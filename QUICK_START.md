# ⚡ Quick Start Guide

## 1. Cài đặt Dependencies

```bash

```

## 2. Cấu hình Firebase

1. Tạo file `.env.local` trong thư mục gốc:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

2. Lấy credentials từ Firebase Console:

   - Vào Project Settings > General
   - Scroll xuống "Your apps" > Web app
   - Copy config

3. Cập nhật `.firebaserc`:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

## 3. Setup Firebase Services

### Authentication

1. Vào Firebase Console > Authentication
2. Bật "Email/Password"
3. Bật "Google" (cấu hình OAuth consent screen nếu cần)

### Firestore

1. Vào Firebase Console > Firestore Database
2. Tạo database (chọn Production mode)
3. Deploy rules:

```bash
firebase deploy --only firestore:rules
```

## 4. Chạy Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 5. Khởi tạo Dữ liệu Mẫu (Optional)

```bash
# Cài đặt tsx
npm install -g tsx

# Chạy script
npx tsx scripts/init-dummy-data.ts
```

## 6. Tạo Admin User

### Cách 1: Qua Firebase Console (Khuyến nghị)

1. Đăng ký tài khoản qua ứng dụng
2. Vào Firebase Console > Firestore Database
3. Tìm document trong collection `users` với email của bạn
4. Cập nhật field `role` thành `"admin"`
5. Đăng xuất và đăng nhập lại trong ứng dụng

### Cách 2: Dùng Script (Nhanh hơn)

```bash
# Cài đặt tsx nếu chưa có
npm install -g tsx

# Set admin (thay your@email.com bằng email của bạn)
npx tsx scripts/set-admin.ts your@email.com
```

Sau đó đăng xuất và đăng nhập lại trong ứng dụng.

📖 Xem chi tiết trong `HUONG_DAN_ADMIN.md`

## 7. Deploy (Khi sẵn sàng)

Xem chi tiết trong `DEPLOY.md`

---

**Lưu ý**: Đảm bảo đã cấu hình đúng Firebase credentials trước khi chạy!
