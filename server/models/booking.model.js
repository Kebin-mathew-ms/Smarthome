class Booking {
  constructor({ id, booking_number, user_id, company_id, service_id, package_id, address_id, customer_name, company_name, service_name, package_name, scheduled_date, scheduled_time, estimated_end_time, booking_status, payment_status, payment_method, special_instructions, subtotal, tax_amount, discount_amount, total_amount, created_at, updated_at, cancelled_at, address = null, history = [], volunteers = [] }) {
    this.id = id;
    this.booking_number = booking_number;
    this.user_id = user_id;
    this.company_id = company_id;
    this.service_id = service_id;
    this.package_id = package_id;
    this.address_id = address_id;
    this.customer_name = customer_name || null;
    this.company_name = company_name || null;
    this.service_name = service_name || null;
    this.package_name = package_name || null;
    this.scheduled_date = scheduled_date;
    this.scheduled_time = scheduled_time;
    this.estimated_end_time = estimated_end_time;
    this.booking_status = booking_status;
    this.payment_status = payment_status;
    this.payment_method = payment_method;
    this.special_instructions = special_instructions;
    this.subtotal = Number(subtotal);
    this.tax_amount = Number(tax_amount);
    this.discount_amount = Number(discount_amount);
    this.total_amount = Number(total_amount);
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.cancelled_at = cancelled_at;
    this.address = address;
    this.history = history;
    this.volunteers = volunteers;
  }
}

module.exports = Booking;
