const { query } = require('../config/db');

class InvoiceRepository {
  async createInvoice({ booking_id, invoice_number, invoice_date, invoice_path = null }) {
    const sql = `
      INSERT INTO invoices (booking_id, invoice_number, invoice_date, invoice_path)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [booking_id, invoice_number, invoice_date, invoice_path]);
    return result.insertId;
  }

  async findByBookingId(bookingId) {
    const sql = `SELECT * FROM invoices WHERE booking_id = ? LIMIT 1`;
    const rows = await query(sql, [bookingId]);
    return rows[0] || null;
  }
}

module.exports = new InvoiceRepository();
