import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Tag as TagIcon, MapPin, Loader2 } from 'lucide-react';
import { photoService, videoService, userService } from '../services/apiServices';
import type { TagDto } from '../types/api';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileNavigation } from '../hooks/useProfileNavigation';
import { FollowButton } from './FollowButton';
import { LikeButton } from './LikeButton';
import { SaveButton } from './SaveButton';
import { ShareButton } from './ShareButton';
import { CommentSection } from './CommentSection';
import { TagChip } from './TagChip';
import { StarRating } from './StarRating';
import { formatRelativeTime } from '../utils/dateUtils';

interface MediaDetailModalProps {
  contentId: string;
  contentType: 'Photo' | 'Video';
  title: string;
  caption?: string | null;
  location?: string | null;
  mediaUrl: string;
  creatorId?: string;
  creatorDisplayName?: string;
  createdAtUtc?: string;
  initialLikeCount?: number;
  initialCommentCount?: number;
  initialIsLiked?: boolean;
  onClose: () => void;
  onUpdate?: (newTitle: string, newCaption?: string) => void;
  onDelete?: () => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  contentId,
  contentType,
  title: initialTitle,
  caption: initialCaption,
  location: initialLocation,
  mediaUrl,
  creatorId,
  creatorDisplayName,
  createdAtUtc,
  initialLikeCount = 0,
  initialCommentCount = 0,
  initialIsLiked = false,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const { user } = useAuthStore();
  const navigateToProfile = useProfileNavigation();
  const isOwner = user?.userId === creatorId;

  const [title, setTitle] = useState(initialTitle);
  const [caption, setCaption] = useState(initialCaption || '');
  const [location] = useState(initialLocation || '');
  const [tags, setTags] = useState<TagDto[]>([]);
  const [, setCommentCount] = useState(initialCommentCount);
  const [isFollowing, setIsFollowing] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editCaption, setEditCaption] = useState(caption);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete State
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (contentType === 'Photo' && contentId) {
      photoService
        .getTags(contentId)
        .then(setTags)
        .catch(() => {});
    }

    if (user?.userId && creatorId && creatorId !== user.userId) {
      userService
        .getFollowStatus(creatorId)
        .then((res) => setIsFollowing(res.isFollowing))
        .catch(() => {});
    }
  }, [contentId, contentType, creatorId, user?.userId]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setSavingEdit(true);
    try {
      if (contentType === 'Photo') {
        await photoService.update(contentId, {
          title: editTitle.trim(),
          caption: editCaption.trim(),
          location: location.trim(),
        });
      } else {
        await videoService.update(contentId, {
          title: editTitle.trim(),
          caption: editCaption.trim(),
        });
      }

      setTitle(editTitle.trim());
      setCaption(editCaption.trim());
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(editTitle.trim(), editCaption.trim());
      }
    } catch (err) {
      console.error('Failed to update content:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${contentType.toLowerCase()}?`)) return;

    setDeleting(true);
    try {
      if (contentType === 'Photo') {
        await photoService.delete(contentId);
      } else {
        await videoService.delete(contentId);
      }
      onClose();
      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      console.error('Failed to delete content:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '24px',
          border: '1px solid var(--border-color)',
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.6)',
            border: 'none',
            color: 'white',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Left Side: Media Container */}
        <div
          style={{
            flex: '1.4',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '450px',
          }}
        >
          {contentType === 'Photo' ? (
            <img
              src={mediaUrl}
              alt={title}
              style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }}
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              autoPlay
              style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }}
            />
          )}
        </div>

        {/* Right Side: Details & Comments */}
        <div
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--border-color)',
            overflowY: 'auto',
            maxHeight: '90vh',
            padding: '20px',
          }}
        >
          {/* Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => navigateToProfile(creatorId)}
                style={{ cursor: 'pointer' }}
              >
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {creatorDisplayName || 'Creator'}
                </h4>
                {createdAtUtc && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatRelativeTime(createdAtUtc)}
                  </span>
                )}
              </div>

              {!isOwner && user?.userId && creatorId && (
                <FollowButton userId={creatorId} initialIsFollowing={isFollowing} size="sm" />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <StarRating contentId={contentId} contentType={contentType} />
              {isOwner && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      backgroundColor: 'var(--danger-muted)',
                      border: '1px solid var(--danger)',
                      color: 'var(--danger)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Edit Form or Content View */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
                required
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                }}
              />
              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Caption (optional)"
                rows={3}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--accent)',
                    color: 'var(--text-on-accent)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {savingEdit ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {title}
              </h3>
              {caption && (
                <p style={{ margin: '0 0 10px 0', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {caption}
                </p>
              )}

              {location && (
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '8px',
                  }}
                >
                  <MapPin size={13} color="var(--accent)" /> {location}
                </span>
              )}

              {/* Vision Tags */}
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <TagIcon size={13} color="var(--accent)" /> AI Tags:
                  </span>
                  {tags.map((tag) => (
                    <TagChip key={tag.tagId} name={tag.name} confidence={tag.confidence} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div
            style={{
              padding: '12px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <LikeButton
                contentId={contentId}
                contentType={contentType}
                initialIsLiked={initialIsLiked}
                initialLikeCount={initialLikeCount}
              />
              <ShareButton contentId={contentId} contentType={contentType} title={title} />
            </div>
            <SaveButton contentId={contentId} contentType={contentType} />
          </div>

          {/* Comments Container */}
          <div style={{ flex: 1 }}>
            <CommentSection
              isOpen={true}
              contentId={contentId}
              contentType={contentType}
              onCommentAdded={() => setCommentCount((prev) => prev + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
