import { query } from '../../config/db.js';
import { getCache, setCache, invalidateCategories } from '../../config/redis.js';

const CATEGORY_CACHE_KEY = 'categories:all';
const CATEGORY_CACHE_TTL = 3600; // 1 hour

export async function getCategories(req, res, next) {
  try {
    const startTime = Date.now();
    // 1. Check Redis cache
    const cached = await getCache(CATEGORY_CACHE_KEY);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time-Ms', Date.now() - startTime);
      return res.status(200).json({
        success: true,
        source: 'cache',
        ttl: CATEGORY_CACHE_TTL,
        data: cached
      });
    }

    // 2. Query PostgreSQL
    const result = await query(
      'SELECT id, name, type, color, icon, created_at FROM categories ORDER BY name ASC;'
    );

    // 3. Store in Redis cache
    await setCache(CATEGORY_CACHE_KEY, result.rows, CATEGORY_CACHE_TTL);

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time-Ms', Date.now() - startTime);
    res.status(200).json({
      success: true,
      source: 'database',
      ttl: CATEGORY_CACHE_TTL,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, type, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required.'
      });
    }

    const catType = type || 'expense';
    const catColor = color || '#06b6d4';
    const catIcon = icon || 'Tag';

    const result = await query(
      `INSERT INTO categories (name, type, color, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, type, color, icon, created_at;`,
      [name.trim(), catType, catColor, catIcon]
    );

    // Invalidate categories cache
    await invalidateCategories();

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      return res.status(409).json({
        success: false,
        error: 'A category with this name already exists.'
      });
    }
    next(error);
  }
}
