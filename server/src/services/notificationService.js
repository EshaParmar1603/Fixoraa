const prisma = require('../config/db');
const { emitToUser } = require('../sockets/socketHandler');
class NotificationService {
  /**
   * Create a notification in DB and dispatch via Socket.IO
   */
  async createNotification({ userId, title, message, type = 'SYSTEM', referenceId = null, link = null }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          referenceId,
          link
        }
      });
 emitToUser(userId, 'new_notification', notification);
      return notification;
    } catch (error) {
      console.error('[NotificationService.createNotification error]:', error.message);
      throw error;
    }
  }
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
    const skip = (page - 1) * limit;
    const where = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

     const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } })
    ]);
    return { notifications, total, unreadCount };
  }
  async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: { isRead: true }
    });
  }
  async deleteNotification(notificationId, userId) {
    return prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    });
  }
}
module.exports = new NotificationService();