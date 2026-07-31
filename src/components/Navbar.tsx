import React, { useState } from 'react';
import { Search, Bell, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { UserAvatar } from './UserAvatar';
import { ThemePicker } from './ThemePicker';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const user = useAuthStore((state) => state.user);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

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

      {/* Search Input */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          maxWidth: '360px',
          width: '100%',
          position: 'relative',
        }}
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          type="text"
          placeholder="Search creators, photos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '8px 16px 8px 38px',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
      </form>

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
          <Bell size={20} />
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
