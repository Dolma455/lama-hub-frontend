import React from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TagChipProps {
  name: string;
  confidence?: number;
}

export const TagChip: React.FC<TagChipProps> = ({ name, confidence }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/search?tag=${encodeURIComponent(name)}`);
  };

  return (
    <span
      onClick={handleClick}
      title={confidence ? `Confidence: ${(confidence * 100).toFixed(0)}%` : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '3px 10px',
        borderRadius: '16px',
        background: 'var(--accent-muted)',
        color: 'var(--accent)',
        border: '1px solid var(--accent-muted-border)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <TagIcon size={12} />
      #{name}
    </span>
  );
};
