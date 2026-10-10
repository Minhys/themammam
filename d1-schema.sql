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

-- 6. BẢNG SẢN PHẨM & THỰC ĐƠN (PRODUCTS)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,                       -- Mã món, ví dụ: MM001
    name TEXT NOT NULL,                        -- Tên món
    category TEXT NOT NULL,                    -- Mã danh mục (banh-que, banh-mi, dac-san-dalat...)
    category_label TEXT,                       -- Tên danh mục hiển thị
    price INTEGER NOT NULL,                    -- Giá bán lẻ (VND)
    original_price INTEGER,                    -- Giá gốc niêm yết (VND)
    unit TEXT DEFAULT 'cái',                   -- Đơn vị tính (ổ, cái, miếng, hũ, hộp...)
    image TEXT,                                -- Đường dẫn ảnh hoặc WebP/Base64
    description TEXT,                          -- Mô tả chi tiết món ăn
    prep_time TEXT DEFAULT '15–25 phút',       -- Thời gian chuẩn bị
    tags_json TEXT,                            -- Mảng JSON tags
    calories TEXT,                             -- Hàm lượng calories
    storage TEXT,                              -- Hướng dẫn bảo quản
    shelf_life TEXT,                           -- Hạn sử dụng (HSD)
    shipping_scope TEXT DEFAULT 'ship-xa',     -- 'ship-xa' (Toàn quốc) hoặc 'ship-gan' (Đà Lạt)
    shipping_badge TEXT DEFAULT '✈️ Ship toàn quốc',
    shipping_note TEXT,
    in_stock INTEGER DEFAULT 1,                -- 1 = Còn hàng, 0 = Tạm hết
    is_deleted INTEGER DEFAULT 0,              -- 0 = Hoạt động, 1 = Đã xóa
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_deleted ON products(is_deleted);

-- 7. BẢNG NHẬT KÝ BẢO MẬT & HÀNH ĐỘNG ADMIN (ADMIN AUDIT LOGS)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,                      -- LOGIN, EDIT_PRODUCT, ADD_PRODUCT, DELETE_PRODUCT, CHANGE_PASSWORD...
    target_id TEXT,                            -- ID sản phẩm hoặc đối tượng bị tác động
    details_json TEXT,                         -- Chi tiết thay đổi
    ip_address TEXT,                           -- Địa chỉ IP của Client qua Cloudflare Edge
    user_agent TEXT,                           -- Trình duyệt & thiết bị
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_logs(created_at DESC);

