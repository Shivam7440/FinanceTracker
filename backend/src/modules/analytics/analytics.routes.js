import { Router } from 'express';
import {
  getSummary,
  getTrends,
  getCategoryBreakdown,
  getBenchmark
} from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { analyticsLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Apply rate limiter (50 requests per hour) & authentication
router.use(analyticsLimiter);
router.use(authenticate);

router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/categories', getCategoryBreakdown);
router.get('/benchmark', getBenchmark);

export default router;
