class UserNotification {
  constructor({ id, user_id, title, message, notification_type, reference_type, reference_id, read_status, created_at }) {
    this.id = id;
    this.user_id = user_id;
    this.title = title;
    this.message = message;
    this.notification_type = notification_type || 'general';
    this.reference_type = reference_type || null;
    this.reference_id = reference_id || null;
    this.read_status = Boolean(read_status);
    this.created_at = created_at;
  }
}

module.exports = UserNotification;
