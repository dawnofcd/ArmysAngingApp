/**
 * Admin Categories Management
 * CRUD operations cho danh mục
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/utils/firestore';
import type { Category, CategoryFormData } from '@/types';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { showToast } from '@/components/Toast';

export default function AdminCategoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/home');
        return;
      }
      loadCategories();
    }
  }, [user, authLoading, router]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        showToast('Cập nhật danh mục thành công!', 'success');
      } else {
        await createCategory(formData);
        showToast('Tạo danh mục thành công!', 'success');
      }
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Có lỗi xảy ra!', 'error');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await deleteCategory(categoryId);
      showToast('Xóa danh mục thành công!', 'success');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Có lỗi xảy ra!', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-military-green">
          Quản lý danh mục
        </h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="input-field"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
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

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Chưa có danh mục nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="card">
              <h3 className="text-xl font-bold text-military-green mb-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="btn-secondary flex items-center justify-center gap-2 px-4"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
