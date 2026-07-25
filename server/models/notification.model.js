class Notification {
  constructor({ id, user_id, company_id, booking_id, notification_type, title, message, status, created_at }) {
    this.id = id;
    this.user_id = user_id || null;
    this.company_id = company_id || null;
    this.booking_id = booking_id || null;
    this.notification_type = notification_type;
    this.title = title;
    this.message = message;
    this.status = status || 'pending';
    this.created_at = created_at;
  }
}

module.exports = Notification;
