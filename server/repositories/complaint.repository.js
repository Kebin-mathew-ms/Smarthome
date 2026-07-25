const { query } = require('../config/db');

class ComplaintRepository {
  async createTicket({ booking_id, ticket_number, user_id, company_id, complaint_category, priority = 'Medium', subject, description }) {
    const sql = `
      INSERT INTO complaints (booking_id, ticket_number, user_id, company_id, complaint_category, priority, status, subject, description)
      VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?)
    `;
    const result = await query(sql, [booking_id, ticket_number, user_id, company_id, complaint_category, priority, subject, description]);
    const complaintId = result.insertId;

    // Add initial message
    await this.addMessage(complaintId, user_id, description);

    return complaintId;
  }

  async addMessage(complaintId, senderId, messageText) {
    const sql = `INSERT INTO complaint_messages (complaint_id, sender_id, message) VALUES (?, ?, ?)`;
    const result = await query(sql, [complaintId, senderId, messageText]);
    return result.insertId;
  }

  async addAttachment(messageId, filePath, mimeType) {
    const sql = `INSERT INTO complaint_attachments (complaint_message_id, file_path, mime_type) VALUES (?, ?, ?)`;
    return await query(sql, [messageId, filePath, mimeType]);
  }

  async findById(id) {
    const sql = `
      SELECT c.*, u.full_name as user_name, comp.company_name, b.booking_number
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      JOIN companies comp ON c.company_id = comp.id
      JOIN bookings b ON c.booking_id = b.id
      WHERE c.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    if (!rows[0]) return null;

    const complaint = rows[0];
    const msgRows = await query(
      `SELECT cm.*, u.full_name as sender_name, u.role as sender_role FROM complaint_messages cm JOIN users u ON cm.sender_id = u.id WHERE cm.complaint_id = ? ORDER BY cm.created_at ASC`,
      [id]
    );

    const messages = [];
    for (const msg of msgRows) {
      const attachments = await query(`SELECT * FROM complaint_attachments WHERE complaint_message_id = ?`, [msg.id]);
      messages.push({
        ...msg,
        attachments
      });
    }

    return {
      ...complaint,
      messages
    };
  }

  async findUserComplaints(userId) {
    const sql = `
      SELECT c.*, comp.company_name, b.booking_number
      FROM complaints c
      JOIN companies comp ON c.company_id = comp.id
      JOIN bookings b ON c.booking_id = b.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `;
    return await query(sql, [userId]);
  }

  async findCompanyComplaints(companyId) {
    const sql = `
      SELECT c.*, u.full_name as user_name, b.booking_number
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      JOIN bookings b ON c.booking_id = b.id
      WHERE c.company_id = ?
      ORDER BY c.created_at DESC
    `;
    return await query(sql, [companyId]);
  }

  async findAllComplaints() {
    const sql = `
      SELECT c.*, u.full_name as user_name, comp.company_name, b.booking_number
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      JOIN companies comp ON c.company_id = comp.id
      JOIN bookings b ON c.booking_id = b.id
      ORDER BY c.created_at DESC
    `;
    return await query(sql, []);
  }

  async updateStatus(id, status) {
    const sql = `
      UPDATE complaints
      SET status = ?, closed_at = IF(? IN ('Resolved', 'Closed', 'Rejected'), NOW(), closed_at)
      WHERE id = ?
    `;
    await query(sql, [status, status, id]);
    return this.findById(id);
  }
}

module.exports = new ComplaintRepository();
