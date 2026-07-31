import React, { useState, useEffect } from 'react';
import { X, Send, Trash2, Edit2 } from 'lucide-react';
import { commentService } from '../services/apiServices';
import type { CommentDto } from '../types/api';
import { SentimentBadge } from './SentimentBadge';
import { UserAvatar } from './UserAvatar';
import { useAuthStore } from '../store/useAuthStore';

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'Photo' | 'Video';
  onCommentAdded?: () => void;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  isOpen,
  onClose,
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
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: 'var(--bg-sidebar)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Comments ({comments.length})
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Comment Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '10px 16px',
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
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: text.trim() ? 'var(--accent)' : 'var(--bg-input)',
              color: 'var(--text-on-accent)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: text.trim() ? 'pointer' : 'default',
              transition: 'background-color 0.2s ease',
              flexShrink: 0,
            }}
          >
            <Send size={16} />
          </button>
        </form>

        {/* Comment List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.commentId}
                style={{
                  marginBottom: '18px',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <UserAvatar name={comment.userDisplayName} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
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
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {comment.commentText}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(comment.createdAtUtc).toLocaleDateString()}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};
