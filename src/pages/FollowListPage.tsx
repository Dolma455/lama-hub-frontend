import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { userService } from '../services/apiServices';
import type { UserDto } from '../types/api';
import { UserAvatar } from '../components/UserAvatar';
import { FollowButton } from '../components/FollowButton';
import { Users } from 'lucide-react';

export const FollowListPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [following, setFollowing] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userId) {
      userService
        .getFollowing(user.userId)
        .then((res) => setFollowing(res.items))
        .catch((err) => console.error('Failed to load following list:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Users size={22} color="var(--accent)" />
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Creators You Follow
        </h2>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</p>
      ) : following.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>You are not following any creators yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {following.map((c) => (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UserAvatar name={c.displayName} size={42} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {c.displayName}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.role}</span>
                </div>
              </div>
              <FollowButton userId={c.userId} initialIsFollowing={true} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
