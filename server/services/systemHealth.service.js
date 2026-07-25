const os = require('os');
const { pool } = require('../config/db');

class SystemHealthService {
  async getSystemHealth() {
    const memoryUsage = process.memoryUsage();
    const uptimeSeconds = process.uptime();

    let dbStatus = 'Healthy';
    try {
      await pool.query('SELECT 1');
    } catch {
      dbStatus = 'Degraded';
    }

    return {
      apiStatus: 'Healthy',
      socketStatus: 'Active',
      databaseStatus: dbStatus,
      processUptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`,
      memoryUsage: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`
      },
      systemOS: {
        platform: os.platform(),
        cpus: os.cpus().length,
        totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`
      }
    };
  }
}

module.exports = new SystemHealthService();
