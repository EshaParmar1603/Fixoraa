const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');
let io = null;
const initSocketIO = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    }
  });
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }
const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true, isActive: true }
      });
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: User not active or not found'));
      }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`[Socket Connected] User: ${socket.user.name} (${userId}) - Socket: ${socket.id}`);
    // Join personal user room for direct notifications
    socket.join(`user_${userId}`);
    // Join role-based room (e.g. providers, admins)
    socket.join(`role_${socket.user.role}`);
    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${userId} joined room conversation_${conversationId}`);
    });
socket.on('typing', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId,
        userName: socket.user.name,
        conversationId
      });
    });
    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
        userId,
        conversationId
      });
    });
socket.on('send_message', async (data) => {
      try {
        const { conversationId, receiverId, content, attachmentUrl } = data;
        if (!conversationId || !receiverId || !content) {
          return socket.emit('error', { message: 'conversationId, receiverId, and content are required' });
        }
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            receiverId,
            content,
            attachmentUrl
          },
          include: {
            sender: { select: { id: true, name: true, avatar: true, role: true } }
          }
        });
 await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: new Date() }
        });
        // Broadcast to conversation room
        io.to(`conversation_${conversationId}`).emit('receive_message', message);
        // Also notify receiver's personal room in case they aren't in the conversation room
        io.to(`user_${receiverId}`).emit('new_message_alert', {
          conversationId,
          message
        });
      } catch (err) {
        console.error('[Socket send_message error]:', err.message);
        socket.emit('error', { message: err.message });
      }
    });
 socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] User: ${socket.user?.name} (${userId})`);
    });
  });
  return io;
};
const getIO = () => {
  return io;
};
// Helper to emit to a specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};
const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role_${role}`).emit(event, data);
  }
};
// Helper to emit to a conversation room
const emitToConversation = (conversationId, event, data) => {
  if (io) {
    io.to(`conversation_${conversationId}`).emit(event, data);
  }
};
module.exports = {
  initSocketIO,
  getIO,
  emitToUser,
  emitToRole,
  emitToConversation
};
