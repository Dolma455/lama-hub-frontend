import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { userService } from '../services/apiServices';
import type { UserDto } from '../types/api';
import { useProfileNavigation } from '../hooks/useProfileNavigation';
import { UserAvatar } from '../components/UserAvatar';
import { FollowButton } from '../components/FollowButton';
import { Users, UserCheck, HeartHandshake } from 'lucide-react';

export const FollowListPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const navigateToProfile = useProfileNavigation();
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  const [items, setItems] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      if (activeTab === 'following') {
        const res = await userService.getFollowing(user.userId);
        setItems(res.items);
      } else {
        const res = await userService.getFollowers(user.userId);
        setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to load list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [user, activeTab]);

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Users size={22} color="var(--accent)" />
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Connections
        </h2>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setActiveTab('following')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'following' ? '3px solid var(--accent)' : '3px solid transparent',
            color: activeTab === 'following' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'following' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          <UserCheck size={16} /> Following
        </button>

        <button
          onClick={() => setActiveTab('followers')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'followers' ? '3px solid var(--accent)' : '3px solid transparent',
            color: activeTab === 'followers' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'followers' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          <HeartHandshake size={16} /> Followers
        </button>
      </div>

      {/* List Content */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading list...</p>
      ) : items.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            {activeTab === 'following'
              ? 'You are not following any creators yet.'
              : 'You do not have any followers yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((c) => (
            <div
              key={c.userId}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                onClick={() => navigateToProfile(c.userId)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              >
                <UserAvatar src={c.profileImageUrl} name={c.displayName} size={42} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {c.displayName}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.role}</span>
                </div>
              </div>

              <FollowButton
                userId={c.userId}
                initialIsFollowing={activeTab === 'following'}
                initialIsFollowedBy={activeTab === 'followers'}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
