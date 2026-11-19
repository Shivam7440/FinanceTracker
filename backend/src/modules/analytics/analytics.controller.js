import { query } from '../../config/db.js';
import { getCache, setCache } from '../../config/redis.js';

const ANALYTICS_CACHE_TTL = 900; // 15 minutes (900 seconds)

export async function getSummary(req, res, next) {
  try {
    const startTime = Date.now();
    const userId = req.user.id;
    const { from = '', to = '', period = 'month' } = req.query;

    const cacheKey = `analytics:${userId}:summary:${period}:${from || 'none'}:${to || 'none'}`;

    // 1. Check Redis Cache
    const cached = await getCache(cacheKey);
    if (cached) {
      const duration = Date.now() - startTime;
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time-Ms', duration);
      return res.status(200).json({
        success: true,
        source: 'cache',
        ttl: ANALYTICS_CACHE_TTL,
        responseTimeMs: duration,
        data: cached
      });
    }

    // 2. Compute Aggregates from PostgreSQL
    const conditions = ['user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (from) {
      conditions.push(`transaction_date >= $${paramIndex++}`);
      params.push(from);
    }
    if (to) {
      conditions.push(`transaction_date <= $${paramIndex++}`);
      params.push(to);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const summarySql = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
        COUNT(*) AS transaction_count
      FROM transactions
      ${whereClause};
    `;

    const summaryResult = await query(summarySql, params);
    const row = summaryResult.rows[0];

    const totalIncome = parseFloat(row.total_income || 0);
    const totalExpenses = parseFloat(row.total_expenses || 0);
    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0.0';

    // Calculate current month and current year spending
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const startOfMonth = `${currentYear}-${currentMonth}-01`;
    const startOfYear = `${currentYear}-01-01`;

    const periodSpendSql = `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'expense' AND transaction_date >= $2 THEN amount ELSE 0 END), 0) AS month_expense,
        COALESCE(SUM(CASE WHEN type = 'expense' AND transaction_date >= $3 THEN amount ELSE 0 END), 0) AS year_expense,
        COALESCE(SUM(CASE WHEN type = 'income' AND transaction_date >= $2 THEN amount ELSE 0 END), 0) AS month_income
      FROM transactions
      WHERE user_id = $1;
    `;

    const periodResult = await query(periodSpendSql, [userId, startOfMonth, startOfYear]);
    const periodRow = periodResult.rows[0];

    const data = {
      period: { from, to, period },
      totals: {
        totalIncome: totalIncome.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        netBalance: netBalance.toFixed(2),
        savingsRate: parseFloat(savingsRate),
        transactionCount: parseInt(row.transaction_count, 10)
      },
      currentPeriod: {
        monthlyExpense: parseFloat(periodRow.month_expense || 0).toFixed(2),
        monthlyIncome: parseFloat(periodRow.month_income || 0).toFixed(2),
        yearlyExpense: parseFloat(periodRow.year_expense || 0).toFixed(2)
      }
    };

    // 3. Store in Redis Cache
    await setCache(cacheKey, data, ANALYTICS_CACHE_TTL);

    const duration = Date.now() - startTime;
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time-Ms', duration);
    res.status(200).json({
      success: true,
      source: 'database',
      ttl: ANALYTICS_CACHE_TTL,
      responseTimeMs: duration,
      data
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrends(req, res, next) {
  try {
    const startTime = Date.now();
    const userId = req.user.id;
    const { months = 6 } = req.query;
    const monthCount = Math.min(24, Math.max(3, parseInt(months, 10) || 6));

    const cacheKey = `analytics:${userId}:trends:${monthCount}`;

    // 1. Check Redis Cache
    const cached = await getCache(cacheKey);
    if (cached) {
      const duration = Date.now() - startTime;
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time-Ms', duration);
      return res.status(200).json({
        success: true,
        source: 'cache',
        ttl: ANALYTICS_CACHE_TTL,
        responseTimeMs: duration,
        data: cached
      });
    }

    // 2. Query monthly aggregates
    const sql = `
      SELECT 
        TO_CHAR(transaction_date, 'YYYY-MM') AS month_key,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
      FROM transactions
      WHERE user_id = $1
      GROUP BY TO_CHAR(transaction_date, 'YYYY-MM')
      ORDER BY month_key ASC;
    `;

    const result = await query(sql, [userId]);
    const dbMap = new Map();
    for (const r of result.rows) {
      dbMap.set(r.month_key, {
        income: parseFloat(r.income || 0),
        expenses: parseFloat(r.expenses || 0)
      });
    }

    // Build continuous chronological series including zero-value months
    const series = [];
    const now = new Date();
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${monthNum}`;
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const label = `${monthName} ${year}`;

      const matched = dbMap.get(monthKey) || { income: 0, expenses: 0 };
      series.push({
        monthKey,
        label,
        monthName,
        year,
        income: matched.income,
        expenses: matched.expenses,
        net: matched.income - matched.expenses
      });
    }

    // 3. Store in Redis Cache
    await setCache(cacheKey, series, ANALYTICS_CACHE_TTL);

    const duration = Date.now() - startTime;
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time-Ms', duration);
    res.status(200).json({
      success: true,
      source: 'database',
      ttl: ANALYTICS_CACHE_TTL,
      responseTimeMs: duration,
      data: series
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBreakdown(req, res, next) {
  try {
    const startTime = Date.now();
    const userId = req.user.id;
    const { from = '', to = '', type = 'expense' } = req.query;

    const cacheKey = `analytics:${userId}:categories:${type}:${from || 'all'}:${to || 'all'}`;

    // 1. Check Redis Cache
    const cached = await getCache(cacheKey);
    if (cached) {
      const duration = Date.now() - startTime;
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time-Ms', duration);
      return res.status(200).json({
        success: true,
        source: 'cache',
        ttl: ANALYTICS_CACHE_TTL,
        responseTimeMs: duration,
        data: cached
      });
    }

    // 2. Query category distribution
    const conditions = ['t.user_id = $1', 't.type = $2'];
    const params = [userId, type];
    let paramIndex = 3;

    if (from) {
      conditions.push(`t.transaction_date >= $${paramIndex++}`);
      params.push(from);
    }
    if (to) {
      conditions.push(`t.transaction_date <= $${paramIndex++}`);
      params.push(to);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const sql = `
      SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        COALESCE(SUM(t.amount), 0) AS total_amount,
        COUNT(t.id) AS count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${whereClause}
      GROUP BY c.id, c.name, c.color, c.icon
      ORDER BY total_amount DESC;
    `;

    const result = await query(sql, params);

    // Calculate total for percentage distribution
    const grandTotal = result.rows.reduce((acc, r) => acc + parseFloat(r.total_amount || 0), 0);

    const breakdown = result.rows.map((r) => {
      const amt = parseFloat(r.total_amount || 0);
      const percentage = grandTotal > 0 ? ((amt / grandTotal) * 100).toFixed(1) : '0.0';
      return {
        id: r.id,
        name: r.name,
        color: r.color || '#06b6d4',
        icon: r.icon || 'Tag',
        total: amt.toFixed(2),
        count: parseInt(r.count, 10),
        percentage: parseFloat(percentage)
      };
    });

    const payload = {
      type,
      grandTotal: grandTotal.toFixed(2),
      categories: breakdown
    };

    // 3. Store in Redis Cache
    await setCache(cacheKey, payload, ANALYTICS_CACHE_TTL);

    const duration = Date.now() - startTime;
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time-Ms', duration);
    res.status(200).json({
      success: true,
      source: 'database',
      ttl: ANALYTICS_CACHE_TTL,
      responseTimeMs: duration,
      data: payload
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Benchmark endpoint: measures uncached vs cached query latency
 * Demonstrates actual Redis performance speedup for documentation & review
 */
export async function getBenchmark(req, res, next) {
  try {
    const userId = req.user.id;
    const testKey = `analytics:${userId}:benchmark-test`;

    // 1. Force cold run (simulate database query)
    const t0 = process.hrtime.bigint();
    const dbSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses,
        COUNT(*) AS count
      FROM transactions
      WHERE user_id = $1;
    `;
    const dbRes = await query(dbSql, [userId]);
    const t1 = process.hrtime.bigint();
    const uncachedLatencyMs = Number(t1 - t0) / 1e6;

    // Store in cache
    await setCache(testKey, dbRes.rows[0], 60);

    // 2. Force warm run (from cache)
    const t2 = process.hrtime.bigint();
    const cachedData = await getCache(testKey);
    const t3 = process.hrtime.bigint();
    const cachedLatencyMs = Number(t3 - t2) / 1e6;

    const speedup = (uncachedLatencyMs / Math.max(0.01, cachedLatencyMs)).toFixed(1);

    res.status(200).json({
      success: true,
      measurement: {
        uncachedDatabaseLatencyMs: parseFloat(uncachedLatencyMs.toFixed(3)),
        cachedLatencyMs: parseFloat(cachedLatencyMs.toFixed(3)),
        speedupMultiplier: `${speedup}x faster`,
        cacheTTLSeconds: ANALYTICS_CACHE_TTL,
        data: cachedData
      }
    });
  } catch (error) {
    next(error);
  }
}
