# 🔧 Hướng dẫn Cấu hình Environment Variables

## ⚠️ Lỗi: Firebase API Key không hợp lệ

Nếu bạn gặp lỗi `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`, hãy làm theo các bước sau:

## Bước 1: Tạo file `.env.local` trong thư mục gốc

Tạo file `.env.local` trong thư mục gốc của dự án (cùng cấp với `package.json`), **KHÔNG** phải trong thư mục `app/`.

## Bước 2: Thêm nội dung sau vào file `.env.local`

**Lưu ý quan trọng:**

- ❌ KHÔNG có dấu phẩy (`,`) ở cuối
- ❌ KHÔNG có dấu ngoặc kép (`"`) bao quanh giá trị
- ✅ Mỗi dòng một biến
- ✅ Không có khoảng trắng thừa

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBuPz1z_iNrfLSG1UoqQ9JGdVT_9bU4svM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=quandoimusic.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=quandoimusic
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=quandoimusic.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1015764261514
NEXT_PUBLIC_FIREBASE_APP_ID=1:1015764261514:web:cf90fadb873d17ba47ab73
```

## Bước 3: Khởi động lại Development Server

Sau khi tạo file `.env.local`, **BẮT BUỘC** phải khởi động lại server:

1. Dừng server hiện tại (Ctrl + C)
2. Chạy lại:

```bash
npm run dev
```

## ✅ Kiểm tra

Sau khi khởi động lại, lỗi API key sẽ biến mất.

## 📝 Lưu ý

- File `.env.local` đã được thêm vào `.gitignore`, nên sẽ không bị commit lên Git
- Nếu bạn thay đổi giá trị trong `.env.local`, phải khởi động lại server
- Đảm bảo không có khoảng trắng thừa hoặc ký tự đặc biệt

## 🔍 Nếu vẫn gặp lỗi

1. Kiểm tra file `.env.local` có đúng vị trí không (thư mục gốc, không phải `app/`)
2. Kiểm tra format không có dấu phẩy, dấu ngoặc kép
3. Đảm bảo đã khởi động lại server
4. Xóa `.next` folder và build lại:

```bash
rm -rf .next
npm run dev
```




