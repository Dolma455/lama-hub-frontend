import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  PlusSquare,
  Bookmark,
  Bell,
  Star,
  User,
  Settings,
  LogOut,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { UserAvatar } from './UserAvatar';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home Feed', path: '/', icon: <Home size={20} /> },
    { label: 'Search', path: '/search', icon: <Search size={20} /> },
    { label: 'Recommendations', path: '/recommendations', icon: <Star size={20} /> },
    ...(user?.role === 'Creator'
      ? [{ label: 'Upload Post', path: '/upload', icon: <PlusSquare size={20} /> }]
      : []),
    { label: 'Saved Posts', path: '/saved', icon: <Bookmark size={20} /> },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-6px',
                backgroundColor: 'var(--danger)',
                color: 'white',
                fontSize: '0.62rem',
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
    { label: 'Following', path: '/following', icon: <Users size={20} /> },
    { label: 'My Profile', path: '/profile', icon: <User size={20} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside
      className="left-sidebar-nav"
      style={{
        width: '240px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        height: 'calc(100vh - 61px)',
        position: 'sticky',
        top: '61px',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '11px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.92rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--accent-muted)' : 'transparent',
              border: isActive
                ? '1px solid var(--accent-muted-border)'
                : '1px solid transparent',
              transition: 'all 0.15s ease',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Card / Logout */}
      {user && (
        <div
          style={{
            padding: '14px',
            backgroundColor: 'var(--accent-muted)',
            borderRadius: '12px',
            border: '1px solid var(--accent-muted-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserAvatar src={user.profileImageUrl} name={user.displayName} size={34} />
              <div>
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user.displayName}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
