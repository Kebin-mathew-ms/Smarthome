class Warranty {
  constructor({ id, booking_id, company_id, company_name, warranty_number, title, description, valid_from, valid_until, terms, created_at }) {
    this.id = id;
    this.booking_id = booking_id;
    this.company_id = company_id;
    this.company_name = company_name || null;
    this.warranty_number = warranty_number;
    this.title = title;
    this.description = description || null;
    this.valid_from = valid_from;
    this.valid_until = valid_until;
    this.terms = terms || null;
    this.created_at = created_at;
  }
}

module.exports = Warranty;
