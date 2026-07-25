class Payment {
  constructor({ id, booking_id, payment_reference, payment_gateway, transaction_id, payment_status, amount, currency, paid_at, created_at }) {
    this.id = id;
    this.booking_id = booking_id;
    this.payment_reference = payment_reference;
    this.payment_gateway = payment_gateway || 'Razorpay';
    this.transaction_id = transaction_id || null;
    this.payment_status = payment_status;
    this.amount = Number(amount);
    this.currency = currency || 'USD';
    this.paid_at = paid_at;
    this.created_at = created_at;
  }
}

module.exports = Payment;
