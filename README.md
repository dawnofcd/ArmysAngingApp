# Học Tập Âm Nhạc Quân Đội

Ứng dụng web học tập các bài hát quân đội Việt Nam với tính năng karaoke, ghi âm, và quản lý bài hát.

## Tính năng

- 🎵 **Quản lý bài hát**: Xem, tìm kiếm, và quản lý bài hát theo danh mục
- 📊 **Import Excel**: Import nhiều bài hát cùng lúc từ file Excel (Admin) - [Xem hướng dẫn](./HUONG_DAN_IMPORT_EXCEL.md)
- 🎤 **Karaoke**: Xem video karaoke với lời bài hát highlight
- 🎙️ **Ghi âm**: Ghi âm giọng hát của bạn
- 💬 **Bình luận**: Thảo luận về bài hát với tính năng like và reply
- 🔔 **Thông báo**: Nhận thông báo khi có người reply hoặc like comment của bạn
- 📊 **Thống kê**: Xem thống kê lượt nghe và bài hát phổ biến (Admin)
- 🏆 **Xếp hạng**: Bảng xếp hạng người dùng theo điểm số
- 👤 **Quản lý người dùng**: Quản lý avatar, playlist, và điểm số

## Công nghệ sử dụng

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Icons**: Lucide React
- **Language**: TypeScript

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd 15songarmy
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Firebase

1. Tạo file `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

2. Điền thông tin Firebase của bạn vào `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Deploy Firestore Rules và Indexes

```bash
# Cài đặt Firebase CLI (nếu chưa có)
npm install -g firebase-tools

# Đăng nhập Firebase
firebase login

# Deploy rules và indexes
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 5. Chạy ứng dụng

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Tài liệu

- [DEPLOY.md](./DEPLOY.md) - Hướng dẫn deploy ứng dụng
- [HUONG_DAN_IMPORT_EXCEL.md](./HUONG_DAN_IMPORT_EXCEL.md) - Hướng dẫn import bài hát từ Excel
- [SETUP_ENV.md](./SETUP_ENV.md) - Hướng dẫn cấu hình environment variables
- [HUONG_DAN_ADMIN.md](./HUONG_DAN_ADMIN.md) - Hướng dẫn sử dụng cho Admin

## Deploy

Xem file [DEPLOY.md](./DEPLOY.md) để biết hướng dẫn chi tiết về deploy.

### Tùy chọn deploy:

- **Vercel** (Khuyến nghị): Tự động build và deploy từ Git
- **Firebase Hosting**: Static export
- **Netlify**: Tương tự Vercel

## Cấu trúc thư mục

```
15songarmy/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin pages
│   ├── categories/     # Categories page
│   ├── home/           # Home page
│   ├── songs/          # Song detail pages
│   └── ...
├── components/         # React components
├── context/            # React contexts (Auth, Theme)
├── utils/              # Utility functions
├── types/              # TypeScript types
├── public/             # Static files
├── firebase/           # Firebase configuration
└── firestore.rules     # Firestore security rules
```

## Firestore Collections

- `users`: Thông tin người dùng
- `songs`: Bài hát
- `categories`: Danh mục bài hát
- `analytics`: Thống kê lượt xem
- `comments`: Bình luận

## License

Copyright © 2025 - Hung Vo
