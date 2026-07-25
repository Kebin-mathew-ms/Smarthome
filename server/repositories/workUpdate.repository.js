const { query } = require('../config/db');

class WorkUpdateRepository {
  async createWorkUpdate({ booking_id, title, description, created_by }) {
    const sql = `
      INSERT INTO work_updates (booking_id, title, description, created_by)
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [booking_id, title, description, created_by]);
    return result.insertId;
  }

  async addMedia(workUpdateId, { media_type = 'image', file_path, thumbnail = null, caption = null }) {
    const sql = `
      INSERT INTO work_update_media (work_update_id, media_type, file_path, thumbnail, caption)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [workUpdateId, media_type, file_path, thumbnail, caption]);
    return result.insertId;
  }

  async findByBookingId(bookingId) {
    const sql = `
      SELECT wu.*, u.full_name as creator_name
      FROM work_updates wu
      JOIN users u ON wu.created_by = u.id
      WHERE wu.booking_id = ?
      ORDER BY wu.created_at DESC
    `;
    const rows = await query(sql, [bookingId]);

    const updates = [];
    for (const update of rows) {
      const media = await query(`SELECT * FROM work_update_media WHERE work_update_id = ?`, [update.id]);
      updates.push({
        ...update,
        media
      });
    }

    return updates;
  }

  async deleteWorkUpdate(id, userId) {
    const sql = `DELETE FROM work_updates WHERE id = ? AND created_by = ?`;
    const result = await query(sql, [id, userId]);
    return result.affectedRows > 0;
  }
}

module.exports = new WorkUpdateRepository();
