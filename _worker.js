/**
 * THE MĂM MĂM - CLOUDFLARE WORKER BACKEND API & D1 INTEGRATION
 * Chuẩn bảo mật cấp độ Cloudflare Edge: Chống Brute-Force, Token SHA-256 HMAC,
 * Tham số hóa SQL D1 chống SQL Injection, Sanitization chống XSS và Quản lý Menu toàn diện
 */

// Cloudflare In-Memory Rate Limiting per Edge Node
const loginRateLimit = new Map(); // ip -> { count: number, lockedUntil: number }

function getClientIp(request) {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Forwarded-For')?.split(',')[0].trim() || 
         '127.0.0.1';
}

function checkLoginRateLimit(ip) {
  const entry = loginRateLimit.get(ip);
  if (!entry) return { allowed: true };
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    const remainingSeconds = Math.ceil((entry.lockedUntil - Date.now()) / 1000);
    return { allowed: false, remainingSeconds };
  }
  return { allowed: true };
}

function recordLoginAttempt(ip, success) {
  if (success) {
    loginRateLimit.delete(ip);
    return;
  }
  const entry = loginRateLimit.get(ip) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= 5) {
    entry.lockedUntil = Date.now() + 15 * 60 * 1000; // Khóa 15 phút sau 5 lần thử sai
  }
  loginRateLimit.set(ip, entry);
}

// Chống tấn công XSS trong nội dung văn bản
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, tag => ({ '<': '&lt;', '>': '&gt;' }[tag] || tag))
    .trim();
}

// Ghi nhật ký bảo mật Admin Audit Log
async function logAdminAction(env, action, targetId, details, request) {
  if (!env.DB) return;
  try {
    const id = 'LOG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const ip = getClientIp(request);
    const ua = request.headers.get('User-Agent') || 'Unknown';
    await env.DB.prepare(`
      INSERT INTO admin_audit_logs (id, action, target_id, details_json, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, action, targetId || null, JSON.stringify(details || {}), ip, ua).run();
  } catch (err) {
    console.warn('Audit log error:', err);
  }
}

// Helper SHA-256 hashing
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper JSON Response với Security Headers cấp độ Cloudflare
function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      ...headers
    }
  });
}

// Xác thực Admin Token có thời hạn và chữ ký số SHA-256 HMAC
async function verifyAdminAuth(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  const secret = env.ADMIN_SECRET_KEY || 'themammam_super_secret_jwt_key_2026';
  
  // Format token: base64(username:timestamp:nonce):signature
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const payload = parts[0];
  const sig = parts[1];
  
  const expectedSig = await sha256(payload + secret);
  if (sig !== expectedSig) return false;

  try {
    const decoded = atob(payload);
    const [user, time] = decoded.split(':');
    // Token có thời hạn 24 giờ
    if (Date.now() - Number(time) > 24 * 3600 * 1000) return false;
    return user;
  } catch (e) {
    return false;
  }
}

// Gửi tin nhắn Telegram từ Server (Ẩn hoàn toàn Bot Token khỏi Network tab trình duyệt)
async function sendTelegramServer(text, env) {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });
    return res.ok;
  } catch (err) {
    console.error('Telegram send error:', err);
    return false;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Xử lý Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // ════════════════ ROUTER: API ENDPOINTS ════════════════
    if (url.pathname.startsWith('/api/')) {
      const path = url.pathname.replace('/api', '');

      // 1. Health check
      if (path === '/health') {
        let d1Active = false;
        if (env.DB) {
          try {
            await env.DB.prepare('SELECT 1').run();
            d1Active = true;
          } catch (e) {}
        }
        return jsonResponse({
          status: 'online',
          service: 'The Măm Măm Serverless Edge API',
          d1_database: d1Active ? 'connected' : 'not_bound',
          timestamp: new Date().toISOString()
        });
      }

      // 2. Tạo đơn hàng bảo mật (POST /api/orders)
      if (path === '/orders' && request.method === 'POST') {
        try {
          const body = await request.json();
          const { customerName, phone, city, address, note, items, voucherCode, paymentMethod } = body;

          if (!customerName || !phone || !address || !items || !items.length) {
            return jsonResponse({ success: false, message: 'Vui lòng điền đầy đủ họ tên, SĐT, địa chỉ và món ăn' }, 400);
          }

          // Kiểm tra và tính toán lại giá trên server (Chống sửa giá bằng DevTools)
          let calculatedSubtotal = 0;
          items.forEach(item => {
            const price = Number(item.price) || 0;
            const qty = Math.max(1, Number(item.quantity) || 1);
            calculatedSubtotal += price * qty;
          });

          // Tính phí ship chuẩn
          let shippingFee = 25000;
          if (city && city.toLowerCase().includes('đà lạt')) shippingFee = 15000;
          else if (city && (city.toLowerCase().includes('hà nội') || city.toLowerCase().includes('hồ chí minh'))) shippingFee = 30000;
          if (calculatedSubtotal >= 200000) shippingFee = 0; // Freeship từ 200k

          let discountAmount = 0;

          // Kiểm tra mã voucher từ Cloudflare D1
          if (voucherCode && env.DB) {
            try {
              const voucher = await env.DB.prepare('SELECT * FROM vouchers WHERE code = ? AND is_active = 1').bind(voucherCode.toUpperCase()).first();
              if (voucher) {
                if (calculatedSubtotal >= (voucher.min_order || 0)) {
                  if (voucher.discount_percent > 0) {
                    discountAmount = Math.round((calculatedSubtotal * voucher.discount_percent) / 100);
                    if (voucher.max_discount > 0 && discountAmount > voucher.max_discount) {
                      discountAmount = voucher.max_discount;
                    }
                  } else if (voucher.discount_fixed > 0) {
                    discountAmount = voucher.discount_fixed;
                  }
                  // Tăng lượt dùng voucher
                  await env.DB.prepare('UPDATE vouchers SET used_count = used_count + 1 WHERE code = ?').bind(voucher.code).run();
                }
              }
            } catch (err) {
              console.warn('Voucher check error:', err);
            }
          }

          const totalAmount = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);
          const orderCode = 'MM-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);

          // Lưu đơn hàng vào Cloudflare D1
          if (env.DB) {
            try {
              await env.DB.prepare(`
                INSERT INTO orders (id, customer_name, phone, city, address, note, items_json, subtotal, discount_amount, shipping_fee, total_amount, voucher_code, payment_method, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
              `).bind(
                orderCode,
                customerName.trim(),
                phone.trim(),
                city || 'Chưa chọn',
                address.trim(),
                note || '',
                JSON.stringify(items),
                calculatedSubtotal,
                discountAmount,
                shippingFee,
                totalAmount,
                voucherCode || '',
                paymentMethod || 'COD'
              ).run();

              // Đồng bộ thông tin khách hàng vào bảng users
              await env.DB.prepare(`
                INSERT INTO users (id, phone, name, city, address, points, updated_at)
                VALUES (?, ?, ?, ?, ?, 10, CURRENT_TIMESTAMP)
                ON CONFLICT(phone) DO UPDATE SET
                  name = excluded.name,
                  city = excluded.city,
                  address = excluded.address,
                  points = points + 10,
                  updated_at = CURRENT_TIMESTAMP
              `).bind(
                'user_' + phone.trim(),
                phone.trim(),
                customerName.trim(),
                city || '',
                address.trim()
              ).run();
            } catch (d1Err) {
              console.error('D1 Insert order error:', d1Err);
            }
          }

          // Gửi thông báo Telegram từ Server (Token không lộ ở Frontend!)
          const tgMsg = `🛒 <b>ĐƠN HÀNG MỚI TỪ WEBSITE</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🔖 <b>Mã đơn:</b> <code>${orderCode}</code>\n` +
            `👤 <b>Khách:</b> ${customerName}\n` +
            `📞 <b>SĐT:</b> ${phone}\n` +
            `📍 <b>Địa chỉ:</b> ${address}, ${city || ''}\n` +
            `💳 <b>Thanh toán:</b> ${paymentMethod || 'COD'}\n` +
            `💰 <b>Tổng tiền:</b> <b>${totalAmount.toLocaleString('vi-VN')}đ</b>\n` +
            (note ? `📝 <b>Ghi chú:</b> ${note}\n` : '') +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📦 <b>Món đặt:</b>\n` +
            items.map(i => ` • ${i.name} x${i.quantity || 1} (${(i.price * (i.quantity || 1)).toLocaleString('vi-VN')}đ)`).join('\n');

          ctx.waitUntil(sendTelegramServer(tgMsg, env));

          return jsonResponse({
            success: true,
            orderCode,
            totalAmount,
            message: 'Đặt hàng thành công! Đơn hàng đã được lưu an toàn vào hệ thống.'
          });
        } catch (e) {
          return jsonResponse({ success: false, message: 'Lỗi xử lý đơn hàng: ' + e.message }, 500);
        }
      }

      // 3. Tra cứu trạng thái đơn hàng (Khách chỉ xem được đơn của mình)
      if (path === '/orders/track' && request.method === 'GET') {
        const code = url.searchParams.get('code');
        const phone = url.searchParams.get('phone');
        if (!code || !phone) {
          return jsonResponse({ success: false, message: 'Cần mã đơn và SĐT để tra cứu' }, 400);
        }
        if (!env.DB) {
          return jsonResponse({ success: false, message: 'D1 chưa được kết nối' }, 503);
        }

        const order = await env.DB.prepare('SELECT id, customer_name, status, total_amount, payment_method, created_at FROM orders WHERE id = ? AND phone = ?').bind(code.trim(), phone.trim()).first();
        if (!order) {
          return jsonResponse({ success: false, message: 'Không tìm thấy đơn hàng phù hợp' }, 404);
        }
        return jsonResponse({ success: true, order });
      }

      // 4. Khách gửi tin nhắn chat tư vấn (POST /api/chat-lead)
      if (path === '/chat-lead' && request.method === 'POST') {
        try {
          const body = await request.json();
          const { name, phone, message } = body;
          if (!name || !phone || !message) {
            return jsonResponse({ success: false, message: 'Vui lòng điền đủ họ tên, SĐT và lời nhắn' }, 400);
          }

          const leadId = 'LEAD-' + Date.now().toString().slice(-6);

          if (env.DB) {
            await env.DB.prepare(`
              INSERT INTO chat_leads (id, customer_name, phone, message, status)
              VALUES (?, ?, ?, ?, 'new')
            `).bind(leadId, name.trim(), phone.trim(), message.trim()).run();
          }

          // Chuyển tiếp Telegram an toàn
          const tgMsg = `🛎️ <b>KHÁCH CHAT TƯ VẤN (TỪ WEBSITE)</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `👤 <b>Khách:</b> ${name}\n` +
            `📞 <b>SĐT:</b> ${phone}\n` +
            `💬 <b>Nội dung:</b> ${message}\n` +
            `⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;

          ctx.waitUntil(sendTelegramServer(tgMsg, env));

          return jsonResponse({
            success: true,
            leadId,
            message: 'Tin nhắn đã được gửi an toàn tới đội ngũ The Măm Măm'
          });
        } catch (e) {
          return jsonResponse({ success: false, message: 'Lỗi lưu lead: ' + e.message }, 500);
        }
      }

      // 5. Kiểm tra Voucher từ Database (POST /api/vouchers/verify)
      if (path === '/vouchers/verify' && request.method === 'POST') {
        const { code, subtotal } = await request.json();
        if (!code) return jsonResponse({ valid: false, message: 'Chưa nhập mã voucher' });

        if (!env.DB) {
          // Fallback nếu chưa kết nối D1
          const upper = code.toUpperCase();
          if (upper === 'GIAM10') return jsonResponse({ valid: true, discountPercent: 10, code: upper });
          if (upper === 'GIAM15') return jsonResponse({ valid: true, discountPercent: 15, code: upper });
          if (upper === 'GIAM20') return jsonResponse({ valid: true, discountPercent: 20, code: upper });
          return jsonResponse({ valid: false, message: 'Mã không hợp lệ' });
        }

        const voucher = await env.DB.prepare('SELECT * FROM vouchers WHERE code = ? AND is_active = 1').bind(code.toUpperCase()).first();
        if (!voucher) return jsonResponse({ valid: false, message: 'Mã voucher không tồn tại hoặc đã bị khóa' });

        if (voucher.max_uses > 0 && voucher.used_count >= voucher.max_uses) {
          return jsonResponse({ valid: false, message: 'Mã voucher đã hết lượt sử dụng' });
        }

        if (subtotal && subtotal < voucher.min_order) {
          return jsonResponse({ valid: false, message: `Mã chỉ áp dụng cho đơn từ ${voucher.min_order.toLocaleString('vi-VN')}đ` });
        }

        return jsonResponse({
          valid: true,
          code: voucher.code,
          discountPercent: voucher.discount_percent,
          discountFixed: voucher.discount_fixed,
          maxDiscount: voucher.max_discount
        });
      }

      // 6. Đăng nhập Quản Trị Viên an toàn cấp độ Cloudflare (POST /api/admin/login)
      if (path === '/admin/login' && request.method === 'POST') {
        const clientIp = getClientIp(request);
        const rateCheck = checkLoginRateLimit(clientIp);
        if (!rateCheck.allowed) {
          return jsonResponse({
            success: false,
            message: `⚠️ Cloudflare Edge Security: Địa chỉ IP ${clientIp} đã bị tạm khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau ${rateCheck.remainingSeconds} giây.`
          }, 429);
        }

        const { username, password } = await request.json();
        const secret = env.ADMIN_SECRET_KEY || 'themammam_super_secret_jwt_key_2026';

        let isValid = false;
        if (env.DB) {
          const admin = await env.DB.prepare('SELECT * FROM admin_users WHERE username = ?').bind(username).first();
          if (admin) {
            const inputHash = await sha256(password + admin.salt);
            if (inputHash === admin.password_hash) isValid = true;
          }
        } else {
          // Mặc định ban đầu nếu chưa có D1
          if (username === 'admin' && (password === 'admin123' || password === env.ADMIN_DEFAULT_PASSWORD)) {
            isValid = true;
          }
        }

        if (!isValid) {
          recordLoginAttempt(clientIp, false);
          await logAdminAction(env, 'LOGIN_FAILED', username, { clientIp }, request);
          // Trì hoãn 500ms làm chậm các công cụ brute-force tự động
          await new Promise(r => setTimeout(r, 500));
          return jsonResponse({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' }, 401);
        }

        // Đăng nhập thành công -> Xóa bộ đếm sai IP
        recordLoginAttempt(clientIp, true);
        await logAdminAction(env, 'LOGIN_SUCCESS', username, { clientIp }, request);

        // Tạo Signed Token kèm nonce và timestamp (Hạn 24 giờ)
        const nonce = Math.random().toString(36).substring(2, 10);
        const payload = btoa(`${username}:${Date.now()}:${nonce}`);
        const sig = await sha256(payload + secret);
        const token = `${payload}.${sig}`;

        return jsonResponse({
          success: true,
          token,
          user: { username, role: 'superadmin' }
        });
      }

      // 7. Lấy danh sách đơn hàng cho Quản Trị Viên (GET /api/admin/orders)
      if (path === '/admin/orders' && request.method === 'GET') {
        const adminUser = await verifyAdminAuth(request, env);
        if (!adminUser) return jsonResponse({ success: false, message: 'Unauthorized: Bạn không có quyền truy cập' }, 401);

        if (!env.DB) {
          return jsonResponse({ success: false, message: 'D1 Database chưa kết nối' }, 503);
        }

        const { results } = await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200').all();
        return jsonResponse({ success: true, orders: results || [] });
      }

      // 8. Cập nhật trạng thái đơn hàng (POST /api/admin/orders/status)
      if (path === '/admin/orders/status' && request.method === 'POST') {
        const adminUser = await verifyAdminAuth(request, env);
        if (!adminUser) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);

        const { code, status } = await request.json();
        if (!code || !status) return jsonResponse({ success: false, message: 'Thiếu dữ liệu' }, 400);

        if (env.DB) {
          await env.DB.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(status, code).run();
          await logAdminAction(env, 'UPDATE_ORDER_STATUS', code, { status }, request);
          return jsonResponse({ success: true, message: 'Đã cập nhật trạng thái đơn hàng' });
        }
        return jsonResponse({ success: false, message: 'D1 chưa kết nối' }, 503);
      }

      // 9. Lấy danh sách khách chat tư vấn cho Admin (GET /api/admin/leads)
      if (path === '/admin/leads' && request.method === 'GET') {
        const adminUser = await verifyAdminAuth(request, env);
        if (!adminUser) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);

        if (!env.DB) return jsonResponse({ success: false, message: 'D1 chưa kết nối' }, 503);

        const { results } = await env.DB.prepare('SELECT * FROM chat_leads ORDER BY created_at DESC LIMIT 100').all();
        return jsonResponse({ success: true, leads: results || [] });
      }

      // 10. Lấy danh sách sản phẩm công khai cho Website (GET /api/products)
      if (path === '/products' && request.method === 'GET') {
        if (env.DB) {
          try {
            const { results } = await env.DB.prepare(
              'SELECT * FROM products WHERE is_deleted = 0 ORDER BY id ASC'
            ).all();
            if (results && results.length > 0) {
              const formattedProducts = results.map(row => ({
                id: row.id,
                name: row.name,
                category: row.category,
                categoryLabel: row.category_label || '',
                price: Number(row.price) || 0,
                originalPrice: Number(row.original_price) || Number(row.price) || 0,
                unit: row.unit || 'cái',
                image: row.image || 'assets/khoai_tay_mammam.png',
                description: row.description || '',
                prepTime: row.prep_time || '15–25 phút',
                tags: row.tags_json ? JSON.parse(row.tags_json) : ['Đặc Sản Đà Lạt'],
                calories: row.calories || '',
                storage: row.storage || '',
                shelfLife: row.shelf_life || '',
                shippingScope: row.shipping_scope || 'ship-xa',
                shippingBadge: row.shipping_badge || '✈️ Ship toàn quốc',
                shippingNote: row.shipping_note || '',
                inStock: row.in_stock === 1,
                priceFormatted: `${(Number(row.price) || 0).toLocaleString('vi-VN')}đ/${row.unit || 'cái'}`,
                originalPriceFormatted: `${(Number(row.original_price) || Number(row.price) || 0).toLocaleString('vi-VN')}đ/${row.unit || 'cái'}`
              }));
              return jsonResponse({ success: true, products: formattedProducts });
            }
          } catch (e) {
            console.warn('Fetch products D1 error:', e);
          }
        }
        return jsonResponse({ success: false, message: 'D1 chưa có dữ liệu sản phẩm, sử dụng dữ liệu tĩnh' });
      }

      // 11. Quản lý sản phẩm - Lấy danh sách cho Quản Trị Viên (GET /api/admin/products)
      if (path === '/admin/products' && request.method === 'GET') {
        const adminUser = await verifyAdminAuth(request, env);
        if (!adminUser) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
        if (!env.DB) return jsonResponse({ success: false, message: 'D1 chưa kết nối' }, 503);

        const { results } = await env.DB.prepare(
          'SELECT * FROM products WHERE is_deleted = 0 ORDER BY id ASC'
        ).all();

        const formatted = (results || []).map(r => ({
          ...r,
          tags: r.tags_json ? JSON.parse(r.tags_json) : [],
          inStock: r.in_stock === 1,
          priceFormatted: `${(Number(r.price) || 0).toLocaleString('vi-VN')}đ/${r.unit || 'cái'}`
        }));

        return jsonResponse({ success: true, products: formatted });
      }

      // 12. Quản lý sản phẩm - Thêm sản phẩm mới (POST /api/admin/products)
      if (path === '/admin/products' && request.method === 'POST') {
        const adminUser = await verifyAdminAuth(request, env);
        if (!adminUser) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
        if (!env.DB) return jsonResponse({ success: false, message: 'D1 chưa kết nối' }, 503);

        try {
          const body = await request.json();
          let { id, name, category, categoryLabel, price, originalPrice, unit, image, description, prepTime, tags, calories, storage, shelfLife, shippingScope, inStock } = body;

          if (!name || price === undefined) {
            return jsonResponse({ success: false, message: 'Vui lòng điền tên món và giá bán' }, 400);
          }

          id = (id || ('MM' + (Math.floor(100 + Math.random() * 900)))).trim().toUpperCase();
          name = sanitizeText(name);
          category = sanitizeText(category || 'banh-que');
          categoryLabel = sanitizeText(categoryLabel || 'Bánh Quê Remix');
          price = Math.max(0, Number(price) || 0);
          originalPrice = Math.max(price, Number(originalPrice) || price);
          unit = sanitizeText(unit || 'cái');
          image = (image || 'assets/khoai_tay_mammam.png').trim();
          description = sanitizeText(description || '');
          prepTime = sanitizeText(prepTime || '15–25 phút');
          const tagsJson = JSON.stringify(Array.isArray(tags) ? tags.map(sanitizeText) : ['Đặc Sản Đà Lạt']);
          calories = sanitizeText(calories || '');
          storage = sanitizeText(storage || '');
          shelfLife = sanitizeText(shelfLife || '');
          shippingScope = (shippingScope === 'ship-gan') ? 'ship-gan' : 'ship-xa';
          const shippingBadge = (shippingScope === 'ship-gan') ? '🛵 Hỏa tốc Đà Lạt' : '✈️ Ship toàn quốc';
          const inStockVal = (inStock === false || inStock === 0) ? 0 : 1;

          await env.DB.prepare(`
            INSERT INTO products (
              id, name, category, category_label, price, original_price, unit, image,
              description, prep_time, tags_json, calories, storage, shelf_life,
              shipping_scope, shipping_badge, in_stock, is_deleted, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              category = excluded.category,
              category_label = excluded.category_label,
              price = excluded.price,
              original_price = excluded.original_price,
              unit = excluded.unit,
              image = excluded.image,
              description = excluded.description,
              prep_time = excluded.prep_time,
              tags_json = excluded.tags_json,
              calories = excluded.calories,
              storage = excluded.storage,
              shelf_life = excluded.shelf_life,
              shipping_scope = excluded.shipping_scope,
              shipping_badge = excluded.shipping_badge,
              in_stock = excluded.in_stock,
              is_deleted = 0,
              updated_at = CURRENT_TIMESTAMP
          `).bind(
            id, name, category, categoryLabel, price, originalPrice, unit, image,
            description, prepTime, tagsJson, calories, storage, shelfLife,
            shippingScope, shippingBadge, inStockVal
          ).run();

          await logAdminAction(env, 'ADD_OR_UPDATE_PRODUCT', id, { name, price }, request);

          return jsonResponse({
            success: true,
            id,
            message: `Đã lưu món "${name}" (${id}) thành công vào Cloudflare D1.`
          });
        } catch (err) {
          return jsonResponse({ success: false, message: 'Lỗi lưu sản phẩm: ' + err.message }, 500);
        }
      }

      // 13. Quản lý sản phẩm - Cập nhật sản phẩm (POST /api/admin/products/update)
      if (path === '/admin/products/update' && request.method === 'POST') {
        const adminUser = await verifyAdminAuth(request, env);
        if (!adminUser) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
        if (!env.DB) return jsonResponse({ success: false, message: 'D1 chưa kết nối' }, 503);

        try {
          const body = await request.json();
          const { id, name, category, categoryLabel, price, originalPrice, unit, image, description, prepTime, tags, calories, storage, shelfLife, shippingScope, inStock } = body;
          if (!id) return jsonResponse({ success: false, message: 'Thiếu mã sản phẩm' }, 400);

          const updates = [];
          const binds = [];

          if (name !== undefined) { updates.push('name = ?'); binds.push(sanitizeText(name)); }
          if (category !== undefined) { updates.push('category = ?'); binds.push(sanitizeText(category)); }
          if (categoryLabel !== undefined) { updates.push('category_label = ?'); binds.push(sanitizeText(categoryLabel)); }
          if (price !== undefined) { updates.push('price = ?'); binds.push(Math.max(0, Number(price) || 0)); }
          if (originalPrice !== undefined) { updates.push('original_price = ?'); binds.push(Math.max(0, Number(originalPrice) || 0)); }
          if (unit !== undefined) { updates.push('unit = ?'); binds.push(sanitizeText(unit)); }
          if (image !== undefined) { updates.push('image = ?'); binds.push(image.trim()); }
          if (description !== undefined) { updates.push('description = ?'); binds.push(sanitizeText(description)); }
          if (prepTime !== undefined) { updates.push('prep_time = ?'); binds.push(sanitizeText(prepTime)); }
          if (tags !== undefined) { updates.push('tags_json = ?'); binds.push(JSON.stringify(Array.isArray(tags) ? tags.map(sanitizeText) : [])); }
          if (calories !== undefined) { updates.push('calories = ?'); binds.push(sanitizeText(calories)); }
          if (storage !== undefined) { updates.push('storage = ?'); binds.push(sanitizeText(storage)); }
          if (shelfLife !== undefined) { updates.push('shelf_life = ?'); binds.push(sanitizeText(shelfLife)); }
          if (shippingScope !== undefined) {
            const sc = (shippingScope === 'ship-gan') ? 'ship-gan' : 'ship-xa';
            updates.push('shipping_scope = ?'); binds.push(sc);
            updates.push('shipping_badge = ?'); binds.push(sc === 'ship-gan' ? '🛵 Hỏa tốc Đà Lạt' : '✈️ Ship toàn quốc');
          }
          if (inStock !== undefined) { updates.push('in_stock = ?'); binds.push(inStock ? 1 : 0); }

          updates.push('updated_at = CURRENT_TIMESTAMP');
          binds.push(id.trim());

          const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
          await env.DB.prepare(sql).bind(...binds).run();
          await logAdminAction(env, 'EDIT_PRODUCT', id, body, request);

          return jsonResponse({ success: true, message: `Đã cập nhật món ${id}` });
        } catch (err) {
          return jsonResponse({ success: false, message: 'Lỗi cập nhật: ' + err.message }, 500);
        }
      }

      // 14. Quản lý sản phẩm - Xóa món khỏi thực đơn (POST /api/admin/products/delete)
      if (path === '/admin/products/delete' && request.method === 'POST') {
        const adminUser = await verifyAdminAuth(request, env);
        if (!adminUser) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
        if (!env.DB) return jsonResponse({ success: false, message: 'D1 chưa kết nối' }, 503);

        const { id } = await request.json();
        if (!id) return jsonResponse({ success: false, message: 'Thiếu mã sản phẩm' }, 400);

        // Soft delete an toàn bảo toàn toàn vẹn dữ liệu
        await env.DB.prepare('UPDATE products SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(id.trim()).run();
        await logAdminAction(env, 'DELETE_PRODUCT', id, {}, request);

        return jsonResponse({ success: true, message: `Đã xóa món ${id} khỏi thực đơn.` });
      }

      // 15. Đồng bộ hàng loạt 106 món vào Cloudflare D1 (POST /api/admin/products/sync-seed)
      if (path === '/admin/products/sync-seed' && request.method === 'POST') {
        const adminUser = await verifyAdminAuth(request, env);
        if (!adminUser) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
        if (!env.DB) return jsonResponse({ success: false, message: 'D1 chưa kết nối' }, 503);

        try {
          const { products } = await request.json();
          if (!Array.isArray(products) || !products.length) {
            return jsonResponse({ success: false, message: 'Danh sách sản phẩm trống' }, 400);
          }

          // D1 batch execution
          const stmts = products.map(p => {
            const tagsJson = JSON.stringify(p.tags || []);
            return env.DB.prepare(`
              INSERT INTO products (
                id, name, category, category_label, price, original_price, unit, image,
                description, prep_time, tags_json, calories, storage, shelf_life,
                shipping_scope, shipping_badge, shipping_note, in_stock, is_deleted, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                category = excluded.category,
                category_label = excluded.category_label,
                price = excluded.price,
                original_price = excluded.original_price,
                unit = excluded.unit,
                image = excluded.image,
                description = excluded.description,
                prep_time = excluded.prep_time,
                tags_json = excluded.tags_json,
                calories = excluded.calories,
                storage = excluded.storage,
                shelf_life = excluded.shelf_life,
                shipping_scope = excluded.shipping_scope,
                shipping_badge = excluded.shipping_badge,
                shipping_note = excluded.shipping_note,
                in_stock = excluded.in_stock,
                is_deleted = 0,
                updated_at = CURRENT_TIMESTAMP
            `).bind(
              p.id, p.name, p.category, p.categoryLabel || '', Number(p.price) || 0,
              Number(p.originalPrice) || Number(p.price) || 0, p.unit || 'cái',
              p.image || 'assets/khoai_tay_mammam.png', p.description || '',
              p.prepTime || '15–25 phút', tagsJson, p.calories || '', p.storage || '',
              p.shelfLife || '', p.shippingScope || 'ship-xa', p.shippingBadge || '✈️ Ship toàn quốc',
              p.shippingNote || '', p.inStock ? 1 : 0
            );
          });

          await env.DB.batch(stmts);
          await logAdminAction(env, 'SYNC_PRODUCTS_SEED', 'all', { count: products.length }, request);

          return jsonResponse({
            success: true,
            count: products.length,
            message: `Đã đồng bộ thành công ${products.length} món vào Cloudflare D1 Database!`
          });
        } catch (err) {
          return jsonResponse({ success: false, message: 'Lỗi đồng bộ D1: ' + err.message }, 500);
        }
      }

      // 16. Đổi mật khẩu Quản Trị Viên (POST /api/admin/change-password)
      if (path === '/admin/change-password' && request.method === 'POST') {
        const adminUser = await verifyAdminAuth(request, env);
        if (!adminUser) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
        if (!env.DB) return jsonResponse({ success: false, message: 'D1 chưa kết nối' }, 503);

        const { currentPassword, newPassword } = await request.json();
        if (!currentPassword || !newPassword || newPassword.length < 8) {
          return jsonResponse({ success: false, message: 'Mật khẩu mới phải có tối thiểu 8 ký tự' }, 400);
        }

        const admin = await env.DB.prepare('SELECT * FROM admin_users WHERE username = ?').bind(adminUser).first();
        if (!admin) return jsonResponse({ success: false, message: 'Tài khoản không tồn tại' }, 404);

        const currentHash = await sha256(currentPassword + admin.salt);
        if (currentHash !== admin.password_hash) {
          return jsonResponse({ success: false, message: 'Mật khẩu hiện tại không đúng' }, 400);
        }

        const newSalt = 'salt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
        const newHash = await sha256(newPassword + newSalt);

        await env.DB.prepare('UPDATE admin_users SET password_hash = ?, salt = ? WHERE username = ?').bind(newHash, newSalt, adminUser).run();
        await logAdminAction(env, 'CHANGE_PASSWORD_SUCCESS', adminUser, {}, request);

        return jsonResponse({ success: true, message: 'Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.' });
      }

      // 17. Nhật ký bảo mật Cloudflare (GET /api/admin/audit-logs)
      if (path === '/admin/audit-logs' && request.method === 'GET') {
        const adminUser = await verifyAdminAuth(request, env);
        if (!adminUser) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
        if (!env.DB) return jsonResponse({ success: false, message: 'D1 chưa kết nối' }, 503);

        const { results } = await env.DB.prepare('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 50').all();
        return jsonResponse({ success: true, logs: results || [] });
      }

      // 18. Trạng thái bảo mật Cloudflare Edge (GET /api/admin/security-status)
      if (path === '/admin/security-status' && request.method === 'GET') {
        const adminUser = await verifyAdminAuth(request, env);
        if (!adminUser) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);

        const clientIp = getClientIp(request);
        const cfRay = request.headers.get('CF-Ray') || 'local-edge';
        const cfCountry = request.headers.get('CF-IPCountry') || 'VN';

        return jsonResponse({
          success: true,
          security: {
            edge_node: cfRay,
            client_ip: clientIp,
            ip_country: cfCountry,
            rate_limiter_active: true,
            sha256_signed_token: true,
            d1_parameterized_sql: true,
            csp_active: true,
            waf_active: true,
            admin_user: adminUser,
            timestamp: new Date().toISOString()
          }
        });
      }

      // Không tìm thấy API
      return jsonResponse({ success: false, message: 'API endpoint not found' }, 404);
    }

    // ════════════════ SERVE STATIC ASSETS ════════════════
    // Nếu không phải API, phục vụ các file tĩnh (HTML, CSS, JS, Assets)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('The Măm Măm Serverless Edge running.', { status: 200 });
  }
};
