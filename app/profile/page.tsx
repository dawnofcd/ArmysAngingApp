/**
 * Profile Page
 * Trang thông tin cá nhân
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserData, updateUserData } from '@/utils/firestore';
import { compressImage } from '@/utils/imageUtils';
import { showToast } from '@/components/Toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { User } from '@/types';
import {
  User as UserIcon,
  Mail,
  Shield,
  BookOpen,
  ListMusic,
  Camera,
  Lock,
  Save,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, changePassword } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login');
      return;
    }

    if (authUser) {
      loadUserData();
    }
  }, [authUser, authLoading, router]);

  const loadUserData = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const userData = await getUserData(authUser.id);
      setUser(userData);
      setAvatarUrl(userData?.avatarUrl || '');
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file ảnh!', 'warning');
      return;
    }

    // Validate file size (max 5MB trước khi compress)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước file không được vượt quá 5MB!', 'warning');
      return;
    }

    if (!authUser) return;

    setIsUpdating(true);
    try {
      // Compress và resize ảnh (200x200px, quality 0.7 để giảm kích thước base64)
      const compressedFile = await compressImage(file, 200, 200, 0.7);

      // Convert sang base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;

          // Update trong Firestore với base64
          await updateUserData(authUser.id, { avatarUrl: base64String });
          await loadUserData();

          showToast('Cập nhật avatar thành công!', 'success');
        } catch (error: any) {
          console.error('Error updating avatar:', error);
          showToast('Có lỗi xảy ra khi cập nhật avatar!', 'error');
        } finally {
          setIsUpdating(false);
        }
      };

      reader.onerror = () => {
        showToast('Lỗi khi đọc file ảnh!', 'error');
        setIsUpdating(false);
      };

      reader.readAsDataURL(compressedFile);
    } catch (error: any) {
      console.error('Error compressing image:', error);
      showToast('Có lỗi xảy ra khi xử lý ảnh!', 'error');
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    if (passwordData.new !== passwordData.confirm) {
      showToast('Mật khẩu mới và xác nhận không khớp!', 'error');
      return;
    }

    if (passwordData.new.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'warning');
      return;
    }

    setIsUpdating(true);
    try {
      await changePassword(passwordData.current, passwordData.new);
      showToast('Đổi mật khẩu thành công!', 'success');
      setPasswordData({ current: '', new: '', confirm: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      showToast(error.message || 'Có lỗi xảy ra khi đổi mật khẩu!', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  if (!authUser || !user) {
    return null;
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'editor':
        return 'Biên tập viên';
      default:
        return 'Người dùng';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-military-green mb-8">
        Thông tin cá nhân
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-military-green flex items-center justify-center text-white text-3xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUpdating}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-military-green rounded-full flex items-center justify-center text-white hover:bg-military-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Đổi avatar"
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-military-green">
                  {user.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-military-green" />
                <span className="font-semibold">Vai trò:</span>
                <span className="px-3 py-1 bg-military-green/10 text-military-green rounded-lg">
                  {getRoleLabel(user.role)}
                </span>
              </div>

              {/* Change Password Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2 text-military-green hover:text-military-green/80 transition-colors"
                >
                  <Lock className="w-5 h-5" />
                  <span className="font-semibold">Đổi mật khẩu</span>
                </button>

                {showPasswordForm && (
                  <form
                    onSubmit={handlePasswordChange}
                    className="mt-4 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        value={passwordData.current}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current: e.target.value,
                          })
                        }
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwordData.new}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirm: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                        className="input-field"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {isUpdating ? 'Đang cập nhật...' : 'Lưu'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            current: '',
                            new: '',
                            confirm: '',
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Thống kê</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-military-green" />
                  <span>Bài đã học</span>
                </div>
                <span className="text-2xl font-bold text-military-green">
                  {user.completedSongs.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-5 h-5 text-military-green" />
                  <span>Playlist</span>
                </div>
                <span className="text-2xl font-bold text-military-green">
                  {user.playlist.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
