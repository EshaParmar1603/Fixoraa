const prisma = require('../config/db');
const { emitToConversation, emitToUser } = require('../sockets/socketHandler');

class ChatService {
  async getOrCreateConversation(customerId, providerId, bookingId = null) {
    let whereClause = {};
    if (bookingId) {
      whereClause = { bookingId };
    } else {
      whereClause = {
        customerId_providerId_bookingId: {
          customerId,
          providerId,
          bookingId: null
        }
      };
    }
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { customerId, providerId, ...(bookingId ? { bookingId } : {}) },
          { customerId: providerId, providerId: customerId, ...(bookingId ? { bookingId } : {}) }
        ]
      },
      include: {
        customer: { select: { id: true, name: true, avatar: true, role: true } },
        provider: { select: { id: true, name: true, avatar: true, role: true } },
        booking: { select: { id: true, bookingNumber: true, status: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerId,
          providerId,
          bookingId: bookingId || null
        },
        include: {
          customer: { select: { id: true, name: true, avatar: true, role: true } },
          provider: { select: { id: true, name: true, avatar: true, role: true } },
          booking: { select: { id: true, bookingNumber: true, status: true } },
          messages: true
        }
      });
    }
    return conversation;
  }

  async getUserConversations(userId) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ customerId: userId }, { providerId: userId }]
      },
      include: {
        customer: { select: { id: true, name: true, avatar: true, role: true } },
        provider: { select: { id: true, name: true, avatar: true, role: true } },
        booking: { select: { id: true, bookingNumber: true, status: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });
     const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: userId,
            isRead: false
          }
        });
        return {
          ...conv,
          unreadCount,
          lastMessage: conv.messages[0] || null
        };
      })
    );
    return conversationsWithUnread;
  }

  async getMessages(conversationId, userId, { page = 1, limit = 50 }) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });
    if (!conversation) {
      const err = new Error('Conversation not found.');
      err.statusCode = 404;
      throw err;
    }
    if (conversation.customerId !== userId && conversation.providerId !== userId) {
      const err = new Error('Access denied to this conversation.');
      err.statusCode = 403;
      throw err;
    }
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, avatar: true } }
        }
      }),
      prisma.message.count({ where: { conversationId } })
    ]);
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });
    return { messages, total };
  }
  async sendMessage(senderId, { conversationId, receiverId, content, attachmentUrl = null }) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });
    if (!conversation) {
      const err = new Error('Conversation not found.');
      err.statusCode = 404;
      throw err;
    }
     const targetReceiverId = receiverId || (conversation.customerId === senderId ? conversation.providerId : conversation.customerId);
    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId,
          receiverId: targetReceiverId,
          content,
          attachmentUrl
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true, role: true } }
        }
      });
      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      });
      return msg;
    });
    emitToConversation(conversationId, 'receive_message', message);
    emitToUser(targetReceiverId, 'new_message_alert', {
      conversationId,
      message
    });
    return message;
  }
  async markAsRead(conversationId, userId) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });
  }
}
module.exports = new ChatService();
