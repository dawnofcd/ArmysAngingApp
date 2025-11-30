/**
 * Admin Songs Management
 * CRUD operations cho bài hát
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  getSongs,
  getCategories,
  createSong,
  updateSong,
  deleteSong,
} from '@/utils/firestore';
import type { Song, Category, SongFormData } from '@/types';
import { Plus, Edit, Trash2, Music, Search, X, Upload } from 'lucide-react';
import { showToast } from '@/components/Toast';
import { ImportSongs } from '@/components/ImportSongs';

export default function AdminSongsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [formData, setFormData] = useState<SongFormData>({
    title: '',
    author: '',
    lyrics: '',
    videoLinkKaraoke: '',
    videoLinkPerformance: '',
    categoryId: '',
    year: new Date().getFullYear(),
    meaning: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/home');
        return;
      }
      loadData();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      // Debounce search
      const timer = setTimeout(() => {
        loadData();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [songsData, categoriesData] = await Promise.all([
        getSongs(undefined, undefined, searchTerm || undefined),
        getCategories(),
      ]);
      setSongs(songsData.songs);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSong) {
        await updateSong(editingSong.id, formData);
        showToast('Cập nhật bài hát thành công!', 'success');
      } else {
        await createSong(formData);
        showToast('Tạo bài hát thành công!', 'success');
      }
      setShowForm(false);
      setEditingSong(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving song:', error);
      showToast('Có lỗi xảy ra!', 'error');
    }
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      author: song.author,
      lyrics: song.lyrics,
      videoLinkKaraoke: song.videoLinkKaraoke,
      videoLinkPerformance: song.videoLinkPerformance,
      categoryId: song.categoryId,
      year: song.year,
      meaning: song.meaning,
    });
    setShowForm(true);
  };

  const handleDelete = async (songId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài hát này?')) return;
    try {
      await deleteSong(songId);
      showToast('Xóa bài hát thành công!', 'success');
      loadData();
    } catch (error) {
      console.error('Error deleting song:', error);
      showToast('Có lỗi xảy ra!', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      lyrics: '',
      videoLinkKaraoke: '',
      videoLinkPerformance: '',
      categoryId: '',
      year: new Date().getFullYear(),
      meaning: '',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-military-green">
            Quản lý bài hát
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Upload className="w-5 h-5" />
              Import Excel
            </button>
            <button
              onClick={() => {
                setEditingSong(null);
                resetForm();
                setShowForm(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm bài hát
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên bài hát hoặc tác giả..."
              className="w-full pl-10 pr-10 py-3 input-field"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Xóa tìm kiếm"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Tìm thấy {songs.length} bài hát cho &quot;{searchTerm}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingSong ? 'Sửa bài hát' : 'Thêm bài hát mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tác giả *
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Danh mục *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  required
                  className="input-field"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Năm</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Link Video Karaoke (YouTube embed)
                </label>
                <input
                  type="url"
                  value={formData.videoLinkKaraoke}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      videoLinkKaraoke: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="https://www.youtube.com/embed/xxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Link Video Người hát (YouTube embed)
                </label>
                <input
                  type="url"
                  value={formData.videoLinkPerformance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      videoLinkPerformance: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="https://www.youtube.com/embed/yyyyyy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Lời bài hát *
                </label>
                <textarea
                  value={formData.lyrics}
                  onChange={(e) =>
                    setFormData({ ...formData, lyrics: e.target.value })
                  }
                  required
                  rows={10}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ý nghĩa bài hát
                </label>
                <textarea
                  value={formData.meaning}
                  onChange={(e) =>
                    setFormData({ ...formData, meaning: e.target.value })
                  }
                  rows={5}
                  className="input-field"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingSong ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSong(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Songs List */}
      {songs.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Chưa có bài hát nào.</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4">Tiêu đề</th>
                  <th className="text-left p-4">Tác giả</th>
                  <th className="text-left p-4">Danh mục</th>
                  <th className="text-left p-4">Năm</th>
                  <th className="text-right p-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => (
                  <tr
                    key={song.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="p-4 font-semibold">{song.title}</td>
                    <td className="p-4">{song.author}</td>
                    <td className="p-4">
                      {categories.find((c) => c.id === song.categoryId)?.name ||
                        song.categoryId}
                    </td>
                    <td className="p-4">{song.year || '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(song)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(song.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportSongs
          categories={categories}
          onImportComplete={loadData}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
