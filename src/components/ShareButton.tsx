import React, { useState } from 'react';
import { Repeat2, Check, Copy, MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { sharedPostService } from '../services/apiServices';

interface ShareButtonProps {
  contentId?: string;
  contentType?: 'Photo' | 'Video';
  title?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ contentId, contentType, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQuoteInput, setShowQuoteInput] = useState(false);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleInstantRepost = async () => {
    if (!contentId) {
      handleCopyLink();
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      if (contentType === 'Video') {
        await sharedPostService.shareVideo(contentId);
      } else {
        await sharedPostService.sharePhoto(contentId);
      }
      setReposted(true);
      showToast('Reposted to your feed!');
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to repost:', err);
      showToast('Failed to repost');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteRepost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId || !caption.trim() || loading) return;

    setLoading(true);
    try {
      if (contentType === 'Video') {
        await sharedPostService.shareVideo(contentId, caption.trim());
      } else {
        await sharedPostService.sharePhoto(contentId, caption.trim());
      }
      setReposted(true);
      showToast('Reposted with your thoughts!');
      setCaption('');
      setShowQuoteInput(false);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to repost with quote:', err);
      showToast('Failed to repost');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    if (navigator.share && !contentId) {
      try {
        await navigator.share({
          title: title || 'LamaHub Post',
          url,
        });
        setIsOpen(false);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Repost Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title="Repost / Share"
        style={{
          background: 'none',
          border: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: reposted ? 'var(--success)' : 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          padding: '4px 6px',
          borderRadius: '8px',
        }}
      >
        <Repeat2 size={22} style={{ transform: reposted ? 'scale(1.1)' : 'none', transition: 'transform 0.2s ease' }} />
        {reposted && <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Reposted</span>}
      </button>

      {/* Toast Notification */}
      {message && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            backgroundColor: 'var(--accent)',
            color: 'var(--text-on-accent)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 100,
          }}
        >
          {message}
        </div>
      )}

      {/* Instagram-style Repost Popup Modal / Menu */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setShowQuoteInput(false);
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 998,
            }}
          />

          {/* Modal / Menu */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '110%',
              left: 0,
              width: '260px',
              backgroundColor: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Repost to LamaHub
              </span>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {!showQuoteInput ? (
              <>
                {/* Instant Repost */}
                <button
                  onClick={handleInstantRepost}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background-color 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Repeat2 size={18} color="var(--accent)" />}
                  <div>
                    <div>Repost</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      Share directly to your followers
                    </div>
                  </div>
                </button>

                {/* Repost with Thoughts */}
                <button
                  onClick={() => setShowQuoteInput(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background-color 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  <MessageSquare size={18} color="var(--accent)" />
                  <div>
                    <div>Repost with Thoughts</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      Add your own caption
                    </div>
                  </div>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} />}
                  <span>Copy Link</span>
                </button>
              </>
            ) : (
              /* Quote Repost Input Form */
              <form onSubmit={handleQuoteRepost} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  placeholder="Add your thoughts..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowQuoteInput(false)}
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!caption.trim() || loading}
                    style={{
                      backgroundColor: caption.trim() ? 'var(--accent)' : 'var(--bg-input)',
                      color: 'var(--text-on-accent)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: caption.trim() ? 'pointer' : 'default',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Repost
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};
