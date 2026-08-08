const { query } = require('../config/db');

class ServicePackageRepository {
  async findById(id) {
    const sql = `
      SELECT sp.*, s.service_name
      FROM service_packages sp
      JOIN services s ON sp.service_id = s.id
      WHERE sp.id = ? AND sp.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  async create({ service_id, package_name, package_description = null, price, estimated_duration = null, status = 'active' }) {
    const sql = `
      INSERT INTO service_packages (service_id, package_name, package_description, price, estimated_duration, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [service_id, package_name, package_description, price, estimated_duration, status]);
    return result.insertId;
  }

  async update(id, { package_name, package_description, price, estimated_duration, status }) {
    const pkg = await this.findById(id);
    if (!pkg) return null;

    const sql = `
      UPDATE service_packages
      SET package_name = ?, package_description = ?, price = ?, estimated_duration = ?, status = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    await query(sql, [package_name, package_description, price, estimated_duration, status, id]);
    return this.findById(id);
  }

  async softDelete(id) {
    const pkg = await this.findById(id);
    if (!pkg) return false;

    const sql = `UPDATE service_packages SET deleted_at = NOW(), status = 'inactive' WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  async findByServiceId(serviceId) {
    const sql = `
      SELECT * FROM service_packages
      WHERE service_id = ? AND deleted_at IS NULL
      ORDER BY price ASC
    `;
    return await query(sql, [serviceId]);
  }

  async findAll() {
    const sql = `
      SELECT sp.*, s.service_name
      FROM service_packages sp
      JOIN services s ON sp.service_id = s.id
      WHERE sp.deleted_at IS NULL AND s.deleted_at IS NULL
      ORDER BY sp.created_at DESC
    `;
    return await query(sql);
  }
}

module.exports = new ServicePackageRepository();
