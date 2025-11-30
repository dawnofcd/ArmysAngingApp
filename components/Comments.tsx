/**
 * Comments Component
 * Hiển thị và quản lý bình luận cho bài hát
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  createNotification,
} from '@/utils/firestore';
import type { Comment } from '@/types';
import {
  MessageSquare,
  Send,
  Edit,
  Trash2,
  User,
  Heart,
  Reply,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { showToast } from '@/components/Toast';

interface CommentsProps {
  songId: string;
}

export function Comments({ songId }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getComments(songId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      showToast('Có lỗi xảy ra khi tải bình luận', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      await createComment(
        songId,
        user.id,
        user.name,
        user.avatarUrl,
        newComment.trim(),
      );
      setNewComment('');
      await loadComments();
      showToast('Đăng bình luận thành công!', 'success');
    } catch (error: any) {
      console.error('Error creating comment:', error);
      if (error?.code === 'permission-denied') {
        showToast('Bạn không có quyền đăng bình luận', 'error');
      } else if (error?.code === 'unauthenticated') {
        showToast('Vui lòng đăng nhập để đăng bình luận', 'error');
      } else {
        showToast('Có lỗi xảy ra khi đăng bình luận!', 'error');
      }
    }
  };

  const handleReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    try {
      // Find the parent comment to get the original commenter
      const parentComment = comments.find((c) => c.id === parentId);

      // Create the reply comment
      await createComment(
        songId,
        user.id,
        user.name,
        user.avatarUrl,
        replyContent.trim(),
        parentId,
      );

      // Create notification for the parent comment owner (don't fail if this errors)
      if (parentComment && parentComment.userId !== user.id) {
        try {
          await createNotification(
            parentComment.userId,
            'reply',
            songId,
            parentId,
            user.id,
            user.name,
            user.avatarUrl,
            replyContent.trim().substring(0, 100), // Preview of reply
          );
        } catch (notifError) {
          // Log but don't fail the reply if notification creation fails
          console.error('Error creating notification:', notifError);
        }
      }

      setReplyContent('');
      setReplyingTo(null);
      await loadComments();
      showToast('Trả lời thành công!', 'success');
    } catch (error: any) {
      console.error('Error replying:', error);
      if (error?.code === 'permission-denied') {
        showToast('Bạn không có quyền trả lời bình luận', 'error');
      } else if (error?.code === 'unauthenticated') {
        showToast('Vui lòng đăng nhập để trả lời', 'error');
      } else {
        showToast('Có lỗi xảy ra khi trả lời!', 'error');
      }
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thích bình luận', 'warning');
      return;
    }

    try {
      // Find the comment to get the commenter
      const comment = comments.find((c) => c.id === commentId);
      const wasLiked = comment?.likedBy?.includes(user.id);

      // Like/unlike the comment
      await likeComment(commentId, user.id);

      // Create notification only if this is a new like (not unliking)
      if (comment && !wasLiked && comment.userId !== user.id) {
        try {
          await createNotification(
            comment.userId,
            'like',
            songId,
            commentId,
            user.id,
            user.name,
            user.avatarUrl,
            comment.content.substring(0, 100), // Preview of comment
          );
        } catch (notifError) {
          // Log but don't fail the like if notification creation fails
          console.error('Error creating notification:', notifError);
        }
      }

      await loadComments();
    } catch (error: any) {
      console.error('Error liking comment:', error);
      if (error?.code === 'permission-denied') {
        showToast('Bạn không có quyền thích bình luận', 'error');
      } else {
        showToast('Có lỗi xảy ra khi thích bình luận', 'error');
      }
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await updateComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent('');
      loadComments();
      showToast('Cập nhật bình luận thành công!', 'success');
    } catch (error) {
      console.error('Error updating comment:', error);
      showToast('Có lỗi xảy ra khi cập nhật bình luận!', 'error');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      await deleteComment(commentId);
      loadComments();
      showToast('Xóa bình luận thành công!', 'success');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showToast('Có lỗi xảy ra khi xóa bình luận!', 'error');
    }
  };

  // Organize comments: separate parent comments and replies
  const parentComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => {
    return comments.filter((c) => c.parentId === parentId);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Bình luận ({comments.length})
      </h3>

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 input-field"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Gửi
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          Đang tải bình luận...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {parentComments.map((comment) => {
            const replies = getReplies(comment.id);
            const isLiked = user && comment.likedBy?.includes(user.id);

            return (
              <div key={comment.id}>
                {/* Parent Comment */}
                <div
                  id={`comment-${comment.id}`}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg scroll-mt-20"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {comment.userAvatar ? (
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-military-green flex items-center justify-center text-white font-bold">
                          {comment.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-military-green">
                          {comment.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                        {comment.updatedAt &&
                          comment.updatedAt !== comment.createdAt && (
                            <span className="text-xs text-gray-400">
                              (đã chỉnh sửa)
                            </span>
                          )}
                      </div>

                      {editingId === comment.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full input-field"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(comment.id)}
                              className="btn-primary text-sm"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditContent('');
                              }}
                              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      )}

                      {/* Actions */}
                      {user && editingId !== comment.id && (
                        <div className="flex items-center gap-4 mt-3">
                          {/* Like Button */}
                          <button
                            onClick={() => handleLike(comment.id)}
                            className={cn(
                              'flex items-center gap-1 text-sm transition-colors',
                              isLiked
                                ? 'text-red-600 hover:text-red-700'
                                : 'text-gray-600 dark:text-gray-400 hover:text-red-600',
                            )}
                          >
                            <Heart
                              className={cn(
                                'w-4 h-4',
                                isLiked && 'fill-current',
                              )}
                            />
                            <span>{comment.likes || 0}</span>
                          </button>

                          {/* Reply Button */}
                          <button
                            onClick={() => {
                              setReplyingTo(
                                replyingTo === comment.id ? null : comment.id,
                              );
                              setReplyContent('');
                            }}
                            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-military-green transition-colors"
                          >
                            <Reply className="w-4 h-4" />
                            Trả lời
                          </button>

                          {/* User can edit/delete their own comments */}
                          {user.id === comment.userId && (
                            <>
                              <button
                                onClick={() => handleEdit(comment)}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-military-green flex items-center gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Xóa
                              </button>
                            </>
                          )}
                          {/* Admin can delete any comment */}
                          {user.role === 'admin' &&
                            user.id !== comment.userId && (
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                                title="Admin: Xóa bình luận này"
                              >
                                <Trash2 className="w-3 h-3" />
                                Xóa (Admin)
                              </button>
                            )}
                        </div>
                      )}

                      {/* Reply Form */}
                      {replyingTo === comment.id && user && (
                        <div className="mt-4 pl-4 border-l-2 border-military-green">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`Trả lời ${comment.userName}...`}
                              className="flex-1 input-field text-sm"
                            />
                            <button
                              onClick={() => handleReply(comment.id)}
                              disabled={!replyContent.trim()}
                              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Gửi
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {replies.length > 0 && (
                  <div className="mt-2 ml-8 space-y-2">
                    {replies.map((reply) => {
                      const isReplyLiked =
                        user && reply.likedBy?.includes(user.id);
                      return (
                        <div
                          key={reply.id}
                          id={`comment-${reply.id}`}
                          className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg scroll-mt-20"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0">
                              {reply.userAvatar ? (
                                <img
                                  src={reply.userAvatar}
                                  alt={reply.userName}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-military-green flex items-center justify-center text-white text-xs font-bold">
                                  {reply.userName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-military-green">
                                  {reply.userName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {reply.content}
                              </p>
                              {user && (
                                <div className="flex items-center gap-3 mt-2">
                                  <button
                                    onClick={() => handleLike(reply.id)}
                                    className={cn(
                                      'flex items-center gap-1 text-xs transition-colors',
                                      isReplyLiked
                                        ? 'text-red-600 hover:text-red-700'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-red-600',
                                    )}
                                  >
                                    <Heart
                                      className={cn(
                                        'w-3 h-3',
                                        isReplyLiked && 'fill-current',
                                      )}
                                    />
                                    <span>{reply.likes || 0}</span>
                                  </button>
                                  {user.id === reply.userId && (
                                    <button
                                      onClick={() => handleDelete(reply.id)}
                                      className="text-xs text-red-600 hover:text-red-700"
                                    >
                                      Xóa
                                    </button>
                                  )}
                                  {user.role === 'admin' &&
                                    user.id !== reply.userId && (
                                      <button
                                        onClick={() => handleDelete(reply.id)}
                                        className="text-xs text-red-600 hover:text-red-700"
                                      >
                                        Xóa (Admin)
                                      </button>
                                    )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
