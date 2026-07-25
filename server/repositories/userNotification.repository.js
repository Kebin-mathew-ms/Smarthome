const { query } = require('../config/db');

class UserNotificationRepository {
  async createNotification({ user_id, title, message, notification_type = 'general', reference_type = null, reference_id = null }) {
    const sql = `
      INSERT INTO notifications (user_id, title, message, notification_type, reference_type, reference_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [user_id, title, message, notification_type, reference_type, reference_id]);
    return result.insertId;
  }

  async findByUserId(userId, limit = 20) {
    const sql = `
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;
    return await query(sql, [userId, Number(limit)]);
  }

  async getUnreadCount(userId) {
    const sql = `SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND read_status = FALSE`;
    const rows = await query(sql, [userId]);
    return rows[0].unread || 0;
  }

  async markRead(id, userId) {
    const sql = `UPDATE notifications SET read_status = TRUE WHERE id = ? AND user_id = ?`;
    await query(sql, [id, userId]);
  }

  async markAllRead(userId) {
    const sql = `UPDATE notifications SET read_status = TRUE WHERE user_id = ?`;
    await query(sql, [userId]);
  }

  async delete(id, userId) {
    const sql = `DELETE FROM notifications WHERE id = ? AND user_id = ?`;
    await query(sql, [id, userId]);
  }
}

module.exports = new UserNotificationRepository();
