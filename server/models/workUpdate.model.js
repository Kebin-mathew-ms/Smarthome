class WorkUpdate {
  constructor({ id, booking_id, title, description, created_by, creator_name, created_at, media = [] }) {
    this.id = id;
    this.booking_id = booking_id;
    this.title = title;
    this.description = description || null;
    this.created_by = created_by;
    this.creator_name = creator_name || null;
    this.created_at = created_at;
    this.media = media;
  }
}

module.exports = WorkUpdate;
