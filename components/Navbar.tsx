/**
 * Navigation Bar Component
 * Header với theme quân đội
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, LogOut, User, Home, Music, ListMusic, Shield, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/utils/cn";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <nav className="navbar-gradient text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">Đang tải...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar-gradient text-white shadow-lg sticky top-0 z-50 border-b-4 border-vietnam-gold">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={user ? "/home" : "/"} className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
            <Music className="w-6 h-6 text-vietnam-gold" />
            <span className="flex items-center gap-1">
              <span className="text-vietnam-gold">Quân</span>
              <span>Đội</span>
              <span className="text-vietnam-gold">Music</span>
            </span>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/home"
                className={cn(
                  "flex items-center gap-2 hover:opacity-80 transition-opacity",
                  pathname === "/home" && "underline"
                )}
              >
                <Home className="w-4 h-4" />
                Trang chủ
              </Link>
              <Link
                href="/categories"
                className={cn(
                  "flex items-center gap-2 hover:opacity-80 transition-opacity",
                  pathname === "/categories" && "underline"
                )}
              >
                <Music className="w-4 h-4" />
                Danh mục
              </Link>
              <Link
                href="/playlist"
                className={cn(
                  "flex items-center gap-2 hover:opacity-80 transition-opacity",
                  pathname === "/playlist" && "underline"
                )}
              >
                <ListMusic className="w-4 h-4" />
                Playlist
              </Link>
              <Link
                href="/leaderboard"
                className={cn(
                  "flex items-center gap-2 hover:opacity-80 transition-opacity",
                  pathname === "/leaderboard" && "underline"
                )}
              >
                <Trophy className="w-4 h-4" />
                Xếp hạng
              </Link>
              <Link
                href="/stats"
                className={cn(
                  "flex items-center gap-2 hover:opacity-80 transition-opacity",
                  pathname === "/stats" && "underline"
                )}
              >
                <TrendingUp className="w-4 h-4" />
                Thống kê
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-2 hover:opacity-80 transition-opacity",
                    pathname?.startsWith("/admin") && "underline"
                  )}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Đăng xuất</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hover:opacity-80 transition-opacity">
                  Đăng nhập
                </Link>
                <span>|</span>
                <Link href="/register" className="hover:opacity-80 transition-opacity">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && (
          <div className="md:hidden mt-4 flex items-center justify-around border-t border-white/20 pt-4">
            <Link
              href="/home"
              className={cn(
                "flex flex-col items-center gap-1 text-sm",
                pathname === "/home" && "underline"
              )}
            >
              <Home className="w-5 h-5" />
              <span>Trang chủ</span>
            </Link>
            <Link
              href="/categories"
              className={cn(
                "flex flex-col items-center gap-1 text-sm",
                pathname === "/categories" && "underline"
              )}
            >
              <Music className="w-5 h-5" />
              <span>Danh mục</span>
            </Link>
            <Link
              href="/playlist"
              className={cn(
                "flex flex-col items-center gap-1 text-sm",
                pathname === "/playlist" && "underline"
              )}
            >
              <ListMusic className="w-5 h-5" />
              <span>Playlist</span>
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className={cn(
                  "flex flex-col items-center gap-1 text-sm",
                  pathname?.startsWith("/admin") && "underline"
                )}
              >
                <Shield className="w-5 h-5" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

