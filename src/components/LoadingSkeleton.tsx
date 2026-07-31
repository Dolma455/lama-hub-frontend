import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        marginBottom: '24px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          className="skeleton-pulse"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-hover)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            className="skeleton-pulse"
            style={{
              width: '120px',
              height: '14px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-hover)',
            }}
          />
          <div
            className="skeleton-pulse"
            style={{
              width: '80px',
              height: '10px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-input)',
            }}
          />
        </div>
      </div>
      <div
        className="skeleton-pulse"
        style={{
          width: '100%',
          height: '240px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-hover)',
        }}
      />
    </div>
  );
};
