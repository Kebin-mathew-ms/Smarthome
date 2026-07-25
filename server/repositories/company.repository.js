const { query } = require('../config/db');

class CompanyRepository {
  async findById(id) {
    const sql = `
      SELECT c.*, cs.working_hours, cs.working_days, cs.service_radius, cs.minimum_booking_amount, cs.company_status,
             u.first_name as creator_first_name, u.last_name as creator_last_name, u.email as creator_email
      FROM companies c
      LEFT JOIN company_settings cs ON c.id = cs.company_id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ? AND c.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  async findByEmail(company_email) {
    const sql = `
      SELECT * FROM companies
      WHERE company_email = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [company_email]);
    return rows[0] || null;
  }

  async create({ company_name, company_email, company_phone, logo = null, address, city, district = null, state, postal_code, description = null, status = 'pending', created_by }) {
    const sql = `
      INSERT INTO companies (company_name, company_email, company_phone, logo, address, city, district, state, postal_code, description, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      company_name, company_email, company_phone, logo, address, city, district, state, postal_code, description, status, created_by
    ]);
    return this.findById(result.insertId);
  }

  async update(id, { company_name, company_email, company_phone, logo, address, city, district, state, postal_code, description, status }) {
    const sql = `
      UPDATE companies
      SET company_name = ?, company_email = ?, company_phone = ?, logo = COALESCE(?, logo), address = ?, city = ?, district = ?, state = ?, postal_code = ?, description = ?, status = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    await query(sql, [
      company_name, company_email, company_phone, logo, address, city, district, state, postal_code, description, status, id
    ]);
    return this.findById(id);
  }

  async updateStatus(id, status) {
    const sql = `
      UPDATE companies
      SET status = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    await query(sql, [status, id]);
    // Sync with company_settings status
    const syncSql = `UPDATE company_settings SET company_status = ? WHERE company_id = ?`;
    await query(syncSql, [status, id]);
    return this.findById(id);
  }

  async softDelete(id) {
    const sql = `
      UPDATE companies
      SET deleted_at = NOW(), status = 'inactive'
      WHERE id = ? AND deleted_at IS NULL
    `;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  async findAll({ page = 1, limit = 10, status, city, district, startDate, endDate, search }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE deleted_at IS NULL';

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (city) {
      whereClause += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }

    if (district) {
      whereClause += ' AND district LIKE ?';
      params.push(`%${district}%`);
    }

    if (startDate) {
      whereClause += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND created_at <= ?';
      params.push(endDate);
    }

    if (search) {
      whereClause += ' AND (company_name LIKE ? OR company_email LIKE ? OR company_phone LIKE ? OR city LIKE ? OR state LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    const countSql = `SELECT COUNT(*) as total FROM companies ${whereClause}`;
    const countRows = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT id, company_name, company_email, company_phone, logo, address, city, district, state, postal_code, status, created_at, updated_at
      FROM companies
      ${whereClause}
      ORDER BY created_at DESC
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

  async getCountsByStatus() {
    const sql = `
      SELECT status, COUNT(*) as count
      FROM companies
      WHERE deleted_at IS NULL
      GROUP BY status
    `;
    const rows = await query(sql);
    const stats = { total: 0, active: 0, inactive: 0, pending: 0, blocked: 0, rejected: 0 };
    rows.forEach(r => {
      stats[r.status] = r.count;
      stats.total += r.count;
    });
    return stats;
  }

  async getRecent(limit = 5) {
    const sql = `
      SELECT id, company_name, company_email, city, status, created_at
      FROM companies
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ?
    `;
    return await query(sql, [Number(limit)]);
  }
}

module.exports = new CompanyRepository();
