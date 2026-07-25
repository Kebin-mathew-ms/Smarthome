const { query } = require('../config/db');

class AnnouncementRepository {
  async createAnnouncement({ title, description, visible_to = 'all', start_date, end_date, status = 'active' }) {
    const sql = `
      INSERT INTO system_announcements (title, description, visible_to, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [title, description, visible_to, start_date, end_date, status]);
    return result.insertId;
  }

  async updateAnnouncement(id, { title, description, visible_to, start_date, end_date, status }) {
    const sql = `
      UPDATE system_announcements
      SET title = ?, description = ?, visible_to = ?, start_date = ?, end_date = ?, status = ?
      WHERE id = ?
    `;
    await query(sql, [title, description, visible_to, start_date, end_date, status, id]);
  }

  async deleteAnnouncement(id) {
    const sql = `DELETE FROM system_announcements WHERE id = ?`;
    await query(sql, [id]);
  }

  async findActiveAnnouncements(role = 'all') {
    const sql = `
      SELECT * FROM system_announcements
      WHERE status = 'active'
      AND (visible_to = 'all' OR visible_to = ?)
      AND CURDATE() BETWEEN start_date AND end_date
      ORDER BY created_at DESC
    `;
    return await query(sql, [role]);
  }

  async findAllAnnouncements() {
    const sql = `SELECT * FROM system_announcements ORDER BY created_at DESC`;
    return await query(sql, []);
  }
}

module.exports = new AnnouncementRepository();
