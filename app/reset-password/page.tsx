/**
 * Reset Password Page
 * Gửi email reset mật khẩu
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Không thể gửi email reset. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-military-beige via-white to-vietnam-red/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-military-green mb-2">Đặt lại mật khẩu</h1>
          <p className="text-gray-600 dark:text-gray-400">Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Đã gửi email! Vui lòng kiểm tra hộp thư của bạn.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field pl-10"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Mail className="w-5 h-5" />
            {loading ? "Đang gửi..." : success ? "Đã gửi!" : "Gửi email reset"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-military-green font-semibold hover:underline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

