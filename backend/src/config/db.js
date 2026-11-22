import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbClient = null;
let dbType = 'none';

export async function initDatabase() {
  if (dbClient) return dbClient;

  // 1. Try external PostgreSQL if DATABASE_URL is configured
  if (config.databaseUrl) {
    try {
      console.log('Connecting to PostgreSQL via DATABASE_URL...');
      const pool = new pg.Pool({
        connectionString: config.databaseUrl,
        ssl: config.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        max: 10
      });

      // Handle unexpected idle client errors (prevents crash on pooler socket drop)
      pool.on('error', (err) => {
        console.warn('PostgreSQL pool idle client warning (handled):', err.message);
      });

      // Test connection
      await pool.query('SELECT 1;');
      console.log('Successfully connected to external PostgreSQL database.');
      dbType = 'pg-pool';
      dbClient = pool;
      return dbClient;
    } catch (err) {
      console.warn('External PostgreSQL connection failed:', err.message);
      console.log('Falling back to local persistent PostgreSQL engine (PGlite)...');
    }
  }

  // 2. Persistent PGlite engine (PostgreSQL 16)
  const dataDir = path.resolve(__dirname, '../../data/pgdata');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  try {
    const pglite = new PGlite(dataDir);
    await pglite.query('SELECT 1;');
    console.log(`Initialized persistent PostgreSQL (PGlite) at: ${dataDir}`);
    dbType = 'pglite';
    dbClient = pglite;
    return dbClient;
  } catch (err) {
    console.error('Failed to initialize PGlite database:', err);
    throw err;
  }
}

export async function query(text, params = []) {
  if (!dbClient) {
    await initDatabase();
  }

  try {
    if (dbType === 'pg-pool') {
      const result = await dbClient.query(text, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount
      };
    } else {
      // PGlite query
      const result = await dbClient.query(text, params);
      return {
        rows: result.rows,
        rowCount: result.rows ? result.rows.length : 0
      };
    }
  } catch (error) {
    console.error('Database query error:', {
      text,
      params,
      message: error.message
    });
    throw error;
  }
}

export async function exec(sql) {
  if (!dbClient) {
    await initDatabase();
  }

  if (dbType === 'pg-pool') {
    return await dbClient.query(sql);
  } else {
    if (typeof dbClient.exec === 'function') {
      return await dbClient.exec(sql);
    }
    return await dbClient.query(sql);
  }
}

export function getDatabaseType() {
  return dbType;
}
