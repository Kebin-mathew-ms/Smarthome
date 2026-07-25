const analyticsRepository = require('../repositories/analytics.repository');
const auditLogService = require('./auditLog.service');

class AnalyticsService {
  async getAdminAnalytics(user, ipAddress) {
    if (user.role !== 'Admin') {
      const error = new Error('Access forbidden. Only Admin can access platform BI analytics.');
      error.statusCode = 403;
      throw error;
    }

    await auditLogService.log({
      user_id: user.id,
      action: 'Analytics Viewed',
      ip_address: ipAddress
    });

    return await analyticsRepository.getAdminAnalytics();
  }

  async getCompanyAnalytics(user, ipAddress) {
    if (user.role !== 'Company') {
      const error = new Error('Access forbidden. Only service providers can access company analytics.');
      error.statusCode = 403;
      throw error;
    }

    const companyId = user.companyId || user.id;

    await auditLogService.log({
      user_id: user.id,
      action: 'Company Analytics Viewed',
      ip_address: ipAddress
    });

    return await analyticsRepository.getCompanyAnalytics(companyId);
  }

  async getBookingReport(filters) {
    return await analyticsRepository.getBookingReport(filters);
  }
}

module.exports = new AnalyticsService();
