import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { userService, photoService, videoService } from '../services/apiServices';
import type { ConsumerProfileDto, CreatorProfileDto, PhotoListItemDto, VideoListItemDto } from '../types/api';
import { UserAvatar } from '../components/UserAvatar';
import { Image, Video, Camera, Trash2, Loader2, X } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ConsumerProfileDto | CreatorProfileDto | null>(null);
  const [photos, setPhotos] = useState<PhotoListItemDto[]>([]);
  const [videos, setVideos] = useState<VideoListItemDto[]>([]);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
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

        const [pList, vList] = await Promise.all([
          photoService.getMine().catch(() => []),
          videoService.getMine().catch(() => []),
        ]);
        if (isMounted) {
          setPhotos(pList);
          setVideos(vList);
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
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setIsViewingPhoto(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsViewingPhoto(false)}
              style={{
                position: 'absolute',
                top: '-44px',
                right: '0',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
              }}
              title="Close"
            >
              <X size={28} />
            </button>
            <img
              src={profile.profileImageUrl}
              alt={user?.displayName || 'Profile'}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '16px',
                objectFit: 'contain',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        </div>
      )}

      {/* Profile Header Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatar Container with Icon-Only Controls */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              onClick={() => {
                if (profile?.profileImageUrl) setIsViewingPhoto(true);
              }}
              style={{ cursor: profile?.profileImageUrl ? 'pointer' : 'default' }}
              title={profile?.profileImageUrl ? 'Click to view photo' : ''}
            >
              <UserAvatar src={profile?.profileImageUrl} name={user?.displayName || 'User'} size={84} />
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />

            {/* Icon-Only Action Buttons (Edit, View, Delete) */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
              {/* Edit / Upload Icon Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                title={profile?.profileImageUrl ? 'Edit / Replace photo' : 'Upload photo'}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              >
                {uploadingAvatar ? <Loader2 size={14} className="spin" /> : <Camera size={15} color="var(--accent)" />}
              </button>

              {/* Delete Icon Button */}
              {profile?.profileImageUrl && (
                <button
                  type="button"
                  onClick={handleAvatarDelete}
                  disabled={uploadingAvatar}
                  title="Delete profile photo"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
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
                </>
              ) : (
                <div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {(profile as ConsumerProfileDto)?.followingCount || 0}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Following</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('photos')} style={tabStyle(activeTab === 'photos')}>
          <Image size={18} /> Photos ({photos.length})
        </button>
        <button onClick={() => setActiveTab('videos')} style={tabStyle(activeTab === 'videos')}>
          <Video size={18} /> Videos ({videos.length})
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
      ) : videos.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '40px 0' }}>No uploaded videos yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {videos.map((v) => (
            <div key={v.videoId} style={{ borderRadius: '12px', overflow: 'hidden', height: '180px', backgroundColor: 'var(--bg-primary)' }}>
              <video src={v.blobUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
