import { create } from 'zustand';
import { notificationService } from '../services/apiServices';
import type { NotificationDto } from '../types/api';

interface NotificationState {
  notifications: NotificationDto[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await notificationService.getNotifications(1, 50);
      const items = res.items || [];
      const unread = items.filter((n) => !n.isRead).length;
      set({ notifications: items, unreadCount: unread, loading: false });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        );
        const unread = updated.filter((n) => !n.isRead).length;
        return { notifications: updated, unreadCount: unread };
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
        return { notifications: updated, unreadCount: 0 };
      });
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  },
}));
