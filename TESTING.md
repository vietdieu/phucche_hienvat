# Quy Trình Kiểm Thử Đa Trình Duyệt & Tối Ưu Hiệu Suất (Quality Manual)

Tài liệu này đặc tả quy trình kiểm định chất lượng hiển thị, khả năng tương thích của tệp tin báo cáo PDF và tối ưu hóa tính năng chuyển giao trên các nền tảng trình duyệt hàng đầu.

---

## 🛠️ Trình duyệt Mục tiêu (Target Platforms)
1. **Google Chrome & Microsoft Edge (Blink Engine)**: Môi trường chính, hỗ trợ hoạt họa và xử lý canvas hoàn hảo.
2. **Mozilla Firefox (Gecko Engine)**: Đặc biệt lưu tâm hiển thị CSS variables và tỷ lệ khung Iframe.
3. **Apple Safari - macOS & iOS (WebKit Engine)**: Chú ý chính sách bảo mật máy ảnh, cử chỉ vuốt và xử lý bộ nhớ ảo PDF.

---

## 📋 Hạng mục Kiểm thử Thủ công (Manual Test Catalog)

### 1. Hệ Thống Chọn Giao Diện Động (Theme Preference Engine)
- [ ] **Kiểm thử hiển thị màu sắc**:
  - Chọn tuần tự đủ 6 bảng màu: Hổ phách, Ngọc lục bảo, Xanh dương, Tím, Hồng, Đá cẩm thạch.
  - Xác nhận rằng các thành phần giao diện chính như các nút điều hướng cốt lõi thay đổi viền và sắc tố chính xác.
- [ ] **Kiểm thử giãn cách (Density)**:
  - Bật chế độ "Gọn gàng": Kiểm tra dữ liệu được dồn gọn để hiển thị tối đa, lý tưởng cho bảng biểu.
  - Bật chế độ "Rộng rãi": Xác thực các thẻ hiển thị thoáng đạt, phù hợp hiển thị ảnh chất lượng cao.
- [ ] **Lưu trữ cục bộ (Persistence)**:
  - Đóng và mở lại trình duyệt hoặc tải lại trang (F5).
  - Đảm bảo các cài đặt về font, màu sắc và giãn cách được phục hồi nguyên vẹn từ `localStorage`.

### 2. Trình Xuất Bản Báo Cáo Di Sản PDF (High-Performance PDF Engineering)
- [ ] **Kiểm tra tính năng tải xuống trực tiếp**:
  - Click "Xuất PDF Báo Cáo".
  - Chọn mẫu (Modern/Classic/Minimal) và bấm "Tải PDF Xuống máy".
  - Xác nhận tệp tải xuống có kích thước hợp lệ và mở được bình thường trên Acrobat Reader hoặc PDF viewer mặc định của máy.
- [ ] **Đồng bộ hóa Google Drive**:
  - Thực hiện xác thực và tải trực tiếp tệp PDF lên kho lưu trữ đám mây.
  - Kiểm tra tính trọn vẹn của tệp đã tải lên.

---

## 🚀 Tối ưu hóa Hiệu suất (Performance Audits)

### ⚡ Giải pháp Memo hóa (React.memo Techniques)
1. **`PDFDocument` & `MultiPDFDocument`**: Đã được bao gói toàn diện trong `React.memo` giúp trình duyệt bỏ qua việc dịch mã cấu trúc tài liệu đồ sộ khi người dùng thao thác giao diện phụ (nhập liệu note, kích hoạt máy đĩa than cổ...).
2. **`React.useMemo` trong phím bấm xuất bản**: Chặn hoàn toàn việc tái khởi dựng các thẻ `<Document>` động bên dưới nền trừ khi hiện vật cốt lõi hoặc mẫu thiết kế được thay đổi bởi hành vi của giáo sư khảo cứu.

---

## 🧪 Chạy Kiểm thử Tự động qua Playwright (Automated Testing suite)

Hệ thống đã chuẩn bị sẵn file kịch bản tương tác tại `/scripts/test-cross-browser.js`.

### Các bước chạy:
```bash
# 1. Cài đặt môi trường kiểm thử Playwright
npm install -D @playwright/test

# 2. Khởi tạo tác vụ kiểm thử tự động
npx playwright test scripts/test-cross-browser.js
```
