import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, ChevronRight } from 'lucide-react';
import { NotificationsDropdown, AppNotification } from './NotificationsDropdown';
import { apiRequest } from '../lib/api';

interface HeaderProps {
  breadcrumbs: string[];
  adminToken?: string | null;
  onNavigateToBooking?: () => void;
  onNavigateToTracking?: () => void;
}

export const AdminHeader: React.FC<HeaderProps> = ({
  breadcrumbs,
  adminToken,
  onNavigateToBooking,
  onNavigateToTracking,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(4); // Default 4 matching wireframe Page 19
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Live Notifications from Backend
  const fetchNotifications = async () => {
    if (!adminToken) return;
    try {
      const data = await apiRequest<{ unreadCount: number; notifications: AppNotification[] }>(
        '/admin/notifications',
        {},
        adminToken
      );
      setUnreadCount(data.unreadCount);
      setNotifications(data.notifications);
    } catch (e) {
      // Graceful fallback to initial values
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s for real-time events
    return () => clearInterval(interval);
  }, [adminToken]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark single as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await apiRequest(`/admin/notifications/${id}/read`, { method: 'PUT' }, adminToken || undefined);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {}
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest('/admin/notifications/mark-all-read', { method: 'PUT' }, adminToken || undefined);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 ml-16">
      {/* Dynamic Breadcrumbs */}
      <div className="flex items-center text-sm font-semibold">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            {idx > 0 && <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />}
            <span className={idx === breadcrumbs.length - 1 ? 'text-slate-900 font-bold text-lg' : 'text-slate-400'}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
        {/* Notification Bell Button */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Interactive Notifications Drawer */}
          {dropdownOpen && (
            <NotificationsDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClose={() => setDropdownOpen(false)}
              onNavigateToBooking={() => {
                setDropdownOpen(false);
                onNavigateToBooking?.();
              }}
              onNavigateToTracking={() => {
                setDropdownOpen(false);
                onNavigateToTracking?.();
              }}
            />
          )}
        </div>

        {/* User Profile */}
        <button 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
          title="Fleet Administrator"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};