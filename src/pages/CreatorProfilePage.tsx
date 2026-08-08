import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { PublicCreatorProfileDto } from '../types/api';
import { userService } from '../services/apiServices';
import { UserAvatar } from '../components/UserAvatar';
import { FollowButton } from '../components/FollowButton';
import { Users, Heart, Image } from 'lucide-react';

export const CreatorProfilePage: React.FC = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const [profile, setProfile] = useState<PublicCreatorProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (creatorId) {
      userService
        .getPublicCreatorProfile(creatorId)
        .then(setProfile)
        .catch((err) => console.error('Failed to load creator profile:', err))
        .finally(() => setLoading(false));
    }
  }, [creatorId]);

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading creator profile...</p>;
  }

  if (!profile) {
    return <p style={{ color: 'var(--danger)', textAlign: 'center' }}>Creator not found.</p>;
  }

  return (
    <div>
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
            <UserAvatar src={profile.profileImageUrl} name={profile.displayName} size={72} />
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
              <Image size={16} color="var(--accent-light)" /> {profile.photoCount + profile.videoCount}
            </span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Posts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
