const { query, getConnection } = require('../config/db');

class BookingRepository {
  async findById(id) {
    const sql = `
      SELECT b.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
             c.company_name, c.logo as company_logo, c.company_phone,
             s.service_name, s.starting_price, sp.package_name, sp.price as package_price
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN companies c ON b.company_id = c.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN service_packages sp ON b.package_id = sp.id
      WHERE b.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    if (!rows[0]) return null;

    const booking = rows[0];

    // Address
    const addressRows = await query(`SELECT * FROM addresses WHERE id = ?`, [booking.address_id]);
    booking.address = addressRows[0] || null;

    // Status Timeline History
    const historyRows = await query(`SELECT * FROM booking_status_history WHERE booking_id = ? ORDER BY created_at ASC`, [id]);
    booking.history = historyRows;

    // Assigned Volunteers
    const empRows = await query(
      `SELECT e.id, e.volunteer_name, e.designation, e.phone, e.profile_photo, be.assigned_at
       FROM booking_volunteers be
       JOIN volunteers e ON be.volunteer_id = e.id
       WHERE be.booking_id = ?`,
      [id]
    );
    booking.volunteers = empRows;
    booking.employees = empRows; // Compatibility fallback

    return booking;
  }

  async findUserBookings(userId, { status, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const params = [userId];
    let whereClause = 'WHERE b.user_id = ?';

    if (status) {
      whereClause += ' AND b.booking_status = ?';
      params.push(status);
    }

    const countSql = `SELECT COUNT(*) as total FROM bookings b ${whereClause}`;
    const countRows = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT b.*, c.company_name, c.logo as company_logo, s.service_name, sp.package_name
      FROM bookings b
      LEFT JOIN companies c ON b.company_id = c.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN service_packages sp ON b.package_id = sp.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));
    const rows = await query(dataSql, params);

    return {
      items: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  async findCompanyBookings(companyId, { status, search, page = 1, limit = 10 }) {
    // Falls back to Admin listing of all bookings for compatibility
    return this.findAllBookings({ status, search, page, limit });
  }

  async findAllBookings({ status, search, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (status) {
      whereClause += ' AND b.booking_status = ?';
      params.push(status);
    }
    if (search) {
      whereClause += ' AND (b.booking_number LIKE ? OR u.full_name LIKE ? OR s.service_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const countSql = `
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      ${whereClause}
    `;
    const countRows = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT b.*, u.full_name as customer_name, s.service_name,
             (SELECT GROUP_CONCAT(v.volunteer_name SEPARATOR ', ') FROM booking_volunteers bv JOIN volunteers v ON bv.volunteer_id = v.id WHERE bv.booking_id = b.id) as volunteer_names
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));
    const rows = await query(dataSql, params);

    return {
      items: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  async createBooking(bookingData) {
    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      const {
        booking_number,
        user_id,
        service_id,
        package_id,
        address_id,
        scheduled_date,
        scheduled_time,
        booking_status = 'Pending',
        payment_status = 'Pending',
        payment_method = 'Cash',
        special_instructions,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount
      } = bookingData;

      const [res] = await conn.execute(
        `INSERT INTO bookings (booking_number, user_id, company_id, service_id, package_id, address_id, scheduled_date, scheduled_time, booking_status, payment_status, payment_method, special_instructions, subtotal, tax_amount, discount_amount, total_amount)
         VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [booking_number, user_id, service_id, package_id || null, address_id, scheduled_date, scheduled_time, booking_status, payment_status, payment_method, special_instructions || null, subtotal, tax_amount, discount_amount, total_amount]
      );
      const bookingId = res.insertId;

      // Booking Services
      await conn.execute(
        `INSERT INTO booking_services (booking_id, service_id, package_id, service_price, quantity, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [bookingId, service_id, package_id || null, subtotal, 1, subtotal]
      );

      // Initial Status History
      await conn.execute(
        `INSERT INTO booking_status_history (booking_id, status, remarks, changed_by)
         VALUES (?, ?, ?, ?)`,
        [bookingId, 'Pending', 'Booking created by customer', 'Customer']
      );

      await conn.commit();
      conn.release();

      return bookingId;
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  }

  async updateStatus(bookingId, status, remarks = null, changedBy = 'System') {
    await query(`UPDATE bookings SET booking_status = ? WHERE id = ?`, [status, bookingId]);
    await query(`INSERT INTO booking_status_history (booking_id, status, remarks, changed_by) VALUES (?, ?, ?, ?)`, [bookingId, status, remarks, changedBy]);
    return this.findById(bookingId);
  }

  async updatePaymentStatus(bookingId, paymentStatus) {
    await query(`UPDATE bookings SET payment_status = ? WHERE id = ?`, [paymentStatus, bookingId]);
    return this.findById(bookingId);
  }

  async rescheduleBooking(bookingId, userId, date, time) {
    await query(`UPDATE bookings SET scheduled_date = ?, scheduled_time = ? WHERE id = ? AND user_id = ?`, [date, time, bookingId, userId]);
    await query(`INSERT INTO booking_status_history (booking_id, status, remarks, changed_by) VALUES (?, ?, ?, ?)`, [bookingId, 'Rescheduled', `Rescheduled to ${date} at ${time}`, 'Customer']);
    return this.findById(bookingId);
  }

  async cancelBooking(bookingId, userId, remarks = 'Cancelled by customer') {
    await query(`UPDATE bookings SET booking_status = 'Cancelled', cancelled_at = NOW() WHERE id = ? AND user_id = ?`, [bookingId, userId]);
    await query(`INSERT INTO booking_status_history (booking_id, status, remarks, changed_by) VALUES (?, ?, ?, ?)`, [bookingId, 'Cancelled', remarks, 'Customer']);
    return this.findById(bookingId);
  }

  async assignVolunteers(bookingId, volunteerIds = []) {
    await query(`DELETE FROM booking_volunteers WHERE booking_id = ?`, [bookingId]);
    for (const volId of volunteerIds) {
      await query(`INSERT INTO booking_volunteers (booking_id, volunteer_id) VALUES (?, ?)`, [bookingId, volId]);
    }
    // We map internally to 'Employee Assigned' status for DB consistency
    await this.updateStatus(bookingId, 'Employee Assigned', `Assigned ${volunteerIds.length} volunteer(s)`, 'Admin');
    return this.findById(bookingId);
  }

  async assignEmployees(bookingId, employeeIds = []) {
    return this.assignVolunteers(bookingId, employeeIds);
  }
}

module.exports = new BookingRepository();
