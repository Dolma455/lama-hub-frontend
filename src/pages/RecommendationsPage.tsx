import React, { useEffect, useState } from 'react';
import { recommendationService } from '../services/apiServices';
import type { CreatorRecommendationDto } from '../types/api';
import { RecommendationCard } from '../components/RecommendationCard';
import { Star, RefreshCw } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<CreatorRecommendationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await recommendationService.getCreatorRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load creator recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Star size={24} color="var(--accent)" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Suggested Creators
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Creators you might enjoy based on your interests
            </p>
          </div>
        </div>

        <button
          onClick={fetchRecommendations}
          title="Refresh Recommendations"
          style={{
            backgroundColor: 'var(--accent-muted)',
            border: '1px solid var(--accent-muted-border)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            color: 'var(--accent)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
          Loading creators...
        </p>
      ) : recommendations.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No creator recommendations found at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {recommendations.map((creator) => (
            <RecommendationCard key={creator.creatorId} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
};
