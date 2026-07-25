const { query } = require('../config/db');

class NotificationRepository {
  async queueNotification({ user_id = null, company_id = null, booking_id = null, notification_type, title, message, status = 'pending' }) {
    const sql = `
      INSERT INTO notification_queue (user_id, company_id, booking_id, notification_type, title, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [user_id, company_id, booking_id, notification_type, title, message, status]);
    return result.insertId;
  }

  async findByUserId(userId) {
    const sql = `SELECT * FROM notification_queue WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`;
    return await query(sql, [userId]);
  }

  async findByCompanyId(companyId) {
    const sql = `SELECT * FROM notification_queue WHERE company_id = ? ORDER BY created_at DESC LIMIT 20`;
    return await query(sql, [companyId]);
  }
}

module.exports = new NotificationRepository();
