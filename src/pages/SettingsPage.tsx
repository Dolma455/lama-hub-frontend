import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { userService } from '../services/apiServices';
import { Settings, User, LogOut, CheckCircle, Palette, Check, Camera, Trash2, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore, PALETTES } from '../store/useThemeStore';
import { UserAvatar } from '../components/UserAvatar';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isViewingPhoto, setIsViewingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { paletteId, setPalette } = useThemeStore();

  useEffect(() => {
    let isMounted = true;
    const fetchCurrentProfile = async () => {
      try {
        if (user?.role === 'Creator') {
          const profile = await userService.getCreatorProfile();
          if (isMounted) {
            setBio(profile.bio || '');
            setAvatarUrl(profile.profileImageUrl || null);
            if (profile.profileImageUrl !== user?.profileImageUrl) {
              useAuthStore.getState().updateUser({ profileImageUrl: profile.profileImageUrl || null });
            }
          }
        } else {
          const profile = await userService.getConsumerProfile();
          if (isMounted) {
            setBio(profile.bio || '');
            setAvatarUrl(profile.profileImageUrl || null);
            if (profile.profileImageUrl !== user?.profileImageUrl) {
              useAuthStore.getState().updateUser({ profileImageUrl: profile.profileImageUrl || null });
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile settings:', err);
      }
    };

    fetchCurrentProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.userId, user?.role]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);
    try {
      const res = await userService.uploadAvatar(file);
      setAvatarUrl(res.avatarUrl);
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setUploadingAvatar(true);
    try {
      await userService.deleteAvatar();
      setAvatarUrl(null);
    } catch (err) {
      console.error('Failed to delete profile picture:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile({ displayName, bio });
      updateUser({ displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'none' as const,
  };

  return (
    <div>
      {/* Photo Viewer Modal */}
      {isViewingPhoto && avatarUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setIsViewingPhoto(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsViewingPhoto(false)}
              style={{
                position: 'absolute',
                top: '-44px',
                right: '0',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
              }}
              title="Close"
            >
              <X size={28} />
            </button>
            <img
              src={avatarUrl}
              alt={user?.displayName || 'Profile'}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '16px',
                objectFit: 'contain',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Settings size={22} color="var(--accent)" />
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Account Settings
        </h2>
      </div>

      {/* Profile Section */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: '1rem',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
          }}
        >
          <User size={18} color="var(--accent)" /> Profile Settings
        </h3>

        {/* Profile Picture Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div
            onClick={() => {
              if (avatarUrl) setIsViewingPhoto(true);
            }}
            style={{ cursor: avatarUrl ? 'pointer' : 'default' }}
            title={avatarUrl ? 'Click to view photo' : ''}
          >
            <UserAvatar src={avatarUrl} name={user?.displayName || 'User'} size={68} />
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Edit / Upload Icon Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              title={avatarUrl ? 'Edit / Replace photo' : 'Upload photo'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
              }}
            >
              {uploadingAvatar ? <Loader2 size={16} className="spin" /> : <Camera size={16} color="var(--accent)" />}
            </button>

            {/* Delete Icon Button */}
            {avatarUrl && (
              <button
                type="button"
                onClick={handleAvatarDelete}
                disabled={uploadingAvatar}
                title="Delete profile photo"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Bio
            </label>
            <textarea
              rows={3}
              placeholder="Tell others about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={inputStyle}
            />
          </div>

          {saved && (
            <p
              style={{
                color: 'var(--success)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
              }}
            >
              <CheckCircle size={16} /> Changes saved successfully!
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: 'var(--text-on-accent)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              fontFamily: 'inherit',
              transition: 'opacity 0.2s ease',
            }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Appearance Section */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: '1rem',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
          }}
        >
          <Palette size={18} color="var(--accent)" /> Appearance
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {PALETTES.map((palette) => {
            const isActive = paletteId === palette.id;
            return (
              <button
                key={palette.id}
                onClick={() => setPalette(palette.id)}
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

      {/* Sign Out Section */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '24px',
        }}
      >
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '1rem',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
          }}
        >
          <LogOut size={18} /> Account Session
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Log out of your current session on this device.
        </p>

        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
