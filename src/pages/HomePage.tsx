import React, { useEffect, useState } from 'react';
import type { FeedItemDto } from '../types/api';
import { feedService } from '../services/apiServices';
import { PostCard } from '../components/PostCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { LayoutList, RefreshCw } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [items, setItems] = useState<FeedItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await feedService.getFeed(pageNum, 10);
      setItems((prev) => (pageNum === 1 ? res.items : [...prev, ...res.items]));
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutList size={22} color="var(--accent)" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Unified Feed
          </h2>
        </div>
        <button
          onClick={() => {
            setPage(1);
            fetchFeed(1);
          }}
          title="Refresh Feed"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <>
          <LoadingSkeleton />
          <LoadingSkeleton />
        </>
      ) : items.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            No posts found in your feed yet.
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Follow creators or post your own photos/videos!
          </p>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <PostCard key={`${item.contentType}-${item.contentId}`} item={item} />
          ))}

          {page < totalPages && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={handleLoadMore}
                disabled={refreshing}
                style={{
                  backgroundColor: 'var(--accent-muted)',
                  border: '1px solid var(--accent-muted-border)',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  borderRadius: '20px',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {refreshing ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
