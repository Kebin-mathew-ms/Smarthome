class Complaint {
  constructor({ id, booking_id, ticket_number, user_id, user_name, company_id, company_name, assigned_admin, complaint_category, priority, status, subject, description, created_at, updated_at, closed_at, messages = [] }) {
    this.id = id;
    this.booking_id = booking_id;
    this.ticket_number = ticket_number;
    this.user_id = user_id;
    this.user_name = user_name || null;
    this.company_id = company_id;
    this.company_name = company_name || null;
    this.assigned_admin = assigned_admin;
    this.complaint_category = complaint_category;
    this.priority = priority || 'Medium';
    this.status = status || 'Open';
    this.subject = subject;
    this.description = description;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.closed_at = closed_at;
    this.messages = messages;
  }
}

module.exports = Complaint;
