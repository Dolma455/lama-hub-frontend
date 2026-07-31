import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, PlusSquare, Bookmark, User, Star } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const BottomNav: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { path: '/',               icon: <Home size={22} /> },
    { path: '/search',         icon: <Search size={22} /> },
    ...(user?.role === 'Creator' ? [{ path: '/upload', icon: <PlusSquare size={22} /> }] : []),
    { path: '/recommendations',icon: <Star size={22} /> },
    { path: '/saved',          icon: <Bookmark size={22} /> },
    { path: '/profile',        icon: <User size={22} /> },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'var(--bg-sidebar)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
      }}
      className="mobile-only"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          style={({ isActive }) => ({
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
          })}
        >
          {item.icon}
        </NavLink>
      ))}
    </nav>
  );
};
