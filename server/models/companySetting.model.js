class CompanySetting {
  constructor({ id, company_id, working_hours, working_days, service_radius, minimum_booking_amount, company_status, created_at, updated_at }) {
    this.id = id;
    this.company_id = company_id;
    this.working_hours = working_hours || '09:00 - 18:00';
    this.working_days = working_days || 'Monday - Saturday';
    this.service_radius = service_radius !== undefined ? Number(service_radius) : 25.00;
    this.minimum_booking_amount = minimum_booking_amount !== undefined ? Number(minimum_booking_amount) : 0.00;
    this.company_status = company_status || 'pending';
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = CompanySetting;
