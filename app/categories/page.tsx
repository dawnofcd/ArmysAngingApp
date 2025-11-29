/**
 * Categories Page
 * Hiển thị danh sách danh mục và bài hát theo danh mục
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getCategories, getSongs } from '@/utils/firestore';
import type { Category, Song } from '@/types';
import { Music, FolderOpen } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SkeletonCard } from '@/components/SkeletonCard';

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      // Load default category if exists
      if (categoriesData.length > 0 && !selectedCategory) {
        setSelectedCategory(categoriesData[0]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSongs = async (categoryId: string) => {
    setLoading(true);
    try {
      const songsData = await getSongs(categoryId);
      setSongs(songsData.songs);
    } catch (error) {
      console.error('Error loading songs:', error);
      setSongs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      loadSongs(selectedCategory.id);
    } else {
      setSongs([]); // Clear songs when no category is selected
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-military-green mb-8 flex items-center gap-2">
        <FolderOpen className="w-10 h-10" />
        Danh mục bài hát
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories List */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Danh mục</h2>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  selectedCategory?.id === category.id
                    ? 'bg-military-green text-white'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <h3 className="font-semibold">{category.name}</h3>
                {category.description && (
                  <p className="text-sm mt-1 opacity-80">
                    {category.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Songs in Category */}
        <div className="lg:col-span-2">
          {selectedCategory ? (
            <>
              <h2 className="text-2xl font-bold mb-4">
                Bài hát trong &quot;{selectedCategory.name}&quot;{' '}
                {songs.length > 0 && `(${songs.length})`}
              </h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : songs.length === 0 ? (
                <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                  <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">
                    Chưa có bài hát nào trong danh mục này.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {songs.map((song) => (
                    <Link
                      key={song.id}
                      href={`/songs/${song.id}`}
                      className="card hover:shadow-xl transition-all hover:scale-[1.02]"
                    >
                      <h3 className="text-xl font-bold text-military-green mb-2">
                        {song.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Tác giả: {song.author}
                      </p>
                      {song.year && (
                        <p className="text-sm text-gray-500 mt-1">
                          Năm: {song.year}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Chọn một danh mục để xem bài hát</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
