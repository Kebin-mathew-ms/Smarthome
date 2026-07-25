const bookingService = require('../services/booking.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class BookingController {
  async createBooking(req, res, next) {
    try {
      const booking = await bookingService.createBooking(req.user.id, req.ip, req.body);
      return sendSuccess(res, 'Booking created successfully', booking, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getUserBookings(req, res, next) {
    try {
      const result = await bookingService.getUserBookings(req.user.id, req.query);
      return sendSuccess(res, 'User bookings retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req, res, next) {
    try {
      const booking = await bookingService.getBookingById(req.params.id, req.user);
      return sendSuccess(res, 'Booking details retrieved successfully', booking, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const { bookingId, reason } = req.body;
      const updated = await bookingService.cancelBooking(bookingId, req.user.id, req.ip, reason);
      return sendSuccess(res, 'Booking cancelled successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async rescheduleBooking(req, res, next) {
    try {
      const { bookingId, scheduled_date, scheduled_time } = req.body;
      const updated = await bookingService.rescheduleBooking(bookingId, req.user.id, req.ip, { scheduled_date, scheduled_time });
      return sendSuccess(res, 'Booking rescheduled successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();
