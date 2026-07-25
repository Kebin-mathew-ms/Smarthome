const invoiceRepository = require('../repositories/invoice.repository');
const bookingRepository = require('../repositories/booking.repository');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class InvoiceController {
  async getInvoiceByBookingId(req, res, next) {
    try {
      const booking = await bookingRepository.findById(req.params.bookingId);
      if (!booking) {
        const error = new Error('Booking not found.');
        error.statusCode = 404;
        throw error;
      }

      const invoice = await invoiceRepository.findByBookingId(req.params.bookingId);
      if (!invoice) {
        const error = new Error('Invoice not found for this booking.');
        error.statusCode = 404;
        throw error;
      }

      return sendSuccess(res, 'Invoice details retrieved successfully', {
        invoice,
        booking
      }, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoiceController();
