const auditLogRepository = require('../repositories/auditLog.repository');
const AuditLog = require('../models/auditLog.model');
const logger = require('../config/logger');

class AuditLogService {
  async log({ user_id, action, table_name, record_id, ip_address }) {
    try {
      await auditLogRepository.create({
        user_id,
        action,
        table_name,
        record_id,
        ip_address
      });
    } catch (error) {
      logger.error(`Failed to write audit log: ${error.message}`);
    }
  }

  async getAuditLogs(query) {
    const result = await auditLogRepository.findAll(query);
    return {
      ...result,
      items: result.items.map(item => new AuditLog(item))
    };
  }
}

module.exports = new AuditLogService();
