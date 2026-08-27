const chatService = require('../services/chat.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class ChatController {
  async getRoomByBookingId(req, res, next) {
    try {
      const room = await chatService.getOrCreateRoom(req.params.bookingId, req.user);
      return sendSuccess(res, 'Chat room retrieved successfully', room, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const messages = await chatService.getMessages(req.params.bookingId, req.user, req.query);
      return sendSuccess(res, 'Chat messages retrieved successfully', messages, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const msg = await chatService.sendMessage(req.body.bookingId, req.user, req.ip, req.body);
      return sendSuccess(res, 'Message sent successfully', msg, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async uploadAttachment(req, res, next) {
    try {
      if (!req.file) {
        const error = new Error('No attachment file uploaded.');
        error.statusCode = 400;
        throw error;
      }

      let messageType = 'Image';
      if (req.file.mimetype.startsWith('video/')) messageType = 'Video';
      else if (req.file.mimetype.startsWith('audio/')) messageType = 'Voice';
      else if (req.file.mimetype.includes('pdf')) messageType = 'PDF';
      else if (req.file.mimetype.includes('document')) messageType = 'PDF';

      const msg = await chatService.addAttachment(req.body.bookingId, req.user, req.ip, req.file, messageType);
      return sendSuccess(res, 'Attachment uploaded successfully', msg, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async editMessage(req, res, next) {
    try {
      const updated = await chatService.editMessage(req.params.id, req.user, req.body.message);
      return sendSuccess(res, 'Message edited successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const updated = await chatService.deleteMessage(req.params.id, req.user);
      return sendSuccess(res, 'Message deleted successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getSharedMedia(req, res, next) {
    try {
      const media = await chatService.getSharedMedia(req.params.bookingId, req.user);
      return sendSuccess(res, 'Shared media gallery retrieved', media, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
