import React, { useState, useEffect } from 'react';
import { Send, Trash2, Edit2 } from 'lucide-react';
import { commentService } from '../services/apiServices';
import type { CommentDto } from '../types/api';
import { SentimentBadge } from './SentimentBadge';
import { UserAvatar } from './UserAvatar';
import { useAuthStore } from '../store/useAuthStore';
import { formatRelativeTime } from '../utils/dateUtils';

interface CommentSectionProps {
  isOpen: boolean;
  contentId: string;
  contentType: 'Photo' | 'Video';
  onCommentAdded?: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  isOpen,
  contentId,
  contentType,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const currentUser = useAuthStore((state) => state.user);

  const fetchComments = async () => {
    setLoading(true);
    try {
      if (contentType === 'Photo') {
        const res = await commentService.getPhotoComments(contentId);
        setComments(res.items);
      } else {
        const res = await commentService.getVideoComments(contentId);
        setComments(res.items);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && contentId) {
      fetchComments();
    }
  }, [isOpen, contentId, contentType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      let newComment: CommentDto;
      if (contentType === 'Photo') {
        newComment = await commentService.addPhotoComment(contentId, text.trim());
      } else {
        newComment = await commentService.addVideoComment(contentId, text.trim());
      }
      setComments((prev) => [newComment, ...prev]);
      setText('');
      onCommentAdded?.();
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      const updated = await commentService.updateComment(commentId, editText.trim());
      setComments((prev) => prev.map((c) => (c.commentId === commentId ? updated : c)));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-primary)',
        padding: '16px 18px',
      }}
    >
      {/* Input box at top of comment section */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          marginBottom: comments.length > 0 ? '16px' : '4px',
        }}
      >
        <UserAvatar src={currentUser?.profileImageUrl} name={currentUser?.displayName || 'User'} size={34} />
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '10px 42px 10px 16px',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            style={{
              position: 'absolute',
              right: '6px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: text.trim() ? 'var(--accent)' : 'transparent',
              color: text.trim() ? 'var(--text-on-accent)' : 'var(--text-muted)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: text.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </form>

      {/* List of comments */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0', margin: 0 }}>
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '8px 0 4px 0', margin: 0 }}>
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {comments.map((comment) => (
            <div key={comment.commentId} style={{ display: 'flex', gap: '10px' }}>
              <UserAvatar name={comment.userDisplayName} size={32} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    display: 'inline-block',
                    maxWidth: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {comment.userDisplayName}
                    </span>
                    <SentimentBadge
                      sentiment={comment.sentiment}
                      positiveScore={comment.positiveScore}
                      neutralScore={comment.neutralScore}
                      negativeScore={comment.negativeScore}
                    />
                  </div>

                  {editingId === comment.commentId ? (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{
                          flex: 1,
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--accent)',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => handleUpdate(comment.commentId)}
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'var(--text-on-accent)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: 600,
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          backgroundColor: 'var(--bg-input)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {comment.commentText}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px', paddingLeft: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {formatRelativeTime(comment.createdAtUtc)}
                  </span>

                  {(currentUser?.userId === comment.userId || currentUser?.role === 'Admin') &&
                    editingId !== comment.commentId && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(comment.commentId);
                            setEditText(comment.commentText);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.commentId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
