class Announcement {
  constructor({ id, title, description, visible_to, start_date, end_date, status, created_at }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.visible_to = visible_to || 'all';
    this.start_date = start_date;
    this.end_date = end_date;
    this.status = status || 'active';
    this.created_at = created_at;
  }
}

module.exports = Announcement;
