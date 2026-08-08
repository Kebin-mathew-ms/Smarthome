const { query } = require('../config/db');

class VolunteerRepository {
  async findById(id) {
    const sql = `
      SELECT * FROM volunteers
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    if (!rows[0]) return null;

    const skills = await this.getSkills(id);
    return {
      ...rows[0],
      skills
    };
  }

  async findByEmail(email) {
    const sql = `
      SELECT * FROM volunteers
      WHERE email = ? AND deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [email]);
    return rows[0] || null;
  }

  async create({ volunteer_name, email, phone, designation, profile_photo = null, address = null, status = 'active' }) {
    const sql = `
      INSERT INTO volunteers (company_id, volunteer_name, email, phone, designation, profile_photo, address, status)
      VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [volunteer_name, email, phone, designation, profile_photo, address, status]);
    return result.insertId;
  }

  async update(id, { volunteer_name, email, phone, designation, profile_photo, address, status }) {
    const sql = `
      UPDATE volunteers
      SET volunteer_name = ?, email = ?, phone = ?, designation = ?, profile_photo = COALESCE(?, profile_photo), address = ?, status = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    await query(sql, [volunteer_name, email, phone, designation, profile_photo, address, status, id]);
    return this.findById(id);
  }

  async updateStatus(id, status) {
    const sql = `
      UPDATE volunteers
      SET status = ?
      WHERE id = ? AND deleted_at IS NULL
    `;
    await query(sql, [status, id]);
    return this.findById(id);
  }

  async softDelete(id) {
    const sql = `
      UPDATE volunteers
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
      whereClause += ' AND (volunteer_name LIKE ? OR email LIKE ? OR phone LIKE ? OR designation LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const countSql = `SELECT COUNT(*) as total FROM volunteers ${whereClause}`;
    const countRows = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT * FROM volunteers
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
  async setSkills(volunteerId, skills = []) {
    await query(`DELETE FROM volunteer_skills WHERE volunteer_id = ?`, [volunteerId]);
    for (const skill of skills) {
      if (skill.subcategory_id) {
        await query(
          `INSERT INTO volunteer_skills (volunteer_id, subcategory_id, experience_years) VALUES (?, ?, ?)`,
          [volunteerId, skill.subcategory_id, skill.experience_years || 1]
        );
      }
    }
  }

  async getSkills(volunteerId) {
    const sql = `
      SELECT es.id, es.subcategory_id, es.experience_years, sub.subcategory_name, c.category_name
      FROM volunteer_skills es
      JOIN service_subcategories sub ON es.subcategory_id = sub.id
      JOIN service_categories c ON sub.category_id = c.id
      WHERE es.volunteer_id = ?
    `;
    return await query(sql, [volunteerId]);
  }

  async countAll() {
    const sql = `SELECT COUNT(*) as total FROM volunteers WHERE deleted_at IS NULL`;
    const rows = await query(sql);
    return rows[0].total;
  }
}

module.exports = new VolunteerRepository();
