const userNotificationService = require('../services/userNotification.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class UserNotificationController {
  async getUserNotifications(req, res, next) {
    try {
      const data = await userNotificationService.getUserNotifications(req.user.id);
      return sendSuccess(res, 'Notifications retrieved', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async markRead(req, res, next) {
    try {
      await userNotificationService.markRead(req.user.id, req.body.id || req.params.id);
      return sendSuccess(res, 'Notification marked as read', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req, res, next) {
    try {
      await userNotificationService.markAllRead(req.user.id);
      return sendSuccess(res, 'All notifications marked as read', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      await userNotificationService.deleteNotification(req.user.id, req.params.id);
      return sendSuccess(res, 'Notification deleted', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserNotificationController();
