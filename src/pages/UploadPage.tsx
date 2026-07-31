import React, { useState } from 'react';
import { photoService, videoService } from '../services/apiServices';
import { UploadCloud, Image, Video, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState<'Photo' | 'Video'>('Photo');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file || uploading) return;

    setUploading(true);
    setProgressStatus('Creating post entry...');

    try {
      if (contentType === 'Photo') {
        const peopleList = people
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean);

        const photo = await photoService.create({
          title: title.trim(),
          caption: caption.trim() || undefined,
          location: location.trim() || undefined,
          peoplePresent: peopleList,
        });

        setProgressStatus('Uploading image...');
        await photoService.uploadImage(photo.photoId, file);
        setProgressStatus('Detecting image tags...');
      } else {
        const video = await videoService.create({
          title: title.trim(),
          caption: caption.trim() || undefined,
        });

        setProgressStatus('Uploading video...');
        await videoService.uploadVideo(video.videoId, file);
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Failed to upload media:', err);
      setProgressStatus('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
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
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  };

  const typeButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px',
    borderRadius: '12px',
    border: active ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
    backgroundColor: active ? 'var(--accent-muted)' : 'var(--bg-input)',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  });

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        padding: '28px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <UploadCloud size={24} color="var(--accent)" />
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Upload New Media
        </h2>
      </div>

      {/* Content Type Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => { setContentType('Photo'); setFile(null); setPreviewUrl(null); }}
          style={typeButtonStyle(contentType === 'Photo')}
        >
          <Image size={18} /> Photo Post
        </button>
        <button
          type="button"
          onClick={() => { setContentType('Video'); setFile(null); setPreviewUrl(null); }}
          style={typeButtonStyle(contentType === 'Video')}
        >
          <Video size={18} /> Video Post
        </button>
      </div>

      {success ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Upload Successful!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Redirecting to feed...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* File Upload Box */}
          <div>
            <label style={{ ...labelStyle, marginBottom: '8px' }}>
              Media File ({contentType === 'Photo' ? 'JPG, PNG, WebP' : 'MP4, WebM'})
            </label>
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-input)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
            >
              <input
                type="file"
                accept={contentType === 'Photo' ? 'image/*' : 'video/*'}
                required
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                }}
              />
              {previewUrl ? (
                contentType === 'Photo' ? (
                  <img src={previewUrl} alt="Preview" style={{ maxHeight: '240px', borderRadius: '12px', objectFit: 'cover' }} />
                ) : (
                  <video src={previewUrl} controls style={{ maxHeight: '240px', borderRadius: '12px', width: '100%' }} />
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <UploadCloud size={32} color="var(--accent)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Click or drag & drop to select file
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              required
              placeholder="Sunset at Malibu Beach"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Caption</label>
            <textarea
              rows={3}
              placeholder="Write a description for your post..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {contentType === 'Photo' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Location (Optional)</label>
                <input
                  type="text"
                  placeholder="California, USA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>People Present (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Sarah, John"
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {progressStatus && (
            <p
              style={{
                color: 'var(--accent)',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
              }}
            >
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {progressStatus}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading || !file || !title.trim()}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: 'var(--text-on-accent)',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: uploading || !file || !title.trim() ? 'not-allowed' : 'pointer',
              opacity: uploading || !file || !title.trim() ? 0.6 : 1,
              fontFamily: 'inherit',
              transition: 'opacity 0.2s ease',
            }}
          >
            {uploading ? 'Processing & Uploading...' : `Publish ${contentType}`}
          </button>
        </form>
      )}
    </div>
  );
};
