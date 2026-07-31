import React, { useState, useEffect } from 'react';
import { MessageCircle, Tag } from 'lucide-react';
import type { FeedItemDto, TagDto } from '../types/api';
import { photoService } from '../services/apiServices';
import { UserAvatar } from './UserAvatar';
import { LikeButton } from './LikeButton';
import { SaveButton } from './SaveButton';
import { ShareButton } from './ShareButton';
import { TagChip } from './TagChip';
import { CommentSection } from './CommentSection';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../utils/dateUtils';

interface PostCardProps {
  item: FeedItemDto;
}

export const PostCard: React.FC<PostCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<TagDto[]>([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(item.commentCount);

  useEffect(() => {
    if (item.contentType === 'Photo' && item.contentId) {
      photoService
        .getTags(item.contentId)
        .then(setTags)
        .catch(() => {});
    }
  }, [item.contentId, item.contentType]);

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
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          onClick={() => navigate(`/creator/${item.creatorId}`)}
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
      </div>

      {/* Title & Caption */}
      <div style={{ padding: '0 18px 12px 18px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {item.title}
        </h3>
        {item.caption && (
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {item.caption}
          </p>
        )}
      </div>

      {/* Media Image / Video */}
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          minHeight: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {item.contentType === 'Photo' ? (
          item.mediaUrl ? (
            <img
              src={item.mediaUrl}
              alt={item.title}
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
          <ShareButton title={item.title} />
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
