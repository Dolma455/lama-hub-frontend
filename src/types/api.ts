export type UserRole = 'Consumer' | 'Creator' | 'Admin';

export interface UserDto {
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
  profileImageUrl?: string | null;
}

export interface AuthResponseDto {
  token: string;
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
  expiresAtUtc: string;
  profileImageUrl?: string | null;
}

export interface ConsumerProfileDto {
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
  bio?: string;
  profileImageUrl?: string | null;
  followingCount: number;
  savedItemsCount: number;
  createdAtUtc: string;
}

export interface CreatorProfileDto {
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
  bio?: string;
  profileImageUrl?: string | null;
  followersCount: number;
  photoCount: number;
  videoCount: number;
  totalLikesReceived: number;
  createdAtUtc: string;
}

export interface PublicCreatorProfileDto {
  creatorId: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
  followersCount: number;
  photoCount: number;
  videoCount: number;
  totalLikesReceived: number;
  isFollowed: boolean;
}

export interface FeedItemDto {
  contentId: string;
  contentType: 'Photo' | 'Video';
  title: string;
  caption?: string;
  mediaUrl: string;
  uploadDate: string;
  creatorId: string;
  creatorDisplayName: string;
  creatorProfileImageUrl?: string;
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
}

export interface PhotoDetailDto {
  photoId: string;
  userId: string;
  creatorName: string;
  title: string;
  caption?: string;
  location?: string;
  peoplePresent: string[];
  blobUrl: string;
  likeCount: number;
  commentCount: number;
  createdAtUtc: string;
}

export interface PhotoListItemDto {
  photoId: string;
  title: string;
  caption?: string;
  location?: string;
  blobUrl: string;
  likeCount: number;
  commentCount: number;
  createdAtUtc: string;
}

export interface VideoDetailDto {
  videoId: string;
  userId: string;
  creatorName: string;
  title: string;
  caption?: string;
  blobUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAtUtc: string;
}

export interface VideoListItemDto {
  videoId: string;
  userId: string;
  creatorName: string;
  title: string;
  caption?: string;
  blobUrl: string;
  createdAtUtc: string;
}

export interface CommentDto {
  commentId: string;
  photoId?: string;
  videoId?: string;
  userId: string;
  userDisplayName: string;
  commentText: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative' | 'Mixed' | null;
  positiveScore?: number | null;
  neutralScore?: number | null;
  negativeScore?: number | null;
  sentimentAnalyzedAtUtc?: string | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface TagDto {
  tagId: string;
  name: string;
  confidence: number;
}

export interface CreatorRecommendationDto {
  creatorId: string;
  username: string;
  profileImage?: string;
  followerCount: number;
  reasonForRecommendation: string;
}

export interface NotificationDto {
  notificationId: string;
  userId: string;
  actorId: string;
  actorDisplayName: string;
  type: string;
  targetId?: string;
  message: string;
  isRead: boolean;
  createdAtUtc: string;
}

export interface SavedContentDto {
  savedContentId: string;
  contentType: 'Photo' | 'Video';
  contentId: string;
  title: string;
  caption?: string;
  mediaUrl: string;
  savedAtUtc: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SharedPostDto {
  sharedPostId: string;
  contentType: 'Photo' | 'Video';
  contentId: string;
  title: string;
  mediaUrl: string;
  sharedByUserId: string;
  sharedByUserDisplayName: string;
  caption?: string | null;
  sharedAtUtc: string;
}
