/**
 * Admin Dashboard
 * Trang tổng quan cho admin
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAllUsers, getSongs, getCategories, getAnalytics } from "@/utils/firestore";
import type { User, Song, Category, Analytics } from "@/types";
import { Shield, Users, Music, Eye, BookOpen, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSongs: 0,
    totalCategories: 0,
    totalViews: 0,
    totalCompletions: 0,
  });
  const [topSongs, setTopSongs] = useState<Array<Song & { analytics?: Analytics }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        router.push("/home");
        return;
      }
      loadDashboard();
    }
  }, [user, authLoading, router]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [users, songsData, categories] = await Promise.all([
        getAllUsers(),
        getSongs(),
        getCategories(),
      ]);

      // Load analytics for all songs
      const songsWithAnalytics = await Promise.all(
        songsData.songs.map(async (song) => {
          const analytics = await getAnalytics(song.id);
          return { ...song, analytics };
        })
      );

      // Calculate stats
      const totalViews = songsWithAnalytics.reduce(
        (sum, song) => sum + (song.analytics?.views || 0),
        0
      );
      const totalCompletions = songsWithAnalytics.reduce(
        (sum, song) => sum + (song.analytics?.completions || 0),
        0
      );

      // Top songs by views
      const top = songsWithAnalytics
        .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
        .slice(0, 5);

      setStats({
        totalUsers: users.length,
        totalSongs: songsData.songs.length,
        totalCategories: categories.length,
        totalViews,
        totalCompletions,
      });
      setTopSongs(top);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-military-green flex items-center gap-2">
          <Shield className="w-10 h-10" />
          Admin Dashboard
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng người dùng</p>
              <p className="text-3xl font-bold text-military-green">{stats.totalUsers}</p>
            </div>
            <Users className="w-12 h-12 text-military-green opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng bài hát</p>
              <p className="text-3xl font-bold text-military-green">{stats.totalSongs}</p>
            </div>
            <Music className="w-12 h-12 text-military-green opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Danh mục</p>
              <p className="text-3xl font-bold text-military-green">{stats.totalCategories}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-military-green opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng lượt xem</p>
              <p className="text-3xl font-bold text-military-green">{stats.totalViews}</p>
            </div>
            <Eye className="w-12 h-12 text-military-green opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hoàn thành</p>
              <p className="text-3xl font-bold text-military-green">{stats.totalCompletions}</p>
            </div>
            <BookOpen className="w-12 h-12 text-military-green opacity-50" />
          </div>
        </div>
      </div>

      {/* Top Songs */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">Bài hát được xem nhiều nhất</h2>
        {topSongs.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-2">
            {topSongs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-military-green w-8">{index + 1}</span>
                  <div>
                    <Link
                      href={`/songs/${song.id}`}
                      className="font-semibold text-military-green hover:underline"
                    >
                      {song.title}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{song.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold">{song.analytics?.views || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/songs" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold text-military-green mb-2">Quản lý bài hát</h3>
          <p className="text-gray-600 dark:text-gray-400">Thêm, sửa, xóa bài hát</p>
        </Link>

        <Link href="/admin/categories" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold text-military-green mb-2">Quản lý danh mục</h3>
          <p className="text-gray-600 dark:text-gray-400">Thêm, sửa, xóa danh mục</p>
        </Link>

        <Link href="/admin/users" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold text-military-green mb-2">Quản lý người dùng</h3>
          <p className="text-gray-600 dark:text-gray-400">Xem và cập nhật vai trò</p>
        </Link>
      </div>
    </div>
  );
}





