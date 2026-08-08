class VolunteerSignature {
  constructor({ id, booking_id, volunteer_id, customer_signature, signed_at }) {
    this.id = id;
    this.booking_id = booking_id;
    this.volunteer_id = volunteer_id;
    this.customer_signature = customer_signature;
    this.signed_at = signed_at;
  }
}

module.exports = VolunteerSignature;
