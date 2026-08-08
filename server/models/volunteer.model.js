class Volunteer {
  constructor({ id, company_id, volunteer_name, email, phone, designation, profile_photo, address, status, created_at, updated_at, skills = [] }) {
    this.id = id;
    this.company_id = company_id;
    this.volunteer_name = volunteer_name;
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

  static toResponse(vol) {
    if (!vol) return null;
    const { deleted_at, ...clean } = vol;
    return clean;
  }
}

module.exports = Volunteer;
