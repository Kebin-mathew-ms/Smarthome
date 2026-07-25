class EmployeeCheckin {
  constructor({ id, booking_id, employee_id, check_in_time, check_out_time, latitude, longitude, address, notes, created_at }) {
    this.id = id;
    this.booking_id = booking_id;
    this.employee_id = employee_id;
    this.check_in_time = check_in_time;
    this.check_out_time = check_out_time || null;
    this.latitude = latitude ? Number(latitude) : null;
    this.longitude = longitude ? Number(longitude) : null;
    this.address = address || null;
    this.notes = notes || null;
    this.created_at = created_at;
  }
}

module.exports = EmployeeCheckin;
