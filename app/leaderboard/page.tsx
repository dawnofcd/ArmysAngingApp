/**
 * Leaderboard Page
 * Bảng xếp hạng top 10 người dùng theo điểm số
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getLeaderboard } from "@/utils/firestore";
import type { User } from "@/types";
import { Trophy, Medal, Award, User as UserIcon, Clock } from "lucide-react";

export default function LeaderboardPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser) {
      loadLeaderboard();
    }
  }, [currentUser, authLoading, router]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(10);
      setLeaderboard(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-vietnam-gold" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-military-green w-6">{rank}</span>;
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Chưa có";
    return new Date(timestamp).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-military-green mb-8 flex items-center gap-2">
        <Trophy className="w-10 h-10 text-vietnam-gold" />
        Bảng Xếp Hạng
      </h1>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Chưa có dữ liệu xếp hạng.</p>
          <p className="text-sm mt-2 text-gray-500">
            Hãy hoàn thành các bài hát để tích lũy điểm số!
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="space-y-4">
            {leaderboard.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = user.id === currentUser.id;
              
              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    rank === 1
                      ? "bg-gradient-to-r from-vietnam-gold/20 to-vietnam-gold/10 border-2 border-vietnam-gold"
                      : rank === 2
                      ? "bg-gradient-to-r from-gray-200/50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/50 border-2 border-gray-300 dark:border-gray-600"
                      : rank === 3
                      ? "bg-gradient-to-r from-orange-100/50 to-orange-50/50 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-300 dark:border-orange-700"
                      : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  } ${isCurrentUser ? "ring-2 ring-military-green" : ""}`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(rank)}
                  </div>

                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      rank === 1
                        ? "bg-vietnam-gold text-vietnam-red"
                        : rank === 2
                        ? "bg-gray-400"
                        : rank === 3
                        ? "bg-orange-600"
                        : "bg-military-green"
                    }`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      {isCurrentUser && (
                        <span className="text-xs px-2 py-1 bg-military-green text-white rounded-full">
                          Bạn
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(user.lastActive)}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-military-green">
                      {user.score || 0}
                    </div>
                    <div className="text-xs text-gray-500">điểm</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-military-beige dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              💡 Điểm số được tính dựa trên số bài hát đã học và hoạt động của bạn
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

