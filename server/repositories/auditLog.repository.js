const { query } = require('../config/db');

class AuditLogRepository {
  async create({ user_id, action, table_name, record_id, ip_address }) {
    const sql = `
      INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [user_id || null, action, table_name, record_id || null, ip_address || null]);
    return result.insertId;
  }

  async findAll({ page = 1, limit = 10, action, table_name, user_id, startDate, endDate }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (action) {
      whereClause += ' AND al.action = ?';
      params.push(action);
    }
    if (table_name) {
      whereClause += ' AND al.table_name = ?';
      params.push(table_name);
    }
    if (user_id) {
      whereClause += ' AND al.user_id = ?';
      params.push(user_id);
    }
    if (startDate) {
      whereClause += ' AND al.created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND al.created_at <= ?';
      params.push(endDate);
    }

    const countSql = `SELECT COUNT(*) as total FROM audit_logs al ${whereClause}`;
    const countRows = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT al.*, u.first_name, u.last_name, u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
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

module.exports = new AuditLogRepository();
