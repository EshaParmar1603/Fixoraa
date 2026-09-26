
const chatService = require('../services/chatService');
const { successResponse, createdResponse, paginatedResponse, errorResponse } = require('../utils/response');
const getConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getUserConversations(req.user.id);
    return successResponse(res, conversations);
  } catch (error) {
    next(error);
  }
};
const startConversation = async (req, res, next) => {
  try {
    const { receiverId, bookingId } = req.body;
    if (!receiverId) {
      return errorResponse(res, 'receiverId is required', 400);
    }
    const conversation = await chatService.getOrCreateConversation(req.user.id, receiverId, bookingId);
    return successResponse(res, conversation);
  } catch (error) {
    next(error);
  }
};
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const { messages, total } = await chatService.getMessages(conversationId, req.user.id, { page, limit });
    return paginatedResponse(res, messages, page, limit, total);
  } catch (error) {
    next(error);
  }

};
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, receiverId, content, attachmentUrl } = req.body;
    if (!conversationId || !content) {
      return errorResponse(res, 'conversationId and content are required', 400);
    }
    const message = await chatService.sendMessage(req.user.id, {
      conversationId,
      receiverId,
      content,
      attachmentUrl
    });
    return createdResponse(res, message, 'Message sent successfully');
  } catch (error) {
    next(error);
  }
};
const markConversationRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    await chatService.markAsRead(conversationId, req.user.id);
    return successResponse(res, null, 'Messages marked as read');
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  markConversationRead
};
