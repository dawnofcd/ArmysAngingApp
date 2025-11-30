/**
 * Firestore utility functions
 * Tối ưu cho Firebase Spark Plan: batch operations, pagination
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type {
  Song,
  Category,
  User,
  Analytics,
  DailyAnalytics,
  Comment,
  Notification,
} from '@/types';

// Batch size cho pagination (tối ưu quota)
const BATCH_SIZE = 20;

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const categoriesRef = collection(db, 'categories');
  const q = query(categoriesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
}

/**
 * Get category by ID
 */
export async function getCategoryById(
  categoryId: string,
): Promise<Category | null> {
  const categoryRef = doc(db, 'categories', categoryId);
  const snapshot = await getDoc(categoryRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Category;
}

/**
 * Create category
 */
export async function createCategory(
  data: Omit<Category, 'id' | 'createdAt'>,
): Promise<string> {
  const categoriesRef = collection(db, 'categories');
  const newCategory = {
    ...data,
    createdAt: Timestamp.now().toMillis(),
  };
  const docRef = await addDoc(categoriesRef, newCategory);
  return docRef.id;
}

/**
 * Update category
 */
export async function updateCategory(
  categoryId: string,
  data: Partial<Category>,
): Promise<void> {
  const categoryRef = doc(db, 'categories', categoryId);
  await updateDoc(categoryRef, data);
}

/**
 * Delete category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  const categoryRef = doc(db, 'categories', categoryId);
  await deleteDoc(categoryRef);
}

/**
 * Get songs with pagination
 */
export async function getSongs(
  categoryId?: string,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
  searchTerm?: string,
): Promise<{
  songs: Song[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> {
  const songsRef = collection(db, 'songs');
  let q;

  // Build query based on whether categoryId is provided
  if (categoryId) {
    // When filtering by category, we need to use where + orderBy
    // Note: This requires a composite index in Firestore
    q = query(
      songsRef,
      where('categoryId', '==', categoryId),
      orderBy('createdAt', 'desc'),
      limit(BATCH_SIZE),
    );
  } else {
    // When no category filter, just order by createdAt
    q = query(songsRef, orderBy('createdAt', 'desc'), limit(BATCH_SIZE));
  }

  // Add pagination if lastDoc is provided
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  try {
    const snapshot = await getDocs(q);
    let songs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Song[];

    // Client-side search để tiết kiệm quota
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      songs = songs.filter(
        (song) =>
          song.title.toLowerCase().includes(term) ||
          song.author.toLowerCase().includes(term),
      );
    }

    return {
      songs,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error: any) {
    // If there's an index error, try without orderBy for categoryId queries
    if (error?.code === 'failed-precondition' && categoryId) {
      console.warn('Composite index missing, trying query without orderBy...');
      let fallbackQ = query(
        songsRef,
        where('categoryId', '==', categoryId),
        limit(BATCH_SIZE),
      );
      if (lastDoc) {
        fallbackQ = query(fallbackQ, startAfter(lastDoc));
      }
      const snapshot = await getDocs(fallbackQ);
      let songs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Song[];

      // Sort client-side
      songs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      // Client-side search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        songs = songs.filter(
          (song) =>
            song.title.toLowerCase().includes(term) ||
            song.author.toLowerCase().includes(term),
        );
      }

      return {
        songs,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      };
    }
    throw error;
  }
}

/**
 * Get song by ID
 */
export async function getSongById(songId: string): Promise<Song | null> {
  const songRef = doc(db, 'songs', songId);
  const snapshot = await getDoc(songRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Song;
}

/**
 * Create song
 */
export async function createSong(
  data: Omit<Song, 'id' | 'createdAt'>,
): Promise<string> {
  const songsRef = collection(db, 'songs');
  const newSong = {
    ...data,
    createdAt: Timestamp.now().toMillis(),
  };
  const docRef = await addDoc(songsRef, newSong);

  // Tạo analytics entry mới
  const { setDoc } = await import('firebase/firestore');
  const analyticsRef = doc(db, 'analytics', docRef.id);
  await setDoc(analyticsRef, {
    views: 0,
    completions: 0,
    likes: 0,
  });

  return docRef.id;
}

/**
 * Update song
 */
export async function updateSong(
  songId: string,
  data: Partial<Song>,
): Promise<void> {
  const songRef = doc(db, 'songs', songId);
  await updateDoc(songRef, data);
}

/**
 * Delete song
 */
export async function deleteSong(songId: string): Promise<void> {
  const songRef = doc(db, 'songs', songId);
  const analyticsRef = doc(db, 'analytics', songId);

  // Batch delete để tối ưu
  const batch = writeBatch(db);
  batch.delete(songRef);
  batch.delete(analyticsRef);
  await batch.commit();
}

/**
 * Get analytics for song
 */
export async function getAnalytics(songId: string): Promise<Analytics | null> {
  const analyticsRef = doc(db, 'analytics', songId);
  const snapshot = await getDoc(analyticsRef);
  if (!snapshot.exists()) {
    // Tạo mới nếu chưa có
    const { setDoc } = await import('firebase/firestore');
    const defaultAnalytics = { views: 0, completions: 0, likes: 0 };
    await setDoc(analyticsRef, defaultAnalytics);
    return defaultAnalytics;
  }
  return snapshot.data() as Analytics;
}

/**
 * Update analytics (batch để tối ưu quota)
 * Note: For increment operations, use Firestore increment() function in production
 */
export async function updateAnalytics(
  songId: string,
  updates: Partial<Analytics>,
): Promise<void> {
  const analyticsRef = doc(db, 'analytics', songId);
  // Check if document exists
  const snapshot = await getDoc(analyticsRef);
  if (!snapshot.exists()) {
    // Create with default values
    const { setDoc } = await import('firebase/firestore');
    await setDoc(analyticsRef, {
      views: 0,
      completions: 0,
      likes: 0,
      ...updates,
    });
  } else {
    await updateDoc(analyticsRef, updates);
  }
}

/**
 * Batch update analytics (cho nhiều bài hát cùng lúc)
 */
export async function batchUpdateAnalytics(
  updates: { songId: string; data: Partial<Analytics> }[],
): Promise<void> {
  const batch = writeBatch(db);
  updates.forEach(({ songId, data }) => {
    const analyticsRef = doc(db, 'analytics', songId);
    batch.update(analyticsRef, data);
  });
  await batch.commit();
}

/**
 * Get user data
 */
export async function getUserData(userId: string): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as User;
}

/**
 * Update user data
 */
export async function updateUserData(
  userId: string,
  data: Partial<User>,
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
}

/**
 * Add completed song (sử dụng array để tối ưu)
 */
export async function addCompletedSong(
  userId: string,
  songId: string,
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userData = await getDoc(userRef);
  if (!userData.exists()) return;

  const currentCompleted = (userData.data().completedSongs || []) as string[];
  if (!currentCompleted.includes(songId)) {
    await updateDoc(userRef, {
      completedSongs: [...currentCompleted, songId],
    });
  }
}

/**
 * Add song to playlist
 */
export async function addToPlaylist(
  userId: string,
  songId: string,
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userData = await getDoc(userRef);
  if (!userData.exists()) return;

  const currentPlaylist = (userData.data().playlist || []) as Array<{
    songId: string;
    createdAt: number;
  }>;
  if (!currentPlaylist.some((item) => item.songId === songId)) {
    await updateDoc(userRef, {
      playlist: [...currentPlaylist, { songId, createdAt: Date.now() }],
    });
  }
}

/**
 * Remove song from playlist
 */
export async function removeFromPlaylist(
  userId: string,
  songId: string,
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userData = await getDoc(userRef);
  if (!userData.exists()) return;

  const currentPlaylist = (userData.data().playlist || []) as Array<{
    songId: string;
    createdAt: number;
  }>;
  await updateDoc(userRef, {
    playlist: currentPlaylist.filter((item) => item.songId !== songId),
  });
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as User[];
}

/**
 * Get leaderboard (top users by score)
 */
export async function getLeaderboard(limitCount: number = 10): Promise<User[]> {
  const usersRef = collection(db, 'users');

  try {
    // Try to query with orderBy score
    const q = query(usersRef, orderBy('score', 'desc'), limit(limitCount * 2)); // Get more to filter
    const snapshot = await getDocs(q);
    let users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        score: data.score ?? 0, // Default to 0 if undefined
        lastActive: data.lastActive ?? 0,
        ...data,
      };
    }) as User[];

    // Filter out users with null/undefined scores and sort
    users = users
      .filter((user) => user.score !== undefined && user.score !== null)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limitCount);

    return users;
  } catch (error: any) {
    // Fallback: Get all users and sort client-side
    console.warn(
      'Error querying leaderboard with orderBy, using fallback:',
      error,
    );
    const snapshot = await getDocs(usersRef);
    let users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        score: data.score ?? 0,
        lastActive: data.lastActive ?? 0,
        ...data,
      };
    }) as User[];

    // Filter and sort
    users = users
      .filter((user) => (user.score ?? 0) >= 0) // Only users with valid scores
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limitCount);

    return users;
  }
}

/**
 * Update user score
 */
export async function updateUserScore(
  userId: string,
  score: number,
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    score,
    lastActive: Date.now(),
  });
}

/**
 * Record page view (daily analytics)
 * Structure: analytics/daily/{yyyy-mm-dd}
 */
export async function recordPageView(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]; // Format: yyyy-mm-dd
  const dailyRef = doc(db, 'analytics', `daily_${today}`);

  try {
    const snapshot = await getDoc(dailyRef);
    if (snapshot.exists()) {
      // Update existing
      await updateDoc(dailyRef, {
        views: (snapshot.data().views || 0) + 1,
        timestamp: Date.now(),
      });
    } else {
      // Create new
      const { setDoc } = await import('firebase/firestore');
      await setDoc(dailyRef, {
        date: today,
        views: 1,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('Error recording page view:', error);
  }
}

/**
 * Get daily analytics
 */
export async function getDailyAnalytics(
  days: number = 30,
): Promise<DailyAnalytics[]> {
  // Get all daily analytics documents
  const analyticsRef = collection(db, 'analytics');
  const snapshot = await getDocs(analyticsRef);

  const data = snapshot.docs
    .filter((doc) => doc.id.startsWith('daily_'))
    .map((doc) => ({
      date: doc.id.replace('daily_', ''),
      ...doc.data(),
    })) as DailyAnalytics[];

  // Sort by date and get last N days
  return data
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, days)
    .reverse();
}

/**
 * Get today's views
 */
export async function getTodayViews(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const dailyRef = doc(db, 'analytics', `daily_${today}`);
  const snapshot = await getDoc(dailyRef);
  return snapshot.exists() ? snapshot.data().views || 0 : 0;
}

/**
 * Get total views
 */
export async function getTotalViews(): Promise<number> {
  const analyticsRef = collection(db, 'analytics');
  const snapshot = await getDocs(analyticsRef);
  return snapshot.docs
    .filter((doc) => doc.id.startsWith('daily_'))
    .reduce((sum, doc) => sum + (doc.data().views || 0), 0);
}

/**
 * Get comments for a song
 */
export async function getComments(songId: string): Promise<Comment[]> {
  const commentsRef = collection(db, 'comments');

  try {
    // Try query with orderBy - get all comments (including replies)
    const q = query(
      commentsRef,
      where('songId', '==', songId),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      likes: doc.data().likes || 0,
      likedBy: doc.data().likedBy || [],
      parentId: doc.data().parentId || undefined,
      ...doc.data(),
    })) as Comment[];
  } catch (error: any) {
    // Fallback: query without orderBy if index is missing
    if (error?.code === 'failed-precondition') {
      console.warn('Composite index missing for comments, using fallback...');
      const q = query(commentsRef, where('songId', '==', songId));
      const snapshot = await getDocs(q);
      let comments = snapshot.docs.map((doc) => ({
        id: doc.id,
        likes: doc.data().likes || 0,
        likedBy: doc.data().likedBy || [],
        parentId: doc.data().parentId || undefined,
        ...doc.data(),
      })) as Comment[];

      // Sort client-side
      comments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return comments;
    }
    throw error;
  }
}

/**
 * Create a comment
 */
export async function createComment(
  songId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  content: string,
  parentId?: string,
): Promise<string> {
  if (!songId || !userId || !userName || !content) {
    throw new Error('Missing required fields for comment');
  }

  const commentsRef = collection(db, 'comments');
  const newComment = {
    songId: songId.trim(),
    userId: userId.trim(),
    userName: userName.trim(),
    userAvatar: userAvatar || null, // Use null instead of undefined for Firestore
    content: content.trim(),
    createdAt: Timestamp.now().toMillis(),
    parentId: parentId || null,
    likes: 0,
    likedBy: [],
  };

  try {
    const docRef = await addDoc(commentsRef, newComment);
    return docRef.id;
  } catch (error: any) {
    console.error('Error in createComment:', error);
    throw error;
  }
}

/**
 * Like a comment
 */
export async function likeComment(
  commentId: string,
  userId: string,
): Promise<void> {
  const commentRef = doc(db, 'comments', commentId);
  const commentDoc = await getDoc(commentRef);

  if (!commentDoc.exists()) {
    throw new Error('Comment not found');
  }

  const commentData = commentDoc.data();
  const likedBy = commentData.likedBy || [];

  if (likedBy.includes(userId)) {
    // Unlike
    const updatedLikedBy = likedBy.filter((id: string) => id !== userId);
    await updateDoc(commentRef, {
      likes: Math.max(0, (commentData.likes || 0) - 1),
      likedBy: updatedLikedBy,
    });
  } else {
    // Like
    await updateDoc(commentRef, {
      likes: (commentData.likes || 0) + 1,
      likedBy: [...likedBy, userId],
    });
  }
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  content: string,
): Promise<void> {
  const commentRef = doc(db, 'comments', commentId);
  await updateDoc(commentRef, {
    content,
    updatedAt: Timestamp.now().toMillis(),
  });
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  const commentRef = doc(db, 'comments', commentId);
  await deleteDoc(commentRef);
}

/**
 * Create a notification
 */
export async function createNotification(
  userId: string,
  type: 'reply' | 'like',
  songId: string,
  commentId: string,
  fromUserId: string,
  fromUserName: string,
  fromUserAvatar?: string,
  content?: string,
): Promise<void> {
  // Don't create notification if user is notifying themselves
  if (userId === fromUserId) return;

  const notificationsRef = collection(db, 'notifications');
  const notificationData: any = {
    userId,
    type,
    songId,
    commentId,
    fromUserId,
    fromUserName,
    read: false,
    createdAt: Timestamp.now().toMillis(),
  };

  // Only add optional fields if they have values (Firestore doesn't allow undefined)
  if (fromUserAvatar) {
    notificationData.fromUserAvatar = fromUserAvatar;
  }
  if (content) {
    notificationData.content = content;
  }

  await addDoc(notificationsRef, notificationData);
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
): Promise<Notification[]> {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Notification[];
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, {
    read: true,
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  userId: string,
): Promise<void> {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false),
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });
  await batch.commit();
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false),
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}
