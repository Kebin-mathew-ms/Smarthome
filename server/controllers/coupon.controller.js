const couponService = require('../services/coupon.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CouponController {
  async createCoupon(req, res, next) {
    try {
      const coupon = await couponService.createCoupon(req.user, req.ip, req.body);
      return sendSuccess(res, 'Coupon created successfully', coupon, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async validateAndApplyCoupon(req, res, next) {
    try {
      const result = await couponService.validateAndApplyCoupon(req.user, req.body.coupon_code, req.body.order_amount);
      return sendSuccess(res, 'Coupon applied successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getActiveCoupons(req, res, next) {
    try {
      const coupons = await couponService.getActiveCoupons();
      return sendSuccess(res, 'Active coupons retrieved', coupons, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getUserRewardPoints(req, res, next) {
    try {
      const points = await couponService.getUserRewardPoints(req.user.id);
      return sendSuccess(res, 'User reward points retrieved', points, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CouponController();
