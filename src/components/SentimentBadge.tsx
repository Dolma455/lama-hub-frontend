import React from 'react';
import { Smile, Meh, Frown, Shuffle } from 'lucide-react';

interface SentimentBadgeProps {
  sentiment?: 'Positive' | 'Neutral' | 'Negative' | 'Mixed' | null;
  positiveScore?: number | null;
  neutralScore?: number | null;
  negativeScore?: number | null;
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({
  sentiment,
  positiveScore,
  neutralScore,
  negativeScore,
}) => {
  if (!sentiment) return null;

  const getStyle = () => {
    switch (sentiment) {
      case 'Positive':
        return {
          bg: 'rgba(34, 197, 94, 0.12)',
          color: 'var(--success)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          icon: <Smile size={13} />,
        };
      case 'Negative':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          color: 'var(--danger)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          icon: <Frown size={13} />,
        };
      case 'Mixed':
        return {
          bg: 'var(--accent-muted)',
          color: 'var(--accent)',
          border: '1px solid var(--accent-muted-border)',
          icon: <Shuffle size={13} />,
        };
      case 'Neutral':
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.12)',
          color: 'var(--text-secondary)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          icon: <Meh size={13} />,
        };
    }
  };

  const style = getStyle();
  const scoresText = [
    positiveScore != null && `Pos: ${(positiveScore * 100).toFixed(0)}%`,
    neutralScore != null && `Neu: ${(neutralScore * 100).toFixed(0)}%`,
    negativeScore != null && `Neg: ${(negativeScore * 100).toFixed(0)}%`,
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <span
      title={scoresText || undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.7rem',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '12px',
        background: style.bg,
        color: style.color,
        border: style.border,
        cursor: 'help',
      }}
    >
      {style.icon}
      {sentiment}
    </span>
  );
};
