# 🔒 Sửa lỗi "Missing or insufficient permissions"

## Vấn đề

Lỗi này xảy ra khi Firestore security rules chưa được deploy hoặc quá strict.

## Giải pháp

### Bước 1: Deploy Firestore Rules

**Quan trọng**: Bạn PHẢI deploy Firestore rules lên Firebase để ứng dụng hoạt động.

```bash
# Đảm bảo đã cài Firebase CLI
npm install -g firebase-tools

# Đăng nhập (nếu chưa)
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

### Bước 2: Kiểm tra Rules đã được deploy

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Firestore Database** > **Rules**
4. Kiểm tra xem rules có giống với file `firestore.rules` không

### Bước 3: Nếu vẫn gặp lỗi

#### Option A: Tạm thời cho phép đọc (CHỈ DÙNG CHO DEVELOPMENT)

⚠️ **CẢNH BÁO**: Chỉ dùng cho development, KHÔNG dùng cho production!

Tạo file `firestore.rules` với nội dung:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TẠM THỜI: Cho phép đọc khi authenticated (development only)
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Sau đó deploy lại:

```bash
firebase deploy --only firestore:rules
```

#### Option B: Kiểm tra User đã đăng nhập chưa

Đảm bảo user đã đăng nhập trước khi truy cập dữ liệu. Rules hiện tại yêu cầu:

- ✅ User phải authenticated để đọc categories, songs, analytics
- ✅ Chỉ admin mới có thể write vào categories, songs
- ✅ User có thể update analytics (views tracking)

### Bước 4: Test lại

1. Đăng nhập vào ứng dụng
2. Thử truy cập các trang (home, categories, songs)
3. Nếu vẫn lỗi, kiểm tra console để xem lỗi cụ thể

## Rules hiện tại (Production-ready)

Rules hiện tại đã được cấu hình an toàn:

- ✅ Users phải đăng nhập để đọc dữ liệu
- ✅ Chỉ admin có thể tạo/sửa/xóa categories và songs
- ✅ Users có thể update analytics (views, completions)
- ✅ Users có thể tạo analytics document nếu chưa có

## Troubleshooting

### Lỗi: "Permission denied" khi đọc categories/songs

- ✅ Đảm bảo user đã đăng nhập
- ✅ Deploy rules: `firebase deploy --only firestore:rules`
- ✅ Kiểm tra rules trong Firebase Console

### Lỗi: "Permission denied" khi update analytics

- ✅ Đảm bảo user đã đăng nhập
- ✅ Rules đã cho phép authenticated users update analytics

### Lỗi: "Permission denied" khi admin tạo/sửa bài hát

- ✅ Kiểm tra user có role "admin" trong Firestore
- ✅ Collection `users/{userId}` có field `role: "admin"`

## Kiểm tra User Role

1. Vào Firebase Console > Firestore Database
2. Tìm collection `users`
3. Tìm document với email của bạn
4. Kiểm tra field `role` có giá trị `"admin"` không

Nếu chưa có, cập nhật:

```json
{
  "name": "Your Name",
  "email": "your@email.com",
  "role": "admin",
  "completedSongs": [],
  "playlist": []
}
```

---

**Sau khi deploy rules, khởi động lại ứng dụng và test lại!**






