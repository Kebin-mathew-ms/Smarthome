const backupService = require('../services/backup.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class BackupController {
  async generateBackup(req, res, next) {
    try {
      const data = await backupService.generateBackup(req.user, req.ip);
      return sendSuccess(res, 'Backup snapshot generated successfully', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BackupController();
