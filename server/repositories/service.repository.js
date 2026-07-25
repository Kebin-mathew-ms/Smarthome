const { query } = require('../config/db');

class ServiceRepository {
  async findById(id, companyId) {
    const sql = `
      SELECT s.*, c.category_name, sub.subcategory_name
      FROM services s
      JOIN service_categories c ON s.category_id = c.id
      JOIN service_subcategories sub ON s.subcategory_id = sub.id
      WHERE s.id = ? AND s.company_id = ? AND s.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [id, companyId]);
    if (!rows[0]) return null;

    const images = await this.getImages(id);
    const features = await this.getFeatures(id);

    return {
      ...rows[0],
      images,
      features
    };
  }

  async findByName(serviceName, companyId) {
    const sql = `
      SELECT * FROM services
      WHERE service_name = ? AND company_id = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [serviceName, companyId]);
    return rows[0] || null;
  }

  async create({ company_id, category_id, subcategory_id, service_name, short_description, full_description, starting_price, estimated_duration, service_type = 'on_site', thumbnail = null, status = 'active' }) {
    const sql = `
      INSERT INTO services (company_id, category_id, subcategory_id, service_name, short_description, full_description, starting_price, estimated_duration, service_type, thumbnail, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      company_id, category_id, subcategory_id, service_name, short_description, full_description, starting_price, estimated_duration, service_type, thumbnail, status
    ]);
    return result.insertId;
  }

  async update(id, companyId, { category_id, subcategory_id, service_name, short_description, full_description, starting_price, estimated_duration, service_type, thumbnail, status }) {
    const sql = `
      UPDATE services
      SET category_id = ?, subcategory_id = ?, service_name = ?, short_description = ?, full_description = ?, starting_price = ?, estimated_duration = ?, service_type = ?, thumbnail = COALESCE(?, thumbnail), status = ?
      WHERE id = ? AND company_id = ? AND deleted_at IS NULL
    `;
    await query(sql, [
      category_id, subcategory_id, service_name, short_description, full_description, starting_price, estimated_duration, service_type, thumbnail, status, id, companyId
    ]);
    return this.findById(id, companyId);
  }

  async updateStatus(id, companyId, status) {
    const sql = `
      UPDATE services
      SET status = ?
      WHERE id = ? AND company_id = ? AND deleted_at IS NULL
    `;
    await query(sql, [status, id, companyId]);
    return this.findById(id, companyId);
  }

  async softDelete(id, companyId) {
    const sql = `
      UPDATE services
      SET deleted_at = NOW(), status = 'inactive'
      WHERE id = ? AND company_id = ? AND deleted_at IS NULL
    `;
    const result = await query(sql, [id, companyId]);
    return result.affectedRows > 0;
  }

  async findAll(companyId, { page = 1, limit = 10, category_id, subcategory_id, status, search, minPrice, maxPrice }) {
    const offset = (page - 1) * limit;
    const params = [companyId];
    let whereClause = 'WHERE s.company_id = ? AND s.deleted_at IS NULL';

    if (category_id) {
      whereClause += ' AND s.category_id = ?';
      params.push(category_id);
    }
    if (subcategory_id) {
      whereClause += ' AND s.subcategory_id = ?';
      params.push(subcategory_id);
    }
    if (status) {
      whereClause += ' AND s.status = ?';
      params.push(status);
    }
    if (minPrice !== undefined && minPrice !== '') {
      whereClause += ' AND s.starting_price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      whereClause += ' AND s.starting_price <= ?';
      params.push(Number(maxPrice));
    }
    if (search) {
      whereClause += ' AND (s.service_name LIKE ? OR s.short_description LIKE ? OR c.category_name LIKE ? OR sub.subcategory_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const countSql = `
      SELECT COUNT(*) as total
      FROM services s
      JOIN service_categories c ON s.category_id = c.id
      JOIN service_subcategories sub ON s.subcategory_id = sub.id
      ${whereClause}
    `;
    const countRows = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT s.*, c.category_name, sub.subcategory_name
      FROM services s
      JOIN service_categories c ON s.category_id = c.id
      JOIN service_subcategories sub ON s.subcategory_id = sub.id
      ${whereClause}
      ORDER BY s.created_at DESC
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

  // Feature operations
  async setFeatures(serviceId, featureNames = []) {
    await query(`DELETE FROM service_features WHERE service_id = ?`, [serviceId]);
    for (const name of featureNames) {
      if (name && name.trim()) {
        await query(`INSERT INTO service_features (service_id, feature_name) VALUES (?, ?)`, [serviceId, name.trim()]);
      }
    }
  }

  async getFeatures(serviceId) {
    const rows = await query(`SELECT id, feature_name FROM service_features WHERE service_id = ?`, [serviceId]);
    return rows;
  }

  // Image operations
  async addImage(serviceId, imagePath, displayOrder = 0) {
    const sql = `INSERT INTO service_images (service_id, image_path, display_order) VALUES (?, ?, ?)`;
    return await query(sql, [serviceId, imagePath, displayOrder]);
  }

  async getImages(serviceId) {
    const sql = `SELECT id, image_path, display_order FROM service_images WHERE service_id = ? ORDER BY display_order ASC, id ASC`;
    return await query(sql, [serviceId]);
  }

  async countByCompanyId(companyId) {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
      FROM services
      WHERE company_id = ? AND deleted_at IS NULL
    `;
    const rows = await query(sql, [companyId]);
    return rows[0] || { total: 0, active: 0, inactive: 0 };
  }
}

module.exports = new ServiceRepository();
