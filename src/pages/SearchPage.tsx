import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchService } from '../services/apiServices';
import type { UserDto, PhotoListItemDto, VideoListItemDto } from '../types/api';
import { UserAvatar } from '../components/UserAvatar';
import { FollowButton } from '../components/FollowButton';
import { TagChip } from '../components/TagChip';
import { useProfileNavigation } from '../hooks/useProfileNavigation';
import { Search, X } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const navigateToProfile = useProfileNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTag = searchParams.get('tag') || '';

  const [query, setQuery] = useState(initialQuery);
  const [tag, setTag] = useState(initialTag);
  const [activeTab, setActiveTab] = useState<'photos' | 'creators' | 'videos'>('photos');

  const [photos, setPhotos] = useState<PhotoListItemDto[]>([]);
  const [creators, setCreators] = useState<UserDto[]>([]);
  const [videos, setVideos] = useState<VideoListItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (activeTab === 'photos') {
        const res = await searchService.searchPhotos(query, tag);
        setPhotos(res.items);
      } else if (activeTab === 'creators') {
        const res = await searchService.searchCreators(query);
        setCreators(res.items);
      } else {
        const res = await searchService.searchVideos(query);
        setVideos(res.items);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [query, tag, activeTab]);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Search & Discover
        </h2>

        {/* Query Input */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search keywords, titles..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchParams({ q: e.target.value, tag });
            }}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '12px 14px 12px 42px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Tag Filter Banner */}
        {tag && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filtered by Tag:</span>
            <TagChip name={tag} />
            <button
              onClick={() => {
                setTag('');
                setSearchParams({ q: query });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontFamily: 'inherit',
              }}
            >
              <X size={14} /> Clear
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['photos', 'creators', 'videos'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: activeTab === tab
                  ? '1px solid var(--accent)'
                  : '1px solid var(--border-subtle)',
                backgroundColor: activeTab === tab ? 'var(--accent-muted)' : 'var(--bg-card)',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Searching...</p>
      ) : activeTab === 'photos' ? (
        photos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No photo results found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {photos.map((p) => (
              <div key={p.photoId} style={{ borderRadius: '12px', overflow: 'hidden', height: '180px' }}>
                <img src={p.blobUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'creators' ? (
        creators.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No creators found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {creators.map((c) => (
              <div
                key={c.userId}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div
                  onClick={() => navigateToProfile(c.userId)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                >
                  <UserAvatar src={c.profileImageUrl} name={c.displayName} size={40} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {c.displayName}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.role}</span>
                  </div>
                </div>
                <FollowButton userId={c.userId} size="sm" />
              </div>
            ))}
          </div>
        )
      ) : videos.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No video results found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {videos.map((v) => (
            <div
              key={v.videoId}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                height: '180px',
                backgroundColor: 'var(--bg-primary)',
              }}
            >
              <video src={v.blobUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
