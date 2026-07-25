const workUpdateRepository = require('../repositories/workUpdate.repository');
const chatRepository = require('../repositories/chat.repository');
const bookingRepository = require('../repositories/booking.repository');
const notificationRepository = require('../repositories/notification.repository');
const auditLogService = require('./auditLog.service');
const { getIO } = require('../socket');
const WorkUpdate = require('../models/workUpdate.model');

class WorkUpdateService {
  async createWorkUpdate(bookingId, user, ipAddress, data, files = []) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'Admin') {
      const error = new Error('Admins cannot post work progress updates.');
      error.statusCode = 403;
      throw error;
    }

    const updateId = await workUpdateRepository.createWorkUpdate({
      booking_id: bookingId,
      title: data.title,
      description: data.description || null,
      created_by: user.id
    });

    if (files && files.length) {
      for (const file of files) {
        let mediaType = 'image';
        if (file.mimetype.startsWith('video/')) mediaType = 'video';
        else if (file.mimetype.startsWith('application/')) mediaType = 'document';

        await workUpdateRepository.addMedia(updateId, {
          media_type: mediaType,
          file_path: file.path,
          caption: data.caption || null
        });
      }
    }

    const updates = await workUpdateRepository.findByBookingId(bookingId);
    const createdUpdate = updates.find(u => u.id === updateId);
    const updateModel = new WorkUpdate(createdUpdate);

    // Emit Socket.IO Event
    try {
      const io = getIO();
      io.to(`booking-room-${bookingId}`).emit('work-update-created', updateModel);
    } catch {
      // ignore
    }

    // Queue Notification
    await notificationRepository.queueNotification({
      user_id: booking.user_id,
      company_id: booking.company_id,
      booking_id: bookingId,
      notification_type: 'WORK_UPDATE_CREATED',
      title: `New Work Update: ${data.title}`,
      message: `Progress update posted: ${data.title}`
    });

    // Write Audit Log
    await auditLogService.log({
      user_id: user.id,
      action: 'Work Update Created',
      table_name: 'work_updates',
      record_id: updateId,
      ip_address: ipAddress
    });

    return updateModel;
  }

  async getWorkUpdates(bookingId) {
    const list = await workUpdateRepository.findByBookingId(bookingId);
    return list.map(u => new WorkUpdate(u));
  }
}

module.exports = new WorkUpdateService();
