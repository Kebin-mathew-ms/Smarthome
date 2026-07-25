class ChatMessage {
  constructor({ id, room_id, sender_id, sender_name, sender_role, message_type, message, reply_to, edited, deleted, created_at, updated_at, attachments = [], read_by = [] }) {
    this.id = id;
    this.room_id = room_id;
    this.sender_id = sender_id;
    this.sender_name = sender_name || null;
    this.sender_role = sender_role || null;
    this.message_type = message_type || 'Text';
    this.message = deleted ? 'This message was deleted' : message;
    this.reply_to = reply_to || null;
    this.edited = Boolean(edited);
    this.deleted = Boolean(deleted);
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.attachments = attachments;
    this.read_by = read_by;
  }
}

module.exports = ChatMessage;
