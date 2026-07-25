class RecentlyViewed {
  constructor({ id, user_id, company_id, service_id, company_name, logo, service_name, thumbnail, starting_price, viewed_at }) {
    this.id = id;
    this.user_id = user_id;
    this.company_id = company_id;
    this.service_id = service_id;
    this.company_name = company_name || null;
    this.logo = logo || null;
    this.service_name = service_name || null;
    this.thumbnail = thumbnail || null;
    this.starting_price = starting_price ? Number(starting_price) : null;
    this.viewed_at = viewed_at;
  }
}

module.exports = RecentlyViewed;
