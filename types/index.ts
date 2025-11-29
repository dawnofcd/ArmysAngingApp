/**
 * TypeScript types cho ứng dụng học tập âm nhạc quân đội
 */

// User roles
export type UserRole = 'user' | 'editor' | 'admin';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  completedSongs: string[]; // Array of song IDs
  playlist: PlaylistItem[];
  score?: number; // Điểm số cho leaderboard
  lastActive?: number; // Timestamp lần hoạt động cuối
  avatarUrl?: string; // URL của avatar
  createdAt?: number;
}

// Playlist item
export interface PlaylistItem {
  songId: string;
  createdAt: number;
}

// Category interface
export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

// Song interface
export interface Song {
  id: string;
  title: string;
  author: string;
  lyrics: string;
  videoLinkKaraoke: string; // YouTube embed link
  videoLinkPerformance: string; // YouTube embed link
  categoryId: string;
  year: number;
  meaning: string;
  createdAt: number;
}

// Analytics interface
export interface Analytics {
  views: number;
  completions: number;
  likes: number;
}

// Song with analytics (for display)
export interface SongWithAnalytics extends Song {
  analytics?: Analytics;
}

// Form data types
export interface CategoryFormData {
  name: string;
  description: string;
}

export interface SongFormData {
  title: string;
  author: string;
  lyrics: string;
  videoLinkKaraoke: string;
  videoLinkPerformance: string;
  categoryId: string;
  year: number;
  meaning: string;
}

// Daily Analytics interface
export interface DailyAnalytics {
  date: string; // Format: yyyy-mm-dd
  views: number;
  timestamp: number;
}

// Stats interface
export interface StatsData {
  todayViews: number;
  totalViews: number;
  dailyData: DailyAnalytics[];
}

// Comment interface
export interface Comment {
  id: string;
  songId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
  parentId?: string; // ID của comment cha (nếu là reply)
  likes?: number; // Số lượt like
  likedBy?: string[]; // Array of user IDs who liked this comment
}
