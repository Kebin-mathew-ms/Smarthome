const analyticsService = require('../services/analytics.service');
const activityLogRepository = require('../repositories/activityLog.repository');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class AnalyticsController {
  async getAdminAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getAdminAnalytics(req.user, req.ip);
      return sendSuccess(res, 'Admin analytics retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getCompanyAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getCompanyAnalytics(req.user, req.ip);
      return sendSuccess(res, 'Company analytics retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getBookingReport(req, res, next) {
    try {
      const data = await analyticsService.getBookingReport(req.query);
      return sendSuccess(res, 'Booking report generated', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getActivityLogs(req, res, next) {
    try {
      const data = await activityLogRepository.findLogs(req.query);
      return sendSuccess(res, 'Activity logs retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
