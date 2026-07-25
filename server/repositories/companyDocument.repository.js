const { query } = require('../config/db');

class CompanyDocumentRepository {
  async findByCompanyId(company_id) {
    const sql = `
      SELECT * FROM company_documents
      WHERE company_id = ?
      ORDER BY uploaded_at DESC
    `;
    return await query(sql, [company_id]);
  }

  async create({ company_id, document_name, document_path, document_type }) {
    const sql = `
      INSERT INTO company_documents (company_id, document_name, document_path, document_type)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [company_id, document_name, document_path, document_type]);
    return result.insertId;
  }

  async delete(id) {
    const sql = `DELETE FROM company_documents WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new CompanyDocumentRepository();
