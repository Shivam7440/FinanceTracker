import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSwagger } from './docs/swagger.js';
import { config } from './config/env.js';

export function createApp() {
  const app = express();

  // Trust Cloudflare / Render reverse proxy for accurate IP identification & rate limiting
  app.set('trust proxy', 1);

  // Security Headers via Helmet
  app.use(helmet({
    contentSecurityPolicy: false // Allows swagger UI assets
  }));

  // CORS Configuration - Permissive for live cloud environments & preview domains
  const corsOptions = {
    origin: true, // Automatically reflects request origin (crucial for Vercel preview branches)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Cache']
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Root endpoint for cloud health checks (Render / Railway / AWS)
  app.get('/', (req, res) => {
    res.json({
      success: true,
      service: 'Aura Finance REST API Gateway',
      status: 'operational',
      health: '/api/health',
      docs: '/api/docs'
    });
  });

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
