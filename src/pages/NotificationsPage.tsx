import React, { useEffect } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { useProfileNavigation } from '../hooks/useProfileNavigation';
import { UserAvatar } from '../components/UserAvatar';
import { FollowButton } from '../components/FollowButton';
import { Bell, CheckCheck } from 'lucide-react';
import { formatRelativeTime } from '../utils/dateUtils';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();
  const navigateToProfile = useProfileNavigation();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--accent-muted-border)',
            }}
          >
            <Bell size={20} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Notifications
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {notifications.length} Total {unreadCount > 0 && `• ${unreadCount} Unread`}
            </span>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            style={{
              backgroundColor: 'var(--accent-muted)',
              border: '1px solid var(--accent-muted-border)',
              color: 'var(--accent)',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '40px 0' }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <Bell size={36} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.6 }} />
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>
            No notifications yet.
          </p>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            When users follow you, like, or comment on your posts, you'll see them here!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((n) => {
            const isUnread = !n.isRead;

            return (
              <div
                key={n.notificationId}
                onClick={() => isUnread && markAsRead(n.notificationId)}
                style={{
                  /* Unread: low opacity accent tint (var(--accent-muted)); Read: clean var(--bg-card) / white */
                  backgroundColor: isUnread ? 'var(--accent-muted)' : 'var(--bg-card)',
                  border: isUnread
                    ? '1.5px solid var(--accent-muted-border)'
                    : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: isUnread ? 'pointer' : 'default',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Actor Avatar */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isUnread) markAsRead(n.notificationId);
                    navigateToProfile(n.actorId);
                  }}
                  style={{ flexShrink: 0, cursor: 'pointer' }}
                >
                  <UserAvatar src={n.actorProfileImageUrl} name={n.actorDisplayName || 'User'} size={44} />
                </div>

                {/* Message Content */}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)',
                      lineHeight: '1.4',
                      fontWeight: isUnread ? 700 : 500,
                    }}
                  >
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {formatRelativeTime(n.createdAtUtc)}
                  </span>
                </div>

                {/* Follow / Follow Back Action Button */}
                {n.actorId && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <FollowButton
                      userId={n.actorId}
                      initialIsFollowedBy={n.type === 'NewFollower' || n.message?.toLowerCase().includes('following')}
                      size="sm"
                    />
                  </div>
                )}

                {/* Unread Accent Dot Indicator (Facebook / Instagram Style) */}
                {isUnread && (
                  <div
                    title="Unread notification"
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)',
                      flexShrink: 0,
                      boxShadow: '0 0 6px var(--accent)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
