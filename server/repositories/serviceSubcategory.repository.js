const { query } = require('../config/db');

class ServiceSubcategoryRepository {
  async findById(id) {
    const sql = `
      SELECT sub.*, c.category_name
      FROM service_subcategories sub
      JOIN service_categories c ON sub.category_id = c.id
      WHERE sub.id = ? AND sub.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  async findByNameAndCategory(subcategory_name, category_id) {
    const sql = `
      SELECT * FROM service_subcategories
      WHERE subcategory_name = ? AND category_id = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [subcategory_name, category_id]);
    return rows[0] || null;
  }

  async create({ category_id, subcategory_name, icon = null, description = null, status = 'active' }) {
    const sql = `
      INSERT INTO service_subcategories (category_id, subcategory_name, icon, description, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [category_id, subcategory_name, icon, description, status]);
    return this.findById(result.insertId);
  }

  async update(id, { category_id, subcategory_name, icon, description, status }) {
    const sql = `
      UPDATE service_subcategories
      SET category_id = ?, subcategory_name = ?, icon = COALESCE(?, icon), description = ?, status = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    await query(sql, [category_id, subcategory_name, icon, description, status, id]);
    return this.findById(id);
  }

  async softDelete(id) {
    const sql = `
      UPDATE service_subcategories
      SET deleted_at = NOW(), status = 'inactive'
      WHERE id = ? AND deleted_at IS NULL
    `;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  async findAll({ page = 1, limit = 10, category_id, status, search }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE sub.deleted_at IS NULL';

    if (category_id) {
      whereClause += ' AND sub.category_id = ?';
      params.push(category_id);
    }

    if (status) {
      whereClause += ' AND sub.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (sub.subcategory_name LIKE ? OR sub.description LIKE ? OR c.category_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const countSql = `
      SELECT COUNT(*) as total
      FROM service_subcategories sub
      JOIN service_categories c ON sub.category_id = c.id
      ${whereClause}
    `;
    const countRows = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT sub.*, c.category_name
      FROM service_subcategories sub
      JOIN service_categories c ON sub.category_id = c.id
      ${whereClause}
      ORDER BY sub.created_at DESC
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

module.exports = new ServiceSubcategoryRepository();
