const healthService = require('../services/health.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class HealthController {
  async getGeneralHealth(req, res, next) {
    try {
      const data = await healthService.getGeneralHealth();
      return sendSuccess(res, 'Health status retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getDatabaseHealth(req, res, next) {
    try {
      const data = await healthService.getDatabaseHealth();
      return sendSuccess(res, 'Database health retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getSocketHealth(req, res, next) {
    try {
      const data = await healthService.getSocketHealth();
      return sendSuccess(res, 'Socket health retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getStorageHealth(req, res, next) {
    try {
      const data = await healthService.getStorageHealth();
      return sendSuccess(res, 'Storage health retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthController();
