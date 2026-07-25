const userNotificationRepository = require('../repositories/userNotification.repository');
const UserNotification = require('../models/userNotification.model');

class UserNotificationService {
  async getUserNotifications(userId) {
    const list = await userNotificationRepository.findByUserId(userId, 30);
    const unreadCount = await userNotificationRepository.getUnreadCount(userId);
    return {
      notifications: list.map(n => new UserNotification(n)),
      unreadCount
    };
  }

  async markRead(userId, notificationId) {
    await userNotificationRepository.markRead(notificationId, userId);
  }

  async markAllRead(userId) {
    await userNotificationRepository.markAllRead(userId);
  }

  async deleteNotification(userId, notificationId) {
    await userNotificationRepository.delete(notificationId, userId);
  }
}

module.exports = new UserNotificationService();
