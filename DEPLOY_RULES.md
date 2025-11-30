# 🚀 Hướng dẫn Deploy Firestore Rules

## ⚠️ QUAN TRỌNG: Phải deploy rules để ứng dụng hoạt động!

Lỗi "Missing or insufficient permissions" xảy ra vì Firestore rules chưa được deploy lên Firebase.

## Bước 1: Cài đặt Firebase CLI (nếu chưa có)

```bash
npm install -g firebase-tools
```

## Bước 2: Đăng nhập Firebase

```bash
firebase login
```

Mở trình duyệt và đăng nhập với tài khoản Google của bạn.

## Bước 3: Kiểm tra project

```bash
firebase projects:list
```

Đảm bảo project `quandoimusic` có trong danh sách.

## Bước 4: Deploy Rules

```bash
firebase deploy --only firestore:rules
```

Bạn sẽ thấy output tương tự:
```
✔  firestore: released rules firestore.rules to firebase
```

## Bước 5: Xác nhận trong Firebase Console

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project `quandoimusic`
3. Vào **Firestore Database** > **Rules**
4. Kiểm tra rules đã được cập nhật

## Rules đã được sửa

Rules hiện tại cho phép:
- ✅ User có thể tạo document của chính họ khi đăng ký
- ✅ User có thể đọc/update dữ liệu của chính họ
- ✅ Admin có thể quản lý tất cả users
- ✅ Authenticated users có thể đọc categories, songs, analytics
- ✅ Users có thể update analytics (views tracking)

## Nếu vẫn gặp lỗi sau khi deploy

1. **Khởi động lại ứng dụng**:
   ```bash
   # Dừng server (Ctrl + C)
   npm run dev
   ```

2. **Xóa cache trình duyệt** hoặc mở Incognito mode

3. **Kiểm tra user đã đăng nhập**:
   - Mở DevTools > Console
   - Kiểm tra không có lỗi authentication

4. **Kiểm tra rules trong Firebase Console**:
   - Rules phải giống với file `firestore.rules`
   - Không có syntax errors

## Test Rules

Sau khi deploy, test các trường hợp:

1. ✅ Đăng ký user mới → Tạo được document trong `users`
2. ✅ Đăng nhập → Đọc được categories, songs
3. ✅ Xem bài hát → Update được analytics (views)
4. ✅ Admin → Có thể tạo/sửa categories, songs

---

**Sau khi deploy rules, khởi động lại ứng dụng và test lại!**







