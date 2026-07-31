import React from 'react';
import type { CreatorRecommendationDto } from '../types/api';
import { UserAvatar } from './UserAvatar';
import { FollowButton } from './FollowButton';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecommendationCardProps {
  creator: CreatorRecommendationDto;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ creator }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/creator/${creator.creatorId}`)}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        padding: '16px',
        marginBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-card)',
        transition: 'border-color 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserAvatar src={creator.profileImage} name={creator.username} size={44} />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {creator.username}
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} />
              {creator.followerCount} followers
            </span>
          </div>
        </div>
        <FollowButton userId={creator.creatorId} size="sm" />
      </div>

      {creator.reasonForRecommendation && (
        <div
          style={{
            backgroundColor: 'var(--accent-muted)',
            border: '1px solid var(--accent-muted-border)',
            borderRadius: '10px',
            padding: '8px 12px',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {creator.reasonForRecommendation}
          </p>
        </div>
      )}
    </div>
  );
};
