const { query } = require('../config/db');

class ActivityLogRepository {
  async findLogs({ page = 1, limit = 50, search }) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT al.*, u.full_name as user_name, u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (al.activity LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY al.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const rows = await query(sql, params);

    const countSql = `SELECT COUNT(*) as total FROM activity_logs`;
    const countRows = await query(countSql, []);

    return {
      items: rows,
      total: countRows[0].total || 0
    };
  }
}

module.exports = new ActivityLogRepository();
