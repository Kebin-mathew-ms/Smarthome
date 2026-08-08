const { query } = require('../config/db');

class VolunteerPortalRepository {
  async findVolunteerByEmailOrPhone(identifier) {
    const sql = `
      SELECT ce.*, u.id as user_id, u.email, u.password as password_hash, u.full_name, c.company_name
      FROM volunteers ce
      JOIN users u ON (ce.email = u.email OR ce.phone = u.phone)
      LEFT JOIN companies c ON ce.company_id = c.id
      WHERE (ce.email = ? OR ce.phone = ?) AND ce.status = 'active'
      LIMIT 1
    `;
    const rows = await query(sql, [identifier, identifier]);
    return rows[0] || null;
  }

  async findVolunteerByUserId(userId) {
    const sql = `
      SELECT ce.*, u.email, u.full_name, c.company_name
      FROM volunteers ce
      JOIN users u ON (ce.email = u.email OR ce.phone = u.phone)
      LEFT JOIN companies c ON ce.company_id = c.id
      WHERE u.id = ? AND ce.status = 'active'
      LIMIT 1
    `;
    const rows = await query(sql, [userId]);
    return rows[0] || null;
  }

  async findAssignedBookings(volunteerId, { status = null }) {
    let sql = `
      SELECT b.*, s.service_name, c.company_name, u.full_name as customer_name, u.phone as customer_phone
      FROM booking_volunteers be
      JOIN bookings b ON be.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN companies c ON b.company_id = c.id
      JOIN users u ON b.user_id = u.id
      WHERE be.volunteer_id = ?
    `;
    const params = [volunteerId];

    if (status) {
      sql += ` AND b.booking_status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY b.scheduled_date ASC, b.scheduled_time ASC`;
    return await query(sql, params);
  }

  async findAssignedBookingById(volunteerId, bookingId) {
    const sql = `
      SELECT b.*, s.service_name, c.company_name, u.full_name as customer_name, u.phone as customer_phone
      FROM booking_volunteers be
      JOIN bookings b ON be.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN companies c ON b.company_id = c.id
      JOIN users u ON b.user_id = u.id
      WHERE be.volunteer_id = ? AND b.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [volunteerId, bookingId]);
    if (!rows[0]) return null;

    const booking = rows[0];
    const checkin = await query(`SELECT * FROM volunteer_checkins WHERE booking_id = ? AND volunteer_id = ? ORDER BY id DESC LIMIT 1`, [bookingId, volunteerId]);
    const signature = await query(`SELECT * FROM volunteer_signatures WHERE booking_id = ? LIMIT 1`, [bookingId]);
    const logs = await query(`SELECT * FROM volunteer_daily_logs WHERE booking_id = ? AND volunteer_id = ? ORDER BY created_at DESC`, [bookingId, volunteerId]);

    return {
      ...booking,
      checkin: checkin[0] || null,
      signature: signature[0] || null,
      logs
    };
  }

  async checkIn({ booking_id, volunteer_id, latitude = null, longitude = null, address = null, notes = null }) {
    const sql = `
      INSERT INTO volunteer_checkins (booking_id, volunteer_id, check_in_time, latitude, longitude, address, notes)
      VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
    `;
    const result = await query(sql, [booking_id, volunteer_id, latitude, longitude, address, notes]);
    return result.insertId;
  }

  async checkOut(checkinId, { notes = null }) {
    const sql = `
      UPDATE volunteer_checkins
      SET check_out_time = CURRENT_TIMESTAMP, notes = COALESCE(?, notes)
      WHERE id = ?
    `;
    await query(sql, [notes, checkinId]);
  }

  async saveSignature({ booking_id, volunteer_id, customer_signature }) {
    const sql = `
      INSERT INTO volunteer_signatures (booking_id, volunteer_id, customer_signature, signed_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE customer_signature = ?, signed_at = CURRENT_TIMESTAMP
    `;
    await query(sql, [booking_id, volunteer_id, customer_signature, customer_signature]);
  }

  async createWorkLog({ volunteer_id, booking_id, work_summary }) {
    const sql = `
      INSERT INTO volunteer_daily_logs (volunteer_id, booking_id, work_summary)
      VALUES (?, ?, ?)
    `;
    const result = await query(sql, [volunteer_id, booking_id, work_summary]);
    return result.insertId;
  }

  async findAttendance(volunteerId) {
    const sql = `
      SELECT ec.*, b.booking_number
      FROM volunteer_checkins ec
      JOIN bookings b ON ec.booking_id = b.id
      WHERE ec.volunteer_id = ?
      ORDER BY ec.check_in_time DESC
    `;
    return await query(sql, [volunteerId]);
  }
}

module.exports = new VolunteerPortalRepository();
