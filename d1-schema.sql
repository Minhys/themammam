-- ═══════════════════════════════════════════════════════════════════
-- THE MĂM MĂM - CLOUDFLARE D1 DATABASE SCHEMA
-- Hệ thống cơ sở dữ liệu Edge SQL bảo mật cho đơn hàng, khách hàng & voucher
-- ═══════════════════════════════════════════════════════════════════

-- 1. BẢNG KHÁCH HÀNG & THÀNH VIÊN (USERS)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    city TEXT,
    address TEXT,
    points INTEGER DEFAULT 50,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 2. BẢNG ĐƠN HÀNG (ORDERS)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,                       -- Mã đơn hàng, ví dụ: MM-2610-8492
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    note TEXT,
    items_json TEXT NOT NULL,                  -- Danh sách món dạng JSON an toàn
    subtotal INTEGER NOT NULL,                 -- Tiền hàng gốc
    discount_amount INTEGER DEFAULT 0,         -- Số tiền được giảm
    shipping_fee INTEGER DEFAULT 0,            -- Phí vận chuyển
    total_amount INTEGER NOT NULL,             -- Tổng tiền thanh toán cuối cùng
    voucher_code TEXT,                         -- Mã giảm giá áp dụng
    payment_method TEXT DEFAULT 'COD',         -- 'COD' hoặc 'MOMO'
    status TEXT DEFAULT 'pending',             -- 'pending', 'confirmed', 'shipping', 'completed', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- 3. BẢNG MÃ GIẢM GIÁ (VOUCHERS)
CREATE TABLE IF NOT EXISTS vouchers (
    code TEXT PRIMARY KEY,                     -- Mã 5-8 ký tự ngẫu nhiên
    discount_percent INTEGER DEFAULT 0,        -- Phần trăm giảm (ví dụ: 10, 15, 20)
    discount_fixed INTEGER DEFAULT 0,          -- Tiền mặt giảm (ví dụ: 30000, 50000)
    min_order INTEGER DEFAULT 0,               -- Đơn tối thiểu để áp dụng
    max_discount INTEGER DEFAULT 0,            -- Số tiền giảm tối đa (0 = không giới hạn)
    max_uses INTEGER DEFAULT 100,              -- Số lượt dùng tối đa
    used_count INTEGER DEFAULT 0,              -- Số lượt đã dùng
    is_active INTEGER DEFAULT 1,               -- 1 = Đang kích hoạt, 0 = Khóa
    expires_at DATETIME,                       -- Thời điểm hết hạn
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Thêm các voucher mặc định
INSERT OR IGNORE INTO vouchers (code, discount_percent, min_order, max_uses, is_active)
VALUES 
    ('GIAM10', 10, 100000, 1000, 1),
    ('GIAM15', 15, 150000, 1000, 1),
    ('GIAM20', 20, 200000, 500, 1),
    ('FREESHIP', 0, 200000, 5000, 1);

-- 4. BẢNG TIN NHẮN TƯ VẤN (CHAT LEADS)
CREATE TABLE IF NOT EXISTS chat_leads (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT DEFAULT 'website_chat',
    status TEXT DEFAULT 'new',                 -- 'new', 'contacted', 'closed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_created ON chat_leads(created_at DESC);

-- 5. BẢNG TÀI KHOẢN QUẢN TRỊ VIÊN (ADMIN USERS)
CREATE TABLE IF NOT EXISTS admin_users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,               -- Băm SHA-256 kèm salt bí mật
    salt TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Mật khẩu mặc định: admin123 (SHA-256 băm kèm salt)
INSERT OR IGNORE INTO admin_users (username, password_hash, salt, role)
VALUES ('admin', '420a4066c10319caab92cb1f2eb0a649c090be4df08a108a7ae79bb77b5a5b5f', 'themammam_salt_2026', 'superadmin');
