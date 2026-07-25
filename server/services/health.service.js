const { pool } = require('../config/db');

class HealthService {
  async getGeneralHealth() {
    return {
      status: 'UP',
      service: 'Smart Home Care Enterprise SaaS Platform',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  async getDatabaseHealth() {
    try {
      const start = Date.now();
      await pool.query('SELECT 1');
      const responseTime = Date.now() - start;
      return {
        status: 'UP',
        database: 'MySQL (pool)',
        responseTimeMs: responseTime
      };
    } catch (err) {
      return {
        status: 'DOWN',
        database: 'MySQL (pool)',
        error: err.message
      };
    }
  }

  async getSocketHealth() {
    return {
      status: 'UP',
      engine: 'Socket.IO Real-Time Server',
      transports: ['websocket', 'polling']
    };
  }

  async getStorageHealth() {
    return {
      status: 'UP',
      uploadPath: process.env.UPLOAD_PATH || 'uploads',
      writable: true
    };
  }
}

module.exports = new HealthService();
