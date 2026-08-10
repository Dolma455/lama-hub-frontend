import { apiClient } from './apiClient';
import type {
  AuthResponseDto,
  ConsumerProfileDto,
  CreatorProfileDto,
  PublicCreatorProfileDto,
  FeedItemDto,
  PhotoDetailDto,
  PhotoListItemDto,
  VideoDetailDto,
  VideoListItemDto,
  CommentDto,
  TagDto,
  CreatorRecommendationDto,
  NotificationDto,
  SavedContentDto,
  PagedResult,
  UserDto,
  SharedPostDto,
  RatingSummaryDto,
} from '../types/api';
import { useAuthStore } from '../store/useAuthStore';

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponseDto> => {
    const res = await apiClient.post<{ token: string }>('/api/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    const token = res.data.token;
    localStorage.setItem('token', token);

    const meRes = await apiClient.get<UserDto>('/api/auth/me');
    let profileImageUrl = (meRes.data as any).profileImageUrl || (meRes.data as any).ProfileImageUrl || null;
    if (!profileImageUrl) {
      try {
        if (meRes.data.role === 'Creator') {
          const p = await userService.getCreatorProfile();
          profileImageUrl = p.profileImageUrl || null;
        } else {
          const p = await userService.getConsumerProfile();
          profileImageUrl = p.profileImageUrl || null;
        }
      } catch {
        // ignore fallback failure
      }
    }

    return {
      token,
      userId: meRes.data.userId,
      displayName: meRes.data.displayName,
      email: meRes.data.email,
      role: meRes.data.role,
      profileImageUrl,
      expiresAtUtc: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  },
  register: async (userData: { name: string; email: string; password: string; role: string }): Promise<AuthResponseDto> => {
    const res = await apiClient.post<{ token: string }>('/api/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
    });
    const token = res.data.token;
    localStorage.setItem('token', token);

    const meRes = await apiClient.get<UserDto>('/api/auth/me');
    let profileImageUrl = (meRes.data as any).profileImageUrl || (meRes.data as any).ProfileImageUrl || null;
    if (!profileImageUrl) {
      try {
        if (meRes.data.role === 'Creator') {
          const p = await userService.getCreatorProfile();
          profileImageUrl = p.profileImageUrl || null;
        } else {
          const p = await userService.getConsumerProfile();
          profileImageUrl = p.profileImageUrl || null;
        }
      } catch {
        // ignore fallback failure
      }
    }

    return {
      token,
      userId: meRes.data.userId,
      displayName: meRes.data.displayName,
      email: meRes.data.email,
      role: meRes.data.role,
      profileImageUrl,
      expiresAtUtc: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
  },
  getMe: async (): Promise<UserDto> => {
    const res = await apiClient.get<UserDto>('/api/auth/me');
    let profileImageUrl = (res.data as any).profileImageUrl || (res.data as any).ProfileImageUrl || null;
    if (!profileImageUrl) {
      try {
        if (res.data.role === 'Creator') {
          const p = await userService.getCreatorProfile();
          profileImageUrl = p.profileImageUrl || null;
        } else {
          const p = await userService.getConsumerProfile();
          profileImageUrl = p.profileImageUrl || null;
        }
      } catch {
        // ignore fallback failure
      }
    }

    return {
      ...res.data,
      profileImageUrl,
    };
  },
};

export const userService = {
  getConsumerProfile: async (): Promise<ConsumerProfileDto> => {
    const res = await apiClient.get<ConsumerProfileDto>('/api/users/profile/consumer');
    return res.data;
  },
  getCreatorProfile: async (): Promise<CreatorProfileDto> => {
    const res = await apiClient.get<CreatorProfileDto>('/api/users/profile/creator');
    return res.data;
  },
  getPublicCreatorProfile: async (creatorId: string): Promise<PublicCreatorProfileDto> => {
    const res = await apiClient.get<PublicCreatorProfileDto>(`/api/users/profile/creator/${creatorId}`);
    return res.data;
  },
  updateProfile: async (data: { displayName?: string; bio?: string }) => {
    const res = await apiClient.put('/api/users/profile', data);
    return res.data;
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ avatarUrl: string }>('/api/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    useAuthStore.getState().updateUser({ profileImageUrl: res.data.avatarUrl });
    return res.data;
  },
  deleteAvatar: async () => {
    const res = await apiClient.delete<{ message: string }>('/api/users/profile/avatar');
    useAuthStore.getState().updateUser({ profileImageUrl: null });
    return res.data;
  },
  follow: async (userId: string) => {
    const res = await apiClient.post(`/api/users/${userId}/follow`);
    return res.data;
  },
  unfollow: async (userId: string) => {
    const res = await apiClient.post(`/api/users/${userId}/unfollow`);
    return res.data;
  },
  getFollowStatus: async (userId: string): Promise<{ isFollowing: boolean; isFollowedBy: boolean }> => {
    const res = await apiClient.get<{ isFollowing: boolean; isFollowedBy: boolean }>(`/api/users/${userId}/follow-status`);
    return res.data;
  },
  getFollowers: async (userId: string, page = 1, pageSize = 10): Promise<PagedResult<UserDto>> => {
    const res = await apiClient.get<PagedResult<UserDto>>(`/api/users/${userId}/followers?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
  getFollowing: async (userId: string, page = 1, pageSize = 10): Promise<PagedResult<UserDto>> => {
    const res = await apiClient.get<PagedResult<UserDto>>(`/api/users/${userId}/following?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
};

export const photoService = {
  getById: async (photoId: string): Promise<PhotoDetailDto> => {
    const res = await apiClient.get<PhotoDetailDto>(`/api/photos/${photoId}`);
    return res.data;
  },
  getMine: async (): Promise<PhotoListItemDto[]> => {
    const res = await apiClient.get<PhotoListItemDto[]>('/api/photos/mine');
    return res.data;
  },
  getByUser: async (userId: string): Promise<PhotoListItemDto[]> => {
    const res = await apiClient.get<PhotoListItemDto[]>(`/api/photos/user/${userId}`);
    return res.data;
  },
  create: async (data: { title: string; caption?: string; location?: string; peoplePresent?: string[] }): Promise<PhotoDetailDto> => {
    const res = await apiClient.post<PhotoDetailDto>('/api/photos', data);
    return res.data;
  },
  uploadImage: async (photoId: string, file: File): Promise<PhotoDetailDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<PhotoDetailDto>(`/api/photos/${photoId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (photoId: string, data: { title: string; caption?: string; location?: string; peoplePresent?: string[] }): Promise<PhotoDetailDto> => {
    const res = await apiClient.put<PhotoDetailDto>(`/api/photos/${photoId}`, data);
    return res.data;
  },
  delete: async (photoId: string): Promise<void> => {
    await apiClient.delete(`/api/photos/${photoId}`);
  },
  getTags: async (photoId: string): Promise<TagDto[]> => {
    const res = await apiClient.get<TagDto[]>(`/api/photos/${photoId}/tags`);
    return res.data;
  },
};

export const videoService = {
  getById: async (videoId: string): Promise<VideoDetailDto> => {
    const res = await apiClient.get<VideoDetailDto>(`/api/videos/${videoId}`);
    return res.data;
  },
  getMine: async (): Promise<VideoListItemDto[]> => {
    const res = await apiClient.get<VideoListItemDto[]>('/api/videos/mine');
    return res.data;
  },
  getByUser: async (userId: string): Promise<VideoListItemDto[]> => {
    const res = await apiClient.get<VideoListItemDto[]>(`/api/videos/user/${userId}`);
    return res.data;
  },
  create: async (data: { title: string; caption?: string }): Promise<VideoDetailDto> => {
    const res = await apiClient.post<VideoDetailDto>('/api/videos', data);
    return res.data;
  },
  uploadVideo: async (videoId: string, file: File): Promise<VideoDetailDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<VideoDetailDto>(`/api/videos/${videoId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (videoId: string, data: { title: string; caption?: string }): Promise<VideoDetailDto> => {
    const res = await apiClient.put<VideoDetailDto>(`/api/videos/${videoId}`, data);
    return res.data;
  },
  delete: async (videoId: string): Promise<void> => {
    await apiClient.delete(`/api/videos/${videoId}`);
  },
};

export const commentService = {
  getPhotoComments: async (photoId: string, page = 1, pageSize = 10): Promise<PagedResult<CommentDto>> => {
    const res = await apiClient.get<PagedResult<CommentDto>>(`/api/photos/${photoId}/comments?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
  addPhotoComment: async (photoId: string, commentText: string): Promise<CommentDto> => {
    const res = await apiClient.post<CommentDto>(`/api/photos/${photoId}/comments`, { commentText });
    return res.data;
  },
  getVideoComments: async (videoId: string, page = 1, pageSize = 10): Promise<PagedResult<CommentDto>> => {
    const res = await apiClient.get<PagedResult<CommentDto>>(`/api/videos/${videoId}/comments?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
  addVideoComment: async (videoId: string, commentText: string): Promise<CommentDto> => {
    const res = await apiClient.post<CommentDto>(`/api/videos/${videoId}/comments`, { commentText });
    return res.data;
  },
  updateComment: async (commentId: string, commentText: string): Promise<CommentDto> => {
    const res = await apiClient.put<CommentDto>(`/api/comments/${commentId}`, { commentText });
    return res.data;
  },
  deleteComment: async (commentId: string) => {
    const res = await apiClient.delete(`/api/comments/${commentId}`);
    return res.data;
  },
};

export const likeService = {
  likePhoto: async (photoId: string): Promise<{ count: number }> => {
    const res = await apiClient.post<{ count: number }>(`/api/photos/${photoId}/like`);
    return res.data;
  },
  unlikePhoto: async (photoId: string): Promise<{ count: number }> => {
    const res = await apiClient.delete<{ count: number }>(`/api/photos/${photoId}/like`);
    return res.data;
  },
  likeVideo: async (videoId: string): Promise<{ count: number }> => {
    const res = await apiClient.post<{ count: number }>(`/api/videos/${videoId}/like`);
    return res.data;
  },
  unlikeVideo: async (videoId: string): Promise<{ count: number }> => {
    const res = await apiClient.delete<{ count: number }>(`/api/videos/${videoId}/like`);
    return res.data;
  },
};

export const feedService = {
  getFeed: async (page = 1, pageSize = 10): Promise<PagedResult<FeedItemDto>> => {
    const res = await apiClient.get<PagedResult<FeedItemDto>>(`/api/feed?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
  getFollowingFeed: async (page = 1, pageSize = 10): Promise<PagedResult<FeedItemDto>> => {
    const res = await apiClient.get<PagedResult<FeedItemDto>>(`/api/feed/following?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
};

export const searchService = {
  searchUsers: async (query: string, page = 1, pageSize = 10): Promise<PagedResult<UserDto>> => {
    const res = await apiClient.get<PagedResult<UserDto>>(`/api/search/users?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
  searchCreators: async (query: string, page = 1, pageSize = 10): Promise<PagedResult<UserDto>> => {
    const res = await apiClient.get<PagedResult<UserDto>>(`/api/search/creators?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
  searchConsumers: async (query: string, page = 1, pageSize = 10): Promise<PagedResult<UserDto>> => {
    const res = await apiClient.get<PagedResult<UserDto>>(`/api/search/consumers?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
  searchPhotos: async (query: string, tag?: string, page = 1, pageSize = 10): Promise<PagedResult<PhotoListItemDto>> => {
    const tagQuery = tag ? `&tag=${encodeURIComponent(tag)}` : '';
    const res = await apiClient.get<PagedResult<PhotoListItemDto>>(`/api/search/photos?query=${encodeURIComponent(query)}${tagQuery}&page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
  searchVideos: async (query: string, page = 1, pageSize = 10): Promise<PagedResult<VideoListItemDto>> => {
    const res = await apiClient.get<PagedResult<VideoListItemDto>>(`/api/search/videos?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
};

export const notificationService = {
  getNotifications: async (page = 1, pageSize = 10): Promise<PagedResult<NotificationDto>> => {
    const res = await apiClient.get<PagedResult<NotificationDto>>(`/api/notifications?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
  markAsRead: async (notificationId: string) => {
    const res = await apiClient.put(`/api/notifications/${notificationId}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await apiClient.put('/api/notifications/read-all');
    return res.data;
  },
};

export const savedService = {
  savePhoto: async (photoId: string) => {
    const res = await apiClient.post(`/api/saved/photos/${photoId}`);
    return res.data;
  },
  unsavePhoto: async (photoId: string) => {
    const res = await apiClient.delete(`/api/saved/photos/${photoId}`);
    return res.data;
  },
  saveVideo: async (videoId: string) => {
    const res = await apiClient.post(`/api/saved/videos/${videoId}`);
    return res.data;
  },
  unsaveVideo: async (videoId: string) => {
    const res = await apiClient.delete(`/api/saved/videos/${videoId}`);
    return res.data;
  },
  getSavedContent: async (page = 1, pageSize = 10): Promise<PagedResult<SavedContentDto>> => {
    const res = await apiClient.get<PagedResult<SavedContentDto>>(`/api/saved?page=${page}&pageSize=${pageSize}`);
    return res.data;
  },
};

export const recommendationService = {
  getCreatorRecommendations: async (): Promise<CreatorRecommendationDto[]> => {
    const res = await apiClient.get<CreatorRecommendationDto[]>('/api/recommendations/creators');
    return res.data;
  },
};

export const sharedPostService = {
  sharePhoto: async (photoId: string, caption?: string): Promise<SharedPostDto> => {
    const res = await apiClient.post<SharedPostDto>(`/api/photos/${photoId}/share`, {
      caption: caption || null,
    });
    return res.data;
  },
  shareVideo: async (videoId: string, caption?: string): Promise<SharedPostDto> => {
    const res = await apiClient.post<SharedPostDto>(`/api/videos/${videoId}/share`, {
      caption: caption || null,
    });
    return res.data;
  },
  getMySharedPosts: async (): Promise<SharedPostDto[]> => {
    const res = await apiClient.get<SharedPostDto[]>('/api/photos/shared/mine');
    return res.data;
  },
  getUserSharedPosts: async (userId: string): Promise<SharedPostDto[]> => {
    const res = await apiClient.get<SharedPostDto[]>(`/api/photos/shared/user/${userId}`);
    return res.data;
  },
  getSharedPostsFeed: async (): Promise<SharedPostDto[]> => {
    const res = await apiClient.get<SharedPostDto[]>('/api/photos/shared/feed');
    return res.data;
  },
};

export const ratingService = {
  getPhotoRating: async (photoId: string): Promise<RatingSummaryDto> => {
    const res = await apiClient.get<RatingSummaryDto>(`/api/photos/${photoId}/rating`);
    return res.data;
  },
  ratePhoto: async (photoId: string, score: number): Promise<RatingSummaryDto> => {
    const res = await apiClient.post<RatingSummaryDto>(`/api/photos/${photoId}/rating`, { score });
    return res.data;
  },
  getVideoRating: async (videoId: string): Promise<RatingSummaryDto> => {
    const res = await apiClient.get<RatingSummaryDto>(`/api/videos/${videoId}/rating`);
    return res.data;
  },
  rateVideo: async (videoId: string, score: number): Promise<RatingSummaryDto> => {
    const res = await apiClient.post<RatingSummaryDto>(`/api/videos/${videoId}/rating`, { score });
    return res.data;
  },
};
