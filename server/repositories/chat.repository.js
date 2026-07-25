const { query, getConnection } = require('../config/db');

class ChatRepository {
  async findRoomByBookingId(bookingId) {
    const sql = `SELECT * FROM chat_rooms WHERE booking_id = ? LIMIT 1`;
    const rows = await query(sql, [bookingId]);
    if (!rows[0]) return null;

    const room = rows[0];
    const participants = await query(
      `SELECT cp.*, u.full_name, u.email, u.role FROM chat_participants cp JOIN users u ON cp.user_id = u.id WHERE cp.room_id = ?`,
      [room.id]
    );
    room.participants = participants;
    return room;
  }

  async createRoom(bookingId) {
    const existing = await this.findRoomByBookingId(bookingId);
    if (existing) return existing;

    const sql = `INSERT INTO chat_rooms (booking_id, room_status) VALUES (?, 'active')`;
    const result = await query(sql, [bookingId]);
    return await this.findRoomByBookingId(bookingId);
  }

  async addParticipant(roomId, userId, role) {
    const sql = `
      INSERT INTO chat_participants (room_id, user_id, participant_role)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE last_seen = CURRENT_TIMESTAMP
    `;
    await query(sql, [roomId, userId, role]);
  }

  async isParticipant(roomId, userId) {
    const sql = `SELECT id FROM chat_participants WHERE room_id = ? AND user_id = ? LIMIT 1`;
    const rows = await query(sql, [roomId, userId]);
    return Boolean(rows[0]);
  }

  async createMessage({ room_id, sender_id, message_type = 'Text', message = null, reply_to = null }) {
    const sql = `
      INSERT INTO chat_messages (room_id, sender_id, message_type, message, reply_to)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [room_id, sender_id, message_type, message, reply_to]);
    return result.insertId;
  }

  async addAttachment(messageId, { file_name, original_name, file_path, file_size = 0, mime_type, thumbnail = null }) {
    const sql = `
      INSERT INTO chat_attachments (message_id, file_name, original_name, file_path, file_size, mime_type, thumbnail)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [messageId, file_name, original_name, file_path, file_size, mime_type, thumbnail]);
    return result.insertId;
  }

  async findMessageById(messageId) {
    const sql = `
      SELECT cm.*, u.full_name as sender_name, u.role as sender_role
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [messageId]);
    if (!rows[0]) return null;

    const msg = rows[0];
    const attachments = await query(`SELECT * FROM chat_attachments WHERE message_id = ?`, [messageId]);
    const read_by = await query(`SELECT user_id, read_at FROM chat_read_receipts WHERE message_id = ?`, [messageId]);

    return {
      ...msg,
      attachments,
      read_by
    };
  }

  async findMessagesByRoomId(roomId, { page = 1, limit = 50 }) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT cm.*, u.full_name as sender_name, u.role as sender_role
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.room_id = ?
      ORDER BY cm.created_at ASC
      LIMIT ? OFFSET ?
    `;
    const rows = await query(sql, [roomId, Number(limit), Number(offset)]);

    const messages = [];
    for (const msg of rows) {
      const attachments = await query(`SELECT * FROM chat_attachments WHERE message_id = ?`, [msg.id]);
      const read_by = await query(`SELECT user_id, read_at FROM chat_read_receipts WHERE message_id = ?`, [msg.id]);
      messages.push({
        ...msg,
        attachments,
        read_by
      });
    }

    return messages;
  }

  async markMessageRead(messageId, userId) {
    const sql = `
      INSERT INTO chat_read_receipts (message_id, user_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP
    `;
    await query(sql, [messageId, userId]);
  }

  async editMessage(messageId, senderId, newMessage) {
    const sql = `UPDATE chat_messages SET message = ?, edited = TRUE WHERE id = ? AND sender_id = ?`;
    await query(sql, [newMessage, messageId, senderId]);
    return this.findMessageById(messageId);
  }

  async deleteMessage(messageId, senderId) {
    const sql = `UPDATE chat_messages SET deleted = TRUE, message = 'This message was deleted' WHERE id = ? AND sender_id = ?`;
    await query(sql, [messageId, senderId]);
    return this.findMessageById(messageId);
  }

  async getSharedMedia(roomId) {
    const images = await query(
      `SELECT ca.*, cm.created_at FROM chat_attachments ca JOIN chat_messages cm ON ca.message_id = cm.id WHERE cm.room_id = ? AND ca.mime_type LIKE 'image/%'`,
      [roomId]
    );
    const videos = await query(
      `SELECT ca.*, cm.created_at FROM chat_attachments ca JOIN chat_messages cm ON ca.message_id = cm.id WHERE cm.room_id = ? AND ca.mime_type LIKE 'video/%'`,
      [roomId]
    );
    const voices = await query(
      `SELECT ca.*, cm.created_at FROM chat_attachments ca JOIN chat_messages cm ON ca.message_id = cm.id WHERE cm.room_id = ? AND ca.mime_type LIKE 'audio/%'`,
      [roomId]
    );
    const documents = await query(
      `SELECT ca.*, cm.created_at FROM chat_attachments ca JOIN chat_messages cm ON ca.message_id = cm.id WHERE cm.room_id = ? AND ca.mime_type NOT LIKE 'image/%' AND ca.mime_type NOT LIKE 'video/%' AND ca.mime_type NOT LIKE 'audio/%'`,
      [roomId]
    );

    return {
      images,
      videos,
      voices,
      documents
    };
  }
}

module.exports = new ChatRepository();
