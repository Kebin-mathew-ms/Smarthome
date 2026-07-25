const announcementService = require('../services/announcement.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class AnnouncementController {
  async getActiveAnnouncements(req, res, next) {
    try {
      const data = await announcementService.getActiveAnnouncements(req.user ? req.user.role.toLowerCase() : 'all');
      return sendSuccess(res, 'Active announcements retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getAllAnnouncements(req, res, next) {
    try {
      const data = await announcementService.getAllAnnouncements();
      return sendSuccess(res, 'All announcements retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createAnnouncement(req, res, next) {
    try {
      await announcementService.createAnnouncement(req.user, req.ip, req.body);
      return sendSuccess(res, 'Announcement created successfully', null, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateAnnouncement(req, res, next) {
    try {
      await announcementService.updateAnnouncement(req.user, req.ip, req.params.id, req.body);
      return sendSuccess(res, 'Announcement updated successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnouncement(req, res, next) {
    try {
      await announcementService.deleteAnnouncement(req.user, req.ip, req.params.id);
      return sendSuccess(res, 'Announcement deleted successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnnouncementController();
