import React, { useState } from 'react';
import { X, Check, Moon, Sun } from 'lucide-react';
import { useThemeStore, PALETTES } from '../store/useThemeStore';

interface ThemePickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({ isOpen, onClose }) => {
  const { paletteId, setPalette } = useThemeStore();
  const [filter, setFilter] = useState<'all' | 'dark' | 'light'>('all');

  if (!isOpen) return null;

  const filteredPalettes = PALETTES.filter((p) => {
    if (filter === 'dark') return p.isDark;
    if (filter === 'light') return !p.isDark;
    return true;
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 900,
          backgroundColor: 'transparent',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: '62px',
          right: '12px',
          width: '320px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '18px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          zIndex: 901,
          overflow: 'hidden',
          animation: 'slideDown 0.18s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 18px 12px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Appearance Settings
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Select your favorite theme
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Filter Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '8px 14px 0',
            gap: '6px',
          }}
        >
          <button
            onClick={() => setFilter('all')}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '8px',
              border: filter === 'all' ? '1px solid var(--accent)' : '1px solid transparent',
              backgroundColor: filter === 'all' ? 'var(--accent-muted)' : 'transparent',
              color: filter === 'all' ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All ({PALETTES.length})
          </button>
          <button
            onClick={() => setFilter('dark')}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '8px',
              border: filter === 'dark' ? '1px solid var(--accent)' : '1px solid transparent',
              backgroundColor: filter === 'dark' ? 'var(--accent-muted)' : 'transparent',
              color: filter === 'dark' ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Moon size={12} /> Dark
          </button>
          <button
            onClick={() => setFilter('light')}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '8px',
              border: filter === 'light' ? '1px solid var(--accent)' : '1px solid transparent',
              backgroundColor: filter === 'light' ? 'var(--accent-muted)' : 'transparent',
              color: filter === 'light' ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Sun size={12} /> Light
          </button>
        </div>

        {/* Palette Grid */}
        <div
          style={{
            padding: '14px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            maxHeight: '440px',
            overflowY: 'auto',
          }}
        >
          {filteredPalettes.map((palette) => {
            const isActive = paletteId === palette.id;
            return (
              <button
                key={palette.id}
                onClick={() => {
                  setPalette(palette.id);
                }}
                style={{
                  background: 'none',
                  border: isActive
                    ? '2px solid var(--accent)'
                    : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                  transition: 'border-color 0.15s ease, transform 0.1s ease',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {/* 4-color swatch grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '3px',
                    borderRadius: '7px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                    height: '44px',
                  }}
                >
                  {palette.swatches.map((color, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: color,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  ))}
                </div>

                {/* Name + active check */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {palette.name}
                  </span>
                  {isActive && (
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={10} color="white" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
