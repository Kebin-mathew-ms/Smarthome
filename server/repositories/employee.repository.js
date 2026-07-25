const { query } = require('../config/db');

class EmployeeRepository {
  async findById(id, companyId) {
    const sql = `
      SELECT * FROM company_employees
      WHERE id = ? AND company_id = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [id, companyId]);
    if (!rows[0]) return null;

    const skills = await this.getSkills(id);
    return {
      ...rows[0],
      skills
    };
  }

  async findByEmail(email, companyId) {
    const sql = `
      SELECT * FROM company_employees
      WHERE email = ? AND company_id = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [email, companyId]);
    return rows[0] || null;
  }

  async create({ company_id, employee_name, email, phone, designation, profile_photo = null, address = null, status = 'active' }) {
    const sql = `
      INSERT INTO company_employees (company_id, employee_name, email, phone, designation, profile_photo, address, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [company_id, employee_name, email, phone, designation, profile_photo, address, status]);
    return result.insertId;
  }

  async update(id, companyId, { employee_name, email, phone, designation, profile_photo, address, status }) {
    const sql = `
      UPDATE company_employees
      SET employee_name = ?, email = ?, phone = ?, designation = ?, profile_photo = COALESCE(?, profile_photo), address = ?, status = ?
      WHERE id = ? AND company_id = ? AND deleted_at IS NULL
    `;
    await query(sql, [employee_name, email, phone, designation, profile_photo, address, status, id, companyId]);
    return this.findById(id, companyId);
  }

  async updateStatus(id, companyId, status) {
    const sql = `
      UPDATE company_employees
      SET status = ?
      WHERE id = ? AND company_id = ? AND deleted_at IS NULL
    `;
    await query(sql, [status, id, companyId]);
    return this.findById(id, companyId);
  }

  async softDelete(id, companyId) {
    const sql = `
      UPDATE company_employees
      SET deleted_at = NOW(), status = 'inactive'
      WHERE id = ? AND company_id = ? AND deleted_at IS NULL
    `;
    const result = await query(sql, [id, companyId]);
    return result.affectedRows > 0;
  }

  async findAll(companyId, { page = 1, limit = 10, status, search }) {
    const offset = (page - 1) * limit;
    const params = [companyId];
    let whereClause = 'WHERE company_id = ? AND deleted_at IS NULL';

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (employee_name LIKE ? OR email LIKE ? OR phone LIKE ? OR designation LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const countSql = `SELECT COUNT(*) as total FROM company_employees ${whereClause}`;
    const countRows = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT * FROM company_employees
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

  // Skills mapping
  async setSkills(employeeId, skills = []) {
    await query(`DELETE FROM employee_skills WHERE employee_id = ?`, [employeeId]);
    for (const skill of skills) {
      if (skill.subcategory_id) {
        await query(
          `INSERT INTO employee_skills (employee_id, subcategory_id, experience_years) VALUES (?, ?, ?)`,
          [employeeId, skill.subcategory_id, skill.experience_years || 1]
        );
      }
    }
  }

  async getSkills(employeeId) {
    const sql = `
      SELECT es.id, es.subcategory_id, es.experience_years, sub.subcategory_name, c.category_name
      FROM employee_skills es
      JOIN service_subcategories sub ON es.subcategory_id = sub.id
      JOIN service_categories c ON sub.category_id = c.id
      WHERE es.employee_id = ?
    `;
    return await query(sql, [employeeId]);
  }

  async countByCompanyId(companyId) {
    const sql = `SELECT COUNT(*) as total FROM company_employees WHERE company_id = ? AND deleted_at IS NULL`;
    const rows = await query(sql, [companyId]);
    return rows[0].total;
  }
}

module.exports = new EmployeeRepository();
