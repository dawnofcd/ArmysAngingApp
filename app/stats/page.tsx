/**
 * Stats Page
 * Trang thống kê với biểu đồ lượt truy cập
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getDailyAnalytics, getTodayViews, getTotalViews, getSongs, getAnalytics } from "@/utils/firestore";
import type { DailyAnalytics, Song, Analytics } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Eye, Calendar, Music, Play } from "lucide-react";

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([]);
  const [todayViews, setTodayViews] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [topSongs, setTopSongs] = useState<Array<Song & { analytics: Analytics; viewCount: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.role !== "admin") {
        router.push("/home");
        return;
      }
      loadStats();
    }
  }, [user, authLoading, router, days]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [daily, today, total, songsData] = await Promise.all([
        getDailyAnalytics(days),
        getTodayViews(),
        getTotalViews(),
        getSongs(),
      ]);
      setDailyData(daily);
      setTodayViews(today);
      setTotalViews(total);

      // Load analytics for all songs and get top songs by views
      const songsWithAnalytics = await Promise.all(
        songsData.songs.map(async (song) => {
          const analytics = await getAnalytics(song.id);
          return {
            ...song,
            analytics: analytics || { views: 0, completions: 0, likes: 0 },
            viewCount: analytics?.views || 0,
          };
        })
      );

      // Sort by views descending and take top 10
      const top = songsWithAnalytics
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 10);

      setTopSongs(top);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format data for chart
  const chartData = dailyData.map((item) => ({
    date: new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    views: item.views,
  }));

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
      <h1 className="text-4xl font-bold text-military-green mb-8 flex items-center gap-2">
        <TrendingUp className="w-10 h-10" />
        Thống Kê Truy Cập
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lượt truy cập hôm nay</p>
              <p className="text-3xl font-bold text-military-green">{todayViews}</p>
            </div>
            <Eye className="w-12 h-12 text-military-green opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng lượt truy cập</p>
              <p className="text-3xl font-bold text-vietnam-red">{totalViews}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-vietnam-red opacity-50" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Số ngày thống kê</p>
              <p className="text-3xl font-bold text-vietnam-gold">{days}</p>
            </div>
            <Calendar className="w-12 h-12 text-vietnam-gold opacity-50" />
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-military-green">Biểu đồ lượt truy cập</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setDays(7)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                days === 7
                  ? "bg-military-green text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                days === 30
                  ? "bg-military-green text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              30 ngày
            </button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Chưa có dữ liệu thống kê.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#2F4F2F"
                strokeWidth={3}
                dot={{ fill: "#DA251D", r: 5 }}
                activeDot={{ r: 8 }}
                name="Lượt truy cập"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Songs by Views */}
      <div className="card">
        <h2 className="text-2xl font-bold text-military-green mb-6 flex items-center gap-2">
          <Music className="w-6 h-6" />
          Top 10 Bài Hát Có Lượt Nghe Nhiều Nhất
        </h2>

        {topSongs.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Chưa có dữ liệu thống kê bài hát.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4">Hạng</th>
                  <th className="text-left p-4">Tên bài hát</th>
                  <th className="text-left p-4">Tác giả</th>
                  <th className="text-right p-4">Lượt nghe</th>
                  <th className="text-right p-4">Hoàn thành</th>
                  <th className="text-right p-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {topSongs.map((song, index) => (
                  <tr
                    key={song.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-2xl">🥇</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                        {index > 2 && (
                          <span className="text-lg font-bold text-military-green w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                            {index + 1}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{song.title}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{song.author}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Eye className="w-4 h-4 text-military-green" />
                        <span className="font-bold text-military-green">{song.viewCount}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-gray-600 dark:text-gray-400">
                      {song.analytics?.completions || 0}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/songs/${song.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-military-green text-white rounded-lg hover:bg-military-green/90 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Xem
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


