/**
 * Script để khởi tạo dummy data
 * Chạy: npx tsx scripts/init-dummy-data.ts
 * 
 * Lưu ý: Cần cấu hình Firebase credentials trước
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs } from "firebase/firestore";

// Firebase config - thay thế bằng config thực tế
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dummyData = {
  categories: [
    {
      id: "military",
      name: "Bài hát quân đội",
      description: "Các bài hát truyền thống quân đội Việt Nam",
    },
  ],
  songs: [
    {
      id: "song1",
      title: "Hồn Tráng Sĩ",
      author: "Nguyễn Văn A",
      lyrics: `Lời bài hát dòng 1
Lời bài hát dòng 2
Lời bài hát dòng 3
Lời bài hát dòng 4`,
      videoLinkKaraoke: "https://www.youtube.com/embed/xxxxxx",
      videoLinkPerformance: "https://www.youtube.com/embed/yyyyyy",
      categoryId: "military",
      year: 1975,
      meaning: "Bài hát ca ngợi tinh thần chiến đấu của người lính Việt Nam.",
    },
  ],
};

async function initDummyData() {
  try {
    console.log("Bắt đầu khởi tạo dummy data...");

    // Check if categories already exist
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    if (categoriesSnapshot.empty) {
      console.log("Tạo categories...");
      for (const category of dummyData.categories) {
        await setDoc(doc(db, "categories", category.id), {
          name: category.name,
          description: category.description,
          createdAt: Date.now(),
        });
      }
      console.log("✓ Đã tạo categories");
    } else {
      console.log("Categories đã tồn tại, bỏ qua...");
    }

    // Check if songs already exist
    const songsSnapshot = await getDocs(collection(db, "songs"));
    if (songsSnapshot.empty) {
      console.log("Tạo songs...");
      for (const song of dummyData.songs) {
        await setDoc(doc(db, "songs", song.id), {
          title: song.title,
          author: song.author,
          lyrics: song.lyrics,
          videoLinkKaraoke: song.videoLinkKaraoke,
          videoLinkPerformance: song.videoLinkPerformance,
          categoryId: song.categoryId,
          year: song.year,
          meaning: song.meaning,
          createdAt: Date.now(),
        });

        // Create analytics entry
        await setDoc(doc(db, "analytics", song.id), {
          views: 0,
          completions: 0,
          likes: 0,
        });
      }
      console.log("✓ Đã tạo songs");
    } else {
      console.log("Songs đã tồn tại, bỏ qua...");
    }

    console.log("✓ Hoàn thành khởi tạo dummy data!");
  } catch (error) {
    console.error("Lỗi khi khởi tạo dummy data:", error);
    process.exit(1);
  }
}

initDummyData();







