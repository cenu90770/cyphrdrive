import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Car, 
  Check, 
  X, 
  ExternalLink 
} from 'lucide-react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'TELEMATICS' | 'OPERATIONS' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  read: boolean;
  resource_id?: string;
  created_at: string;
}

interface DropdownProps {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
  onNavigateToBooking?: () => void;
  onNavigateToTracking?: () => void;
}

export const NotificationsDropdown: React.FC<DropdownProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
  onNavigateToBooking,
  onNavigateToTracking,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'alerts') return n.severity === 'CRITICAL' || n.severity === 'WARNING';
    return true;
  });

  const getNotificationIcon = (type: string, severity: string) => {
    if (severity === 'CRITICAL') {
      return (
        <div className="p-2 bg-rose-50 text-rose-600 rounded-xl flex-shrink-0 animate-bounce">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'BOOKING') {
      return (
        <div className="p-2 bg-teal-50 text-teal-600 rounded-xl flex-shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'OPERATIONS') {
      return (
        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0">
          <Clock className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
        <Car className="w-4 h-4" />
      </div>
    );
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="absolute right-0 top-12 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans select-none animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <h3 className="font-extrabold text-sm text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex px-4 pt-2 border-b border-slate-100 text-xs font-semibold space-x-4 bg-white text-slate-400">
        <button
          onClick={() => setFilter('all')}
          className={`pb-2 transition ${filter === 'all' ? 'border-b-2 border-blue-600 text-slate-900 font-bold' : 'hover:text-slate-600'}`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-2 transition ${filter === 'unread' ? 'border-b-2 border-blue-600 text-slate-900 font-bold' : 'hover:text-slate-600'}`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('alerts')}
          className={`pb-2 transition ${filter === 'alerts' ? 'border-b-2 border-blue-600 text-slate-900 font-bold' : 'hover:text-slate-600'}`}
        >
          Alerts
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 text-xs">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium">
            No notifications in this category.
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) onMarkAsRead(n.id);
                if (n.type === 'BOOKING') onNavigateToBooking?.();
                if (n.type === 'TELEMATICS') onNavigateToTracking?.();
              }}
              className={`p-3.5 flex items-start space-x-3 transition cursor-pointer ${
                n.read ? 'bg-white hover:bg-slate-50/80 opacity-75' : 'bg-blue-50/20 hover:bg-blue-50/40'
              }`}
            >
              {getNotificationIcon(n.type, n.severity)}

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-slate-900 truncate pr-2">{n.title}</p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatTimeAgo(n.created_at)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                  {n.message}
                </p>
              </div>

              {/* Unread indicator */}
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};