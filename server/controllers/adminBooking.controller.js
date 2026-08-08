const adminBookingService = require('../services/adminBooking.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class AdminBookingController {
  async getAllBookings(req, res, next) {
    try {
      const result = await adminBookingService.getAllBookings(req.query);
      return sendSuccess(res, 'Admin bookings overview retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async exportBookingsCSV(req, res, next) {
    try {
      const csvData = await adminBookingService.exportBookingsCSV(req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="bookings_report.csv"');
      return res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }

  async assignVolunteers(req, res, next) {
    try {
      const { bookingId, volunteerIds } = req.body;
      const result = await adminBookingService.assignVolunteers(bookingId, volunteerIds);
      return sendSuccess(res, 'Volunteers assigned successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateBookingStatus(req, res, next) {
    try {
      const { bookingId, status, remarks } = req.body;
      const result = await adminBookingService.updateBookingStatus(bookingId, status, remarks);
      return sendSuccess(res, `Booking status updated to ${status}`, result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminBookingController();
