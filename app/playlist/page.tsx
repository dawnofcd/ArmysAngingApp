/**
 * Playlist Page
 * Hiển thị playlist cá nhân của user
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getUserData,
  getSongById,
  removeFromPlaylist,
} from '@/utils/firestore';
import type { Song, PlaylistItem } from '@/types';
import { ListMusic, Trash2, Play, Music } from 'lucide-react';
import { showToast } from '@/components/Toast';

interface PlaylistSong extends Song {
  playlistItem: PlaylistItem;
}

export default function PlaylistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [playlistSongs, setPlaylistSongs] = useState<PlaylistSong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadPlaylist();
    }
  }, [user, authLoading, router]);

  const loadPlaylist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userData = await getUserData(user.id);
      if (!userData || !userData.playlist || userData.playlist.length === 0) {
        setPlaylistSongs([]);
        return;
      }

      // Load all songs in playlist
      const songs = await Promise.all(
        userData.playlist.map(async (item) => {
          const song = await getSongById(item.songId);
          if (song) {
            return { ...song, playlistItem: item };
          }
          return null;
        }),
      );

      setPlaylistSongs(songs.filter((s): s is PlaylistSong => s !== null));
    } catch (error) {
      console.error('Error loading playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (songId: string) => {
    if (!user) return;
    if (!confirm('Bạn có chắc muốn xóa bài hát này khỏi playlist?')) return;

    try {
      await removeFromPlaylist(user.id, songId);
      setPlaylistSongs(playlistSongs.filter((song) => song.id !== songId));
      showToast('Đã xóa khỏi playlist!', 'success');
    } catch (error) {
      console.error('Error removing from playlist:', error);
      showToast('Có lỗi xảy ra khi xóa bài hát.', 'error');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-military-green mb-8 flex items-center gap-2">
        <ListMusic className="w-10 h-10" />
        Playlist của tôi
      </h1>

      {playlistSongs.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Playlist trống</p>
          <p className="text-sm">
            Thêm bài hát vào playlist từ trang chủ hoặc trang chi tiết bài hát.
          </p>
          <Link href="/home" className="btn-primary mt-4 inline-block">
            Khám phá bài hát
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlistSongs.map((song) => (
            <div
              key={song.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-military-green flex-1">
                  {song.title}
                </h3>
                <button
                  onClick={() => handleRemove(song.id)}
                  className="text-red-500 hover:text-red-600 ml-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Tác giả: {song.author}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Thêm vào:{' '}
                {new Date(song.playlistItem.createdAt).toLocaleDateString(
                  'vi-VN',
                )}
              </p>
              <Link
                href={`/songs/${song.id}`}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Phát bài hát
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
