class CompanyUser {
  constructor({ id, company_id, user_id, designation, created_at }) {
    this.id = id;
    this.company_id = company_id;
    this.user_id = user_id;
    this.designation = designation;
    this.created_at = created_at;
  }
}

module.exports = CompanyUser;
