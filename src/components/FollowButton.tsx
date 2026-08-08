import React, { useState, useEffect } from 'react';
import { userService } from '../services/apiServices';
import { useAuthStore } from '../store/useAuthStore';
import { UserCheck, UserPlus } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  initialIsFollowedBy?: boolean;
  onStatusChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md';
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialIsFollowing = false,
  initialIsFollowedBy = false,
  onStatusChange,
  size = 'md',
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isFollowedBy, setIsFollowedBy] = useState(initialIsFollowedBy);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  useEffect(() => {
    setIsFollowedBy(initialIsFollowedBy);
  }, [initialIsFollowedBy]);

  useEffect(() => {
    if (userId && currentUser?.userId !== userId) {
      userService
        .getFollowStatus(userId)
        .then((res) => {
          setIsFollowing(res.isFollowing);
          setIsFollowedBy((prev) => prev || res.isFollowedBy);
        })
        .catch(() => {});
    }
  }, [userId, currentUser?.userId]);

  if (!userId || currentUser?.userId === userId) {
    return null;
  }

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
  const showFollowBack = !isFollowing && isFollowedBy;

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: isSmall ? '0.75rem' : '0.85rem',
        fontWeight: 700,
        padding: isSmall ? '5px 14px' : '8px 18px',
        borderRadius: '20px',
        border: isFollowing
          ? '1px solid var(--border-color)'
          : showFollowBack
          ? '1px solid var(--accent)'
          : '1px solid var(--accent)',
        backgroundColor: isFollowing
          ? 'var(--bg-input)'
          : showFollowBack
          ? 'var(--accent)'
          : 'var(--accent)',
        color: isFollowing ? 'var(--text-secondary)' : 'var(--text-on-accent)',
        boxShadow: showFollowBack ? '0 2px 10px var(--accent-muted)' : 'none',
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
      ) : showFollowBack ? (
        <>
          <UserPlus size={isSmall ? 13 : 15} />
          Follow Back
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
