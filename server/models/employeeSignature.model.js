class EmployeeSignature {
  constructor({ id, booking_id, employee_id, customer_signature, signed_at }) {
    this.id = id;
    this.booking_id = booking_id;
    this.employee_id = employee_id;
    this.customer_signature = customer_signature;
    this.signed_at = signed_at;
  }
}

module.exports = EmployeeSignature;
