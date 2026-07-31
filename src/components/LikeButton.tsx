import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { likeService } from '../services/apiServices';

interface LikeButtonProps {
  contentId: string;
  contentType: 'Photo' | 'Video';
  initialIsLiked?: boolean;
  initialLikeCount?: number;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  contentId,
  contentType,
  initialIsLiked = false,
  initialLikeCount = 0,
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    const prevIsLiked = isLiked;
    const prevCount = likeCount;

    // Optimistic UI update
    setIsLiked(!prevIsLiked);
    setLikeCount(prevIsLiked ? prevCount - 1 : prevCount + 1);

    try {
      if (contentType === 'Photo') {
        if (prevIsLiked) {
          const res = await likeService.unlikePhoto(contentId);
          setLikeCount(res.count);
        } else {
          const res = await likeService.likePhoto(contentId);
          setLikeCount(res.count);
        }
      } else {
        if (prevIsLiked) {
          const res = await likeService.unlikeVideo(contentId);
          setLikeCount(res.count);
        } else {
          const res = await likeService.likeVideo(contentId);
          setLikeCount(res.count);
        }
      }
    } catch (err) {
      console.error('Failed to update like status:', err);
      setIsLiked(prevIsLiked);
      setLikeCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      style={{
        background: 'none',
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: isLiked ? '#ef4444' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 600,
        transition: 'transform 0.15s ease, color 0.15s ease',
      }}
    >
      <Heart
        size={22}
        fill={isLiked ? '#ef4444' : 'none'}
        stroke={isLiked ? '#ef4444' : 'currentColor'}
      />
      <span>{likeCount}</span>
    </button>
  );
};
