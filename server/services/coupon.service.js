const couponRepository = require('../repositories/coupon.repository');
const auditLogService = require('./auditLog.service');
const Coupon = require('../models/coupon.model');

class CouponService {
  async createCoupon(user, ipAddress, data) {
    if (user.role !== 'Admin') {
      const error = new Error('Only Admin can create coupons.');
      error.statusCode = 403;
      throw error;
    }

    const couponId = await couponRepository.createCoupon({
      coupon_code: data.coupon_code,
      discount_type: data.discount_type || 'percentage',
      discount_value: data.discount_value,
      minimum_amount: data.minimum_amount || 0.00,
      expiry_date: data.expiry_date,
      status: data.status || 'active'
    });

    await auditLogService.log({
      user_id: user.id,
      action: 'Coupon Created',
      table_name: 'coupon_codes',
      record_id: couponId,
      ip_address: ipAddress
    });

    const coupon = await couponRepository.findByCode(data.coupon_code);
    return new Coupon(coupon);
  }

  async validateAndApplyCoupon(user, couponCode, orderAmount) {
    const coupon = await couponRepository.findByCode(couponCode);
    if (!coupon) {
      const error = new Error('Invalid coupon code.');
      error.statusCode = 404;
      throw error;
    }

    if (coupon.status !== 'active') {
      const error = new Error('This coupon is currently inactive.');
      error.statusCode = 400;
      throw error;
    }

    const today = new Date().toISOString().split('T')[0];
    if (coupon.expiry_date < today) {
      const error = new Error('This coupon code has expired.');
      error.statusCode = 400;
      throw error;
    }

    if (Number(orderAmount) < Number(coupon.minimum_amount)) {
      const error = new Error(`Minimum order amount of $${coupon.minimum_amount} required to use this coupon.`);
      error.statusCode = 400;
      throw error;
    }

    const isUsed = await couponRepository.isUsedByUser(coupon.id, user.id);
    if (isUsed) {
      const error = new Error('You have already redeemed this coupon.');
      error.statusCode = 400;
      throw error;
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (Number(orderAmount) * Number(coupon.discount_value)) / 100;
    } else {
      discount = Number(coupon.discount_value);
    }

    return {
      coupon: new Coupon(coupon),
      discountAmount: Number(discount.toFixed(2)),
      finalAmount: Math.max(0, Number((orderAmount - discount).toFixed(2)))
    };
  }

  async getActiveCoupons() {
    const list = await couponRepository.findAllActive();
    return list.map(c => new Coupon(c));
  }

  async getUserRewardPoints(userId) {
    return await couponRepository.getUserRewardPoints(userId);
  }
}

module.exports = new CouponService();
