const systemHealthService = require('../services/systemHealth.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class SystemHealthController {
  async getSystemHealth(req, res, next) {
    try {
      const data = await systemHealthService.getSystemHealth();
      return sendSuccess(res, 'System health telemetry retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SystemHealthController();
