import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { userService, photoService, videoService, sharedPostService } from '../services/apiServices';
import type { ConsumerProfileDto, CreatorProfileDto, PhotoListItemDto, VideoListItemDto, SharedPostDto } from '../types/api';
import { UserAvatar } from '../components/UserAvatar';
import { Image, Video, Camera, Trash2, Loader2, X, Repeat2 } from 'lucide-react';
import { formatRelativeTime } from '../utils/dateUtils';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ConsumerProfileDto | CreatorProfileDto | null>(null);
  const [photos, setPhotos] = useState<PhotoListItemDto[]>([]);
  const [videos, setVideos] = useState<VideoListItemDto[]>([]);
  const [sharedPosts, setSharedPosts] = useState<SharedPostDto[]>([]);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'reposts'>('photos');
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isViewingPhoto, setIsViewingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (user?.role === 'Creator') {
          const res = await userService.getCreatorProfile();
          if (isMounted) {
            setProfile(res);
            if (res.profileImageUrl !== user?.profileImageUrl) {
              useAuthStore.getState().updateUser({ profileImageUrl: res.profileImageUrl || null });
            }
          }
        } else {
          const res = await userService.getConsumerProfile();
          if (isMounted) {
            setProfile(res);
            if (res.profileImageUrl !== user?.profileImageUrl) {
              useAuthStore.getState().updateUser({ profileImageUrl: res.profileImageUrl || null });
            }
          }
        }

        const [pList, vList, sList] = await Promise.all([
          photoService.getMine().catch(() => []),
          videoService.getMine().catch(() => []),
          sharedPostService.getMySharedPosts().catch(() => []),
        ]);
        if (isMounted) {
          setPhotos(pList);
          setVideos(vList);
          setSharedPosts(sList);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.userId, user?.role]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);
    try {
      const res = await userService.uploadAvatar(file);
      setProfile((prev) => (prev ? { ...prev, profileImageUrl: res.avatarUrl } : prev));
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setUploadingAvatar(true);
    try {
      await userService.deleteAvatar();
      setProfile((prev) => (prev ? { ...prev, profileImageUrl: null } : prev));
    } catch (err) {
      console.error('Failed to delete profile picture:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading profile...</p>;
  }

  const isCreator = user?.role === 'Creator';
  const creatorProfile = profile as CreatorProfileDto;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: active ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
    backgroundColor: active ? 'var(--accent-muted)' : 'var(--bg-card)',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  });

  return (
    <div>
      {/* Photo Viewer Modal */}
      {isViewingPhoto && profile?.profileImageUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsViewingPhoto(false)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              onClick={() => setIsViewingPhoto(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <X size={28} />
            </button>
            <img
              src={profile.profileImageUrl}
              alt="Profile avatar"
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '16px', objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Avatar with Upload Hover Action */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div
              onClick={() => profile?.profileImageUrl && setIsViewingPhoto(true)}
              style={{ cursor: profile?.profileImageUrl ? 'pointer' : 'default' }}
            >
              <UserAvatar src={profile?.profileImageUrl} name={user?.displayName || 'User'} size={88} />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              title="Change Profile Picture"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                color: 'var(--text-on-accent)',
                border: '2px solid var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </button>

            {profile?.profileImageUrl && (
              <button
                onClick={handleAvatarDelete}
                disabled={uploadingAvatar}
                title="Remove Profile Picture"
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--danger)',
                  color: 'white',
                  border: '2px solid var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {user?.displayName}
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--accent-muted)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-muted-border)',
                }}
              >
                {user?.role}
              </span>
            </div>

            <p style={{ margin: '6px 0 16px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {profile?.bio || 'No bio provided yet.'}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '28px' }}>
              {isCreator ? (
                <>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {creatorProfile?.followersCount || 0}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Followers</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {photos.length}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Photos</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {videos.length}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Videos</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {sharedPosts.length}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reposts</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {(profile as ConsumerProfileDto)?.followingCount || 0}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Following</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {sharedPosts.length}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reposts</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('photos')} style={tabStyle(activeTab === 'photos')}>
          <Image size={18} /> Photos ({photos.length})
        </button>
        <button onClick={() => setActiveTab('videos')} style={tabStyle(activeTab === 'videos')}>
          <Video size={18} /> Videos ({videos.length})
        </button>
        <button onClick={() => setActiveTab('reposts')} style={tabStyle(activeTab === 'reposts')}>
          <Repeat2 size={18} /> Reposts ({sharedPosts.length})
        </button>
      </div>

      {/* Grid Content */}
      {activeTab === 'photos' ? (
        photos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '40px 0' }}>No uploaded photos yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {photos.map((p) => (
              <div key={p.photoId} style={{ borderRadius: '12px', overflow: 'hidden', height: '180px' }}>
                <img src={p.blobUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'videos' ? (
        videos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '40px 0' }}>No uploaded videos yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {videos.map((v) => (
              <div key={v.videoId} style={{ borderRadius: '12px', overflow: 'hidden', height: '180px', backgroundColor: 'var(--bg-primary)' }}>
                <video src={v.blobUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )
      ) : (
        /* Reposts Tab Content */
        sharedPosts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '40px 0' }}>No reposts yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {sharedPosts.map((s) => (
              <div
                key={s.sharedPostId}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Header with Repost Tag */}
                <div
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--accent-muted)',
                    borderBottom: '1px solid var(--accent-muted-border)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Repeat2 size={13} /> Reposted
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {formatRelativeTime(s.sharedAtUtc)}
                  </span>
                </div>

                {/* Media Preview */}
                <div style={{ height: '150px', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
                  {s.contentType === 'Photo' ? (
                    <img src={s.mediaUrl} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <video src={s.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* Caption / Title */}
                <div style={{ padding: '10px 12px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {s.title}
                  </h4>
                  {s.caption && (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.3' }}>
                      "{s.caption}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
