/**
 * Admin Users Management
 * Quản lý người dùng và cập nhật role
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers, updateUserData } from '@/utils/firestore';
import type { User, UserRole } from '@/types';
import { Shield, User as UserIcon, Mail } from 'lucide-react';
import { showToast } from '@/components/Toast';

export default function AdminUsersPage() {
  const { user: currentUser, loading: authLoading, updateUserRole } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/home');
        return;
      }
      loadUsers();
    }
  }, [currentUser, authLoading, router]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (
      !confirm(
        `Bạn có chắc muốn thay đổi vai trò của người dùng này thành "${newRole}"?`,
      )
    )
      return;
    try {
      await updateUserRole(userId, newRole);
      await updateUserData(userId, { role: newRole });
      showToast('Cập nhật vai trò thành công!', 'success');
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      showToast('Có lỗi xảy ra!', 'error');
    }
  };

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

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-military-green mb-8">
        Quản lý người dùng
      </h1>

      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <UserIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Chưa có người dùng nào.</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4">Người dùng</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Vai trò</th>
                  <th className="text-left p-4">Bài đã học</th>
                  <th className="text-left p-4">Playlist</th>
                  <th className="text-right p-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-military-green flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-sm ${
                          user.role === 'admin'
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            : user.role === 'editor'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="p-4">{user.completedSongs.length}</td>
                    <td className="p-4">{user.playlist.length}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(
                              user.id,
                              e.target.value as UserRole,
                            )
                          }
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                        >
                          <option value="user">Người dùng</option>
                          <option value="editor">Biên tập viên</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
