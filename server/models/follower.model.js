class Follower {
  constructor({ id, company_id, user_id, company_name, logo, city, created_at }) {
    this.id = id;
    this.company_id = company_id;
    this.user_id = user_id;
    this.company_name = company_name || null;
    this.logo = logo || null;
    this.city = city || null;
    this.created_at = created_at;
  }
}

module.exports = Follower;
