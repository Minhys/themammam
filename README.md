# 🥔 The Măm Măm — Tiệm Bánh & Ăn Vặt Đà Lạt

> **Thương hiệu ẩm thực thành lập năm 2026** · Chuyên bánh tươi nướng mỗi ngày, khoai tây sấy giòn thượng hạng và các món ăn vặt đặc sản Đà Lạt chuẩn an toàn vệ sinh thực phẩm.

---

## 🌟 Điểm Nổi Bật Của Dự Án

- **Thực Đơn Phong Phú (106 Món)**: Thông tin chi tiết từng món bánh (hàm lượng Calo, hạn sử dụng, phân loại ship gần/xa, ảnh minh họa chất lượng cao).
- **Trải Nghiệm Mua Sắm Chuẩn App (Mobile-First)**: Giao diện responsive mượt mà trên mọi thiết bị di động, giỏ hàng trực quan, hỗ trợ tính phí giao hàng tự động và mã giảm giá.
- **Bảo Mật Voucher Ngẫu Nhiên 5 Ký Tự**: Hệ thống sinh mã voucher động mã hóa SHA-256 kèm cơ chế Rate-limit, chống brute-force và chống giả mạo mã giảm giá.
- **Mini-Game Vui Nhộn**: Trò chơi gõ thìa vào củ khoai tây né tránh trong 10s để nhận lượt quay Vòng Quay May Mắn trúng eVoucher hấp dẫn (5%, 10%, 15%).
- **Tích Hợp Chat Telegram Trực Tuyến**: Khách hàng chat trực tiếp trên web, tin nhắn cùng số điện thoại chuyển tiếp ngay về Telegram Bot cho đội ngũ trực hỗ trợ.
- **Trang Quản Trị Admin Riêng (`admin.html`)**: Quản lý đơn hàng, duyệt thanh toán MoMo QR, thống kê doanh thu và quản lý danh sách khách cần hỗ trợ (Leads). Đăng nhập an toàn qua popup tài khoản.
- **Chính Sách & Tiêu Chuẩn ATTP (`chinh-sach.html`)**: Đầy đủ cam kết chất lượng chuẩn Bộ Y Tế.

---

## 🚀 Hướng Dẫn Triển Khai Lên Cloudflare Pages

Dự án được tối ưu 100% dạng Static Web hiện đại, sẵn sàng triển khai lên **Cloudflare Pages** trong vòng 1 phút mà không cần cấu hình phức tạp:

1. **Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/)** -> Chọn menu **Compute (Workers & Pages)** -> **Create application** -> Tab **Pages** -> **Connect to Git**.
2. **Chọn Repository**: `Minhys/themammam`.
3. **Cấu hình bản build (Set up builds and deployments)**:
   - **Project name**: `themammam`
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: *(Để trống)*
   - **Build output directory**: *(Để trống hoặc `/`)*
4. Bấm **Save and Deploy**.
5. Trang web của bạn sẽ hoạt động ngay lập tức trên tên miền miễn phí dạng:  
   👉 `https://themammam.pages.dev` (hỗ trợ liên kết tên miền riêng tùy chỉnh kèm HTTPS miễn phí).

---

## 💻 Chạy Thử Nghiệm Tại Local

```bash
# Mở thư mục dự án
cd mammam

# Chạy server cục bộ bằng Python tích hợp sẵn
python3 server.py
# hoặc
python3 -m http.server 3000

# Truy cập trình duyệt:
# http://127.0.0.1:3000/index.html (Trang bán hàng)
# http://127.0.0.1:3000/admin.html (Trang quản trị)
```

---

## 📁 Cấu Trúc Dự Án

```
themammam/
├── index.html                  # Trang bán hàng & đặt món chính
├── admin.html                  # Trang quản trị đơn hàng & quản lý
├── chinh-sach.html             # Chính sách chất lượng & ATTP
├── config.json                 # Cấu hình Store & Telegram Bot
├── server.py                   # Server Python dev & webhook Telegram
├── TELEGRAM_SETUP_GUIDE.md     # Hướng dẫn chi tiết cấu hình Telegram
├── _headers                    # Cấu hình Cache & Security Headers cho Cloudflare
├── .gitignore                  # Bỏ qua file rác hệ thống
├── css/
│   └── style.css               # Hệ thống Style, Animations & Responsive
├── js/
│   ├── app.js                  # Logic ứng dụng, giỏ hàng, auth, modals
│   ├── data.js                 # Dữ liệu thực đơn 106 món
│   └── voucher-security.js     # Engine bảo mật tạo mã voucher 5 ký tự
└── assets/                     # Logo thương hiệu, hình ảnh sản phẩm & icon
```

---

## 🛡️ Bản Quyền & Giấy Phép

© 2026 **The Măm Măm** — Tiệm Bánh & Ăn Vặt Đà Lạt. Tất cả quyền được bảo lưu.
