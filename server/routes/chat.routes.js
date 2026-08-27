const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const chatController = require('../controllers/chat.controller');
const workUpdateController = require('../controllers/workUpdate.controller');

// -------------------------------------------------------------
// Chat & Messaging Endpoints
// -------------------------------------------------------------
router.get('/chat/rooms/:bookingId', authenticate, chatController.getRoomByBookingId);
router.get('/chat/messages/:bookingId', authenticate, chatController.getMessages);
router.post('/chat/message', authenticate, chatController.sendMessage);
router.put('/chat/message/:id', authenticate, chatController.editMessage);
router.delete('/chat/message/:id', authenticate, chatController.deleteMessage);
router.get('/chat/media/:bookingId', authenticate, chatController.getSharedMedia);

// Media Attachment Uploads
router.post('/chat/upload/image', authenticate, upload.single('chat_image'), chatController.uploadAttachment);
router.post('/chat/upload/video', authenticate, upload.single('chat_video'), chatController.uploadAttachment);
router.post('/chat/upload/voice', authenticate, upload.single('chat_voice'), chatController.uploadAttachment);
router.post('/chat/upload/document', authenticate, upload.single('chat_document'), chatController.uploadAttachment);

// -------------------------------------------------------------
// Work Progress Updates Endpoints
// -------------------------------------------------------------
router.get('/work-updates/:bookingId', authenticate, workUpdateController.getWorkUpdates);
router.post('/work-updates', authenticate, upload.array('work_update_media', 10), workUpdateController.createWorkUpdate);

module.exports = router;
