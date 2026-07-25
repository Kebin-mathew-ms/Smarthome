const { query } = require('../config/db');

class ServiceCategoryRepository {
  async findById(id) {
    const sql = `
      SELECT id, category_name, icon, description, status, created_at, updated_at
      FROM service_categories
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  async findByName(category_name) {
    const sql = `
      SELECT id, category_name, icon, description, status, created_at, updated_at
      FROM service_categories
      WHERE category_name = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [category_name]);
    return rows[0] || null;
  }

  async create({ category_name, icon = null, description = null, status = 'active' }) {
    const sql = `
      INSERT INTO service_categories (category_name, icon, description, status)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [category_name, icon, description, status]);
    return this.findById(result.insertId);
  }

  async update(id, { category_name, icon, description, status }) {
    const sql = `
      UPDATE service_categories
      SET category_name = ?, icon = COALESCE(?, icon), description = ?, status = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    await query(sql, [category_name, icon, description, status, id]);
    return this.findById(id);
  }

  async softDelete(id) {
    const sql = `
      UPDATE service_categories
      SET deleted_at = NOW(), status = 'inactive'
      WHERE id = ? AND deleted_at IS NULL
    `;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  async findAll({ page = 1, limit = 10, status, search }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE deleted_at IS NULL';

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (category_name LIKE ? OR description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    const countSql = `SELECT COUNT(*) as total FROM service_categories ${whereClause}`;
    const countRows = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT id, category_name, icon, description, status, created_at, updated_at
      FROM service_categories
      ${whereClause}
      ORDER BY category_name ASC
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
}

module.exports = new ServiceCategoryRepository();
