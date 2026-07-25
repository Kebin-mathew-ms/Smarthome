require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('../config/logger');

async function runMigrations() {
  const connection = await pool.getConnection();
  try {
    logger.info('Starting Database Migrations...');
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      logger.info(`Running migration file: ${file}`);
      await connection.query(sql);
      logger.info(`Successfully executed: ${file}`);
    }
    logger.info('All database migrations completed successfully.');
  } catch (error) {
    logger.error(`Migration Error: ${error.message}`);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigrations();
