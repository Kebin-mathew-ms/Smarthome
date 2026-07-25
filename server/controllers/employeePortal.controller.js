const employeePortalService = require('../services/employeePortal.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class EmployeePortalController {
  async login(req, res, next) {
    try {
      const result = await employeePortalService.login(req.ip, req.body);
      return sendSuccess(res, 'Employee login successful', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const data = await employeePortalService.getDashboard(req.user);
      return sendSuccess(res, 'Employee dashboard retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getAssignedBookings(req, res, next) {
    try {
      const bookings = await employeePortalService.getAssignedBookings(req.user, req.query);
      return sendSuccess(res, 'Assigned bookings retrieved', bookings, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getAssignedBookingById(req, res, next) {
    try {
      const booking = await employeePortalService.getAssignedBookingById(req.user, req.params.id);
      return sendSuccess(res, 'Assigned booking details retrieved', booking, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(req, res, next) {
    try {
      await employeePortalService.updateBookingStatus(req.user, req.ip, req.body.bookingId, req.body.status);
      return sendSuccess(res, `Booking status updated to ${req.body.status}`, null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req, res, next) {
    try {
      const checkinId = await employeePortalService.checkIn(req.user, req.ip, req.body);
      return sendSuccess(res, 'Check-in recorded successfully', { checkinId }, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req, res, next) {
    try {
      await employeePortalService.checkOut(req.user, req.ip, req.body);
      return sendSuccess(res, 'Check-out recorded successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async saveCustomerSignature(req, res, next) {
    try {
      await employeePortalService.saveCustomerSignature(req.user, req.ip, req.body);
      return sendSuccess(res, 'Customer signature captured successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createWorkLog(req, res, next) {
    try {
      const logId = await employeePortalService.createWorkLog(req.user, req.ip, req.body);
      return sendSuccess(res, 'Work log created', { logId }, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req, res, next) {
    try {
      const attendance = await employeePortalService.getAttendance(req.user);
      return sendSuccess(res, 'Employee attendance history retrieved', attendance, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeePortalController();
