import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSwagger } from './docs/swagger.js';
import { config } from './config/env.js';

export function createApp() {
  const app = express();

  // Security Headers via Helmet
  app.use(helmet({
    contentSecurityPolicy: false // Allows swagger UI assets
  }));

  // CORS Configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      // Allow wildcard or explicit matching origin
      if (config.clientOrigin === '*' || origin === config.clientOrigin) {
        return callback(null, true);
      }

      // Allow comma-separated client origins
      const allowedOrigins = config.clientOrigin.split(',').map(o => o.trim());
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow local development and Vercel preview / production deployments
      if (origin.startsWith('http://localhost:') || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      return callback(new Error(`CORS policy violation: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Cache']
  }));

  // Body Parsing
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Swagger Documentation
  setupSwagger(app);

  // Mount API Routes
  app.use('/api', routes);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Resource not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
