const companyBookingService = require('../services/companyBooking.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CompanyBookingController {
  async getCompanyBookings(req, res, next) {
    try {
      const result = await companyBookingService.getCompanyBookings(req.companyId, req.query);
      return sendSuccess(res, 'Company bookings retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(req, res, next) {
    try {
      const updated = await companyBookingService.updateBookingStatus(req.companyId, req.user.id, req.ip, req.body);
      return sendSuccess(res, 'Booking status updated successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async assignEmployees(req, res, next) {
    try {
      const updated = await companyBookingService.assignEmployees(req.companyId, req.user.id, req.ip, req.body);
      return sendSuccess(res, 'Technicians assigned successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyBookingController();
