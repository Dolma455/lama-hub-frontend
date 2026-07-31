import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { CreatorProfilePage } from '../pages/CreatorProfilePage';
import { UploadPage } from '../pages/UploadPage';
import { SearchPage } from '../pages/SearchPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SavedPage } from '../pages/SavedPage';
import { FollowListPage } from '../pages/FollowListPage';
import { RecommendationsPage } from '../pages/RecommendationsPage';
import { SettingsPage } from '../pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const CreatorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'Creator' ? <>{children}</> : <Navigate to="/" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="creator/:creatorId" element={<CreatorProfilePage />} />
        <Route
          path="upload"
          element={
            <CreatorRoute>
              <UploadPage />
            </CreatorRoute>
          }
        />
        <Route path="search" element={<SearchPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="following" element={<FollowListPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
