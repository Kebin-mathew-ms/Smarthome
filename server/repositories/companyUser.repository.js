const { query } = require('../config/db');

class CompanyUserRepository {
  async linkUserToCompany(company_id, user_id, designation = null) {
    const sql = `
      INSERT INTO company_users (company_id, user_id, designation)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE designation = VALUES(designation)
    `;
    const result = await query(sql, [company_id, user_id, designation]);
    return result;
  }

  async findUsersByCompanyId(company_id) {
    const sql = `
      SELECT cu.id, cu.company_id, cu.user_id, cu.designation, cu.created_at,
             u.first_name, u.last_name, u.email, u.phone, u.role, u.status
      FROM company_users cu
      JOIN users u ON cu.user_id = u.id
      WHERE cu.company_id = ? AND u.deleted_at IS NULL
    `;
    return await query(sql, [company_id]);
  }

  async findCompanyByUserId(user_id) {
    const sql = `
      SELECT cu.id, cu.company_id, cu.user_id, cu.designation, cu.created_at,
             c.company_name, c.company_email, c.company_phone, c.logo, c.status
      FROM company_users cu
      JOIN companies c ON cu.company_id = c.id
      WHERE cu.user_id = ? AND c.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [user_id]);
    return rows[0] || null;
  }

  async removeUserFromCompany(company_id, user_id) {
    const sql = `
      DELETE FROM company_users
      WHERE company_id = ? AND user_id = ?
    `;
    const result = await query(sql, [company_id, user_id]);
    return result.affectedRows > 0;
  }
}

module.exports = new CompanyUserRepository();
