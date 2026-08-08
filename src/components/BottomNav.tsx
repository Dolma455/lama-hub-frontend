import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, PlusSquare, Bell, Star, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { UserAvatar } from './UserAvatar';

export const BottomNav: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={22} /> },
    { path: '/search', label: 'Search', icon: <Search size={22} /> },
    { path: '/recommendations', label: 'Explore', icon: <Star size={22} /> },
    ...(user?.role === 'Creator'
      ? [{ path: '/upload', label: 'Upload', icon: <PlusSquare size={22} /> }]
      : []),
    {
      path: '/notifications',
      label: 'Notifications',
      icon: (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Bell size={22} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-6px',
                backgroundColor: 'var(--danger)',
                color: 'white',
                fontSize: '0.6rem',
                fontWeight: 800,
                borderRadius: '10px',
                minWidth: '15px',
                height: '15px',
                padding: '0 3px',
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
        </div>
      ),
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: user?.profileImageUrl ? (
        <UserAvatar src={user.profileImageUrl} name={user.displayName} size={24} />
      ) : (
        <User size={22} />
      ),
    },
  ];

  return (
    <nav
      className="mobile-only"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '62px',
        backgroundColor: 'var(--bg-sidebar)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        padding: '0 8px',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          title={item.label}
          style={({ isActive }) => ({
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            borderRadius: '12px',
            backgroundColor: isActive ? 'var(--accent-muted)' : 'transparent',
            transition: 'all 0.15s ease',
          })}
        >
          {item.icon}
        </NavLink>
      ))}
    </nav>
  );
};
