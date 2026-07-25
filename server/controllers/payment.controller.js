const paymentService = require('../services/payment.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class PaymentController {
  async createOrder(req, res, next) {
    try {
      const order = await paymentService.createRazorpayOrder(req.body.bookingId, req.user.id);
      return sendSuccess(res, 'Razorpay order created successfully', order, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req, res, next) {
    try {
      const verified = await paymentService.verifyPayment(req.user.id, req.ip, req.body);
      return sendSuccess(res, 'Payment verified successfully', verified, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
