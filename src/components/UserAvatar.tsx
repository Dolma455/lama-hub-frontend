import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, size = 40 }) => {
  const [imageError, setImageError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    setImageError(false);
  }, [src]);

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImageError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--border-color)',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: `${size * 0.42}px`,
        border: '2px solid var(--accent-muted-border)',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
};
