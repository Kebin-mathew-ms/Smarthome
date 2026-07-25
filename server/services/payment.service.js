const paymentRepository = require('../repositories/payment.repository');
const bookingRepository = require('../repositories/booking.repository');
const razorpayUtil = require('../utils/razorpay.util');
const auditLogService = require('./auditLog.service');

class PaymentService {
  async createRazorpayOrder(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking || booking.user_id !== userId) {
      const error = new Error('Booking not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }

    const payment = await paymentRepository.findByBookingId(bookingId);
    if (!payment) {
      const error = new Error('Payment record missing for booking.');
      error.statusCode = 404;
      throw error;
    }

    const order = razorpayUtil.createOrder({
      amount: booking.total_amount,
      currency: 'USD',
      receipt: payment.payment_reference
    });

    return {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      payment_reference: payment.payment_reference,
      key_id: order.key_id,
      is_simulated: order.is_simulated
    };
  }

  async verifyPayment(userId, ipAddress, { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_reference }) {
    const payment = await paymentRepository.findByReference(payment_reference);
    if (!payment) {
      const error = new Error('Payment reference not found.');
      error.statusCode = 404;
      throw error;
    }

    const isValid = razorpayUtil.verifySignature({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValid) {
      await paymentRepository.updatePaymentStatus(payment_reference, 'Failed', razorpay_payment_id);
      await auditLogService.log({
        user_id: userId,
        action: 'Payment Failure',
        table_name: 'payments',
        record_id: payment.id,
        ip_address: ipAddress
      });
      const error = new Error('Invalid payment signature verification failed.');
      error.statusCode = 400;
      throw error;
    }

    const updatedPayment = await paymentRepository.updatePaymentStatus(payment_reference, 'Paid', razorpay_payment_id || `TXN-${Date.now()}`);
    await bookingRepository.updatePaymentStatus(payment.booking_id, 'Paid');

    await auditLogService.log({
      user_id: userId,
      action: 'Payment Success',
      table_name: 'payments',
      record_id: payment.id,
      ip_address: ipAddress
    });

    return updatedPayment;
  }
}

module.exports = new PaymentService();
