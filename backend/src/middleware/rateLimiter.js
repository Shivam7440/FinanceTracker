import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

// Auth: 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  statusCode: 429
});

// Transactions: 100 requests per hour
export const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isTest ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Transaction rate limit exceeded (100 requests per hour). Please wait before trying again.'
  },
  statusCode: 429
});

// Analytics: 50 requests per hour
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isTest ? 10000 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Analytics rate limit exceeded (50 requests per hour). Cached data or wait period required.'
  },
  statusCode: 429
});
