# 👨‍💼 Hướng dẫn Tạo Tài khoản Admin

## Cách 1: Tạo Admin qua Firebase Console (Khuyến nghị)

### Bước 1: Đăng ký tài khoản thường

1. Mở ứng dụng và đăng ký tài khoản mới
2. Hoặc đăng nhập với tài khoản Google
3. Ghi nhớ email bạn đã dùng

### Bước 2: Vào Firebase Console

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project `quandoimusic`
3. Vào **Firestore Database** (bên trái menu)

### Bước 3: Tìm và cập nhật User

1. Trong Firestore, tìm collection `users`
2. Tìm document có `email` trùng với email bạn đã đăng ký
3. Click vào document đó
4. Tìm field `role` (nếu chưa có thì thêm mới)
5. Thay đổi giá trị từ `"user"` thành `"admin"`
6. Click **Update** để lưu

**Ví dụ document:**

```json
{
  "name": "Tên của bạn",
  "email": "your@email.com",
  "role": "admin", // ← Thay đổi từ "user" thành "admin"
  "completedSongs": [],
  "playlist": []
}
```

### Bước 4: Đăng xuất và đăng nhập lại

1. Đăng xuất khỏi ứng dụng
2. Đăng nhập lại
3. Bây giờ bạn sẽ thấy menu **Admin** trong navbar

---

## Cách 2: Tạo Admin bằng Script (Nâng cao)

Nếu bạn muốn tự động hóa, có thể tạo script:

### Tạo file `scripts/set-admin.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... các config khác
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setAdmin(email: string) {
  try {
    // Tìm user theo email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('Không tìm thấy user với email:', email);
      return;
    }

    // Update role thành admin
    const userDoc = snapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), {
      role: 'admin',
    });

    console.log('✅ Đã cập nhật user thành admin:', email);
  } catch (error) {
    console.error('Lỗi:', error);
  }
}

// Chạy: npx tsx scripts/set-admin.ts your@email.com
const email = process.argv[2];
if (email) {
  setAdmin(email);
} else {
  console.log('Usage: npx tsx scripts/set-admin.ts your@email.com');
}
```

---

## Cách 3: Tạo Admin ngay khi đăng ký (Development only)

⚠️ **CHỈ DÙNG CHO DEVELOPMENT!**

Nếu muốn tự động set admin khi đăng ký, sửa `context/AuthContext.tsx`:

```typescript
// Trong hàm register, thay đổi:
const newUser: User = {
  id: userCredential.user.uid,
  name,
  email,
  role: 'admin', // ← Thay đổi từ "user" thành "admin"
  completedSongs: [],
  playlist: [],
};
```

**Lưu ý**: Cách này không an toàn cho production!

---

## ✅ Kiểm tra Admin đã hoạt động

Sau khi set admin, bạn sẽ thấy:

1. ✅ Menu **Admin** xuất hiện trong navbar
2. ✅ Có thể truy cập `/admin` dashboard
3. ✅ Có thể tạo/sửa/xóa categories, songs
4. ✅ Có thể quản lý users

---

## 🔐 Bảo mật

- **KHÔNG** commit file có hardcode admin role
- **KHÔNG** để lộ email admin trong code
- Chỉ set admin qua Firebase Console hoặc script an toàn
- Trong production, nên có quy trình phê duyệt admin

---

## 📝 Lưu ý

- Sau khi cập nhật role, cần **đăng xuất và đăng nhập lại** để refresh token
- Nếu vẫn không thấy menu Admin, kiểm tra:
  - Role đã được cập nhật trong Firestore chưa
  - Đã đăng xuất và đăng nhập lại chưa
  - Clear cache trình duyệt

---

**Cách nhanh nhất: Dùng Cách 1 (Firebase Console)!** 🚀






