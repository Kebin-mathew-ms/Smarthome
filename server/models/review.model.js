class Review {
  constructor({ id, booking_id, company_id, service_id, user_id, user_name, company_name, service_name, employee_id, rating, review_title, review_description, recommend, created_at, updated_at, media = [], reply = null }) {
    this.id = id;
    this.booking_id = booking_id;
    this.company_id = company_id;
    this.service_id = service_id;
    this.user_id = user_id;
    this.user_name = user_name || null;
    this.company_name = company_name || null;
    this.service_name = service_name || null;
    this.employee_id = employee_id;
    this.rating = Number(rating);
    this.review_title = review_title;
    this.review_description = review_description;
    this.recommend = Boolean(recommend);
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.media = media;
    this.reply = reply;
  }
}

module.exports = Review;
