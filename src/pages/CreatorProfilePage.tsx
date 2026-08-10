import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { PublicCreatorProfileDto, PhotoListItemDto, VideoListItemDto, SharedPostDto, FeedItemDto } from '../types/api';
import { userService, photoService, videoService, sharedPostService } from '../services/apiServices';
import { UserAvatar } from '../components/UserAvatar';
import { FollowButton } from '../components/FollowButton';
import { PostCard } from '../components/PostCard';
import { MediaDetailModal } from '../components/MediaDetailModal';
import { Users, Heart, Image, Video, Rss, Repeat2, X } from 'lucide-react';

export const CreatorProfilePage: React.FC = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const [profile, setProfile] = useState<PublicCreatorProfileDto | null>(null);
  const [photos, setPhotos] = useState<PhotoListItemDto[]>([]);
  const [videos, setVideos] = useState<VideoListItemDto[]>([]);
  const [sharedPosts, setSharedPosts] = useState<SharedPostDto[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'photos' | 'videos' | 'reposts'>('feed');
  const [loading, setLoading] = useState(true);

  // Avatar zoom modal
  const [isViewingAvatar, setIsViewingAvatar] = useState(false);

  // Selected media for Lightbox modal
  const [selectedMedia, setSelectedMedia] = useState<{
    contentId: string;
    contentType: 'Photo' | 'Video';
    title: string;
    caption?: string | null;
    location?: string | null;
    mediaUrl: string;
    createdAtUtc?: string;
    likeCount?: number;
    commentCount?: number;
  } | null>(null);

  const loadData = async () => {
    if (!creatorId) return;
    setLoading(true);
    try {
      const [profRes, photoList, videoList, sharedList] = await Promise.all([
        userService.getPublicCreatorProfile(creatorId).catch(() => null),
        photoService.getByUser(creatorId).catch(() => []),
        videoService.getByUser(creatorId).catch(() => []),
        sharedPostService.getUserSharedPosts(creatorId).catch(() => []),
      ]);

      setProfile(profRes);
      setPhotos(photoList);
      setVideos(videoList);
      setSharedPosts(sharedList);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [creatorId]);

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>Loading creator profile...</p>;
  }

  if (!profile) {
    return <p style={{ color: 'var(--danger)', textAlign: 'center', marginTop: '40px' }}>Creator profile not found.</p>;
  }

  const creatorFeedItems: FeedItemDto[] = [
    ...photos.map((p) => ({
      contentId: p.photoId,
      contentType: 'Photo' as const,
      creatorId: profile.creatorId,
      creatorDisplayName: profile.displayName,
      creatorProfileImageUrl: profile.profileImageUrl || undefined,
      title: p.title,
      caption: p.caption || undefined,
      location: p.location || undefined,
      mediaUrl: p.blobUrl,
      likeCount: p.likeCount,
      commentCount: p.commentCount,
      uploadDate: p.createdAtUtc,
      isLikedByCurrentUser: false,
    })),
    ...videos.map((v) => ({
      contentId: v.videoId,
      contentType: 'Video' as const,
      creatorId: profile.creatorId,
      creatorDisplayName: profile.displayName,
      creatorProfileImageUrl: profile.profileImageUrl || undefined,
      title: v.title,
      caption: v.caption || undefined,
      mediaUrl: v.blobUrl,
      likeCount: v.likeCount || 0,
      commentCount: v.commentCount || 0,
      uploadDate: v.createdAtUtc,
      isLikedByCurrentUser: false,
    })),
  ].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  const sharedPostFeedItems: FeedItemDto[] = sharedPosts.map((s) => ({
    contentId: s.contentId,
    contentType: s.contentType as 'Photo' | 'Video',
    creatorId: s.sharedByUserId,
    creatorDisplayName: s.sharedByUserDisplayName,
    title: s.title,
    mediaUrl: s.mediaUrl,
    uploadDate: s.sharedAtUtc,
    likeCount: 0,
    commentCount: 0,
    isLikedByCurrentUser: false,
    sharedByUserDisplayName: s.sharedByUserDisplayName,
    sharedByUserId: s.sharedByUserId,
    repostCaption: s.caption,
    sharedAtUtc: s.sharedAtUtc,
  }));

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

  const totalPostsCount = photos.length + videos.length;

  return (
    <div>
      {/* Avatar Lightbox Modal */}
      {isViewingAvatar && profile.profileImageUrl && (
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
          onClick={() => setIsViewingAvatar(false)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              onClick={() => setIsViewingAvatar(false)}
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
              alt={profile.displayName}
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '16px', objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Media Detail Lightbox Modal */}
      {selectedMedia && (
        <MediaDetailModal
          contentId={selectedMedia.contentId}
          contentType={selectedMedia.contentType}
          title={selectedMedia.title}
          caption={selectedMedia.caption}
          location={selectedMedia.location}
          mediaUrl={selectedMedia.mediaUrl}
          creatorId={profile.creatorId}
          creatorDisplayName={profile.displayName}
          createdAtUtc={selectedMedia.createdAtUtc}
          initialLikeCount={selectedMedia.likeCount || 0}
          initialCommentCount={selectedMedia.commentCount || 0}
          onClose={() => setSelectedMedia(null)}
          onUpdate={() => {
            loadData();
            setSelectedMedia(null);
          }}
          onDelete={() => {
            loadData();
            setSelectedMedia(null);
          }}
        />
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              onClick={() => profile.profileImageUrl && setIsViewingAvatar(true)}
              style={{ cursor: profile.profileImageUrl ? 'pointer' : 'default' }}
            >
              <UserAvatar src={profile.profileImageUrl} name={profile.displayName} size={72} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {profile.displayName}
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--accent-muted)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-muted-border)',
                }}
              >
                Creator
              </span>
            </div>
          </div>
          <FollowButton
            userId={profile.creatorId}
            initialIsFollowing={profile.isFollowed}
            initialIsFollowedBy={profile.isFollowingCurrentUser}
          />
        </div>

        {profile.bio && (
          <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {profile.bio}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            gap: '28px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Users size={16} color="var(--accent)" /> {profile.followersCount}
            </span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Followers</span>
          </div>
          <div>
            <span
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Heart size={16} color="var(--danger)" /> {profile.totalLikesReceived}
            </span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Likes</span>
          </div>
          <div>
            <span
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Image size={16} color="var(--accent-light)" /> {totalPostsCount}
            </span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Posts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('feed')} style={tabStyle(activeTab === 'feed')}>
          <Rss size={18} /> Posts ({creatorFeedItems.length})
        </button>
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

      {/* Tab Content */}
      {activeTab === 'feed' ? (
        creatorFeedItems.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '40px 0' }}>No posts published yet.</p>
        ) : (
          <div>
            {creatorFeedItems.map((item) => (
              <PostCard
                key={`${item.contentType}-${item.contentId}`}
                item={item}
                onUpdate={() => loadData()}
                onDelete={() => loadData()}
              />
            ))}
          </div>
        )
      ) : activeTab === 'photos' ? (
        photos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '40px 0' }}>No photos uploaded yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
            {photos.map((p) => (
              <div
                key={p.photoId}
                onClick={() =>
                  setSelectedMedia({
                    contentId: p.photoId,
                    contentType: 'Photo',
                    title: p.title,
                    caption: p.caption,
                    location: p.location,
                    mediaUrl: p.blobUrl,
                    createdAtUtc: p.createdAtUtc,
                    likeCount: p.likeCount,
                    commentCount: p.commentCount,
                  })
                }
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  height: '180px',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-primary)',
                  position: 'relative',
                  border: '1px solid var(--border-color)',
                }}
              >
                <img src={p.blobUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    color: 'white',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.title}
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'videos' ? (
        videos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '40px 0' }}>No videos uploaded yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
            {videos.map((v) => (
              <div
                key={v.videoId}
                onClick={() =>
                  setSelectedMedia({
                    contentId: v.videoId,
                    contentType: 'Video',
                    title: v.title,
                    caption: v.caption,
                    mediaUrl: v.blobUrl,
                    createdAtUtc: v.createdAtUtc,
                    likeCount: v.likeCount || 0,
                    commentCount: v.commentCount || 0,
                  })
                }
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  height: '180px',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-primary)',
                  position: 'relative',
                  border: '1px solid var(--border-color)',
                }}
              >
                <video src={v.blobUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    color: 'white',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {v.title}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        sharedPostFeedItems.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '40px 0' }}>No reposts yet.</p>
        ) : (
          <div>
            {sharedPostFeedItems.map((item) => (
              <PostCard
                key={`${item.contentType}-${item.contentId}-${item.sharedAtUtc}`}
                item={item}
                onUpdate={() => loadData()}
                onDelete={() => loadData()}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};
