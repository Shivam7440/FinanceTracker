import { createApp } from './app.js';
import { config } from './config/env.js';
import { initDatabase, query } from './config/db.js';
import { initRedis } from './config/redis.js';
import { runMigrations } from './database/migrate.js';
import { seedDatabase } from './database/seed.js';

async function startServer() {
  try {
    console.log('--- Initializing Aura Finance Server ---');

    // 1. Database setup & migrations
    await initDatabase();
    await runMigrations();

    // 2. Check if database needs initial seeding
    const userCount = await query('SELECT COUNT(*) AS count FROM users;');
    if (parseInt(userCount.rows[0].count, 10) === 0) {
      console.log('Empty database detected. Seeding demo accounts and categories...');
      await seedDatabase();
    } else {
      console.log(`Database ready (${userCount.rows[0].count} users registered).`);
    }

    // 3. Redis setup
    await initRedis();

    // 4. Create Express app
    const app = createApp();

    // 5. Start listening
    const server = app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Aura Finance API running on: http://localhost:${config.port}`);
      console.log(`📚 Interactive Swagger API Docs: http://localhost:${config.port}/api/docs`);
      console.log(`🩺 Health status endpoint:     http://localhost:${config.port}/api/health`);
      console.log(`=======================================================`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });

    return server;
  } catch (error) {
    console.error('Fatal server startup error:', error);
    process.exit(1);
  }
}

startServer();
