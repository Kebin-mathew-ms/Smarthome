const volunteerPortalService = require('../services/volunteerPortal.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class VolunteerPortalController {
  async login(req, res, next) {
    try {
      const result = await volunteerPortalService.login(req.ip, req.body);
      return sendSuccess(res, 'Volunteer login successful', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const data = await volunteerPortalService.getDashboard(req.user);
      return sendSuccess(res, 'Volunteer dashboard retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getAssignedBookings(req, res, next) {
    try {
      const bookings = await volunteerPortalService.getAssignedBookings(req.user, req.query);
      return sendSuccess(res, 'Assigned bookings retrieved', bookings, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getAssignedBookingById(req, res, next) {
    try {
      const booking = await volunteerPortalService.getAssignedBookingById(req.user, req.params.id);
      return sendSuccess(res, 'Assigned booking details retrieved', booking, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(req, res, next) {
    try {
      await volunteerPortalService.updateBookingStatus(req.user, req.ip, req.body.bookingId, req.body.status);
      return sendSuccess(res, `Booking status updated to ${req.body.status}`, null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req, res, next) {
    try {
      const checkinId = await volunteerPortalService.checkIn(req.user, req.ip, req.body);
      return sendSuccess(res, 'Check-in recorded successfully', { checkinId }, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req, res, next) {
    try {
      await volunteerPortalService.checkOut(req.user, req.ip, req.body);
      return sendSuccess(res, 'Check-out recorded successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async saveCustomerSignature(req, res, next) {
    try {
      await volunteerPortalService.saveCustomerSignature(req.user, req.ip, req.body);
      return sendSuccess(res, 'Customer signature captured successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createWorkLog(req, res, next) {
    try {
      const logId = await volunteerPortalService.createWorkLog(req.user, req.ip, req.body);
      return sendSuccess(res, 'Work log created', { logId }, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req, res, next) {
    try {
      const attendance = await volunteerPortalService.getAttendance(req.user);
      return sendSuccess(res, 'Volunteer attendance history retrieved', attendance, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VolunteerPortalController();
