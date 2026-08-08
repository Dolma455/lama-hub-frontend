import React, { useState, useEffect } from 'react';
import { photoService, videoService, userService } from '../services/apiServices';
import { useAuthStore } from '../store/useAuthStore';
import { UserAvatar } from '../components/UserAvatar';
import type { UserDto } from '../types/api';
import { UploadCloud, Image, Video, CheckCircle, Loader2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [contentType, setContentType] = useState<'Photo' | 'Video'>('Photo');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState('');
  const [followingFriends, setFollowingFriends] = useState<UserDto[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      userService
        .getFollowing(user.userId, 1, 50)
        .then((res) => setFollowingFriends(res.items))
        .catch(() => setFollowingFriends([]));
    }
  }, [user?.userId]);

  const toggleTagFriend = (displayName: string) => {
    const currentList = people
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    let updated: string[];
    if (currentList.some((p) => p.toLowerCase() === displayName.toLowerCase())) {
      updated = currentList.filter((p) => p.toLowerCase() !== displayName.toLowerCase());
    } else {
      updated = [...currentList, displayName];
    }
    setPeople(updated.join(', '));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file || uploading) return;

    setUploading(true);
    setProgressStatus('Creating post entry...');

    try {
      if (contentType === 'Photo') {
        const peopleList = people
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean);

        const photo = await photoService.create({
          title: title.trim(),
          caption: caption.trim() || undefined,
          location: location.trim() || undefined,
          peoplePresent: peopleList,
        });

        setProgressStatus('Uploading image...');
        await photoService.uploadImage(photo.photoId, file);
        setProgressStatus('Detecting image tags...');
      } else {
        const video = await videoService.create({
          title: title.trim(),
          caption: caption.trim() || undefined,
        });

        setProgressStatus('Uploading video...');
        await videoService.uploadVideo(video.videoId, file);
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Failed to upload media:', err);
      setProgressStatus('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  };

  const typeButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px',
    borderRadius: '12px',
    border: active ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
    backgroundColor: active ? 'var(--accent-muted)' : 'var(--bg-input)',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  });

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        padding: '28px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <UploadCloud size={24} color="var(--accent)" />
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Upload New Media
        </h2>
      </div>

      {/* Content Type Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => { setContentType('Photo'); setFile(null); setPreviewUrl(null); }}
          style={typeButtonStyle(contentType === 'Photo')}
        >
          <Image size={18} /> Photo Post
        </button>
        <button
          type="button"
          onClick={() => { setContentType('Video'); setFile(null); setPreviewUrl(null); }}
          style={typeButtonStyle(contentType === 'Video')}
        >
          <Video size={18} /> Video Post
        </button>
      </div>

      {success ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Upload Successful!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Redirecting to feed...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* File Upload Box */}
          <div>
            <label style={{ ...labelStyle, marginBottom: '8px' }}>
              Media File ({contentType === 'Photo' ? 'JPG, PNG, WebP' : 'MP4, WebM'})
            </label>
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-input)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
            >
              <input
                type="file"
                accept={contentType === 'Photo' ? 'image/*' : 'video/*'}
                required
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                }}
              />
              {previewUrl ? (
                contentType === 'Photo' ? (
                  <img src={previewUrl} alt="Preview" style={{ maxHeight: '240px', borderRadius: '12px', objectFit: 'cover' }} />
                ) : (
                  <video src={previewUrl} controls style={{ maxHeight: '240px', borderRadius: '12px', width: '100%' }} />
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <UploadCloud size={32} color="var(--accent)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Click or drag & drop to select file
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Title (Write title)</label>
            <input
              type="text"
              required
              placeholder="Write title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Caption</label>
            <textarea
              rows={3}
              placeholder="Write a description for your post..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {contentType === 'Photo' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Location (Manchester, UK)</label>
                <input
                  type="text"
                  placeholder="Manchester, UK"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Tag / Mention Friends with Attached Dropdown & Selected Chips */}
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Tag / Mention Friends (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Click or type to tag friends..."
                  value={people}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => setPeople(e.target.value)}
                  style={inputStyle}
                />

                {/* Attached Dropdown Menu directly below input */}
                {isDropdownOpen && followingFriends.length > 0 && (
                  <>
                    <div
                      onClick={() => setIsDropdownOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '14px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                        zIndex: 100,
                        padding: '6px',
                      }}
                    >
                      <div
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          letterSpacing: '0.5px',
                        }}
                      >
                        FRIENDS YOU FOLLOW
                      </div>
                      {followingFriends.map((friend) => {
                        const isSelected = people
                          .split(',')
                          .map((p) => p.trim().toLowerCase())
                          .includes(friend.displayName.toLowerCase());

                        return (
                          <div
                            key={friend.userId}
                            onClick={() => toggleTagFriend(friend.displayName)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              backgroundColor: isSelected ? 'var(--accent-muted)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <UserAvatar src={friend.profileImageUrl} name={friend.displayName} size={26} />
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {friend.displayName}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600 }}>
                                  {friend.role}
                                </div>
                              </div>
                            </div>
                            {isSelected && <Check size={16} color="var(--accent)" />}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Tagged Friend Chips directly below input */}
                {people.trim() && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {people
                      .split(',')
                      .map((p) => p.trim())
                      .filter(Boolean)
                      .map((name) => (
                        <span
                          key={name}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'var(--accent-muted)',
                            border: '1px solid var(--accent-muted-border)',
                            color: 'var(--accent)',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          }}
                        >
                          @{name}
                          <X
                            size={12}
                            onClick={() => toggleTagFriend(name)}
                            style={{ cursor: 'pointer', marginLeft: '2px' }}
                          />
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {progressStatus && (
            <p
              style={{
                color: 'var(--accent)',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
              }}
            >
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {progressStatus}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading || !file || !title.trim()}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: 'var(--text-on-accent)',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: uploading || !file || !title.trim() ? 'not-allowed' : 'pointer',
              opacity: uploading || !file || !title.trim() ? 0.6 : 1,
              fontFamily: 'inherit',
              transition: 'opacity 0.2s ease',
            }}
          >
            {uploading ? 'Processing & Uploading...' : `Publish ${contentType}`}
          </button>
        </form>
      )}
    </div>
  );
};
