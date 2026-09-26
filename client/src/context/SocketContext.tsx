import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Message, Notification } from '../types';

interface TypingUser {
  userId: string;
  userName: string;
  conversationId: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeTypers: TypingUser[];
  joinConversation: (conversationId: string) => void;
  sendSocketMessage: (data: { conversationId: string; receiverId: string; content: string; attachmentUrl?: string }) => void;
  emitTyping: (conversationId: string) => void;
  emitStopTyping: (conversationId: string) => void;
  latestNotification: Notification | null;
  latestMessage: Message | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeTypers, setActiveTypers] = useState<TypingUser[]>([]);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Fixora Socket]: Connected successfully ->', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Fixora Socket]: Disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.warn('[Fixora Socket Notice]: Backend WebSocket currently not responding (running in local offline mode).', err.message);
      setIsConnected(false);
    });

    // Real-time chat events
    newSocket.on('receive_message', (message: Message) => {
      setLatestMessage(message);
    });

    newSocket.on('new_message_alert', ({ message }: { message: Message }) => {
      setLatestMessage(message);
    });

    newSocket.on('user_typing', (data: TypingUser) => {
      setActiveTypers((prev) => {
        if (!prev.find((t) => t.userId === data.userId && t.conversationId === data.conversationId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    newSocket.on('user_stop_typing', (data: { userId: string; conversationId: string }) => {
      setActiveTypers((prev) =>
        prev.filter((t) => !(t.userId === data.userId && t.conversationId === data.conversationId))
      );
    });

    // Real-time notifications
    newSocket.on('new_notification', (notification: Notification) => {
      setLatestNotification(notification);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?.id]);

  const joinConversation = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  };

  const sendSocketMessage = (data: { conversationId: string; receiverId: string; content: string; attachmentUrl?: string }) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', data);
    }
  };

  const emitTyping = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', { conversationId });
    }
  };

  const emitStopTyping = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('stop_typing', { conversationId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeTypers,
        joinConversation,
        sendSocketMessage,
        emitTyping,
        emitStopTyping,
        latestNotification,
        latestMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
