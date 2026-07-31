import React, { useState } from 'react';
import { userService } from '../services/apiServices';
import { UserCheck, UserPlus } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  onStatusChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md';
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialIsFollowing = false,
  onStatusChange,
  size = 'md',
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      if (isFollowing) {
        await userService.unfollow(userId);
        setIsFollowing(false);
        onStatusChange?.(false);
      } else {
        await userService.follow(userId);
        setIsFollowing(true);
        onStatusChange?.(true);
      }
    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
    } finally {
      setLoading(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: isSmall ? '0.75rem' : '0.85rem',
        fontWeight: 600,
        padding: isSmall ? '5px 12px' : '7px 16px',
        borderRadius: '20px',
        border: isFollowing
          ? '1px solid var(--border-color)'
          : '1px solid var(--accent)',
        backgroundColor: isFollowing ? 'var(--bg-input)' : 'var(--accent)',
        color: isFollowing ? 'var(--text-secondary)' : 'var(--text-on-accent)',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: loading ? 0.7 : 1,
        fontFamily: 'inherit',
      }}
    >
      {isFollowing ? (
        <>
          <UserCheck size={isSmall ? 13 : 15} />
          Following
        </>
      ) : (
        <>
          <UserPlus size={isSmall ? 13 : 15} />
          Follow
        </>
      )}
    </button>
  );
};
