import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  title?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'LamaHub Post',
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Share Post"
      style={{
        background: 'none',
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: copied ? 'var(--success)' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 500,
        transition: 'color 0.15s ease',
      }}
    >
      {copied ? <Check size={20} /> : <Share2 size={20} />}
      {copied && <span style={{ fontSize: '0.75rem' }}>Copied!</span>}
    </button>
  );
};
