/**
 * Song Detail / Karaoke Page
 * Trang chi tiết bài hát với video karaoke, lyrics highlight, và các tab
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  getSongById,
  getAnalytics,
  updateAnalytics,
  addCompletedSong,
  addToPlaylist,
} from '@/utils/firestore';
import { KaraokeLyrics } from '@/components/KaraokeLyrics';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { Comments } from '@/components/Comments';
import type { Song, Analytics } from '@/types';
import {
  Mic2,
  Star,
  BookOpen,
  History,
  Play,
  Eye,
  User,
  Music,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { showToast } from '@/components/Toast';

type MainTab = 'performer' | 'karaoke';
type SubTab = 'lyrics' | 'meaning' | 'history';

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [song, setSong] = useState<Song | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('performer');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('lyrics');
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isInPlaylist, setIsInPlaylist] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && params.id) {
      loadSong();
    }
  }, [user, authLoading, params.id, router]);

  // Scroll to comment when hash is present in URL
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash && song) {
      const commentId = window.location.hash.substring(1); // Remove #
      // Wait a bit for comments to load
      const timer = setTimeout(() => {
        const commentElement = document.getElementById(commentId);
        if (commentElement) {
          commentElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          // Highlight the comment briefly
          commentElement.classList.add(
            'ring-2',
            'ring-military-green',
            'ring-opacity-50',
          );
          setTimeout(() => {
            commentElement.classList.remove(
              'ring-2',
              'ring-military-green',
              'ring-opacity-50',
            );
          }, 2000);
        }
      }, 1000); // Wait for comments component to load

      return () => clearTimeout(timer);
    }
  }, [song, params.id]);

  const loadSong = async () => {
    if (!params.id || typeof params.id !== 'string') return;
    setLoading(true);
    try {
      const [songData, analyticsData] = await Promise.all([
        getSongById(params.id),
        getAnalytics(params.id),
      ]);

      if (!songData) {
        router.push('/home');
        return;
      }

      setSong(songData);
      setAnalytics(analyticsData);

      // Check if completed
      if (user) {
        setIsCompleted(user.completedSongs.includes(params.id as string));
        setIsInPlaylist(
          user.playlist.some((item) => item.songId === params.id),
        );
      }

      // Update view count (debounced)
      if (analyticsData) {
        await updateAnalytics(params.id as string, {
          views: (analyticsData.views || 0) + 1,
        });
        setAnalytics({
          ...analyticsData,
          views: (analyticsData.views || 0) + 1,
        });
      }
    } catch (error) {
      console.error('Error loading song:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!user || !song) return;
    try {
      await addCompletedSong(user.id, song.id);
      await updateAnalytics(song.id, {
        completions: (analytics?.completions || 0) + 1,
      });

      // Update user score (mỗi bài hát hoàn thành = 10 điểm)
      const { updateUserScore } = await import('@/utils/firestore');
      const newScore = (user.score || 0) + 10;
      await updateUserScore(user.id, newScore);

      setIsCompleted(true);
      showToast('Đã đánh dấu bài hát đã học! +10 điểm', 'success');
    } catch (error) {
      console.error('Error marking completed:', error);
    }
  };

  const handleTogglePlaylist = async () => {
    if (!user || !song) return;
    try {
      if (isInPlaylist) {
        const { removeFromPlaylist } = await import('@/utils/firestore');
        await removeFromPlaylist(user.id, song.id);
        setIsInPlaylist(false);
        showToast('Đã xóa khỏi playlist!', 'success');
      } else {
        await addToPlaylist(user.id, song.id);
        setIsInPlaylist(true);
        showToast('Đã thêm vào playlist!', 'success');
      }
    } catch (error) {
      console.error('Error toggling playlist:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!user || !song) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-military-green hover:underline"
        >
          ← Quay lại
        </button>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-military-green mb-2">
              {song.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Tác giả: {song.author}
            </p>
            {song.year && (
              <p className="text-sm text-gray-500 mt-1">Năm: {song.year}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlaylist}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isInPlaylist
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600',
              )}
            >
              <Star className="w-5 h-5" />
            </button>
            {!isCompleted && (
              <button
                onClick={handleMarkCompleted}
                className="btn-primary flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Đánh dấu đã học
              </button>
            )}
            {isCompleted && (
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg">
                ✓ Đã học
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {analytics?.views || 0} lượt xem
          </span>
        </div>
      </div>

      {/* Main Tabs: Người hát / Karaoke */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveMainTab('performer')}
            className={cn(
              'px-6 py-3 font-semibold border-b-2 transition-colors flex items-center gap-2',
              activeMainTab === 'performer'
                ? 'border-military-green text-military-green'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-military-green',
            )}
          >
            <User className="w-5 h-5" />
            Người hát
          </button>
          <button
            onClick={() => setActiveMainTab('karaoke')}
            className={cn(
              'px-6 py-3 font-semibold border-b-2 transition-colors flex items-center gap-2',
              activeMainTab === 'karaoke'
                ? 'border-military-green text-military-green'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-military-green',
            )}
          >
            <Music className="w-5 h-5" />
            Karaoke
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="mb-8">
        {/* Tab Người hát */}
        {activeMainTab === 'performer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Người hát - Chiếm 2/3 cột */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Play className="w-6 h-6" />
                  Video Người hát
                </h3>
                {song.videoLinkPerformance ? (
                  <div className="aspect-video">
                    <iframe
                      src={`${song.videoLinkPerformance}${
                        song.videoLinkPerformance.includes('?') ? '&' : '?'
                      }rel=0&modestbranding=1`}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">Chưa có video người hát</p>
                  </div>
                )}
              </div>
            </div>

            {/* Nội dung bên phải - Chiếm 1/3 cột */}
            <div className="lg:col-span-1 space-y-6">
              {/* Sub Tabs cho Người hát */}
              <div className="mb-4">
                <div className="flex flex-col border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveSubTab('lyrics')}
                    className={cn(
                      'px-4 py-3 font-semibold border-b-2 transition-colors text-left',
                      activeSubTab === 'lyrics'
                        ? 'border-military-green text-military-green'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-military-green',
                    )}
                  >
                    Lời bài hát
                  </button>
                  <button
                    onClick={() => setActiveSubTab('meaning')}
                    className={cn(
                      'px-4 py-3 font-semibold border-b-2 transition-colors text-left',
                      activeSubTab === 'meaning'
                        ? 'border-military-green text-military-green'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-military-green',
                    )}
                  >
                    Ý nghĩa bài hát
                  </button>
                  <button
                    onClick={() => setActiveSubTab('history')}
                    className={cn(
                      'px-4 py-3 font-semibold border-b-2 transition-colors text-left',
                      activeSubTab === 'history'
                        ? 'border-military-green text-military-green'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-military-green',
                    )}
                  >
                    Lịch sử bài hát
                  </button>
                </div>
              </div>

              {/* Sub Tab Content */}
              <div className="max-h-[600px] overflow-y-auto">
                {activeSubTab === 'lyrics' && (
                  <KaraokeLyrics lyrics={song.lyrics} />
                )}
                {activeSubTab === 'meaning' && (
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <BookOpen className="w-6 h-6" />Ý nghĩa bài hát
                    </h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                        {song.meaning ||
                          'Chưa có thông tin về ý nghĩa bài hát.'}
                      </p>
                    </div>
                  </div>
                )}
                {activeSubTab === 'history' && (
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <History className="w-6 h-6" />
                      Lịch sử bài hát
                    </h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300">
                        {song.year
                          ? `Bài hát được sáng tác năm ${song.year}.`
                          : 'Chưa có thông tin về lịch sử bài hát.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Karaoke */}
        {activeMainTab === 'karaoke' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Karaoke - Chiếm 2/3 cột */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Mic2 className="w-6 h-6" />
                  Video Karaoke
                </h3>
                {song.videoLinkKaraoke ? (
                  <div className="aspect-video">
                    <iframe
                      src={`${song.videoLinkKaraoke}${
                        song.videoLinkKaraoke.includes('?') ? '&' : '?'
                      }rel=0&modestbranding=1`}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500">Chưa có video karaoke</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lời bài hát và Ghi âm - Chiếm 1/3 cột bên phải */}
            <div className="lg:col-span-1 space-y-6">
              {/* Lời bài hát cho Karaoke */}
              <KaraokeLyrics lyrics={song.lyrics} />

              {/* Voice Recorder - Chỉ hiển thị trong tab Karaoke */}
              <VoiceRecorder />
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="mt-8">
        <Comments songId={song.id} />
      </div>
    </div>
  );
}
