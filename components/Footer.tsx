/**
 * Footer Component
 * Hiển thị thông tin lượt truy cập và copyright
 */

"use client";

import { useEffect, useState } from "react";
import { getTodayViews, getTotalViews } from "@/utils/firestore";
import { Eye, Heart, TrendingUp } from "lucide-react";

export function Footer() {
  const [todayViews, setTodayViews] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [today, total] = await Promise.all([getTodayViews(), getTotalViews()]);
      setTodayViews(today);
      setTotalViews(total);
    } catch (error) {
      console.error("Error loading footer stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-military-green via-military-dark-green to-military-green text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-vietnam-gold" />
              <span>
                Lượt truy cập hôm nay: <strong className="text-vietnam-gold">{loading ? "..." : todayViews}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-vietnam-gold" />
              <span>
                Tổng lượt truy cập: <strong className="text-vietnam-gold">{loading ? "..." : totalViews}</strong>
              </span>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm">
            <Heart className="w-4 h-4 text-vietnam-red" />
            <span>© 2025 – Copyright by <strong>Văn Phước</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

