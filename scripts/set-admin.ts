/**
 * Script để set user thành admin
 * Chạy: npx tsx scripts/set-admin.ts your@email.com
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

// Firebase config - lấy từ env hoặc thay thế bằng config thực tế
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBuPz1z_iNrfLSG1UoqQ9JGdVT_9bU4svM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "quandoimusic.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "quandoimusic",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "quandoimusic.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1015764261514",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1015764261514:web:cf90fadb873d17ba47ab73",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setAdmin(email: string) {
  try {
    console.log(`🔍 Đang tìm user với email: ${email}...`);

    // Tìm user theo email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("❌ Không tìm thấy user với email:", email);
      console.log("💡 Hãy đảm bảo user đã đăng ký và đăng nhập ít nhất một lần.");
      return;
    }

    // Update role thành admin
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    console.log(`📋 Tìm thấy user: ${userData.name} (${userData.email})`);
    console.log(`📝 Role hiện tại: ${userData.role || "user"}`);
    
    await updateDoc(doc(db, "users", userDoc.id), {
      role: "admin",
    });

    console.log("✅ Đã cập nhật user thành admin!");
    console.log("🔄 Vui lòng đăng xuất và đăng nhập lại trong ứng dụng để thấy menu Admin.");
  } catch (error: any) {
    console.error("❌ Lỗi:", error.message);
    console.error("💡 Đảm bảo bạn đã:");
    console.error("   1. Cấu hình đúng Firebase credentials");
    console.error("   2. Deploy Firestore rules");
    console.error("   3. User đã tồn tại trong Firestore");
  }
}

// Lấy email từ command line arguments
const email = process.argv[2];

if (!email) {
  console.log("📖 Cách sử dụng:");
  console.log("   npx tsx scripts/set-admin.ts your@email.com");
  console.log("");
  console.log("📝 Ví dụ:");
  console.log("   npx tsx scripts/set-admin.ts admin@example.com");
  process.exit(1);
}

setAdmin(email).then(() => {
  process.exit(0);
});









