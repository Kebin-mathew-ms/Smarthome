class Invoice {
  constructor({ id, booking_id, invoice_number, invoice_date, invoice_path, created_at }) {
    this.id = id;
    this.booking_id = booking_id;
    this.invoice_number = invoice_number;
    this.invoice_date = invoice_date;
    this.invoice_path = invoice_path || null;
    this.created_at = created_at;
  }
}

module.exports = Invoice;
