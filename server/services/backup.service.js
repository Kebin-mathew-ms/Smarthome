const { query } = require('../config/db');
const auditLogService = require('./auditLog.service');

class BackupService {
  async generateBackup(user, ipAddress) {
    if (user.role !== 'Admin') {
      const error = new Error('Access forbidden. Only Admin can generate platform backups.');
      error.statusCode = 403;
      throw error;
    }

    const tables = ['users', 'companies', 'services', 'bookings', 'payments', 'reviews', 'complaints', 'warranties', 'system_announcements'];
    const backupData = {
      timestamp: new Date().toISOString(),
      generatedBy: user.email,
      tables: {}
    };

    for (const tbl of tables) {
      try {
        const rows = await query(`SELECT * FROM ${tbl} LIMIT 1000`);
        backupData.tables[tbl] = rows;
      } catch {
        backupData.tables[tbl] = [];
      }
    }

    await auditLogService.log({
      user_id: user.id,
      action: 'Production Backup Generated',
      ip_address: ipAddress
    });

    return backupData;
  }
}

module.exports = new BackupService();
