const crypto = require('crypto');

class RazorpayUtil {
  createOrder({ amount, currency = 'USD', receipt }) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return {
      id: orderId,
      entity: 'order',
      amount: Math.round(amount * 100), // amount in cents/paisa
      currency,
      receipt,
      status: 'created',
      key_id: keyId || 'rzp_test_placeholder',
      is_simulated: !keyId || !keySecret
    };
  }

  verifySignature({ order_id, payment_id, signature }) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If simulated / test mode without keys set
    if (!keySecret) {
      return true;
    }

    const body = order_id + '|' + payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }
}

module.exports = new RazorpayUtil();
