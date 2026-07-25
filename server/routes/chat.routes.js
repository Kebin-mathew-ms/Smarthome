const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const chatController = require('../controllers/chat.controller');
const workUpdateController = require('../controllers/workUpdate.controller');

// All chat & work update routes require authentication
router.use(authenticate);

// -------------------------------------------------------------
// Chat & Messaging Endpoints
// -------------------------------------------------------------
router.get('/chat/rooms/:bookingId', chatController.getRoomByBookingId);
router.get('/chat/messages/:roomId', chatController.getMessages);
router.post('/chat/message', chatController.sendMessage);
router.put('/chat/message/:id', chatController.editMessage);
router.delete('/chat/message/:id', chatController.deleteMessage);
router.get('/chat/media/:bookingId', chatController.getSharedMedia);

// Media Attachment Uploads
router.post('/chat/upload/image', upload.single('chat_image'), chatController.uploadAttachment);
router.post('/chat/upload/video', upload.single('chat_video'), chatController.uploadAttachment);
router.post('/chat/upload/voice', upload.single('chat_voice'), chatController.uploadAttachment);
router.post('/chat/upload/document', upload.single('chat_document'), chatController.uploadAttachment);

// -------------------------------------------------------------
// Work Progress Updates Endpoints
// -------------------------------------------------------------
router.get('/work-updates/:bookingId', workUpdateController.getWorkUpdates);
router.post('/work-updates', upload.array('work_update_media', 10), workUpdateController.createWorkUpdate);

module.exports = router;
