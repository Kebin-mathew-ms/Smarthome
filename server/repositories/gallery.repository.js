const { query } = require('../config/db');

class GalleryRepository {
  async findByCompanyId(companyId) {
    const sql = `
      SELECT * FROM company_gallery
      WHERE company_id = ?
      ORDER BY display_order ASC, created_at DESC
    `;
    return await query(sql, [companyId]);
  }

  async findById(id, companyId) {
    const sql = `
      SELECT * FROM company_gallery
      WHERE id = ? AND company_id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id, companyId]);
    return rows[0] || null;
  }

  async create({ company_id, image_path, caption = null, display_order = 0 }) {
    const sql = `
      INSERT INTO company_gallery (company_id, image_path, caption, display_order)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [company_id, image_path, caption, display_order]);
    return this.findById(result.insertId, company_id);
  }

  async delete(id, companyId) {
    const sql = `DELETE FROM company_gallery WHERE id = ? AND company_id = ?`;
    const result = await query(sql, [id, companyId]);
    return result.affectedRows > 0;
  }
}

module.exports = new GalleryRepository();
