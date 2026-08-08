import React, { useEffect, useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import type { CreatorRecommendationDto } from '../types/api';
import { recommendationService } from '../services/apiServices';
import { RecommendationCard } from './RecommendationCard';
import { useNavigate } from 'react-router-dom';

export const RightSidebar: React.FC = () => {
  const [recommendations, setRecommendations] = useState<CreatorRecommendationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    recommendationService
      .getCreatorRecommendations()
      .then((data) => setRecommendations(data.slice(0, 3)))
      .catch((err) => console.error('Failed to fetch recommendations:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside
      className="right-sidebar-aside"
      style={{
        width: '320px',
        padding: '24px 16px',
        height: 'calc(100vh - 61px)',
        position: 'sticky',
        top: '61px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="var(--accent)" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Suggested Creators
          </h3>
        </div>
        <button
          onClick={() => navigate('/recommendations')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          See all <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading creators...</p>
      ) : recommendations.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--accent-muted)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Explore creators by following top accounts!
          </p>
        </div>
      ) : (
        recommendations.map((creator) => (
          <RecommendationCard key={creator.creatorId} creator={creator} />
        ))
      )}
    </aside>
  );
};
