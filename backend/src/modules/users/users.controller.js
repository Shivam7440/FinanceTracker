import { query } from '../../config/db.js';

export async function getUsers(req, res, next) {
  try {
    const { search = '' } = req.query;

    const params = [];
    let searchCondition = '';

    if (search && search.trim()) {
      searchCondition = 'WHERE u.name ILIKE $1 OR u.email ILIKE $1';
      params.push(`%${search.trim()}%`);
    }

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        u.updated_at,
        COUNT(t.id) AS transaction_count,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      ${searchCondition}
      GROUP BY u.id, u.name, u.email, u.role, u.created_at, u.updated_at
      ORDER BY u.created_at DESC;
    `;

    const result = await query(sql, params);

    const users = result.rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      stats: {
        transactionCount: parseInt(u.transaction_count, 10),
        totalExpense: parseFloat(u.total_expense).toFixed(2),
        totalIncome: parseFloat(u.total_income).toFixed(2)
      }
    }));

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['admin', 'user', 'read-only'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role specified. Must be one of: ${allowedRoles.join(', ')}`
      });
    }

    // Prevent admin from removing their own admin status
    if (req.user.id === id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Administrators cannot demote their own account role.'
      });
    }

    const updateSql = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, role, updated_at;
    `;

    const result = await query(updateSql, [role, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to '${role}'.`,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}
