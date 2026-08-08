import React, { useState, useEffect } from 'react';
import { Bell, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { UserAvatar } from './UserAvatar';
import { ThemePicker } from './ThemePicker';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
    }
  }, [user?.userId]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--bg-sidebar)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand Logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div
          className="brand-cursive"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'transparent',
            border: '2px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            fontSize: '1.15rem',
            paddingTop: '2px',
          }}
        >
          LH
        </div>
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--accent)',
            letterSpacing: '-0.5px',
          }}
        >
          LamaHub
        </span>
      </div>

      {/* Greeting Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}
      >
        <span>Hello,</span>
        <span style={{ color: 'var(--accent)', fontWeight: 800 }}>
          {user?.displayName || 'User'}
        </span>
        <span>👋</span>
      </div>

      {/* Right User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setIsThemePickerOpen(true)}
          title="Change Theme"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Palette size={20} />
        </button>
        <ThemePicker isOpen={isThemePickerOpen} onClose={() => setIsThemePickerOpen(false)} />

        <button
          onClick={() => navigate('/notifications')}
          title="Notifications"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: 'var(--danger)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 800,
                borderRadius: '10px',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px var(--bg-sidebar)',
                lineHeight: 1,
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {user && (
          <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} title="View Profile">
            <UserAvatar src={user.profileImageUrl} name={user.displayName} size={36} />
          </div>
        )}
      </div>
    </header>
  );
};
