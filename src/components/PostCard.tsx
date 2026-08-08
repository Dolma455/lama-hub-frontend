import React, { useState, useEffect } from 'react';
import { MessageCircle, Tag, Maximize2, Edit3, Trash2, Repeat2 } from 'lucide-react';
import type { FeedItemDto, TagDto } from '../types/api';
import { photoService, videoService, userService } from '../services/apiServices';
import { useAuthStore } from '../store/useAuthStore';
import { UserAvatar } from './UserAvatar';
import { FollowButton } from './FollowButton';
import { LikeButton } from './LikeButton';
import { SaveButton } from './SaveButton';
import { ShareButton } from './ShareButton';
import { TagChip } from './TagChip';
import { CommentSection } from './CommentSection';
import { MediaDetailModal } from './MediaDetailModal';
import { StarRating } from './StarRating';
import { useProfileNavigation } from '../hooks/useProfileNavigation';
import { formatRelativeTime } from '../utils/dateUtils';

interface PostCardProps {
  item: FeedItemDto;
  onUpdate?: (contentId: string, title: string, caption?: string) => void;
  onDelete?: (contentId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ item, onUpdate, onDelete }) => {
  const navigateToProfile = useProfileNavigation();
  const { user } = useAuthStore();
  const isOwner = user?.userId === item.creatorId;

  const [tags, setTags] = useState<TagDto[]>([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(item.commentCount);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [title, setTitle] = useState(item.title);
  const [caption, setCaption] = useState(item.caption);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    if (item.contentType === 'Photo' && item.contentId) {
      photoService
        .getTags(item.contentId)
        .then(setTags)
        .catch(() => {});
    }

    if (user?.userId && item.creatorId && item.creatorId !== user.userId) {
      userService
        .getFollowStatus(item.creatorId)
        .then((res) => setIsFollowing(res.isFollowing))
        .catch(() => {});
    }
  }, [item.contentId, item.contentType, item.creatorId, user?.userId]);

  if (deleted) return null;

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${item.contentType.toLowerCase()}?`)) return;
    try {
      if (item.contentType === 'Photo') {
        await photoService.delete(item.contentId);
      } else {
        await videoService.delete(item.contentId);
      }
      setDeleted(true);
      if (onDelete) onDelete(item.contentId);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Repost Header Banner */}
      {item.sharedByUserDisplayName && (
        <div
          onClick={() => navigateToProfile(item.sharedByUserId)}
          style={{
            padding: '8px 18px',
            backgroundColor: 'var(--accent-muted)',
            borderBottom: '1px solid var(--accent-muted-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--accent)',
            cursor: 'pointer',
          }}
        >
          <Repeat2 size={16} />
          <span>
            {item.sharedByUserDisplayName} reposted {item.sharedAtUtc ? `• ${formatRelativeTime(item.sharedAtUtc)}` : ''}
          </span>
        </div>
      )}

      {/* Repost Caption Quote Box */}
      {item.repostCaption && (
        <div
          style={{
            margin: '12px 18px 0 18px',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            borderLeft: '4px solid var(--accent)',
            fontSize: '0.88rem',
            color: 'var(--text-primary)',
            fontWeight: 500,
          }}
        >
          "{item.repostCaption}"
        </div>
      )}
      {/* Expanded Modal */}
      {isModalOpen && (
        <MediaDetailModal
          contentId={item.contentId}
          contentType={item.contentType}
          title={title}
          caption={caption}
          location={item.location}
          mediaUrl={item.mediaUrl}
          creatorId={item.creatorId}
          creatorDisplayName={item.creatorDisplayName}
          createdAtUtc={item.uploadDate}
          initialLikeCount={item.likeCount}
          initialCommentCount={commentCount}
          initialIsLiked={item.isLikedByCurrentUser}
          onClose={() => setIsModalOpen(false)}
          onUpdate={(newTitle, newCap) => {
            setTitle(newTitle);
            setCaption(newCap);
            if (onUpdate) onUpdate(item.contentId, newTitle, newCap);
          }}
          onDelete={() => {
            setDeleted(true);
            if (onDelete) onDelete(item.contentId);
          }}
        />
      )}

      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            onClick={() => navigateToProfile(item.creatorId)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <UserAvatar src={item.creatorProfileImageUrl} name={item.creatorDisplayName} size={42} />
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.creatorDisplayName}
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formatRelativeTime(item.uploadDate)}
              </span>
            </div>
          </div>

          {!isOwner && user?.userId && item.creatorId && (
            <FollowButton
              userId={item.creatorId}
              initialIsFollowing={isFollowing}
              size="sm"
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StarRating contentId={item.contentId} contentType={item.contentType} />
          {isOwner && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setIsModalOpen(true)}
                title="Edit Post"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={handleDelete}
                title="Delete Post"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & Caption */}
      <div style={{ padding: '0 18px 12px 18px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h3>
        {caption && (
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {caption}
          </p>
        )}
      </div>

      {/* Media Image / Video with Expand Action */}
      <div
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: 'var(--bg-primary)',
          minHeight: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            borderRadius: '50%',
            padding: '6px',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Expand View"
        >
          <Maximize2 size={16} />
        </div>

        {item.contentType === 'Photo' ? (
          item.mediaUrl ? (
            <img
              src={item.mediaUrl}
              alt={title}
              style={{ width: '100%', maxHeight: '550px', objectFit: 'cover' }}
              loading="lazy"
              onError={(e) => {
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  const isHeic = item.mediaUrl.toLowerCase().endsWith('.heic');
                  parent.innerHTML = `
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; color:var(--text-muted); text-align:center;">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:8px; opacity:0.6;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">
                        ${isHeic ? 'HEIC Image format not supported by browser' : 'Unable to load image from storage'}
                      </span>
                      <span style="font-size:0.75rem; opacity:0.7; margin-top:4px;">
                        ${isHeic ? 'Please upload JPEG, PNG, or WebP files' : 'Check Azure Blob container permissions / CORS'}
                      </span>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--text-muted)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No image file attached</span>
            </div>
          )
        ) : (
          <video
            src={item.mediaUrl}
            controls
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxHeight: '550px', objectFit: 'contain' }}
            onError={(e) => {
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const isMov = item.mediaUrl.toLowerCase().endsWith('.mov');
                parent.innerHTML = `
                  <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; color:var(--text-muted); text-align:center;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:8px; opacity:0.6;"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    <span style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">
                      ${isMov ? '.MOV Video format not supported by browser' : 'Unable to play video'}
                    </span>
                    <span style="font-size:0.75rem; opacity:0.7; margin-top:4px;">
                      ${isMov ? 'Please convert/upload MP4 (H.264) or WebM files, or check Azure "videos" container permissions' : 'Check Azure Blob "videos" container access level in Azure Portal'}
                    </span>
                  </div>
                `;
              }
            }}
          />
        )}
      </div>

      {/* Vision Tags */}
      {tags.length > 0 && (
        <div
          style={{
            padding: '12px 18px 4px 18px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Tag size={13} color="var(--accent)" /> Tags:
          </span>
          {tags.map((tag) => (
            <TagChip key={tag.tagId} name={tag.name} confidence={tag.confidence} />
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <LikeButton
            contentId={item.contentId}
            contentType={item.contentType}
            initialIsLiked={item.isLikedByCurrentUser}
            initialLikeCount={item.likeCount}
          />
          <button
            onClick={() => setIsCommentsOpen((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: isCommentsOpen ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'color 0.2s ease',
            }}
          >
            <MessageCircle size={22} />
            <span>{commentCount}</span>
          </button>
          <ShareButton contentId={item.contentId} contentType={item.contentType} title={title} />
        </div>
        <SaveButton contentId={item.contentId} contentType={item.contentType} />
      </div>

      {/* Inline Comment Section */}
      <CommentSection
        isOpen={isCommentsOpen}
        contentId={item.contentId}
        contentType={item.contentType}
        onCommentAdded={() => setCommentCount((prev) => prev + 1)}
      />
    </div>
  );
};
