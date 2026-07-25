class Employee {
  constructor({ id, company_id, employee_name, email, phone, designation, profile_photo, address, status, created_at, updated_at, skills = [] }) {
    this.id = id;
    this.company_id = company_id;
    this.employee_name = employee_name;
    this.email = email;
    this.phone = phone;
    this.designation = designation;
    this.profile_photo = profile_photo;
    this.address = address;
    this.status = status || 'active';
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.skills = skills;
  }

  static toResponse(emp) {
    if (!emp) return null;
    const { deleted_at, ...clean } = emp;
    return clean;
  }
}

module.exports = Employee;
