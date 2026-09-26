import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageSquare,
  User as UserIcon,
  Clock,
  CheckCheck,
  Smile,
  Paperclip,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatApi } from '../../services/api';
import { Conversation, Message } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { joinConversation, sendSocketMessage, emitTyping, emitStopTyping, activeTypers, latestMessage } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getConversations();
      setConversations(data || []);
      if (data && data.length > 0) {
        selectConversation(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: Conversation) => {
    setActiveConversation(conv);
    joinConversation(conv.id);
    try {
      const msgs = await chatApi.getMessages(conv.id);
      setMessages(msgs || []);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (latestMessage && activeConversation && latestMessage.conversationId === activeConversation.id) {
      setMessages((prev) => [...prev, latestMessage]);
      scrollToBottom();
    }
  }, [latestMessage, activeConversation?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!activeConversation) return;

    emitTyping(activeConversation.id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(activeConversation.id);
    }, 1500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const content = newMessage.trim();
    setNewMessage('');

    const otherParticipantId =
      activeConversation.customerId === user.id
        ? activeConversation.providerId
        : activeConversation.customerId;

    // Send via WebSocket
    sendSocketMessage({
      conversationId: activeConversation.id,
      receiverId: otherParticipantId,
      content,
    });

    // Also persist via REST API
    try {
      const sent = await chatApi.sendMessage({
        conversationId: activeConversation.id,
        receiverId: otherParticipantId,
        content,
      });

      setMessages((prev) => {
        if (!prev.find((m) => m.id === sent.id)) {
          return [...prev, sent];
        }
        return prev;
      });
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const isCurrentTyping = activeTypers.some(
    (t) => t.conversationId === activeConversation?.id && t.userId !== user?.id
  );

  if (loading) {
    return <LoadingSpinner message="Establishing encrypted chat room..." fullScreen />;
  }

  const otherUser =
    activeConversation?.customerId === user?.id
      ? activeConversation?.provider
      : activeConversation?.customer;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-5rem)]">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden h-full flex flex-col md:flex-row">
        {/* Left Col: Conversation List */}
        <div className="w-full md:w-80 border-r border-slate-200/80 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200/80">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <span>Direct Messages</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.map((conv) => {
              const partner = conv.customerId === user?.id ? conv.provider : conv.customer;
              const isSelected = activeConversation?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-4 cursor-pointer transition-colors flex items-center space-x-3 ${
                    isSelected ? 'bg-white border-l-4 border-brand-600 shadow-sm' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <img
                    src={
                      partner?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner?.name || 'User'}`
                    }
                    alt=""
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {partner?.name || 'Fixora Member'}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.booking ? `Order #${conv.booking.bookingNumber}` : 'General Inquiry'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Active Chat Window */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col h-full bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white z-10">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    otherUser?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.name || 'Chat'}`
                  }
                  alt=""
                  className="w-10 h-10 rounded-2xl object-cover ring-2 ring-brand-100"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {otherUser?.name || 'Verified Technician'}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-[10px] text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Online & Ready</span>
                  </div>
                </div>
              </div>

              {activeConversation.booking && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-200 rounded-xl text-xs font-semibold text-brand-800">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  <span>#{activeConversation.booking.bookingNumber}</span>
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-brand-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>

                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1 px-1">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3 text-brand-500" />}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isCurrentTyping && (
                <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>{otherUser?.name || 'Technician'} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center space-x-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type your message to technician..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-brand-600 transition-colors"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl shadow-sm transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
            Select a conversation on the left to start messaging.
          </div>
        )}
      </div>
    </div>
  );
};
