import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { savedService } from '../services/apiServices';

interface SaveButtonProps {
  contentId: string;
  contentType: 'Photo' | 'Video';
  initialIsSaved?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  contentId,
  contentType,
  initialIsSaved = false,
}) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    const prevSaved = isSaved;
    setIsSaved(!prevSaved);

    try {
      if (contentType === 'Photo') {
        if (prevSaved) {
          await savedService.unsavePhoto(contentId);
        } else {
          await savedService.savePhoto(contentId);
        }
      } else {
        if (prevSaved) {
          await savedService.unsaveVideo(contentId);
        } else {
          await savedService.saveVideo(contentId);
        }
      }
    } catch (err) {
      console.error('Failed to update save status:', err);
      setIsSaved(prevSaved);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSaveToggle}
      title={isSaved ? 'Remove from Saved' : 'Save Content'}
      style={{
        background: 'none',
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        color: isSaved ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease',
      }}
    >
      <Bookmark
        size={22}
        fill={isSaved ? 'var(--accent)' : 'none'}
        stroke={isSaved ? 'var(--accent)' : 'currentColor'}
      />
    </button>
  );
};
