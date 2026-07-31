import React, { useEffect, useState } from 'react';
import { savedService } from '../services/apiServices';
import type { SavedContentDto } from '../types/api';
import { Bookmark, Image, Video } from 'lucide-react';

export const SavedPage: React.FC = () => {
  const [items, setItems] = useState<SavedContentDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    savedService
      .getSavedContent()
      .then((res) => setItems(res.items))
      .catch((err) => console.error('Failed to load saved items:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Bookmark size={22} color="var(--accent)" />
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Saved Content
        </h2>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading saved items...</p>
      ) : items.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>No saved photos or videos yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
          {items.map((item) => (
            <div
              key={item.savedContentId}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ height: '160px', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
                {item.contentType === 'Photo' ? (
                  <img src={item.mediaUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <video src={item.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'var(--accent)',
                    color: 'var(--text-on-accent)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600,
                  }}
                >
                  {item.contentType === 'Photo' ? <Image size={11} /> : <Video size={11} />}
                  {item.contentType}
                </span>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <h4 style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
