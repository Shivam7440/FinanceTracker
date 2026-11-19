import { config } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error occurred.',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
}
