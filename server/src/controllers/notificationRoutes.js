const notificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/response');
const getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      unreadOnly: unreadOnly === 'true'
    });
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(id, req.user.id);
    return successResponse(res, null, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};
const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationService.deleteNotification(id, req.user.id);
    return successResponse(res, null, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
