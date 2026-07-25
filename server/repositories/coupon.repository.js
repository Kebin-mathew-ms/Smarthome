const { query } = require('../config/db');

class CouponRepository {
  async createCoupon({ coupon_code, discount_type = 'percentage', discount_value, minimum_amount = 0.00, expiry_date, status = 'active' }) {
    const sql = `
      INSERT INTO coupon_codes (coupon_code, discount_type, discount_value, minimum_amount, expiry_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [coupon_code.toUpperCase(), discount_type, discount_value, minimum_amount, expiry_date, status]);
    return result.insertId;
  }

  async findByCode(couponCode) {
    const sql = `SELECT * FROM coupon_codes WHERE coupon_code = ? LIMIT 1`;
    const rows = await query(sql, [couponCode.toUpperCase()]);
    return rows[0] || null;
  }

  async findAllActive() {
    const sql = `SELECT * FROM coupon_codes WHERE status = 'active' AND expiry_date >= CURDATE() ORDER BY created_at DESC`;
    return await query(sql, []);
  }

  async isUsedByUser(couponId, userId) {
    const sql = `SELECT id FROM user_coupons WHERE coupon_id = ? AND user_id = ? AND used = TRUE LIMIT 1`;
    const rows = await query(sql, [couponId, userId]);
    return Boolean(rows[0]);
  }

  async markUsed(couponId, userId) {
    const sql = `
      INSERT INTO user_coupons (coupon_id, user_id, used, used_at)
      VALUES (?, ?, TRUE, NOW())
      ON DUPLICATE KEY UPDATE used = TRUE, used_at = NOW()
    `;
    await query(sql, [couponId, userId]);
  }

  async getUserRewardPoints(userId) {
    // 10 Reward Points per $100 / ₹100 spent on completed bookings
    const sql = `
      SELECT SUM(total_amount) as total_spent
      FROM bookings
      WHERE user_id = ? AND booking_status = 'Completed'
    `;
    const rows = await query(sql, [userId]);
    const totalSpent = rows[0].total_spent ? Number(rows[0].total_spent) : 0;
    const points = Math.floor(totalSpent / 100) * 10;
    return {
      totalSpent,
      rewardPoints: points
    };
  }
}

module.exports = new CouponRepository();
