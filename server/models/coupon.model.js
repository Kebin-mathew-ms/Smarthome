class Coupon {
  constructor({ id, coupon_code, discount_type, discount_value, minimum_amount, expiry_date, status, created_at }) {
    this.id = id;
    this.coupon_code = coupon_code;
    this.discount_type = discount_type || 'percentage';
    this.discount_value = Number(discount_value);
    this.minimum_amount = Number(minimum_amount);
    this.expiry_date = expiry_date;
    this.status = status || 'active';
    this.created_at = created_at;
  }
}

module.exports = Coupon;
