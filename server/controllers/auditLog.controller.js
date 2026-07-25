const auditLogService = require('../services/auditLog.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class AuditLogController {
  async getAuditLogs(req, res, next) {
    try {
      const logs = await auditLogService.getAuditLogs(req.query);
      return sendSuccess(res, 'Audit logs retrieved successfully', logs, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditLogController();
