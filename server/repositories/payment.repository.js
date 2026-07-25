const { query } = require('../config/db');

class PaymentRepository {
  async createPayment({ booking_id, payment_reference, payment_gateway = 'Razorpay', transaction_id = null, payment_status = 'Pending', amount, currency = 'USD' }) {
    const sql = `
      INSERT INTO payments (booking_id, payment_reference, payment_gateway, transaction_id, payment_status, amount, currency)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [booking_id, payment_reference, payment_gateway, transaction_id, payment_status, amount, currency]);
    return result.insertId;
  }

  async findByBookingId(bookingId) {
    const sql = `SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1`;
    const rows = await query(sql, [bookingId]);
    return rows[0] || null;
  }

  async findByReference(paymentReference) {
    const sql = `SELECT * FROM payments WHERE payment_reference = ? LIMIT 1`;
    const rows = await query(sql, [paymentReference]);
    return rows[0] || null;
  }

  async updatePaymentStatus(paymentReference, status, transactionId = null) {
    const sql = `
      UPDATE payments
      SET payment_status = ?, transaction_id = COALESCE(?, transaction_id), paid_at = IF(? = 'Paid', NOW(), paid_at)
      WHERE payment_reference = ?
    `;
    await query(sql, [status, transactionId, status, paymentReference]);
    return this.findByReference(paymentReference);
  }
}

module.exports = new PaymentRepository();
