require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('../config/logger');

async function runCustom() {
  const connection = await pool.getConnection();
  try {
    logger.info('Running customization migration...');
    const filePath = path.join(__dirname, '..', 'database', 'migrations', '022_create_service_customizations.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    await connection.query(sql);
    logger.info('Customization migration completed successfully.');
  } catch (error) {
    logger.error(`Migration Error: ${error.message}`);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runCustom();
