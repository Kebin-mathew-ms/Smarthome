const chatRepository = require('../repositories/chat.repository');
const bookingRepository = require('../repositories/booking.repository');
const companyUserRepository = require('../repositories/companyUser.repository');
const notificationRepository = require('../repositories/notification.repository');
const auditLogService = require('./auditLog.service');
const { getIO } = require('../socket');
const ChatRoom = require('../models/chatRoom.model');
const ChatMessage = require('../models/chatMessage.model');

class ChatService {
  async getOrCreateRoom(bookingId, user) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found.');
      error.statusCode = 404;
      throw error;
    }

    // Verify User Participation Authorization
    let isAuthorized = false;
    let participantRole = 'Customer';

    if (user.role === 'Admin') {
      isAuthorized = true;
      participantRole = 'Admin';
    } else if (booking.user_id === user.id) {
      isAuthorized = true;
      participantRole = 'Customer';
    } else if (user.role === 'Company') {
      const compUser = await companyUserRepository.findCompanyByUserId(user.id);
      if (compUser && compUser.company_id === booking.company_id) {
        isAuthorized = true;
        participantRole = 'Company';
      }
    } else {
      // Check if user is an assigned volunteer technician
      if (booking.employees && booking.employees.some(e => e.email === user.email)) {
        isAuthorized = true;
        participantRole = 'Employee';
      }
    }

    if (!isAuthorized) {
      const error = new Error('Access forbidden. You are not a participant in this booking room.');
      error.statusCode = 403;
      throw error;
    }

    const room = await chatRepository.createRoom(bookingId);
    await chatRepository.addParticipant(room.id, user.id, participantRole);

    return new ChatRoom(room);
  }

  async getMessages(bookingId, user, query) {
    const room = await this.getOrCreateRoom(bookingId, user);
    const rows = await chatRepository.findMessagesByRoomId(room.id, query);
    return rows.map(m => new ChatMessage(m));
  }

  async sendMessage(bookingId, user, ipAddress, { message, message_type = 'Text', reply_to = null }) {
    const room = await this.getOrCreateRoom(bookingId, user);

    if (user.role === 'Admin') {
      const error = new Error('Admins have read-only access for dispute resolution and cannot post messages.');
      error.statusCode = 403;
      throw error;
    }

    const messageId = await chatRepository.createMessage({
      room_id: room.id,
      sender_id: user.id,
      message_type,
      message,
      reply_to
    });

    const fullMsg = await chatRepository.findMessageById(messageId);
    const msgModel = new ChatMessage(fullMsg);

    // Emit via Socket.IO
    try {
      const io = getIO();
      io.to(`booking-room-${bookingId}`).emit('receive-message', msgModel);
    } catch {
      // ignore socket emission errors if offline
    }

    // Queue Notification
    await notificationRepository.queueNotification({
      booking_id: bookingId,
      notification_type: 'NEW_CHAT_MESSAGE',
      title: `New Chat Message`,
      message: `${user.email}: ${message ? message.slice(0, 50) : message_type}`
    });

    // Audit Log
    await auditLogService.log({
      user_id: user.id,
      action: 'Message Sent',
      table_name: 'chat_messages',
      record_id: messageId,
      ip_address: ipAddress
    });

    return msgModel;
  }

  async addAttachment(bookingId, user, ipAddress, file, messageType = 'Image') {
    const room = await this.getOrCreateRoom(bookingId, user);

    if (user.role === 'Admin') {
      const error = new Error('Admins cannot upload attachments.');
      error.statusCode = 403;
      throw error;
    }

    const messageId = await chatRepository.createMessage({
      room_id: room.id,
      sender_id: user.id,
      message_type: messageType,
      message: file.originalname
    });

    await chatRepository.addAttachment(messageId, {
      file_name: file.filename,
      original_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype
    });

    const fullMsg = await chatRepository.findMessageById(messageId);
    const msgModel = new ChatMessage(fullMsg);

    try {
      const io = getIO();
      io.to(`booking-room-${bookingId}`).emit('receive-message', msgModel);
    } catch {
      // ignore
    }

    await auditLogService.log({
      user_id: user.id,
      action: `${messageType} Uploaded`,
      table_name: 'chat_attachments',
      record_id: messageId,
      ip_address: ipAddress
    });

    return msgModel;
  }

  async editMessage(messageId, user, newMessage) {
    if (user.role === 'Admin') {
      const error = new Error('Admins cannot edit messages.');
      error.statusCode = 403;
      throw error;
    }
    const updated = await chatRepository.editMessage(messageId, user.id, newMessage);
    return new ChatMessage(updated);
  }

  async deleteMessage(messageId, user) {
    if (user.role === 'Admin') {
      const error = new Error('Admins cannot delete messages.');
      error.statusCode = 403;
      throw error;
    }
    const updated = await chatRepository.deleteMessage(messageId, user.id);
    return new ChatMessage(updated);
  }

  async getSharedMedia(bookingId, user) {
    const room = await this.getOrCreateRoom(bookingId, user);
    return await chatRepository.getSharedMedia(room.id);
  }
}

module.exports = new ChatService();
