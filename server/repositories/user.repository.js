const { query } = require('../config/db');

class UserRepository {
  async findByEmail(email) {
    const sql = `
      SELECT id, first_name, last_name, email, phone, password, role, status, profile_photo, last_login, created_at, updated_at
      FROM users
      WHERE email = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [email]);
    return rows[0] || null;
  }

  async findById(id) {
    const sql = `
      SELECT id, first_name, last_name, email, phone, password, role, status, profile_photo, last_login, created_at, updated_at
      FROM users
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  async create({ first_name, last_name, email, phone, password, role = 'User', status = 'active', profile_photo = null }) {
    const sql = `
      INSERT INTO users (first_name, last_name, email, phone, password, role, status, profile_photo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [first_name, last_name, email, phone, password, role, status, profile_photo]);
    return this.findById(result.insertId);
  }

  async update(id, { first_name, last_name, phone, profile_photo }) {
    const sql = `
      UPDATE users
      SET first_name = ?, last_name = ?, phone = ?, profile_photo = COALESCE(?, profile_photo)
      WHERE id = ? AND deleted_at IS NULL
    `;
    await query(sql, [first_name, last_name, phone, profile_photo, id]);
    return this.findById(id);
  }

  async updateStatus(id, status) {
    const sql = `
      UPDATE users
      SET status = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    await query(sql, [status, id]);
    return this.findById(id);
  }

  async updateLastLogin(id) {
    const sql = `
      UPDATE users
      SET last_login = NOW()
      WHERE id = ?
    `;
    await query(sql, [id]);
  }

  async updatePassword(id, hashedPassword) {
    const sql = `
      UPDATE users
      SET password = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    await query(sql, [hashedPassword, id]);
    return true;
  }

  async softDelete(id) {
    const sql = `
      UPDATE users
      SET deleted_at = NOW(), status = 'inactive'
      WHERE id = ? AND deleted_at IS NULL
    `;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  async findAll({ page = 1, limit = 10, role, status, search }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE deleted_at IS NULL';

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countRows = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT id, first_name, last_name, email, phone, role, status, profile_photo, last_login, created_at, updated_at
      FROM users
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

  async countCustomers() {
    const sql = `SELECT COUNT(*) as total FROM users WHERE role = 'User' AND deleted_at IS NULL`;
    const rows = await query(sql);
    return rows[0].total;
  }

  async countTodayRegistrations() {
    const sql = `SELECT COUNT(*) as total FROM users WHERE DATE(created_at) = CURDATE() AND deleted_at IS NULL`;
    const rows = await query(sql);
    return rows[0].total;
  }

  async getRecentUsers(limit = 5) {
    const sql = `
      SELECT id, first_name, last_name, email, role, status, created_at
      FROM users
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ?
    `;
    return await query(sql, [Number(limit)]);
  }
}

module.exports = new UserRepository();
