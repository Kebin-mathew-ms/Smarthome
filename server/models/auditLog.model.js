class AuditLog {
  constructor({ id, user_id, first_name, last_name, email, action, table_name, record_id, ip_address, created_at }) {
    this.id = id;
    this.user_id = user_id;
    this.user_name = first_name && last_name ? `${first_name} ${last_name}` : 'System';
    this.user_email = email || null;
    this.action = action;
    this.table_name = table_name;
    this.record_id = record_id;
    this.ip_address = ip_address;
    this.created_at = created_at;
  }
}

module.exports = AuditLog;
