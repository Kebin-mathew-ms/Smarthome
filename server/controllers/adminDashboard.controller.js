const adminDashboardService = require('../services/adminDashboard.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class AdminDashboardController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await adminDashboardService.getDashboardStats();
      return sendSuccess(res, 'Dashboard statistics retrieved successfully', stats, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminDashboardController();
