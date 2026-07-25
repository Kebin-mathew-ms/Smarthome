const mysql = require('mysql2/promise');
const logger = require('./logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'home',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  multipleStatements: true
});

const query = async (sql, params = []) => {
  try {
    const [rows, fields] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    logger.error(`Database Query Error: ${error.message} | SQL: ${sql}`);
    throw error;
  }
};

const getConnection = async () => {
  return await pool.getConnection();
};

const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('MySQL Database connected successfully to pool.');
    connection.release();
    return true;
  } catch (error) {
    logger.error(`Database Connection Failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  pool,
  query,
  getConnection,
  checkConnection
};
