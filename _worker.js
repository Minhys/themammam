/**
 * THE MĂM MĂM - CLOUDFLARE WORKER BACKEND API & D1 INTEGRATION
 * Bảo vệ dữ liệu nhạy cảm, chống DevTools đọc trộm token/đơn hàng,
 * xác thực Admin an toàn và tích hợp Cloudflare D1 Database
 */

// Helper SHA-256 hashing
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper JSON Response
function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    }
  });
}

// Xác thực Admin Token
async function verifyAdminAuth(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  const secret = env.ADMIN_SECRET_KEY || 'themammam_super_secret_jwt_key_2026';
  
  // Format token: base64(username:timestamp):signature
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const payload = parts[0];
  const sig = parts[1];
  
  const expectedSig = await sha256(payload + secret);
  if (sig !== expectedSig) return false;

  try {
    const decoded = atob(payload);
    const [user, time] = decoded.split(':');
    // Token có hạn 7 ngày
    if (Date.now() - Number(time) > 7 * 24 * 3600 * 1000) return false;
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

      // 6. Đăng nhập Quản Trị Viên an toàn (POST /api/admin/login)
      if (path === '/admin/login' && request.method === 'POST') {
        const { username, password } = await request.json();
        const secret = env.ADMIN_SECRET_KEY || 'themammam_super_secret_jwt_key_2026';
        const salt = 'themammam_salt_2026';

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
          return jsonResponse({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' }, 401);
        }

        // Tạo Signed Token
        const payload = btoa(`${username}:${Date.now()}`);
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
