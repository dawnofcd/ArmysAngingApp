# Hướng dẫn Deploy Ứng dụng

## Tùy chọn 1: Deploy lên Vercel (Khuyến nghị cho Next.js)

### Bước 1: Chuẩn bị

1. Đảm bảo đã commit code lên Git repository (GitHub, GitLab, hoặc Bitbucket)
2. Đăng ký tài khoản tại [vercel.com](https://vercel.com)

### Bước 2: Deploy

1. Vào [vercel.com](https://vercel.com) và đăng nhập
2. Click "Add New Project"
3. Import repository từ Git
4. Cấu hình:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Thêm Environment Variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```
6. Click "Deploy"

### Bước 3: Deploy Firestore Rules và Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Tùy chọn 2: Deploy lên Firebase Hosting

### Bước 1: Cài đặt Firebase CLI

```bash
npm install -g firebase-tools
```

### Bước 2: Đăng nhập Firebase

```bash
firebase login
```

### Bước 3: Cấu hình Next.js cho Static Export

Cập nhật `next.config.js`:

```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Thêm dòng này
  images: {
    unoptimized: true, // Cần cho static export
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
};
```

### Bước 4: Build và Export

```bash
npm run build
```

### Bước 5: Deploy

```bash
# Deploy Firestore rules và indexes trước
firebase deploy --only firestore:rules,firestore:indexes

# Deploy hosting
firebase deploy --only hosting
```

---

## Tùy chọn 3: Deploy lên Netlify

### Bước 1: Chuẩn bị

1. Đảm bảo code đã commit lên Git
2. Đăng ký tại [netlify.com](https://netlify.com)

### Bước 2: Deploy

1. Vào Netlify Dashboard → "Add new site" → "Import an existing project"
2. Chọn repository
3. Cấu hình:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. Thêm Environment Variables (giống như Vercel)
5. Click "Deploy site"

---

## Bước quan trọng: Deploy Firestore Rules và Indexes

Sau khi deploy hosting, **BẮT BUỘC** phải deploy Firestore rules và indexes:

```bash
# Deploy tất cả
firebase deploy --only firestore:rules,firestore:indexes,storage

# Hoặc deploy từng phần
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

---

## Kiểm tra sau khi deploy

1. ✅ Kiểm tra ứng dụng hoạt động
2. ✅ Kiểm tra authentication (đăng nhập/đăng ký)
3. ✅ Kiểm tra Firestore rules (thử tạo comment, like, reply)
4. ✅ Kiểm tra Storage rules (thử upload avatar)
5. ✅ Kiểm tra Firestore indexes (xem có lỗi trong console không)

---

## Lưu ý

- **Environment Variables**: Không commit file `.env` vào Git
- **Firestore Indexes**: Có thể mất vài phút để build indexes
- **Storage Rules**: Đảm bảo đã deploy storage.rules
- **CORS**: Nếu có lỗi CORS, kiểm tra Firebase config
