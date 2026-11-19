import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import categoryRoutes from '../modules/categories/categories.routes.js';
import transactionRoutes from '../modules/transactions/transactions.routes.js';
import analyticsRoutes from '../modules/analytics/analytics.routes.js';
import userRoutes from '../modules/users/users.routes.js';
import { getDatabaseType, query } from '../config/db.js';
import { getCacheStatus } from '../config/redis.js';

const router = Router();

// Health Check Endpoint
router.get('/health', async (req, res) => {
  try {
    const dbCheck = await query('SELECT 1 as alive;');
    const cacheStatus = getCacheStatus();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        engine: getDatabaseType(),
        status: dbCheck.rows.length > 0 ? 'connected' : 'error'
      },
      cache: cacheStatus,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Module routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);

export default router;
