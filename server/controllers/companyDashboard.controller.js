const companyDashboardService = require('../services/companyDashboard.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CompanyDashboardController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await companyDashboardService.getDashboardStats(req.companyId);
      return sendSuccess(res, 'Company dashboard stats retrieved successfully', stats, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyDashboardController();
