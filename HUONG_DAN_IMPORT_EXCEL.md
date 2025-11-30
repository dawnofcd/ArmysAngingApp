# 📊 Hướng dẫn Import Bài hát từ Excel

## Tổng quan

Chức năng import Excel cho phép bạn thêm nhiều bài hát vào hệ thống cùng lúc thông qua file Excel (.xlsx, .xls, hoặc .csv).

## 📋 Format File Excel

### Cấu trúc File

File Excel phải có **dòng đầu tiên là tiêu đề cột**, các dòng tiếp theo là dữ liệu bài hát.

### Các Cột Bắt Buộc

| Tên Cột         | Mô tả                                                          | Ví dụ                      |
| --------------- | -------------------------------------------------------------- | -------------------------- |
| **Tiêu đề**     | Tên bài hát                                                    | "Tiến Quân Ca"             |
| **Tác giả**     | Tác giả bài hát                                                | "Văn Cao"                  |
| **Lời bài hát** | Lời bài hát đầy đủ                                             | "Đoàn quân Việt Nam đi..." |
| **Danh mục**    | Tên danh mục (phải khớp chính xác với danh mục trong hệ thống) | "Bài hát truyền thống"     |

### Các Cột Tùy Chọn

| Tên Cột                  | Mô tả                                  | Ví dụ                                  |
| ------------------------ | -------------------------------------- | -------------------------------------- |
| **Link Video Karaoke**   | Link YouTube embed cho video karaoke   | `https://www.youtube.com/embed/xxxxxx` |
| **Link Video Người hát** | Link YouTube embed cho video người hát | `https://www.youtube.com/embed/yyyyyy` |
| **Năm**                  | Năm sáng tác bài hát                   | `1944`                                 |
| **Ý nghĩa**              | Ý nghĩa, lịch sử bài hát               | "Bài hát được sáng tác năm 1944..."    |

## 📝 Ví dụ File Excel

### Cách 1: File Excel đầy đủ

```
| Tiêu đề          | Tác giả  | Lời bài hát              | Danh mục              | Năm | Link Video Karaoke                    | Link Video Người hát              | Ý nghĩa                    |
|------------------|----------|--------------------------|-----------------------|-----|--------------------------------------|-----------------------------------|----------------------------|
| Tiến Quân Ca     | Văn Cao  | Đoàn quân Việt Nam đi... | Bài hát truyền thống  | 1944| https://www.youtube.com/embed/xxxxxx | https://www.youtube.com/embed/yyy | Bài hát được sáng tác...  |
| Hành Khúc Quốc Ca| Đỗ Nhuận | Này công dân ơi...       | Bài hát truyền thống  | 1945| https://www.youtube.com/embed/aaaaaa | https://www.youtube.com/embed/bbb |                            |
```

### Cách 2: File Excel tối thiểu (chỉ các cột bắt buộc)

```
| Tiêu đề          | Tác giả  | Lời bài hát              | Danh mục              |
|------------------|----------|--------------------------|-----------------------|
| Tiến Quân Ca     | Văn Cao  | Đoàn quân Việt Nam đi... | Bài hát truyền thống  |
| Hành Khúc Quốc Ca| Đỗ Nhuận | Này công dân ơi...       | Bài hát truyền thống  |
```

## 🔍 Lưu Ý Quan Trọng

### 1. Tên Danh Mục

- **Phải khớp chính xác** với tên danh mục trong hệ thống (không phân biệt hoa thường)
- Nếu danh mục không tồn tại, bài hát đó sẽ bị bỏ qua và hiển thị lỗi
- Kiểm tra danh mục trong hệ thống trước khi import: Vào **Admin → Quản lý danh mục**

### 2. Link YouTube

- Phải là link **embed**, không phải link thông thường
- Format: `https://www.youtube.com/embed/VIDEO_ID`
- Ví dụ:
  - ✅ Đúng: `https://www.youtube.com/embed/dQw4w9WgXcQ`
  - ❌ Sai: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
  - ❌ Sai: `https://youtu.be/dQw4w9WgXcQ`

### 3. Năm

- Phải là số nguyên
- Nên trong khoảng 1900 đến năm hiện tại + 10
- Nếu để trống, hệ thống sẽ tự động dùng năm hiện tại

### 4. Lời Bài Hát

- Có thể xuống dòng trong Excel (Alt + Enter)
- Hệ thống sẽ giữ nguyên định dạng xuống dòng

## 📤 Cách Import

### Bước 1: Chuẩn bị File Excel

1. Tạo file Excel với format như hướng dẫn trên
2. Đảm bảo dòng đầu tiên là tiêu đề cột
3. Kiểm tra tên danh mục đã khớp với hệ thống chưa

### Bước 2: Import File

1. Đăng nhập với tài khoản **Admin**
2. Vào **Admin → Quản lý bài hát**
3. Click nút **"Import Excel"** (màu xanh lá)
4. Chọn file Excel của bạn
5. Hệ thống sẽ tự động:
   - Đọc và parse file
   - Validate dữ liệu
   - Hiển thị preview và lỗi (nếu có)

### Bước 3: Xem Trước và Sửa Lỗi

- Xem danh sách bài hát sẽ được import
- Kiểm tra các lỗi validation (nếu có)
- Sửa file Excel và import lại nếu cần

### Bước 4: Xác Nhận Import

1. Click nút **"Import X bài hát"**
2. Hệ thống sẽ import từng batch
3. Xem kết quả: số bài hát thành công/thất bại

## ⚠️ Xử Lý Lỗi

### Lỗi Thường Gặp

#### 1. "Thiếu Tiêu đề"

- **Nguyên nhân**: Cột "Tiêu đề" bị trống
- **Giải pháp**: Điền đầy đủ tiêu đề cho tất cả các dòng

#### 2. "Không tìm thấy danh mục"

- **Nguyên nhân**: Tên danh mục không khớp với hệ thống
- **Giải pháp**:
  - Kiểm tra tên danh mục trong Admin → Quản lý danh mục
  - Sửa tên trong file Excel cho khớp chính xác

#### 3. "Năm không hợp lệ"

- **Nguyên nhân**: Năm không phải số hoặc ngoài phạm vi
- **Giải pháp**: Sửa năm thành số hợp lệ (1900 - năm hiện tại + 10)

#### 4. "File Excel không có dữ liệu"

- **Nguyên nhân**: File trống hoặc không có dữ liệu sau dòng tiêu đề
- **Giải pháp**: Thêm dữ liệu bài hát vào file

## 💡 Mẹo và Best Practices

1. **Tạo File Mẫu**: Tạo một file Excel mẫu với format đúng để dùng lại
2. **Kiểm Tra Trước**: Luôn xem preview trước khi import
3. **Import Từng Phần**: Nếu có nhiều bài hát, có thể chia nhỏ thành nhiều file
4. **Backup Dữ Liệu**: Luôn backup dữ liệu trước khi import số lượng lớn
5. **Test Nhỏ Trước**: Import 1-2 bài hát test trước khi import hàng loạt

## 📊 Giới Hạn

- **Kích thước file**: Không giới hạn (nhưng nên < 10MB để upload nhanh)
- **Số lượng bài hát**: Không giới hạn (hệ thống sẽ tự động chia batch)
- **Batch size**: 250 bài hát/batch (tự động xử lý)

## 🔄 Cập Nhật Sau Import

Sau khi import thành công:

- Tất cả bài hát sẽ xuất hiện trong danh sách
- Analytics (lượt xem, hoàn thành) sẽ được khởi tạo = 0
- Có thể chỉnh sửa từng bài hát như bình thường

## ❓ Câu Hỏi Thường Gặp

**Q: Có thể import file CSV không?**  
A: Có, hệ thống hỗ trợ cả .xlsx, .xls, và .csv

**Q: Nếu một bài hát lỗi, các bài khác có bị ảnh hưởng không?**  
A: Không, hệ thống sẽ bỏ qua bài hát lỗi và tiếp tục import các bài khác

**Q: Có thể import lại file đã import rồi không?**  
A: Có, nhưng sẽ tạo bài hát trùng lặp. Nên xóa bài hát cũ trước khi import lại

**Q: Làm sao biết bài hát nào đã import thành công?**  
A: Sau khi import, hệ thống sẽ hiển thị số lượng thành công/thất bại. Kiểm tra danh sách bài hát để xác nhận

---

**Cần hỗ trợ?** Vui lòng liên hệ admin hoặc xem thêm tài liệu trong `README.md`
