class ActivityLog {
  constructor({ id, user_id, user_name, activity, ip_address, device, browser, created_at }) {
    this.id = id;
    this.user_id = user_id;
    this.user_name = user_name || 'System';
    this.activity = activity;
    this.ip_address = ip_address || null;
    this.device = device || null;
    this.browser = browser || null;
    this.created_at = created_at;
  }
}

module.exports = ActivityLog;
