class Company {
  constructor({ id, company_name, company_email, company_phone, logo, address, city, district, state, postal_code, description, status, created_by, created_at, updated_at }) {
    this.id = id;
    this.company_name = company_name;
    this.company_email = company_email;
    this.company_phone = company_phone;
    this.logo = logo;
    this.address = address;
    this.city = city;
    this.district = district;
    this.state = state;
    this.postal_code = postal_code;
    this.description = description;
    this.status = status || 'pending';
    this.created_by = created_by;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static toResponse(company) {
    if (!company) return null;
    const { deleted_at, ...companyData } = company;
    return companyData;
  }
}

module.exports = Company;
