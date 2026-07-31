import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { RightSidebar } from '../components/RightSidebar';
import { authService } from '../services/apiServices';
import { useAuthStore } from '../store/useAuthStore';

export const MainLayout: React.FC = () => {
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    const syncUser = async () => {
      try {
        const me = await authService.getMe();
        if (me) {
          updateUser({
            displayName: me.displayName,
            profileImageUrl: me.profileImageUrl || null,
          });
        }
      } catch (err) {
        console.error('Failed to sync current user:', err);
      }
    };
    syncUser();
  }, [updateUser]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        position: 'relative',
      }}
    >
      {/* Decorative Low-Opacity Vertical Cursive Branding in Far-Left Space (Vertically Centered) */}
      <div
        className="brand-cursive left-watermark"
        style={{
          position: 'fixed',
          left: '18px',
          top: '50%',
          transform: 'translateY(-50%) rotate(180deg)',
          fontSize: '2.6rem',
          color: 'var(--watermark-color)',
          opacity: 'var(--watermark-opacity)' as any,
          writingMode: 'vertical-rl',
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 1,
          letterSpacing: '2px',
          transition: 'color 0.2s ease, opacity 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        LamaHub Doluma..
      </div>

      <Navbar />

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            maxWidth: '640px',
            minHeight: 'calc(100vh - 61px)',
            padding: '24px 16px 40px 16px',
            width: '100%',
          }}
        >
          <Outlet />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};
