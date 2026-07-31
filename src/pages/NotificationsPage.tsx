import React, { useEffect, useState } from 'react';
import { notificationService } from '../services/apiServices';
import type { NotificationDto } from '../types/api';
import { UserAvatar } from '../components/UserAvatar';
import { Bell, CheckCheck } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.items);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bell size={22} color="var(--accent)" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Notifications
          </h2>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            style={{
              backgroundColor: 'var(--accent-muted)',
              border: '1px solid var(--accent-muted-border)',
              color: 'var(--accent)',
              borderRadius: '10px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'inherit',
            }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((n) => (
            <div
              key={n.notificationId}
              style={{
                backgroundColor: n.isRead ? 'var(--bg-card)' : 'var(--accent-muted)',
                border: n.isRead
                  ? '1px solid var(--border-subtle)'
                  : '1px solid var(--accent-muted-border)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'background-color 0.2s ease',
              }}
            >
              <UserAvatar name={n.actorDisplayName || 'User'} size={40} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {new Date(n.createdAtUtc).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
