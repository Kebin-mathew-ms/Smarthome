const { query } = require('../config/db');

class WarrantyRepository {
  async issueWarranty({ booking_id, company_id, warranty_number, title, description = null, valid_from, valid_until, terms = null }) {
    const sql = `
      INSERT INTO warranties (booking_id, company_id, warranty_number, title, description, valid_from, valid_until, terms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE title = ?, valid_until = ?, terms = ?
    `;
    const result = await query(sql, [booking_id, company_id, warranty_number, title, description, valid_from, valid_until, terms, title, valid_until, terms]);
    return result.insertId;
  }

  async findByBookingId(bookingId) {
    const sql = `
      SELECT w.*, c.company_name, b.booking_number
      FROM warranties w
      JOIN companies c ON w.company_id = c.id
      JOIN bookings b ON w.booking_id = b.id
      WHERE w.booking_id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [bookingId]);
    return rows[0] || null;
  }

  async findByUserId(userId) {
    const sql = `
      SELECT w.*, c.company_name, b.booking_number, s.service_name
      FROM warranties w
      JOIN companies c ON w.company_id = c.id
      JOIN bookings b ON w.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE b.user_id = ?
      ORDER BY w.created_at DESC
    `;
    return await query(sql, [userId]);
  }

  async findByCompanyId(companyId) {
    const sql = `
      SELECT w.*, b.booking_number, u.full_name as user_name
      FROM warranties w
      JOIN bookings b ON w.booking_id = b.id
      JOIN users u ON b.user_id = u.id
      WHERE w.company_id = ?
      ORDER BY w.created_at DESC
    `;
    return await query(sql, [companyId]);
  }
}

module.exports = new WarrantyRepository();
