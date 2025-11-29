/**
 * Script để migrate users cũ - thêm score và lastActive nếu chưa có
 * Chạy: npx tsx scripts/migrate-user-scores.ts
 * 
 * Lưu ý: Cần cấu hình Firebase credentials trước
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, writeBatch } from "firebase/firestore";

// Firebase config - lấy từ env
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

async function migrateUserScores() {
  try {
    console.log("🔄 Bắt đầu migrate user scores...");

    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
      console.log("ℹ️ Không có users nào trong database.");
      return;
    }

    const batch = writeBatch(db);
    let updateCount = 0;
    const now = Date.now();

    snapshot.docs.forEach((userDoc) => {
      const userData = userDoc.data();
      const updates: any = {};

      // Kiểm tra và thêm score nếu chưa có
      if (userData.score === undefined || userData.score === null) {
        updates.score = 0;
      }

      // Kiểm tra và thêm lastActive nếu chưa có
      if (!userData.lastActive) {
        updates.lastActive = now;
      }

      // Kiểm tra và thêm createdAt nếu chưa có
      if (!userData.createdAt) {
        updates.createdAt = now;
      }

      // Nếu có updates, thêm vào batch
      if (Object.keys(updates).length > 0) {
        batch.update(doc(db, "users", userDoc.id), updates);
        updateCount++;
        console.log(`  📝 User: ${userData.name || userData.email} - sẽ cập nhật:`, updates);
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Đã cập nhật ${updateCount} users!`);
    } else {
      console.log("ℹ️ Tất cả users đã có đầy đủ thông tin (score, lastActive, createdAt).");
    }

    console.log("✓ Hoàn thành migration!");
  } catch (error: any) {
    console.error("❌ Lỗi khi migrate:", error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateUserScores();

