import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { ratingService } from '../services/apiServices';
import type { RatingSummaryDto } from '../types/api';
import { useAuthStore } from '../store/useAuthStore';

interface StarRatingProps {
  contentId: string;
  contentType: 'Photo' | 'Video';
  size?: number;
  showCount?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  contentId,
  contentType,
  size = 16,
  showCount = true,
}) => {
  const { user } = useAuthStore();
  const [ratingSummary, setRatingSummary] = useState<RatingSummaryDto>({
    averageScore: 0,
    totalRatings: 0,
    userScore: null,
  });
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchRating = async () => {
      try {
        const data =
          contentType === 'Photo'
            ? await ratingService.getPhotoRating(contentId)
            : await ratingService.getVideoRating(contentId);
        if (isMounted) {
          setRatingSummary(data);
        }
      } catch (err) {
        console.error('Failed to load rating:', err);
      }
    };

    if (contentId) {
      fetchRating();
    }
    return () => {
      isMounted = false;
    };
  }, [contentId, contentType]);

  const handleRate = async (score: number) => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const updated =
        contentType === 'Photo'
          ? await ratingService.ratePhoto(contentId, score)
          : await ratingService.rateVideo(contentId, score);
      setRatingSummary(updated);
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setLoading(false);
    }
  };

  const averageScore = ratingSummary?.averageScore ?? 0;
  const totalRatings = ratingSummary?.totalRatings ?? 0;
  const userScore = ratingSummary?.userScore ?? null;
  const displayScore = hoverScore ?? userScore ?? averageScore;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: user ? 'pointer' : 'default' }}
        onMouseLeave={() => setHoverScore(null)}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= Math.round(displayScore);
          return (
            <button
              key={starIndex}
              type="button"
              disabled={!user || loading}
              onClick={() => handleRate(starIndex)}
              onMouseEnter={() => setHoverScore(starIndex)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: user ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s ease',
              }}
              title={user ? `Rate ${starIndex} star${starIndex > 1 ? 's' : ''}` : 'Sign in to rate'}
            >
              <Star
                size={size}
                fill={isFilled ? '#f59e0b' : 'transparent'}
                color={isFilled ? '#f59e0b' : 'var(--text-muted)'}
                style={{ transition: 'all 0.15s ease' }}
              />
            </button>
          );
        })}
      </div>

      <span
        style={{
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginLeft: '2px',
        }}
      >
        {averageScore > 0 ? averageScore.toFixed(1) : 'New'}
      </span>

      {showCount && (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          ({totalRatings})
        </span>
      )}
    </div>
  );
};
