import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Tv,
  ExternalLink
} from 'lucide-react';
import { notificationsApi } from '../../services/api';
import { Notification, NotificationType } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getMyNotifications();
      setNotifications(res?.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationsApi.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'BOOKING':
        return <Calendar className="w-5 h-5 text-brand-600" />;
      case 'PAYMENT':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'MESSAGE':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'REMINDER':
        return <Tv className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const filtered = unreadOnly ? notifications.filter((n) => !n.isRead) : notifications;

  if (loading) {
    return <LoadingSpinner message="Checking real-time notification alerts..." fullScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Bell className="w-8 h-8 text-brand-600" />
            <span>Activity Notifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time updates on appointment dispatches, technician messages, and recurring maintenance reminders
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              unreadOnly
                ? 'bg-brand-50 text-brand-700 border-brand-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {unreadOnly ? 'Showing Unread' : 'All Alerts'}
          </button>

          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You don't have any pending notifications right now. New activity will display here live."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                handleMarkAsRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                n.isRead
                  ? 'bg-white border-slate-200/80 hover:border-slate-300'
                  : 'bg-brand-50/40 border-brand-200/80 shadow-sm hover:shadow'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  {getIcon(n.type)}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={(e) => handleDelete(n.id, e)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
