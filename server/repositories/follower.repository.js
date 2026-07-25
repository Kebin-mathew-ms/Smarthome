const { query } = require('../config/db');

class FollowerRepository {
  async followCompany(userId, companyId) {
    const sql = `
      INSERT INTO company_followers (company_id, user_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
    `;
    const result = await query(sql, [companyId, userId]);
    return result;
  }

  async unfollowCompany(userId, companyId) {
    const sql = `DELETE FROM company_followers WHERE company_id = ? AND user_id = ?`;
    const result = await query(sql, [companyId, userId]);
    return result.affectedRows > 0;
  }

  async findUserFollowing(userId) {
    const sql = `
      SELECT cf.id as follow_id, cf.created_at as followed_at, c.id as company_id, c.company_name, c.logo, c.city, c.state
      FROM company_followers cf
      JOIN companies c ON cf.company_id = c.id
      WHERE cf.user_id = ? AND c.deleted_at IS NULL
      ORDER BY cf.created_at DESC
    `;
    return await query(sql, [userId]);
  }

  async isFollowing(userId, companyId) {
    const sql = `SELECT id FROM company_followers WHERE user_id = ? AND company_id = ? LIMIT 1`;
    const rows = await query(sql, [userId, companyId]);
    return Boolean(rows[0]);
  }
}

module.exports = new FollowerRepository();
