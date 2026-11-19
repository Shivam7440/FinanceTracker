import { query } from '../../config/db.js';
import { invalidateUserAnalytics } from '../../config/redis.js';

export async function getTransactions(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      type = '',
      categoryId = '',
      from = '',
      to = '',
      sort = 'transaction_date',
      order = 'desc',
      adminViewAll = 'false'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Allowed sort columns to prevent SQL injection
    const allowedSortCols = {
      transaction_date: 't.transaction_date',
      amount: 't.amount',
      created_at: 't.created_at',
      category: 'c.name'
    };
    const sortColumn = allowedSortCols[sort] || 't.transaction_date';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Build dynamic WHERE clause with parameterized values
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Role-based scoping: Admins can optionally view all; users and read-only ONLY see their own
    const isAdmin = req.user.role === 'admin';
    const viewAll = isAdmin && adminViewAll === 'true';

    if (!viewAll) {
      conditions.push(`t.user_id = $${paramIndex++}`);
      params.push(req.user.id);
    }

    if (type && (type === 'income' || type === 'expense')) {
      conditions.push(`t.type = $${paramIndex++}`);
      params.push(type);
    }

    if (categoryId) {
      conditions.push(`t.category_id = $${paramIndex++}`);
      params.push(categoryId);
    }

    if (from) {
      conditions.push(`t.transaction_date >= $${paramIndex++}`);
      params.push(from);
    }

    if (to) {
      conditions.push(`t.transaction_date <= $${paramIndex++}`);
      params.push(to);
    }

    if (search && search.trim()) {
      conditions.push(`(t.description ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count query
    const countSql = `
      SELECT COUNT(*) AS total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${whereClause};
    `;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Data query with joins
    const dataSql = `
      SELECT 
        t.id,
        t.user_id,
        u.name AS user_name,
        u.email AS user_email,
        t.category_id,
        c.name AS category_name,
        c.color AS category_color,
        c.icon AS category_icon,
        t.type,
        t.amount,
        t.description,
        t.transaction_date,
        t.created_at,
        t.updated_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      JOIN users u ON t.user_id = u.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}, t.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    const dataParams = [...params, limitNum, offset];
    const dataResult = await query(dataSql, dataParams);

    res.status(200).json({
      success: true,
      data: dataResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionById(req, res, next) {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    const sql = `
      SELECT 
        t.id,
        t.user_id,
        u.name AS user_name,
        u.email AS user_email,
        t.category_id,
        c.name AS category_name,
        c.color AS category_color,
        c.icon AS category_icon,
        t.type,
        t.amount,
        t.description,
        t.transaction_date,
        t.created_at,
        t.updated_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1 AND ($2 = true OR t.user_id = $3);
    `;

    const result = await query(sql, [id, isAdmin, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found or you lack permission to view it.'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

export async function createTransaction(req, res, next) {
  try {
    const { type, amount, categoryId, description, transactionDate, targetUserId } = req.body;

    if (!type || !amount || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Type (income/expense), amount, and categoryId are required.'
      });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        success: false,
        error: "Type must be either 'income' or 'expense'."
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive numeric value greater than zero.'
      });
    }

    // Verify category exists
    const catCheck = await query('SELECT id, name FROM categories WHERE id = $1;', [categoryId]);
    if (catCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category specified.'
      });
    }

    // Determine owner: admin can specify targetUserId, otherwise authenticated user
    let ownerId = req.user.id;
    if (req.user.role === 'admin' && targetUserId) {
      ownerId = targetUserId;
    }

    const txDate = transactionDate || new Date().toISOString().split('T')[0];

    const insertSql = `
      INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;
    `;

    const result = await query(insertSql, [
      ownerId,
      categoryId,
      type,
      parsedAmount.toFixed(2),
      (description || '').trim(),
      txDate
    ]);

    const createdTx = result.rows[0];

    // Invalidate Redis analytics cache for this user
    await invalidateUserAnalytics(ownerId);

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully.',
      data: createdTx
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const { type, amount, categoryId, description, transactionDate } = req.body;

    // Ownership check
    const checkSql = 'SELECT id, user_id FROM transactions WHERE id = $1;';
    const existing = await query(checkSql, [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found.'
      });
    }

    const tx = existing.rows[0];
    const isAdmin = req.user.role === 'admin';

    // Strict IDOR ownership enforcement
    if (!isAdmin && tx.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this transaction.'
      });
    }

    // Validate inputs if provided
    if (type && type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        success: false,
        error: "Type must be either 'income' or 'expense'."
      });
    }

    let parsedAmount = null;
    if (amount !== undefined) {
      parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be greater than zero.'
        });
      }
    }

    if (categoryId) {
      const catCheck = await query('SELECT id FROM categories WHERE id = $1;', [categoryId]);
      if (catCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category specified.'
        });
      }
    }

    const updateSql = `
      UPDATE transactions
      SET 
        type = COALESCE($1, type),
        amount = COALESCE($2, amount),
        category_id = COALESCE($3, category_id),
        description = COALESCE($4, description),
        transaction_date = COALESCE($5, transaction_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
    `;

    const result = await query(updateSql, [
      type || null,
      parsedAmount ? parsedAmount.toFixed(2) : null,
      categoryId || null,
      description !== undefined ? description.trim() : null,
      transactionDate || null,
      id
    ]);

    // Invalidate Redis analytics cache for the owner
    await invalidateUserAnalytics(tx.user_id);

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(req, res, next) {
  try {
    const { id } = req.params;

    // Check ownership
    const checkSql = 'SELECT id, user_id FROM transactions WHERE id = $1;';
    const existing = await query(checkSql, [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found.'
      });
    }

    const tx = existing.rows[0];
    const isAdmin = req.user.role === 'admin';

    // Strict IDOR ownership check
    if (!isAdmin && tx.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You do not have permission to delete this record.'
      });
    }

    await query('DELETE FROM transactions WHERE id = $1;', [id]);

    // Invalidate Redis analytics cache for this user
    await invalidateUserAnalytics(tx.user_id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}
