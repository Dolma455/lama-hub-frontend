import React, { useEffect, useState, useMemo } from 'react';
import type { FeedItemDto, UserDto } from '../types/api';
import { feedService, searchService } from '../services/apiServices';
import { PostCard } from '../components/PostCard';
import { UserAvatar } from '../components/UserAvatar';
import { FollowButton } from '../components/FollowButton';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Search, X, RefreshCw, Compass, Users } from 'lucide-react';
import { useProfileNavigation } from '../hooks/useProfileNavigation';

export const HomePage: React.FC = () => {
  const navigateToProfile = useProfileNavigation();
  const [items, setItems] = useState<FeedItemDto[]>([]);
  const [matchingUsers, setMatchingUsers] = useState<UserDto[]>([]);
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = async (pageNum = 1, tab = activeTab) => {
    if (pageNum === 1) setLoading(true);
    else setRefreshing(true);

    try {
      const res =
        tab === 'following'
          ? await feedService.getFollowingFeed(pageNum, 10)
          : await feedService.getFeed(pageNum, 10);

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
    setPage(1);
    fetchFeed(1, activeTab);
  }, [activeTab]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q) {
      searchService
        .searchUsers(q, 1, 10)
        .then((res) => setMatchingUsers(res.items))
        .catch(() => setMatchingUsers([]));
    } else {
      setMatchingUsers([]);
    }
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage, activeTab);
    }
  };

  // Filter items in real-time based on searchQuery
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(q);
      const captionMatch = item.caption?.toLowerCase().includes(q);
      const creatorMatch = item.creatorDisplayName?.toLowerCase().includes(q);
      const locationMatch = item.location?.toLowerCase().includes(q);
      return titleMatch || captionMatch || creatorMatch || locationMatch;
    });
  }, [items, searchQuery]);

  return (
    <div>
      {/* Prominent Search Bar Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '16px',
              color: 'var(--accent)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search posts, creators, captions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '24px',
              padding: '12px 44px 12px 48px',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontWeight: 500,
              outline: 'none',
              fontFamily: 'inherit',
              boxShadow: 'var(--shadow-card)',
              transition: 'all 0.2s ease',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              title="Clear search"
              style={{
                position: 'absolute',
                right: '14px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setPage(1);
            fetchFeed(1, activeTab);
          }}
          title="Refresh Feed"
          style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '50%',
            width: '46px',
            height: '46px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-card)',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* For You vs Following Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
          backgroundColor: 'var(--bg-card)',
          padding: '6px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
        }}
      >
        <button
          onClick={() => setActiveTab('forYou')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeTab === 'forYou' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'forYou' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
        >
          <Compass size={18} />
          For You
        </button>

        <button
          onClick={() => setActiveTab('following')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeTab === 'following' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'following' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
        >
          <Users size={18} />
          Following
        </button>
      </div>

      {loading ? (
        <>
          <LoadingSkeleton />
          <LoadingSkeleton />
        </>
      ) : filteredItems.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {searchQuery
              ? `No posts matching "${searchQuery}"`
              : activeTab === 'following'
              ? 'No posts from creators you follow yet.'
              : 'No posts found in your feed yet.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                marginTop: '12px',
                backgroundColor: 'var(--accent-muted)',
                color: 'var(--accent)',
                border: '1px solid var(--accent-muted-border)',
                borderRadius: '16px',
                padding: '8px 18px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Clear Search Query
            </button>
          ) : (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {activeTab === 'following'
                ? 'Follow more creators to see their latest posts here!'
                : 'Follow creators or post your own photos/videos!'}
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Matching Users & Creators Section */}
          {searchQuery && matchingUsers.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Users & Creators ({matchingUsers.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {matchingUsers.map((u) => (
                  <div
                    key={u.userId}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <div
                      onClick={() => navigateToProfile(u.userId)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    >
                      <UserAvatar src={u.profileImageUrl} name={u.displayName} size={42} />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {u.displayName}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                          {u.role}
                        </span>
                      </div>
                    </div>

                    <FollowButton userId={u.userId} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery && (
            <div style={{ marginBottom: '14px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {filteredItems.length === 0 && matchingUsers.length > 0
                ? 'No post results for this query'
                : `Showing ${filteredItems.length} post ${filteredItems.length === 1 ? 'result' : 'results'} for "${searchQuery}"`}
            </div>
          )}

          {filteredItems.map((item) => (
            <PostCard key={`${item.contentType}-${item.contentId}`} item={item} />
          ))}

          {!searchQuery && page < totalPages && (
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
