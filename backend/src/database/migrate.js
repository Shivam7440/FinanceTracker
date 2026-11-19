import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, exec } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('Running database migrations...');
  await initDatabase();

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await exec(sql);
    console.log('Database migrations completed successfully.');
  } catch (err) {
    console.error('Migration error:', err.message);
    throw err;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
