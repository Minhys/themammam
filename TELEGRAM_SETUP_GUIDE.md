# HƯỚNG DẪN CẤU HÌNH TELEGRAM BOT CHO TIỆM THE MĂM MĂM

Tài liệu này hướng dẫn bạn cách tạo Bot Telegram và kết nối vào hệ thống **The Măm Măm** để khi khách hàng bấm **"Chat Cho Tiệm"** và nhập **Họ tên, Số điện thoại, Lời nhắn tư vấn**, thông báo sẽ gửi tức thì về Telegram của đội ngũ hỗ trợ để team có thể chat hoặc bấm gọi lại ngay lập tức!

---

## 📌 BƯỚC 1: TẠO BOT TELEGRAM (LẤY BOT TOKEN)

1. Mở ứng dụng **Telegram** trên điện thoại hoặc máy tính.
2. Tìm kiếm bot chính thức của Telegram: **`@BotFather`** (có tích xanh xác thực).
3. Bấm **Start** hoặc gõ lệnh:
   ```text
   /newbot
   ```
4. **Đặt tên hiển thị cho Bot**: Ví dụ: `The Măm Măm Support`
5. **Đặt Username cho Bot**: Phải kết thúc bằng chữ `bot`, ví dụ: `themammam_order_bot` hoặc `themammam_care_bot`.
6. `@BotFather` sẽ gửi lại cho bạn một đoạn mã **HTTP API Token**, có dạng:
   ```text
   7123456789:AAHk7vXXXXXXXXXXXXX-YYYYYYYYYY
   ```
   👉 *Đây chính là **Bot Token** cần dùng.*

---

## 📌 BƯỚC 2: LẤY CHAT ID (NƠI NHẬN TIN NHẮN)

Bạn có thể chọn nhận tin nhắn vào **Tài khoản cá nhân** của bạn hoặc vào **Group chat chung của team**:

### Cách A: Nhận về tài khoản cá nhân của bạn
1. Trên Telegram, tìm bot **`@userinfobot`** hoặc **`@RawDataBot`**.
2. Bấm **Start** (hoặc gửi `/start`).
3. Bot sẽ trả về `Id: 123456789` (một chuỗi số gồm 9–10 chữ số).
4. 👉 *Đây chính là **Chat ID** của bạn.*
5. **LƯU Ý QUAN TRỌNG:** Bạn cần mở Bot của bạn vừa tạo ở Bước 1 và bấm **Start** một lần để cho phép Bot nhắn tin cho bạn!

### Cách B: Nhận về Group chat chung của tiệm (Nhiều người cùng trực)
1. Tạo một Group Telegram mới (ví dụ: `[Team Trực Chat] The Măm Măm`).
2. Thêm Bot bạn vừa tạo ở Bước 1 vào Group.
3. Cấp quyền **Admin** cho Bot trong nhóm.
4. Thêm bot **`@RawDataBot`** vào nhóm để xem thông tin Group ID (Group ID Telegram thường bắt đầu bằng dấu trừ, ví dụ: `-1001987654321` hoặc `-987654321`). Sau đó bạn có thể xóa `@RawDataBot` khỏi nhóm.
5. 👉 *Chuỗi số này (kèm dấu trừ `-`) chính là **Chat ID** của Group.*

---

## 📌 BƯỚC 3: NHẬP VÀO HỆ THỐNG (CÓ 3 CÁCH RẤT DỄ DÀNG)

### 🌟 Cách 1: Nhập trực tiếp trên Giao Diện Quản Trị Admin (Khuyên Dùng)
1. Mở trang quản trị: **`http://127.0.0.1:3000/admin.html`**
2. Đăng nhập tài khoản Admin:
   - **Tên đăng nhập:** `admin`
   - **Mật khẩu:** `themammam2026`
3. Kéo xuống phần **"⚙️ CẤU HÌNH HỆ THỐNG & TÀI KHOẢN ADMIN"** -> thẻ màu xanh **"✈️ Cấu Hình Telegram Bot"**:
   - **Bot Token**: Dán mã API Token từ `@BotFather`
   - **Chat ID**: Dán Chat ID cá nhân hoặc ID Group
   - **Bot Username**: Ví dụ `themammam_order_bot`
4. Bấm nút **"🧪 Gửi Thử Tin Nhắn Test"** -> Nếu Telegram của bạn nhận được tin nhắn tức thì là đã thành công 100%!
5. Bấm **"💾 Lưu Cấu Hình Telegram"**.

---

### 🌟 Cách 2: Cấu hình trong file Backend `config.json`
Mở file [mammam/config.json](file:///Users/user/Desktop/kit/mammam/config.json) và điền:
```json
{
  "telegram": {
    "bot_token": "7123456789:AAHk7vXXXXXXXXXXXXX-YYYYYYYYYY",
    "chat_id": "-1001987654321",
    "bot_username": "themammam_order_bot"
  }
}
```

---

### 🌟 Cách 3: Cấu hình mặc định trong file `js/data.js`
Mở file [mammam/js/data.js](file:///Users/user/Desktop/kit/mammam/js/data.js), tại mục `telegram`:
```javascript
  telegram: {
    botToken: '7123456789:AAHk7vXXXXXXXXXXXXX-YYYYYYYYYY',
    chatId: '-1001987654321',
    botUsername: 'themammam_order_bot'
  },
```

---

## 📱 GIAO DIỆN HIỂN THỊ KHI KHÁCH BẤM CHAT

Khi khách bấm vào nút **"💬 Chat Cho Tiệm"** ở góc phải màn hình:
1. Popup hiện ra yêu cầu:
   - **Họ và tên của bạn** (Ví dụ: `Nguyễn Thị Lan`)
   - **Số điện thoại liên hệ** (Ví dụ: `0909 123 456`)
   - **Nội dung tư vấn** (Ví dụ: `Tiệm ơi ship cho mình 3 hộp khoai tây sấy rong biển qua Quận 3 nhé`)
2. Khách bấm **"🚀 Gửi Tin Nhắn Cho Tiệm"**:
3. Ngay lập tức, Telegram của bạn nhận được tin nhắn định dạng chuyên nghiệp:
   ```text
   🛎️ KHÁCH CHAT TƯ VẤN - THE MĂM MĂM
   ━━━━━━━━━━━━━━━━━━━━
   👤 Khách hàng: Nguyễn Thị Lan
   📞 Số điện thoại: 0909123456
   💬 Lời nhắn:
   Tiệm ơi ship cho mình 3 hộp khoai tây sấy rong biển qua Quận 3 nhé
   ━━━━━━━━━━━━━━━━━━━━
   ⏰ Thời gian: 14:30 09/10/2026
   🌐 Nguồn: Website The Măm Măm
   👉 Bấm số điện thoại trên để gọi lại ngay cho khách!
   ```
4. Đồng thời, toàn bộ thông tin khách hàng cũng được lưu tự động vào bảng **"💬 NHẬT KÝ KHÁCH CHAT CHO TIỆM (LEADS)"** trong trang Admin `admin.html` để nhân viên phụ trách không bao giờ bị sót khách!
