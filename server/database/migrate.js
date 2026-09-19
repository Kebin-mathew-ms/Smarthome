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
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      logger.info(`Running migration file: ${file}`);

      const rawStatements = sqlContent.split(';');

      for (let stmt of rawStatements) {
        const cleaned = stmt
          .split('\n')
          .filter(line => !line.trim().startsWith('--') && !line.trim().startsWith('#'))
          .join('\n')
          .trim();

        if (!cleaned) continue;

        try {
          await connection.query(cleaned);
        } catch (error) {
          const nonFatalErrorCodes = [
            'ER_CANT_DROP_FIELD_OR_KEY',
            'ER_DUP_FIELDNAME',
            'ER_DUP_KEYNAME',
            'ER_TABLE_EXISTS_ERROR',
            'ER_NOSUCH_TABLE',
            'ER_BAD_FIELD_ERROR',
            'ER_KEY_DOES_NOT_EXISTS',
            'ER_CANT_CREATE_TABLE'
          ];

          const isNonFatal =
            nonFatalErrorCodes.includes(error.code) ||
            (error.errno && [1091, 1060, 1061, 1050, 1146, 1054, 1072, 1090].includes(Number(error.errno))) ||
            error.message.includes("Can't DROP") ||
            error.message.includes("already exists") ||
            error.message.includes("Doesn't exist") ||
            error.message.includes("Unknown column");

          if (isNonFatal) {
            logger.warn(`Skipping non-fatal error in ${file}: ${error.message}`);
          } else {
            logger.error(`Migration Statement Failed in ${file}: ${error.message} | Statement: ${cleaned}`);
            throw error;
          }
        }
      }
      logger.info(`Successfully executed: ${file}`);
    }
    logger.info('All database migrations completed successfully.');
  } catch (error) {
    logger.error(`Migration Error: ${error.message}`);
    throw error;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations };

