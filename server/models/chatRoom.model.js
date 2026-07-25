class ChatRoom {
  constructor({ id, booking_id, room_status, created_at, updated_at, participants = [] }) {
    this.id = id;
    this.booking_id = booking_id;
    this.room_status = room_status || 'active';
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.participants = participants;
  }
}

module.exports = ChatRoom;
