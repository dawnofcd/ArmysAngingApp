/**
 * Image utility functions
 * Nén và resize ảnh để tối ưu hiệu suất
 */

/**
 * Resize và compress ảnh
 * @param file File ảnh gốc
 * @param maxWidth Chiều rộng tối đa (mặc định 200px)
 * @param maxHeight Chiều cao tối đa (mặc định 200px)
 * @param quality Chất lượng (0-1, mặc định 0.8)
 * @returns Promise<File> File ảnh đã được resize và compress
 */
export function compressImage(
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Tính toán kích thước mới giữ nguyên tỷ lệ
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Tạo canvas để resize
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Không thể tạo canvas context"));
          return;
        }

        // Vẽ ảnh đã resize lên canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert sang blob với quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Không thể convert ảnh"));
              return;
            }

            // Tạo File từ blob với tên mới
            const compressedFile = new File(
              [blob],
              file.name,
              {
                type: "image/jpeg", // Luôn convert sang JPEG để tối ưu
                lastModified: Date.now(),
              }
            );
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Lỗi khi load ảnh"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Lỗi khi đọc file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Kiểm tra kích thước file sau khi compress
 */
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024);
}

