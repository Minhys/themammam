# 🛡️ BÁO CÁO KIỂM TRA BẢO MẬT & HƯỚNG DẪN CHUYỂN DỮ LIỆU SANG CLOUDFLARE D1

Tài liệu này phân tích chi tiết các rủi ro bảo mật thực tế khi ứng dụng chạy ở tầng Client (trình duyệt người dùng), nguy cơ khi sử dụng DevTools (F12) để xem mã nguồn/thông tin khách hàng, và giải pháp chuyển đổi toàn diện sang **Cloudflare D1 Database + Cloudflare Workers Serverless API**.

---

## 1. 🔍 ĐÁNH GIÁ CÁC RỦI RO BẢO MẬT HIỆN TẠI (CLIENT-SIDE RISK AUDIT)

### ⚠️ Rủi ro 1: Sử dụng DevTools (F12) đọc thông tin khách hàng trong `localStorage`
* **Nguyên lý:** Hiện tại giỏ hàng, thông tin khách hàng (`mammam_guest_info`), lịch sử đơn hàng (`mammam_orders_db`), và tin nhắn tư vấn (`mammam_chat_leads`) được lưu trong `localStorage` của trình duyệt.
* **Nguy cơ thực tế:** 
  * Bất kỳ ai mở DevTools (phím `F12` hoặc Click chuột phải $\rightarrow$ *Inspect* $\rightarrow$ Tab *Application* $\rightarrow$ *Local Storage*) đều đọc được toàn bộ danh bạ khách hàng gồm: **Họ tên, Số điện thoại, Địa chỉ giao hàng cụ thể, Món ăn đã đặt, và Lời nhắn tư vấn**.
  * Nếu thiết bị được chia sẻ hoặc bị tấn công XSS (Cross-Site Scripting), dữ liệu nhạy cảm của khách hàng sẽ bị trích xuất toàn bộ mà máy chủ không hề hay biết.

### ⚠️ Rủi ro 2: Bypass đăng nhập Admin thông qua Console
* **Nguyên lý:** Trước đây trang `admin.html` kiểm tra cờ đăng nhập bằng `localStorage.getItem('mammam_admin_logged') === 'true'` và mật khẩu mặc định nằm trực tiếp trong file mã nguồn JavaScript.
* **Nguy cơ thực tế:** 
  * Kẻ xấu chỉ cần mở Tab **Console** trong DevTools và gõ lệnh:
    ```javascript
    localStorage.setItem('mammam_admin_logged', 'true'); location.reload();
    ```
    là có thể lập tức vượt qua lớp bảo vệ và vào xem dashboard quản trị mà không cần nhập mật khẩu!
  * Mật khẩu quản trị hiển thị dưới dạng văn bản thuần (*cleartext*) trong Tab *Sources*, ai cũng có thể tìm kiếm được.

### ⚠️ Rủi ro 3: Lộ Telegram Bot Token trong Network Tab
* **Nguyên lý:** Khi khách hàng gửi tin nhắn "Chat Cho Tiệm" từ trình duyệt trực tiếp tới API `https://api.telegram.org/bot<TOKEN>/sendMessage`, chuỗi Token của Bot sẽ hiện rõ trong Tab **Network**.
* **Nguy cơ thực tế:**
  * Kẻ xấu có thể lấy cắp Bot Token để chiếm quyền điều khiển Bot, xóa webhook, đọc trộm tin nhắn khách hàng hoặc dùng Bot để gửi tin nhắn rác.

### ⚠️ Rủi ro 4: Gian lận giá đơn hàng & Voucher
* **Nguyên lý:** Nếu không có Server kiểm tra lại giá, người dùng am hiểu kỹ thuật có thể dùng Console sửa biến `state.cart[0].price = 1000` hoặc tự sinh mã giảm giá 90% rồi bấm Đặt Hàng.

---

## 2. 🏰 GIẢI PHÁP TRIỆT ĐỂ: CLOUDFLARE D1 + WORKERS BACKEND API

Để giải quyết triệt để 100% các rủi ro trên theo chuẩn bảo mật hiện đại:
> **Nguyên tắc vàng:** "Tuyệt đối không tin tưởng phía Client (Never trust the client)". Mọi dữ liệu khách hàng, giá tiền, voucher và phân quyền Admin phải được lưu trữ và kiểm soát độc quyền tại Server (Cloudflare Edge).

Hệ thống đã được thiết kế sẵn 2 thành phần cốt lõi:
1. **`d1-schema.sql`**: Bản thiết kế cơ sở dữ liệu quan hệ SQL chuẩn hóa chạy trên **Cloudflare D1** (Bảng `orders`, `users`, `vouchers`, `chat_leads`, `admin_users`).
2. **`_worker.js`**: Backend API Serverless chạy tại biên mạng Cloudflare, tiếp nhận các request bảo mật:
   * `POST /api/orders`: Tự động tính toán lại giá tiền từ cơ sở dữ liệu (chống sửa giá), kiểm tra voucher hợp lệ từ D1, lưu đơn vào D1, và kích hoạt thông báo Telegram an toàn từ Server.
   * `POST /api/chat-lead`: Nhận thông tin tư vấn, lưu vào D1 và gửi Telegram mà **không để lộ Bot Token cho trình duyệt**.
   * `POST /api/admin/login`: Băm mật khẩu bằng SHA-256 kèm Salt bí mật, trả về Signed Token có thời hạn (chống bypass bằng Console).
   * `GET /api/admin/orders`: Yêu cầu Bearer Token hợp lệ mới cho phép đọc đơn hàng từ D1.

---

## 3. 🚀 HƯỚNG DẪN 3 BƯỚC CHUYỂN DỮ LIỆU SANG CLOUDFLARE D1

### Bước 1: Khởi tạo Database D1 trên Cloudflare
Bạn có thể tạo bằng 1 trong 2 cách:

#### Cách A: Dùng giao diện Web Cloudflare Dashboard
1. Truy cập [dash.cloudflare.com](https://dash.cloudflare.com/) $\rightarrow$ Chọn **Storage & Databases** $\rightarrow$ **D1 SQL Database**.
2. Bấm nút **Create database** $\rightarrow$ Đặt tên: `themammam_db`.
3. Bấm **Create**. Sau khi tạo xong, copy chuỗi **Database ID** (dạng `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
4. Mở file `wrangler.json` trong dự án, dán `database_id` của bạn vào:
   ```json
   "d1_databases": [
     {
       "binding": "DB",
       "database_name": "themammam_db",
       "database_id": "DÁN_DATABASE_ID_CỦA_BẠN_VÀO_ĐÂY"
     }
   ]
   ```

#### Cách B: Dùng lệnh Wrangler CLI qua Terminal
Chạy lệnh trong thư mục dự án:
```bash
npx wrangler d1 create themammam_db
```
Lệnh sẽ trả về đoạn cấu hình binding, bạn chỉ cần copy vào `wrangler.json`.

---

### Bước 2: Nạp cấu trúc bảng (Schema SQL) vào Database D1
Chạy lệnh sau trên terminal để tạo toàn bộ bảng dữ liệu vào Cloudflare D1 từ file `d1-schema.sql`:
```bash
npx wrangler d1 execute themammam_db --remote --file=./d1-schema.sql
```
*(Nếu muốn kiểm tra thử ở môi trường local trước, bạn dùng cờ `--local` thay cho `--remote`)*.

---

### Bước 3: Cấu hình Secret bí mật (Che giấu Token Telegram & Khóa Admin)
Thay vì để Bot Token trong code client, hãy lưu trực tiếp vào kho khóa bí mật Cloudflare Secrets:
```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
# Nhập chuỗi bot token của bạn (ví dụ: 123456789:ABCdefGHI...)

npx wrangler secret put TELEGRAM_CHAT_ID
# Nhập chat ID của bạn (ví dụ: 597123456)

npx wrangler secret put ADMIN_SECRET_KEY
# Nhập một chuỗi ký tự ngẫu nhiên bất kỳ làm khóa ký token đăng nhập
```

Sau khi cấu hình xong, deploy lại dự án:
```bash
git add .
git commit -m "feat: complete D1 database and secure serverless backend"
git push origin main
```

---

## 4. 📊 BẢNG SO SÁNH TRƯỚC VÀ SAU KHI CHUYỂN SANG CLOUDFLARE D1

| Tiêu Chí Bảo Mật | Trước Khi Chuyển (Chỉ Client) | Sau Khi Chuyển Sang Cloudflare D1 |
| :--- | :--- | :--- |
| **Lưu trữ thông tin khách hàng** | Nằm trong `localStorage` máy khách, dễ bị đọc qua F12. | Nằm trong **Cloudflare D1 SQL Database** mã hóa tại Server. |
| **Xem mã nguồn bằng DevTools** | Thấy được logic tạo voucher, token telegram. | Chỉ thấy giao diện UI. Mọi logic bảo mật nằm trong Worker `_worker.js`. |
| **Telegram Bot Token** | Lộ trong Network Tab khi gửi tin nhắn. | **Ẩn hoàn toàn** trong Cloudflare Secret. Trình duyệt không biết token. |
| **Gian lận giá & Voucher** | Có thể sửa biến javascript trên Console. | **Server tự tính toán lại giá** và kiểm tra từng voucher trong D1. |
| **Đăng nhập Admin** | Có thể vượt qua bằng lệnh Console đơn giản. | Phải có **Signed Bearer Token** được ký bằng mật mã bí mật từ Server. |
| **Khả năng mở rộng & Sao lưu** | Dữ liệu mất nếu khách xóa cache trình duyệt. | Cơ sở dữ liệu Cloudflare D1 lưu trữ vĩnh viễn, sao lưu tự động toàn cầu. |
