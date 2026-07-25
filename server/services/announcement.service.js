const announcementRepository = require('../repositories/announcement.repository');
const auditLogService = require('./auditLog.service');
const Announcement = require('../models/announcement.model');

class AnnouncementService {
  async createAnnouncement(user, ipAddress, data) {
    if (user.role !== 'Admin') {
      const error = new Error('Only Admin can post system announcements.');
      error.statusCode = 403;
      throw error;
    }

    const id = await announcementRepository.createAnnouncement({
      title: data.title,
      description: data.description,
      visible_to: data.visible_to || 'all',
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status || 'active'
    });

    await auditLogService.log({
      user_id: user.id,
      action: 'Announcement Created',
      table_name: 'system_announcements',
      record_id: id,
      ip_address: ipAddress
    });
  }

  async updateAnnouncement(user, ipAddress, id, data) {
    if (user.role !== 'Admin') {
      const error = new Error('Only Admin can edit system announcements.');
      error.statusCode = 403;
      throw error;
    }

    await announcementRepository.updateAnnouncement(id, data);
  }

  async deleteAnnouncement(user, ipAddress, id) {
    if (user.role !== 'Admin') {
      const error = new Error('Only Admin can delete system announcements.');
      error.statusCode = 403;
      throw error;
    }

    await announcementRepository.deleteAnnouncement(id);
  }

  async getActiveAnnouncements(role = 'all') {
    const list = await announcementRepository.findActiveAnnouncements(role);
    return list.map(a => new Announcement(a));
  }

  async getAllAnnouncements() {
    const list = await announcementRepository.findAllAnnouncements();
    return list.map(a => new Announcement(a));
  }
}

module.exports = new AnnouncementService();
