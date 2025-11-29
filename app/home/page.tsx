/**
 * Home Page
 * Trang chủ hiển thị bài hát gợi ý và danh sách bài hát
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSongs, getCategories, getAnalytics } from '@/utils/firestore';
import { addCompletedSong, addToPlaylist } from '@/utils/firestore';
import type { Song, Category, SongWithAnalytics } from '@/types';
import { Music, Star, Eye, Play, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SkeletonCard } from '@/components/SkeletonCard';
import { showToast } from '@/components/Toast';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [songs, setSongs] = useState<SongWithAnalytics[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [songsData, categoriesData] = await Promise.all([
        getSongs(
          selectedCategory || undefined,
          undefined,
          debouncedSearchTerm || undefined,
        ),
        getCategories(),
      ]);

      // Load analytics for each song
      const songsWithAnalytics = await Promise.all(
        songsData.songs.map(async (song) => {
          const analytics = await getAnalytics(song.id);
          return { ...song, analytics: analytics || undefined };
        }),
      );

      setSongs(songsWithAnalytics);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, debouncedSearchTerm]);

  const handleMarkCompleted = async (songId: string) => {
    if (!user) return;
    try {
      await addCompletedSong(user.id, songId);
      // Update analytics
      const { updateAnalytics, updateUserScore } = await import(
        '@/utils/firestore'
      );
      await updateAnalytics(songId, { completions: 1 });

      // Update user score (mỗi bài hát hoàn thành = 10 điểm)
      const newScore = (user.score || 0) + 10;
      await updateUserScore(user.id, newScore);

      showToast('Đã đánh dấu bài hát đã học! +10 điểm', 'success');
      loadData();
    } catch (error) {
      console.error('Error marking completed:', error);
      showToast('Có lỗi xảy ra khi đánh dấu bài hát', 'error');
    }
  };

  const handleAddToPlaylist = async (songId: string) => {
    if (!user) return;
    try {
      await addToPlaylist(user.id, songId);
      showToast('Đã thêm vào playlist!', 'success');
    } catch (error) {
      console.error('Error adding to playlist:', error);
      showToast('Có lỗi xảy ra khi thêm vào playlist', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Recommended songs (based on completed songs and category)
  const recommendedSongs = songs
    .filter((song) => !user.completedSongs.includes(song.id))
    .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
    .slice(0, 6);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-military-green mb-8">Trang chủ</h1>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên, tác giả..."
                className="input-field pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field md:w-64"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Đang tìm kiếm: &quot;{searchTerm}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Recommended Songs */}
      {recommendedSongs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-military-green mb-4">
            Gợi ý cho bạn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedSongs.map((song) => (
              <div
                key={song.id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-military-green">
                    {song.title}
                  </h3>
                  <button
                    onClick={() => handleAddToPlaylist(song.id)}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Tác giả: {song.author}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {song.analytics?.views || 0}
                  </span>
                </div>
                <Link
                  href={`/songs/${song.id}`}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Songs */}
      <section>
        <h2 className="text-2xl font-bold text-military-green mb-4">
          Tất cả bài hát {songs.length > 0 && `(${songs.length})`}
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">
              {searchTerm || selectedCategory
                ? 'Không tìm thấy bài hát nào'
                : 'Chưa có bài hát nào'}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="text-military-green hover:underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <div
                key={song.id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-military-green">
                    {song.title}
                  </h3>
                  <button
                    onClick={() => handleAddToPlaylist(song.id)}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Tác giả: {song.author}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {song.analytics?.views || 0}
                  </span>
                  {user.completedSongs.includes(song.id) && (
                    <span className="text-green-600 dark:text-green-400">
                      ✓ Đã học
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/songs/${song.id}`}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Xem
                  </Link>
                  {!user.completedSongs.includes(song.id) && (
                    <button
                      onClick={() => handleMarkCompleted(song.id)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Đánh dấu
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
