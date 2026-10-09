/**
 * MĂM MĂM - APPLICATION LOGIC
 * Handles Catalog, Ordering, Cart, User Auth, MoMo QR, and Admin Confirmation
 */

(function () {
  'use strict';

  // ════════════════ STATE ════════════════
  const state = {
    cart: [],
    currentCategory: 'all',
    searchQuery: '',
    sortBy: 'default',
    currentUser: null,
    guestInfo: null,
    voucher: null,
    orders: [],
    adminSettings: {
      momoPhone: '0974449708',
      momoName: 'NGUYEN THI KIM OANH',
      adminPin: '8888'
    }
  };

  // ════════════════ STORAGE HELPERS ════════════════
  function loadStorage() {
    try {
      const storedCart = localStorage.getItem('mammam_cart');
      if (storedCart) state.cart = JSON.parse(storedCart);

      const storedUser = localStorage.getItem('mammam_current_user');
      if (storedUser) state.currentUser = JSON.parse(storedUser);

      const storedGuest = localStorage.getItem('mammam_guest_info');
      if (storedGuest) state.guestInfo = JSON.parse(storedGuest);

      const storedOrders = localStorage.getItem('mammam_orders_db') || localStorage.getItem('mammam_orders');
      if (storedOrders) {
        state.orders = JSON.parse(storedOrders);
      } else {
        // Seed 2 initial sample orders for testing convenience
        state.orders = [
          {
            code: 'MM-7821-B4X',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            customerName: 'Trần Minh Quân',
            phone: '0912345678',
            address: '12 Nguyễn Thị Minh Khai, Phường 2',
            city: 'Đà Lạt',
            note: 'Giao giờ hành chính, bọc kỹ',
            items: [
              { id: 'BT001', name: 'Hộp 10 Su mềm', price: 40000, quantity: 2 },
              { id: 'DK003', name: 'Dâu sấy giòn - hũ', price: 85000, quantity: 1 }
            ],
            subtotal: 165000,
            shippingFee: 25000,
            discount: 0,
            total: 190000,
            paymentMethod: 'momo',
            paymentStatus: 'pending', // 'pending' | 'paid'
            orderStatus: 'pending' // 'pending' | 'preparing' | 'shipping' | 'completed' | 'cancelled'
          },
          {
            code: 'MM-9932-K9P',
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            customerName: 'Lê Hoàng Yến',
            phone: '0987654321',
            address: '45 Hai Bà Trưng, Quận 1',
            city: 'TP. Hồ Chí Minh',
            note: 'Gọi trước khi đến 15 phút',
            items: [
              { id: 'BT003', name: 'Bông lan trứng muối phô mai', price: 55000, quantity: 2 },
              { id: 'BT038', name: 'New York Cookie Red Velvet cream cheese', price: 39000, quantity: 3 }
            ],
            subtotal: 227000,
            shippingFee: 0,
            discount: 20000,
            total: 207000,
            paymentMethod: 'momo',
            paymentStatus: 'paid',
            orderStatus: 'preparing'
          }
        ];
        saveOrders();
      }

      const storedSettings = localStorage.getItem('mammam_admin_settings');
      if (storedSettings) state.adminSettings = { ...state.adminSettings, ...JSON.parse(storedSettings) };
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  function saveCart() {
    try {
      localStorage.setItem('mammam_cart', JSON.stringify(state.cart));
      updateCartBadge();
    } catch (e) {}
  }

  function saveOrders() {
    try {
      localStorage.setItem('mammam_orders', JSON.stringify(state.orders));
      localStorage.setItem('mammam_orders_db', JSON.stringify(state.orders));
    } catch (e) {}
  }

  function saveUsers(users) {
    try {
      localStorage.setItem('mammam_users', JSON.stringify(users));
    } catch (e) {}
  }

  function getUsers() {
    try {
      const u = localStorage.getItem('mammam_users');
      return u ? JSON.parse(u) : [];
    } catch (e) {
      return [];
    }
  }

  // ════════════════ PRELOADER ════════════════
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const bar = document.getElementById('loaderBar');
    if (!preloader || !bar) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 10;
      if (progress >= 100) {
        progress = 100;
        bar.style.width = '100%';
        clearInterval(interval);
        setTimeout(() => {
          preloader.classList.add('loaded');
        }, 300);
      } else {
        bar.style.width = progress + '%';
      }
    }, 60);
  }

  // ════════════════ EYE TRACKING MASCOT ════════════════
  function initEyeTracking() {
    const pupils = document.querySelectorAll('.eye-pupil');
    if (!pupils.length) return;

    window.addEventListener('mousemove', (e) => {
      pupils.forEach((pupil) => {
        const eye = pupil.parentElement;
        const rect = eye.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;

        const rad = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
        const maxDist = rect.width * 0.28;
        const dist = Math.min(maxDist, Math.hypot(e.clientX - eyeX, e.clientY - eyeY));

        const moveX = Math.cos(rad) * dist;
        const moveY = Math.sin(rad) * dist;

        pupil.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
      });
    });
  }

  // ════════════════ 3D STICKER PEEL EFFECT ════════════════
  function initStickers() {
    const stickers = document.querySelectorAll('.sticker-container');
    stickers.forEach((sticker) => {
      sticker.addEventListener('mouseenter', () => {
        sticker.style.setProperty('--peel-amount', '0.65');
      });
      sticker.addEventListener('mouseleave', () => {
        sticker.style.setProperty('--peel-amount', '1');
      });
      sticker.addEventListener('mousemove', (e) => {
        const rect = sticker.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const amount = 0.5 + y * 0.45;
        sticker.style.setProperty('--peel-amount', amount.toFixed(2));
      });
    });
  }

  // ════════════════ CATALOG RENDERING ════════════════
  function formatMoney(amount) {
    return Number(amount || 0).toLocaleString('vi-VN') + 'đ';
  }

  function renderCategoryTabs() {
    const container = document.getElementById('categoryTabs');
    if (!container) return;

    container.innerHTML = MAMMAM_DATA.categories.map((c) => {
      const activeClass = state.currentCategory === c.id ? 'active' : '';
      return `
        <button class="cat-tab ${activeClass}" data-cat="${c.id}">
          <span>${c.emoji}</span>
          <span>${c.name}</span>
          <span style="opacity:0.7;font-size:0.9em">(${c.count})</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.cat-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.currentCategory = btn.dataset.cat;
        renderCategoryTabs();
        renderProducts();
      });
    });
  }

  function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const statsEl = document.getElementById('menuStats');
    if (!grid) return;

    let items = MAMMAM_DATA.products;

    // Filter by Category
    if (state.currentCategory !== 'all') {
      items = items.filter((p) => p.category === state.currentCategory);
    }

    // Filter by Search Query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      items = items.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
      );
    }

    // Sort
    if (state.sortBy === 'price-asc') {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'price-desc') {
      items = [...items].sort((a, b) => b.price - a.price);
    } else if (state.sortBy === 'name') {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (statsEl) {
      statsEl.textContent = `HIỂN THỊ ${items.length} MÓN BÁNH & ĐẶC SẢN`;
    }

    if (!items.length) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🧁🔍</div>
          <h3 class="font-modak text-red" style="font-size: 2rem;">Không tìm thấy món nào!</h3>
          <p style="color: #666; margin-top: 0.5rem;">Hãy thử gõ từ khóa khác hoặc bấm xem Tất Cả Món nhé.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map((p) => {
      const emojiMap = {
        'banh-que': '🌴', 'banh-mi': '🍞', 'banh-mem': '🧁',
        'banh-su': '🍦', 'an-sang': '🍳', 'ngau-hung': '🎉',
        'ny-cookie': '🍪', 'cookie-qua': '🍬', 'dac-san-dalat': '🎁'
      };
      const fallbackEmoji = emojiMap[p.category] || '🧁';
      return `
        <div class="product-card" data-id="${p.id}" tabindex="0" role="button" aria-label="${p.name}">
          <div class="card-thumb-wrap">
            <div class="card-brand-badge" title="The Măm Măm (Since 2026)">
              <img src="assets/mammam-logo.png" alt="The Măm Măm" class="brand-seal-img" />
            </div>
            <img class="card-thumb-img" 
                 src="${p.image}" 
                 alt="${p.name}" 
                 loading="lazy" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:3.5rem; background:#fbebd8;">
              ${fallbackEmoji}
            </div>

            <!-- Hover Info Overlay -->
            <div class="card-hover-overlay">
              <span class="hover-info-badge ${p.shippingScope}">${p.shippingBadge}</span>
              <div class="hover-info-row"><strong>⏳ HSD:</strong> <span>${p.shelfLife}</span></div>
              <div class="hover-info-row"><strong>🔥 Calo:</strong> <span>${p.calories}</span></div>
              <div class="hover-info-desc">${p.shippingNote}</div>
              <span class="hover-click-tip">👆 Bấm để xem chi tiết & chọn số lượng</span>
            </div>
          </div>
          <div class="card-info">
            <h3 class="card-title">${p.name}</h3>
            <div class="card-quick-pills">
              <span class="quick-pill pill-shipping ${p.shippingScope}">${p.shippingBadge}</span>
              <span class="quick-pill">🔥 ${p.calories}</span>
              <span class="quick-pill">⏳ ${p.shelfLife.split('(')[0].trim()}</span>
            </div>
          </div>
          <div class="card-footer">
            <div class="card-price">${formatMoney(p.price)}<span style="font-size:0.65em;color:#555">/${p.unit}</span></div>
            <button class="card-add-btn" data-add="${p.id}">
              <span>+ Thêm</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events
    grid.querySelectorAll('.product-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        // If clicked on "+ Thêm" button, don't open modal
        if (e.target.closest('[data-add]')) {
          const id = e.target.closest('[data-add]').dataset.add;
          addToCart(id, 1);
          return;
        }
        openProductModal(card.dataset.id);
      });
    });
  }

  // ════════════════ PRODUCT DETAIL MODAL ════════════════
  function openProductModal(productId) {
    const product = MAMMAM_DATA.products.find((p) => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productDetailModal');
    const content = document.getElementById('productDetailContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="position:relative; width:100%; height:260px; background:#fbebd8; overflow:hidden;">
        <img src="${product.image}" alt="${product.name}" 
             style="width:100%; height:100%; object-fit:cover;"
             onerror="this.src='assets/khoai_tay_mammam.png'" />
        <div style="position:absolute; top:1rem; right:1.5rem; width:52px; height:52px; border-radius:50%; background:#fff; border:2px solid var(--mustard); box-shadow:0 4px 12px rgba(0,0,0,0.3); overflow:hidden; z-index:5;">
          <img src="assets/mammam-logo.png" alt="The Măm Măm" style="width:100%; height:100%; object-fit:cover;" />
        </div>
        <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.7) 10%, transparent 60%);"></div>
        <div style="position:absolute; bottom:1rem; left:1.5rem; right:1.5rem; color:#fff;">
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; margin-bottom:0.35rem;">
            <span style="background:var(--mustard); color:var(--black); font-size:0.75rem; font-weight:800; padding:0.2rem 0.7rem; border-radius:999px;">
              ${product.id} · ${product.categoryLabel}
            </span>
            <span class="quick-pill pill-shipping ${product.shippingScope}" style="font-size:0.75rem;">
              ${product.shippingBadge}
            </span>
          </div>
          <h2 class="font-modak" style="font-size:2rem; margin-top:0.2rem; line-height:1.1; color:#fff; -webkit-text-stroke:1px rgba(0,0,0,0.5);">
            ${product.name}
          </h2>
          <div class="font-mouse-memoirs text-mustard" style="font-size:1.8rem;">
            ${formatMoney(product.price)} <span style="font-size:0.7em; color:#ddd;">/ ${product.unit}</span>
          </div>
        </div>
      </div>
      <div style="padding:1.5rem;">
        <!-- 4-Box Specification Grid -->
        <div class="product-spec-grid">
          <div class="spec-card-box ${product.shippingScope}">
            <span class="spec-box-icon">🚚</span>
            <div class="spec-box-label">Phân Loại Giao Hàng</div>
            <strong class="spec-box-val">${product.shippingBadge}</strong>
            <div class="spec-box-sub">${product.shippingNote}</div>
          </div>
          <div class="spec-card-box">
            <span class="spec-box-icon">⏳</span>
            <div class="spec-box-label">Hạn Sử Dụng (HSD)</div>
            <strong class="spec-box-val">${product.shelfLife}</strong>
            <div class="spec-box-sub">Bảo quản chuẩn giữ trọn vị ngon</div>
          </div>
          <div class="spec-card-box">
            <span class="spec-box-icon">🔥</span>
            <div class="spec-box-label">Hàm Lượng Calo</div>
            <strong class="spec-box-val text-red">${product.calories}</strong>
            <div class="spec-box-sub">Tính toán chuẩn theo khẩu phần</div>
          </div>
          <div class="spec-card-box">
            <span class="spec-box-icon">⏱️</span>
            <div class="spec-box-label">Thời Gian Chuẩn Bị</div>
            <strong class="spec-box-val">${product.prepTime}</strong>
            <div class="spec-box-sub">Ra lò tươi mỗi ngày</div>
          </div>
        </div>

        <div style="margin-bottom:1rem;">
          <h4 style="font-size:0.95rem; font-weight:800; color:#1b1b1b; margin-bottom:0.35rem;">📖 Mô Tả Sản Phẩm:</h4>
          <p style="color:#444; line-height:1.6; font-size:0.9rem;">
            ${product.description}
          </p>
        </div>

        <div style="background:#fcf8f2; border:1px solid #e8dec8; border-radius:var(--radius-md); padding:0.8rem 1rem; margin-bottom:1.5rem;">
          <strong style="font-size:0.85rem; color:var(--red);">💡 Hướng Dẫn Thưởng Thức & Bảo Quản:</strong>
          <p style="font-size:0.85rem; color:#666; margin-top:0.2rem;">${product.storage}</p>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">
          <div class="qty-control" style="transform:scale(1.1); transform-origin:left center;">
            <button class="qty-btn" id="modalQtyMinus">-</button>
            <span class="qty-val" id="modalQtyVal">1</span>
            <button class="qty-btn" id="modalQtyPlus">+</button>
          </div>
          <button class="blob-btn" id="modalAddToCartBtn" style="flex:1;">
            <svg viewBox="-10 -10 602 475" preserveAspectRatio="none">
              <path d="M310.777 0.20434C424.154 2.91791 540.733 50.9739 574.176 159.34C606.479 264.014 533.962 365.999 442.064 425.623C364.995 475.626 270.863 455.893 193.524 406.309C93.8313 342.395 -27.3608 259.503 5.48889 145.729C40.0621 25.9857 186.179 -2.77783 310.777 0.20434Z"></path>
            </svg>
            <span style="position:relative; z-index:2;">+ Thêm Vào Giỏ</span>
          </button>
        </div>
      </div>
    `;

    let modalQty = 1;
    const qtyVal = content.querySelector('#modalQtyVal');
    content.querySelector('#modalQtyMinus').addEventListener('click', () => {
      if (modalQty > 1) {
        modalQty--;
        qtyVal.textContent = modalQty;
      }
    });
    content.querySelector('#modalQtyPlus').addEventListener('click', () => {
      modalQty++;
      qtyVal.textContent = modalQty;
    });

    content.querySelector('#modalAddToCartBtn').addEventListener('click', () => {
      addToCart(product.id, modalQty);
      closeModal('productDetailModal');
    });

    openModal('productDetailModal');
  }

  // ════════════════ CART LOGIC ════════════════
  function addToCart(productId, qty = 1) {
    const product = MAMMAM_DATA.products.find((p) => p.id === productId);
    if (!product) return;

    const existing = state.cart.find((item) => item.id === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.image,
        quantity: qty
      });
    }

    saveCart();
    renderCart();
    showToast(`Đã thêm ${qty}x ${product.name} vào giỏ! 🧁`);
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter((item) => item.id !== productId);
    saveCart();
    renderCart();
  }

  function updateCartQty(productId, delta) {
    const item = state.cart.find((i) => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      renderCart();
    }
  }

  function updateMobileStickyOrderBar() {
    const bar = document.getElementById('mobileStickyOrderBar');
    if (!bar) return;

    const totals = getCartTotals();
    const totalCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);

    if (totalCount > 0) {
      bar.style.display = 'block';
      const totalEl = document.getElementById('stickyBarTotal');
      const subEl = document.getElementById('stickyBarSub');
      if (totalEl) totalEl.textContent = formatMoney(totals.total);
      if (subEl) {
        if (totals.subtotal >= MAMMAM_DATA.brand.freeShipThreshold) {
          subEl.textContent = '🎉 Miễn phí giao hàng toàn quốc!';
          subEl.style.color = '#7bed9f';
        } else {
          const needed = MAMMAM_DATA.brand.freeShipThreshold - totals.subtotal;
          subEl.textContent = `Thêm ${formatMoney(needed)} để được FREESHIP`;
          subEl.style.color = '#ddd';
        }
      }
    } else {
      bar.style.display = 'none';
    }
  }

  function updateCartBadge() {
    const totalCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach((el) => {
      el.textContent = totalCount;
    });
    updateMobileStickyOrderBar();
  }

  function getCartTotals() {
    const subtotal = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let shippingFee = subtotal >= MAMMAM_DATA.brand.freeShipThreshold || subtotal === 0
      ? 0
      : MAMMAM_DATA.brand.standardShipFee;

    let discount = 0;
    if (state.voucher) {
      if (window.VoucherSecurity) {
        const check = window.VoucherSecurity.verifyVoucher(state.voucher.code);
        if (check.valid && check.voucher) {
          const v = check.voucher;
          if (v.discountType === 'percent') {
            discount = Math.round(subtotal * (v.percent / 100));
          } else if (v.discountType === 'fixed') {
            discount = Math.min(subtotal, v.fixedAmount || 0);
          } else if (v.discountType === 'freeship') {
            shippingFee = 0;
          }
        } else {
          // If voucher is no longer valid, tampered, or expired, auto revoke
          state.voucher = null;
        }
      } else {
        if (state.voucher.code === 'MAMMAM20') discount = 20000;
        else if (state.voucher.code === 'FREESHIP') shippingFee = 0;
        else if (state.voucher.percent) discount = Math.round(subtotal * (state.voucher.percent / 100));
      }
    }

    const total = Math.max(0, subtotal + shippingFee - discount);
    return { subtotal, shippingFee, discount, total };
  }

  function renderCart() {
    const container = document.getElementById('cartItemsList');
    const emptyNotice = document.getElementById('cartEmptyNotice');
    const summaryBox = document.getElementById('cartSummaryBox');
    if (!container) return;

    if (!state.cart.length) {
      container.innerHTML = '';
      if (emptyNotice) emptyNotice.style.display = 'block';
      if (summaryBox) summaryBox.style.display = 'none';
      return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';
    if (summaryBox) summaryBox.style.display = 'flex';

    container.innerHTML = state.cart.map((item) => `
      <div class="cart-item-row">
        <img class="cart-item-thumb" src="${item.image}" alt="${item.name}" onerror="this.src='assets/burgerH.webp'" />
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${formatMoney(item.price)}</div>
        </div>
        <div class="qty-control">
          <button class="qty-btn" onclick="window.mammamApp.updateCartQty('${item.id}', -1)">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="window.mammamApp.updateCartQty('${item.id}', 1)">+</button>
        </div>
        <button onclick="window.mammamApp.removeFromCart('${item.id}')" 
                style="background:none; border:none; color:#c33; cursor:pointer; font-size:1.2rem; padding:0.3rem;">
          ✕
        </button>
      </div>
    `).join('');

    const totals = getCartTotals();
    document.getElementById('cartSubtotal').textContent = formatMoney(totals.subtotal);
    document.getElementById('cartShipping').textContent = totals.shippingFee === 0 ? 'MIỄN PHÍ' : formatMoney(totals.shippingFee);
    
    const discRow = document.getElementById('cartDiscountRow');
    if (totals.discount > 0) {
      discRow.style.display = 'flex';
      document.getElementById('cartDiscount').textContent = '-' + formatMoney(totals.discount);
    } else {
      discRow.style.display = 'none';
    }

    document.getElementById('cartGrandTotal').textContent = formatMoney(totals.total);
    updateMobileStickyOrderBar();
  }

  // ════════════════ CHECKOUT & ORDER CODE GENERATION ════════════════
  function generateOrderCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 3; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const timeSuffix = (Date.now() % 10000).toString().padStart(4, '0');
    return `MM-${timeSuffix}-${rand}`;
  }

  function openCheckout() {
    if (!state.cart.length) {
      showToast('Giỏ hàng đang trống! Vui lòng chọn món trước nhé. 🛒');
      return;
    }

    // Prefill form with currentUser or guestInfo
    const user = state.currentUser;
    const guest = state.guestInfo;

    const nameInput = document.getElementById('checkoutName');
    const phoneInput = document.getElementById('checkoutPhone');
    const addrInput = document.getElementById('checkoutAddress');
    const citySelect = document.getElementById('checkoutCity');

    if (user) {
      if (nameInput) nameInput.value = user.name || '';
      if (phoneInput) phoneInput.value = user.phone || '';
      if (addrInput) addrInput.value = user.address || '';
      if (citySelect && user.city) citySelect.value = user.city;
    } else if (guest) {
      if (nameInput) nameInput.value = guest.name || '';
      if (phoneInput) phoneInput.value = guest.phone || '';
      if (addrInput) addrInput.value = guest.address || '';
      if (citySelect && guest.city) citySelect.value = guest.city;
    }

    const totals = getCartTotals();
    document.getElementById('checkoutTotalPreview').textContent = formatMoney(totals.total);

    closeModal('cartDrawer');
    openModal('checkoutModal');
  }

  function handlePlaceOrder() {
    const name = document.getElementById('checkoutName').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const city = document.getElementById('checkoutCity').value;
    const note = document.getElementById('checkoutNote').value.trim();
    const payMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const saveInfo = document.getElementById('checkoutSaveInfo').checked;

    if (!name || !phone || !address) {
      showToast('Vui lòng điền đủ Tên, Số điện thoại và Địa chỉ giao hàng!', 'error');
      return;
    }

    // If customer checked save info
    if (saveInfo) {
      state.guestInfo = { name, phone, address, city };
      localStorage.setItem('mammam_guest_info', JSON.stringify(state.guestInfo));
    }

    const totals = getCartTotals();
    const orderCode = generateOrderCode();

    const newOrder = {
      code: orderCode,
      createdAt: new Date().toISOString(),
      customerName: name,
      phone,
      address,
      city,
      note,
      items: JSON.parse(JSON.stringify(state.cart)),
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      discount: totals.discount,
      total: totals.total,
      voucherCode: state.voucher ? state.voucher.code : null,
      paymentMethod: payMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    };

    // Redeem voucher in VoucherSecurity (One-Time Use Enforcement)
    if (state.voucher && window.VoucherSecurity) {
      window.VoucherSecurity.redeemVoucher(state.voucher.code, orderCode);
    }

    state.orders.unshift(newOrder);
    saveOrders();

    // Đồng bộ đơn hàng lên Cloudflare D1 Database & gửi Telegram bảo mật từ Server
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          phone,
          city,
          address,
          note,
          items: newOrder.items,
          voucherCode: newOrder.voucherCode,
          paymentMethod: payMethod
        })
      }).then(res => res.json()).then(data => {
        if (data && data.success) {
          console.log('✅ Đơn hàng đã được lưu an toàn vào Cloudflare D1:', data.orderCode);
        }
      }).catch(err => {
        console.warn('Cloudflare D1 edge sync notice:', err);
      });
    } catch (e) {}

    // Clear cart and voucher
    state.cart = [];
    state.voucher = null;
    saveCart();
    renderCart();

    closeModal('checkoutModal');
    showOrderSuccess(newOrder);
  }

  // ════════════════ MOMO QR & SUCCESS MODAL ════════════════
  function showOrderSuccess(order) {
    const modal = document.getElementById('orderSuccessModal');
    if (!modal) return;

    document.getElementById('successOrderCode').textContent = order.code;
    document.getElementById('successTotalAmount').textContent = formatMoney(order.total);
    document.getElementById('momoRecipientName').textContent = state.adminSettings.momoName;
    document.getElementById('momoRecipientPhone').textContent = state.adminSettings.momoPhone;
    document.getElementById('momoMsgOrderCode').textContent = order.code;

    // Generate dynamic QR code URL
    // Format: 2|99|PHONE|NAME||0|0|AMOUNT|MESSAGE|transfer_my_qr
    const qrData = `2|99|${state.adminSettings.momoPhone}|${encodeURIComponent(state.adminSettings.momoName)}||0|0|${order.total}|${order.code}|transfer_my_qr`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(qrData)}`;

    const qrImg = document.getElementById('momoQrImage');
    if (qrImg) qrImg.src = qrUrl;

    openModal('orderSuccessModal');
    showToast(`Đặt hàng thành công! Mã đơn: ${order.code} 🎉`);
  }

  // ════════════════ USER & ADMIN AUTHENTICATION ════════════════
  function handleLogin() {
    const phoneOrEmail = document.getElementById('loginIdentifier').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();

    if (!phoneOrEmail || !pass) {
      showToast('Vui lòng nhập tài khoản và mật khẩu!', 'error');
      return;
    }

    // 1. Thử xác thực Quản trị viên qua Cloudflare Serverless D1 API
    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: phoneOrEmail, password: pass })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.success && data.token) {
        sessionStorage.setItem('mammam_admin_logged', 'true');
        sessionStorage.setItem('mammam_admin_token', data.token);
        localStorage.setItem('mammam_admin_logged', 'true');
        showToast('Đăng nhập Quản Trị Viên thành công! Đang chuyển đến trang Quản Trị... 🔐', 'success');
        closeModal('authModal');
        updateUserUI();
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 500);
        return;
      }
      // Không phải tài khoản admin trên D1 -> Kiểm tra tài khoản khách hàng
      processCustomerLogin(phoneOrEmail, pass);
    })
    .catch(() => {
      // Fallback khi chạy offline
      let adminCreds = { username: 'admin', password: 'themammam2026' };
      const storedAdmin = localStorage.getItem('mammam_admin_account');
      if (storedAdmin) {
        try {
          const parsed = JSON.parse(storedAdmin);
          if (parsed && parsed.username && parsed.password) adminCreds = parsed;
        } catch (e) {}
      }
      if (phoneOrEmail.toLowerCase() === adminCreds.username.toLowerCase() && pass === adminCreds.password) {
        sessionStorage.setItem('mammam_admin_logged', 'true');
        localStorage.setItem('mammam_admin_logged', 'true');
        showToast('Đăng nhập Quản Trị Viên thành công! Đang chuyển đến trang Quản Trị... 🔐', 'success');
        closeModal('authModal');
        updateUserUI();
        setTimeout(() => { window.location.href = 'admin.html'; }, 500);
        return;
      }
      processCustomerLogin(phoneOrEmail, pass);
    });
  }

  function processCustomerLogin(phoneOrEmail, pass) {
    const users = getUsers();
    const user = users.find((u) => (u.phone === phoneOrEmail || u.email === phoneOrEmail) && u.password === pass);

    if (!user) {
      showToast('Sai tài khoản hoặc mật khẩu!', 'error');
      return;
    }

    state.currentUser = user;
    localStorage.setItem('mammam_current_user', JSON.stringify(user));
    updateUserUI();
    closeModal('authModal');
    showToast(`Chào mừng ${user.name} đã quay trở lại! 🧁`);
  }

  function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value.trim();
    const address = document.getElementById('regAddress').value.trim();
    const city = document.getElementById('regCity').value;

    if (!name || !phone || !pass) {
      showToast('Vui lòng nhập Họ tên, Số điện thoại và Mật khẩu!', 'error');
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.phone === phone)) {
      showToast('Số điện thoại này đã được đăng ký!', 'error');
      return;
    }

    const newUser = {
      id: 'USR-' + Date.now(),
      name,
      phone,
      email,
      password: pass,
      address,
      city,
      points: 50,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    state.currentUser = newUser;
    localStorage.setItem('mammam_current_user', JSON.stringify(newUser));

    updateUserUI();
    closeModal('authModal');
    showToast(`Chúc mừng ${name}! Bạn đã nhận 50 điểm The Măm Măm! 🎁`);
  }

  function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem('mammam_current_user');
    sessionStorage.removeItem('mammam_admin_logged');
    localStorage.removeItem('mammam_admin_logged');
    updateUserUI();
    closeModal('userProfileModal');
    showToast('Đã đăng xuất tài khoản an toàn!');
  }

  function updateUserUI() {
    const userBtn = document.getElementById('navUserBtn');
    if (!userBtn) return;

    const isAdmin = sessionStorage.getItem('mammam_admin_logged') === 'true' ||
                    localStorage.getItem('mammam_admin_logged') === 'true';

    if (state.currentUser) {
      userBtn.innerHTML = `<span>👤</span> <span>${state.currentUser.name}</span>`;
      userBtn.title = `Tài khoản ${state.currentUser.name}`;
      userBtn.onclick = () => openUserProfile();
    } else if (isAdmin) {
      userBtn.innerHTML = `<span>⚙️</span> <span>Quản Trị</span>`;
      userBtn.title = 'Trang Quản Trị Đơn Hàng Admin';
      userBtn.onclick = () => {
        window.location.href = 'admin.html';
      };
    } else {
      userBtn.innerHTML = `<span>👤</span> <span>Tài Khoản</span>`;
      userBtn.title = 'Đăng nhập / Tài khoản (Khách & Admin)';
      userBtn.onclick = () => openModal('authModal');
    }
  }

  function openUserProfile() {
    const user = state.currentUser;
    const isAdmin = sessionStorage.getItem('mammam_admin_logged') === 'true' ||
                    localStorage.getItem('mammam_admin_logged') === 'true';

    const adminBanner = document.getElementById('profileAdminBanner');
    if (adminBanner) {
      adminBanner.style.display = isAdmin ? 'flex' : 'none';
    }
    const adminLink = document.getElementById('profileAdminDirectLink');
    if (adminLink) {
      adminLink.style.display = isAdmin ? 'inline-block' : 'none';
    }

    if (!user) {
      if (isAdmin) {
        window.location.href = 'admin.html';
        return;
      }
      openModal('authModal');
      return;
    }

    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profilePhone').textContent = user.phone;
    const fullAddr = user.address ? `${user.address}${user.city ? ', ' + user.city : ''}` : (user.city || 'Chưa cập nhật');
    document.getElementById('profileAddress').textContent = fullAddr;
    document.getElementById('profilePoints').textContent = user.points || 0;

    // Prefill address setup fields
    const editName = document.getElementById('profileEditName');
    const editPhone = document.getElementById('profileEditPhone');
    const editCity = document.getElementById('profileEditCity');
    const editAddr = document.getElementById('profileEditAddress');
    if (editName) editName.value = user.name || '';
    if (editPhone) editPhone.value = user.phone || '';
    if (editCity) editCity.value = user.city || 'Hà Nội';
    if (editAddr) editAddr.value = user.address || '';

    // Render personal order history
    const historyList = document.getElementById('profileOrdersList');
    const myOrders = state.orders.filter((o) => o.phone === user.phone);

    if (!myOrders.length) {
      historyList.innerHTML = '<p style="color:#777; text-align:center; padding:1.5rem;">Bạn chưa có đơn hàng nào.</p>';
    } else {
      historyList.innerHTML = myOrders.map((o) => `
        <div style="background:#fdfaf6; border:2px solid #e0d8cc; border-radius:var(--radius-md); padding:1rem; margin-bottom:0.8rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong class="font-mouse-memoirs text-red" style="font-size:1.4rem;">${o.code}</strong>
            <span class="status-badge status-${o.paymentStatus === 'paid' ? 'confirmed' : 'pending'}">
              ${o.paymentStatus === 'paid' ? 'Đã thanh toán MoMo' : 'Chờ MoMo'}
            </span>
          </div>
          <p style="font-size:0.85rem; color:#666;">
            ${new Date(o.createdAt).toLocaleString('vi-VN')} · ${o.items.length} món · <strong>${formatMoney(o.total)}</strong>
          </p>
          <div style="font-size:0.8rem; color:#888; margin-top:0.3rem;">
            Trạng thái: <strong>${getOrderStatusLabel(o.orderStatus)}</strong>
          </div>
        </div>
      `).join('');
    }

    openModal('userProfileModal');
  }

  function handleSaveProfile() {
    const user = state.currentUser;
    if (!user) {
      showToast('Vui lòng đăng nhập để lưu thiết lập địa chỉ!', 'error');
      return;
    }

    const editName = document.getElementById('profileEditName');
    const editPhone = document.getElementById('profileEditPhone');
    const editCity = document.getElementById('profileEditCity');
    const editAddr = document.getElementById('profileEditAddress');

    const name = editName ? editName.value.trim() : '';
    const phone = editPhone ? editPhone.value.trim() : '';
    const city = editCity ? editCity.value : 'Hà Nội';
    const address = editAddr ? editAddr.value.trim() : '';

    if (!name || !phone) {
      showToast('Vui lòng nhập đầy đủ Họ tên và Số điện thoại!', 'error');
      return;
    }

    // Update currentUser object
    user.name = name;
    user.phone = phone;
    user.city = city;
    user.address = address;

    // Save to users array in localStorage
    const users = getUsers();
    const idx = users.findIndex((u) => u.phone === user.phone || u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], name, phone, city, address };
      saveUsers(users);
    }
    localStorage.setItem('mammam_current_user', JSON.stringify(user));

    // Also update guest info fallback so checkout gets prefilled automatically
    state.guestInfo = { name, phone, city, address };
    localStorage.setItem('mammam_guest_info', JSON.stringify(state.guestInfo));

    // Update UI elements
    updateUserUI();
    const profileNameEl = document.getElementById('profileName');
    const profilePhoneEl = document.getElementById('profilePhone');
    const profileAddrEl = document.getElementById('profileAddress');
    if (profileNameEl) profileNameEl.textContent = name;
    if (profilePhoneEl) profilePhoneEl.textContent = phone;
    if (profileAddrEl) profileAddrEl.textContent = address ? `${address}, ${city}` : city;

    showToast('Đã lưu thiết lập thông tin & địa chỉ giao hàng thành công! 📍');
  }

  function getOrderStatusLabel(status) {
    switch (status) {
      case 'pending': return 'Mới tiếp nhận';
      case 'preparing': return 'Đang nướng/chuẩn bị bánh';
      case 'shipping': return 'Đang giao hàng';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  }

  // ════════════════ ADMIN PORTAL REDIRECT ════════════════
  function openAdmin() {
    window.location.href = 'admin.html';
  }

  function renderAdminDashboard() {
    const orders = state.orders;
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((acc, o) => acc + o.total, 0);

    const pendingMomo = orders.filter((o) => o.paymentStatus === 'pending').length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'completed').length;

    document.getElementById('adminTotalOrders').textContent = orders.length;
    document.getElementById('adminRevenue').textContent = formatMoney(totalRevenue);
    document.getElementById('adminPendingMomo').textContent = pendingMomo;
    document.getElementById('adminCompleted').textContent = completedOrders;

    // Admin MoMo Settings inputs
    document.getElementById('adminSettingPhone').value = state.adminSettings.momoPhone;
    document.getElementById('adminSettingName').value = state.adminSettings.momoName;

    renderAdminOrdersList();
  }

  function renderAdminOrdersList() {
    const tableBody = document.getElementById('adminOrdersTableBody');
    if (!tableBody) return;

    const filter = document.getElementById('adminStatusFilter').value;
    const search = document.getElementById('adminSearchInput').value.toLowerCase().trim();

    let list = state.orders;
    if (filter !== 'all') {
      if (filter === 'pending_momo') list = list.filter((o) => o.paymentStatus === 'pending');
      else if (filter === 'paid_momo') list = list.filter((o) => o.paymentStatus === 'paid');
      else list = list.filter((o) => o.orderStatus === filter);
    }

    if (search) {
      list = list.filter((o) =>
        o.code.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.phone.includes(search)
      );
    }

    if (!list.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:2rem; color:#888;">
            Không tìm thấy đơn hàng nào phù hợp.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = list.map((o) => {
      const isPaid = o.paymentStatus === 'paid';
      const itemsBrief = o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');

      return `
        <tr>
          <td>
            <strong class="font-mouse-memoirs text-red" style="font-size:1.3rem;">${o.code}</strong><br/>
            <span style="font-size:0.75rem; color:#777;">${new Date(o.createdAt).toLocaleTimeString('vi-VN')} ${new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
          </td>
          <td>
            <strong>${o.customerName}</strong><br/>
            <span style="color:#0066cc;">📞 ${o.phone}</span><br/>
            <span style="font-size:0.8rem; color:#666;">${o.address}, ${o.city}</span>
          </td>
          <td style="max-width:240px; font-size:0.8rem;">
            ${itemsBrief}
            ${o.note ? `<div style="color:#b21222; font-style:italic; margin-top:2px;">Ghi chú: ${o.note}</div>` : ''}
          </td>
          <td>
            <strong style="color:var(--red); font-size:1.1rem;">${formatMoney(o.total)}</strong>
          </td>
          <td>
            <div style="margin-bottom:0.4rem;">
              <span class="status-badge status-${isPaid ? 'confirmed' : 'pending'}">
                ${isPaid ? '✓ Đã nhận MoMo' : '⏳ Chờ MoMo'}
              </span>
            </div>
            ${!isPaid ? `
              <button class="btn-confirm-momo" onclick="window.mammamApp.adminConfirmMomo('${o.code}')">
                ✓ Xác nhận MoMo
              </button>
            ` : `
              <span style="font-size:0.75rem; color:#2e7d32; font-weight:700;">Đã khớp tiền</span>
            `}
          </td>
          <td>
            <select class="form-select" style="padding:0.4rem; font-size:0.8rem;" onchange="window.mammamApp.adminUpdateOrderStatus('${o.code}', this.value)">
              <option value="pending" ${o.orderStatus === 'pending' ? 'selected' : ''}>Mới nhận</option>
              <option value="preparing" ${o.orderStatus === 'preparing' ? 'selected' : ''}>Làm bánh</option>
              <option value="shipping" ${o.orderStatus === 'shipping' ? 'selected' : ''}>Đang giao</option>
              <option value="completed" ${o.orderStatus === 'completed' ? 'selected' : ''}>Hoàn thành</option>
              <option value="cancelled" ${o.orderStatus === 'cancelled' ? 'selected' : ''}>Hủy đơn</option>
            </select>
            <div style="margin-top:0.4rem; display:flex; gap:0.4rem;">
              <button onclick="window.mammamApp.printOrderBill('${o.code}')" style="background:#eee; border:1px solid #ccc; border-radius:4px; padding:2px 8px; font-size:0.75rem; cursor:pointer;">
                🖨 In Bill
              </button>
              <button onclick="window.mammamApp.adminDeleteOrder('${o.code}')" style="background:#fee; border:1px solid #fcc; color:#c33; border-radius:4px; padding:2px 8px; font-size:0.75rem; cursor:pointer;">
                ✕ Xóa
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function adminConfirmMomo(orderCode) {
    const order = state.orders.find((o) => o.code === orderCode);
    if (!order) return;

    order.paymentStatus = 'paid';
    if (order.orderStatus === 'pending') {
      order.orderStatus = 'preparing';
    }

    saveOrders();
    renderAdminDashboard();
    showToast(`Đã xác nhận thanh toán MoMo cho đơn ${orderCode}! 🎉`);
  }

  function adminUpdateOrderStatus(orderCode, newStatus) {
    const order = state.orders.find((o) => o.code === orderCode);
    if (!order) return;

    order.orderStatus = newStatus;
    saveOrders();
    renderAdminDashboard();
    showToast(`Đã cập nhật trạng thái đơn ${orderCode}: ${getOrderStatusLabel(newStatus)}`);
  }

  function adminDeleteOrder(orderCode) {
    if (!confirm(`Bạn có chắc muốn xóa đơn hàng ${orderCode}?`)) return;
    state.orders = state.orders.filter((o) => o.code !== orderCode);
    saveOrders();
    renderAdminDashboard();
    showToast(`Đã xóa đơn hàng ${orderCode}!`);
  }

  function saveAdminSettings() {
    const phone = document.getElementById('adminSettingPhone').value.trim();
    const name = document.getElementById('adminSettingName').value.trim();

    if (!phone || !name) {
      showToast('Vui lòng không để trống thông tin MoMo!', 'error');
      return;
    }

    state.adminSettings.momoPhone = phone;
    state.adminSettings.momoName = name;
    localStorage.setItem('mammam_admin_settings', JSON.stringify(state.adminSettings));
    showToast('Đã lưu cấu hình tài khoản MoMo nhận tiền! 💾');
  }

  function printOrderBill(orderCode) {
    const order = state.orders.find((o) => o.code === orderCode);
    if (!order) return;

    const printWin = window.open('', '', 'width=600,height=700');
    printWin.document.write(`
      <html>
      <head>
        <title>Hóa Đơn The Măm Măm - ${order.code}</title>
        <style>
          body { font-family: monospace; padding: 20px; line-height: 1.4; }
          .center { text-align: center; }
          .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 4px 0; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2>TIỆM ĐẶC SẢN THE MĂM MĂM</h2>
          <p>Hotline đặt hàng: 0974 449 708</p>
          <div class="line"></div>
          <h3>PHIẾU XÁC NHẬN GIAO HÀNG</h3>
          <p>MÃ ĐƠN: <strong>${order.code}</strong><br/>${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
        </div>
        <div class="line"></div>
        <p><strong>Khách hàng:</strong> ${order.customerName}<br/>
        <strong>SĐT:</strong> ${order.phone}<br/>
        <strong>Địa chỉ:</strong> ${order.address}, ${order.city}<br/>
        ${order.note ? `<strong>Ghi chú:</strong> ${order.note}` : ''}</p>
        <div class="line"></div>
        <table>
          <thead>
            <tr><th>Món</th><th>SL</th><th class="right">Giá</th></tr>
          </thead>
          <tbody>
            ${order.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td class="right">${i.price.toLocaleString('vi-VN')}đ</td></tr>`).join('')}
          </tbody>
        </table>
        <div class="line"></div>
        <table>
          <tr><td>Tạm tính:</td><td class="right">${order.subtotal.toLocaleString('vi-VN')}đ</td></tr>
          <tr><td>Phí ship:</td><td class="right">${order.shippingFee.toLocaleString('vi-VN')}đ</td></tr>
          ${order.discount ? `<tr><td>Giảm giá:</td><td class="right">-${order.discount.toLocaleString('vi-VN')}đ</td></tr>` : ''}
          <tr><td><strong>TỔNG TIỀN:</strong></td><td class="right"><strong>${order.total.toLocaleString('vi-VN')}đ</strong></td></tr>
        </table>
        <div class="line"></div>
        <p class="center">
          Thanh toán: <strong>${order.paymentMethod === 'momo' ? 'Mã QR MoMo' : 'Tiền mặt'}</strong><br/>
          Trạng thái MoMo: <strong>${order.paymentStatus === 'paid' ? 'ĐÃ NHẬN TIỀN' : 'CHỜ THANH TOÁN'}</strong>
        </p>
        <p class="center" style="margin-top:20px;">Cảm ơn quý khách đã ủng hộ The Măm Măm! ❤️</p>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWin.document.close();
  }

  // ════════════════ TOAST SYSTEM ════════════════
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.textContent = msg;

    if (type === 'error') {
      toast.style.background = 'var(--burgundy)';
    }

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ════════════════ MODAL HELPERS ════════════════
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  function initModals() {
    // Close on overlay click or close-button click
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });

    // Drawer backdrop click close for cartDrawer & mobileDrawer
    const cartDrawer = document.getElementById('cartDrawer');
    if (cartDrawer) {
      cartDrawer.addEventListener('click', (e) => {
        if (e.target === cartDrawer) {
          closeModal('cartDrawer');
        }
      });
    }

    const mobileDrawer = document.getElementById('mobileDrawer');
    if (mobileDrawer) {
      mobileDrawer.addEventListener('click', (e) => {
        if (e.target === mobileDrawer) {
          closeModal('mobileDrawer');
        }
      });
    }

    // Explicit close buttons
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetId = btn.dataset.closeModal;
        closeModal(targetId);
      });
    });

    // Escape key closes open drawers & modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ['cartDrawer', 'mobileDrawer', 'authModal', 'userProfileModal', 'productDetailModal', 'checkoutModal', 'orderSuccessModal', 'chatShopModal', 'faqBotModal'].forEach(closeModal);
      }
    });
  }

  // ════════════════ COPY HELPERS ════════════════
  function copyText(text, label) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Đã sao chép ${label}: ${text} 📋`);
      });
    } else {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      showToast(`Đã sao chép ${label}: ${text} 📋`);
    }
  }

  // ════════════════ CHAT CHO TIỆM (TELEGRAM BOT ROUTING) ════════════════
  async function submitChatShop() {
    const nameInput = document.getElementById('chatCustomerName');
    const phoneInput = document.getElementById('chatCustomerPhone');
    const msgInput = document.getElementById('chatCustomerMsg');
    const statusBox = document.getElementById('chatSubmitStatus');
    const submitBtn = document.getElementById('chatSubmitBtn');

    if (!nameInput || !phoneInput || !msgInput) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const msg = msgInput.value.trim();

    if (!name || name.length < 2) {
      alert('Vui lòng nhập họ và tên của bạn!');
      nameInput.focus();
      return;
    }

    const cleanPhone = phone.replace(/[\s\.\-]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      alert('Vui lòng nhập số điện thoại hợp lệ (9–11 chữ số)!');
      phoneInput.focus();
      return;
    }

    if (!msg) {
      alert('Vui lòng nhập nội dung cần tư vấn hoặc món bạn muốn đặt!');
      msgInput.focus();
      return;
    }

    // Save lead to localStorage for Admin inquiry dashboard
    const newLead = {
      id: 'CHAT-' + Date.now().toString().slice(-6),
      name: name,
      phone: cleanPhone,
      message: msg,
      createdAt: new Date().toISOString(),
      status: 'pending' // pending | called
    };
    try {
      const existingLeads = JSON.parse(localStorage.getItem('mammam_chat_leads') || '[]');
      existingLeads.unshift(newLead);
      localStorage.setItem('mammam_chat_leads', JSON.stringify(existingLeads));
    } catch (e) {
      console.warn('Could not save lead to localStorage', e);
    }

    // Đồng bộ tin nhắn khách lên Cloudflare D1 Serverless API
    try {
      fetch('/api/chat-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          phone: cleanPhone,
          message: msg
        })
      }).catch(e => console.warn('D1 Lead API sync notice:', e));
    } catch (e) {}

    // Load Telegram Configuration
    let tgConfig = null;
    const storedTg = localStorage.getItem('mammam_telegram_config');
    if (storedTg) {
      try { tgConfig = JSON.parse(storedTg); } catch (e) {}
    }
    if (!tgConfig || !tgConfig.botToken || !tgConfig.chatId) {
      tgConfig = MAMMAM_DATA.telegram || {};
    }

    const botToken = (tgConfig.botToken || '').trim();
    const chatId = (tgConfig.chatId || '').trim();
    const botUser = (tgConfig.botUsername || 'themammam_bot').replace('@', '').trim();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ Đang gửi tin nhắn tới tiệm...</span>';
    }
    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.style.background = '#e0f2fe';
      statusBox.style.color = '#0369a1';
      statusBox.style.border = '1px solid #7dd3fc';
      statusBox.innerHTML = 'Đang chuyển tin nhắn tới Telegram của tiệm...';
    }

    const timeStr = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false
    });

    const telegramText = 
      `🛎️ <b>KHÁCH CHAT TƯ VẤN - THE MĂM MĂM</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Khách hàng:</b> ${name}\n` +
      `📞 <b>Số điện thoại:</b> <a href="tel:${cleanPhone}">${cleanPhone}</a>\n` +
      `💬 <b>Nội dung tư vấn:</b>\n<i>${msg}</i>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `⏰ <b>Thời gian:</b> ${timeStr}\n` +
      `🌐 <b>Nguồn:</b> Website The Măm Măm (Khách gửi từ form chat)\n` +
      `👉 <i>Bấm số điện thoại trên để gọi lại ngay cho khách!</i>`;

    let sentToTelegram = false;

    if (botToken && chatId) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramText,
            parse_mode: 'HTML'
          })
        });
        const resData = await res.json();
        if (resData.ok) {
          sentToTelegram = true;
        } else {
          console.warn('Telegram API response not ok:', resData);
        }
      } catch (err) {
        console.error('Fetch Telegram error:', err);
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>🚀 Gửi Tin Nhắn Cho Tiệm</span>';
    }

    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.style.background = '#dcfce7';
      statusBox.style.color = '#15803d';
      statusBox.style.border = '1.5px solid #86efac';
      statusBox.innerHTML = `
        <div style="font-weight:800; font-size:0.95rem; margin-bottom:4px;">
          🎉 ĐÃ GỬI THÀNH CÔNG CHO TIỆM!
        </div>
        <div>
          Cảm ơn bạn <strong>${name}</strong>! Đội ngũ The Măm Măm đã nhận được thông tin và sẽ gọi điện hoặc nhắn tin tư vấn lại qua số <strong>${cleanPhone}</strong> trong ít phút.
        </div>
        <div style="margin-top:8px;">
          <a href="https://t.me/${botUser}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#0088cc; color:#fff; padding:4px 12px; border-radius:999px; text-decoration:none; font-size:0.8rem; font-weight:700;">
            ✈️ Mở ứng dụng Telegram chat tiếp ➔
          </a>
        </div>
      `;
    }

    // Reset inputs
    nameInput.value = '';
    phoneInput.value = '';
    msgInput.value = '';
    showToast('Đã gửi tin nhắn tới tiệm The Măm Măm! 💬');
  }

  // ════════════════ INITIALIZATION ════════════════
  document.addEventListener('DOMContentLoaded', () => {
    loadStorage();
    initPreloader();
    initEyeTracking();
    initStickers();
    initModals();
    renderCategoryTabs();
    renderProducts();
    renderCart();
    updateCartBadge();
    updateUserUI();

    // Search Input
    const searchInput = document.getElementById('menuSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderProducts();
      });
    }

    // Sort Select
    const sortSelect = document.getElementById('menuSort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderProducts();
      });
    }

    // Cart Button in Navbar
    const navCartBtn = document.getElementById('navCartBtn');
    if (navCartBtn) {
      navCartBtn.addEventListener('click', () => openModal('cartDrawer'));
    }

    // Mobile nav toggle
    const mobileToggle = document.getElementById('mobileNavToggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => openModal('mobileDrawer'));
    }

    // Checkout button in Cart
    const checkoutBtn = document.getElementById('proceedCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', openCheckout);
    }

    // Place Order button in Checkout
    const placeOrderBtn = document.getElementById('confirmOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

    // Voucher apply button (Bảo mật xác thực chữ ký & chống hack)
    const applyVoucherBtn = document.getElementById('applyVoucherBtn');
    if (applyVoucherBtn) {
      applyVoucherBtn.addEventListener('click', () => {
        const inputEl = document.getElementById('voucherInput');
        const code = inputEl ? inputEl.value.trim().toUpperCase() : '';
        
        if (!code) {
          showToast('Vui lòng nhập mã voucher giảm giá!', 'error');
          return;
        }

        if (window.VoucherSecurity) {
          const res = window.VoucherSecurity.verifyVoucher(code);
          if (!res.valid) {
            showToast(res.error || 'Mã giảm giá không hợp lệ!', 'error');
            state.voucher = null;
          } else {
            const v = res.voucher;
            state.voucher = {
              code: v.code,
              percent: v.percent,
              discountType: v.discountType,
              fixedAmount: v.fixedAmount,
              desc: v.desc
            };
            showToast(`Áp dụng mã ${v.code} thành công (${v.desc})! 🎉`);
          }
        } else {
          // Fallback if script unavailable
          if (code === 'MAMMAM20') {
            state.voucher = { code, desc: 'Giảm 20.000đ cho đơn hàng' };
            showToast('Áp dụng mã MAMMAM20 thành công (-20.000đ)! 🎉');
          } else if (code === 'FREESHIP') {
            state.voucher = { code, desc: 'Miễn phí giao hàng toàn quốc' };
            showToast('Áp dụng mã FREESHIP thành công! 🚚');
          } else {
            showToast('Mã giảm giá không hợp lệ!', 'error');
            state.voucher = null;
          }
        }
        renderCart();
      });
    }

    // Admin Access -> Redirect to dedicated admin.html
    document.querySelectorAll('.open-admin-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'admin.html';
      });
    });

    // Chat Cho Tiệm FAB button click
    const fabChatShopBtn = document.getElementById('fabChatShopBtn');
    if (fabChatShopBtn) {
      fabChatShopBtn.addEventListener('click', () => {
        openModal('chatShopModal');
      });
    }

    // Auth forms
    const loginBtn = document.getElementById('loginSubmitBtn');
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);

    const loginIdentifier = document.getElementById('loginIdentifier');
    if (loginIdentifier) {
      loginIdentifier.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
      });
    }

    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
      loginPassword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
      });
    }

    const regBtn = document.getElementById('regSubmitBtn');
    if (regBtn) regBtn.addEventListener('click', handleRegister);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const profileSaveBtn = document.getElementById('profileSaveBtn');
    if (profileSaveBtn) profileSaveBtn.addEventListener('click', handleSaveProfile);

    // Auth tabs toggle
    const tabLogin = document.getElementById('tabLoginBtn');
    const tabReg = document.getElementById('tabRegBtn');
    const formLogin = document.getElementById('loginFormWrap');
    const formReg = document.getElementById('regFormWrap');

    if (tabLogin && tabReg) {
      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
        formLogin.style.display = 'block';
        formReg.style.display = 'none';
      });

      tabReg.addEventListener('click', () => {
        tabReg.classList.add('active');
        tabLogin.classList.remove('active');
        formLogin.style.display = 'none';
        formReg.style.display = 'block';
      });
    }

    // Copy buttons in success modal
    document.querySelectorAll('[data-copy-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.copyTarget;
        const label = btn.dataset.copyLabel || 'nội dung';
        const el = document.getElementById(targetId);
        if (el) copyText(el.textContent.trim(), label);
      });
    });

    // Hash change router (e.g. #admin, #menu)
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#admin') {
        openAdmin();
      }
    });

    if (window.location.hash === '#admin') {
      openAdmin();
    }

    // Initialize Potato Dodging Mini-Game & Lucky Wheel
    initPotatoGame();
    initLuckyWheel();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // WEB AUDIO SYNTHESIZER (NO EXTERNAL AUDIO FILES REQUIRED)
  // ═════════════════════════════════════════════════════════════════════════
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'crunch') {
        // Multi-layer realistic crispy potato chip crunch sound
        const bufferSize = Math.floor(ctx.sampleRate * 0.14);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.028));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3400, now);
        filter.frequency.exponentialRampToValueAtTime(750, now + 0.12);
        filter.Q.setValueAtTime(2.8, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.9, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);

        // Low-frequency impact snap thud
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
        oscGain.gain.setValueAtTime(0.75, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'whoosh') {
        // Spoon swing whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'tick') {
        // Wheel peg tick click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1250, now);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
      } else if (type === 'beep') {
        // Countdown alert beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'win') {
        // Victory fanfare arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.24, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.28);
        });
      }
    } catch (e) {
      console.warn('Sound synthesis warning:', e);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // POTATO DODGING MINI-GAME ENGINE (10s THỬ THÁCH, BIẾT NÉ, VỠ VỤN)
  // ═════════════════════════════════════════════════════════════════════════
  let gameRunning = false;
  let gameStartTime = 0;
  const GAME_DURATION = 10000; // 10.0s
  let lastFrameTime = 0;
  let gameAnimId = null;

  let potatoX = 0;
  let potatoY = 0;
  let potatoVx = 0;
  let potatoVy = 0;
  let cursorX = -500;
  let cursorY = -500;
  let dodgeSign = 1;
  let isEvading = false;
  let lastWobbleTime = 0;
  let lastBubbleTime = 0;
  let lastBeepSec = -1;
  let dodgeCount = 0;
  let isDizzy = false;
  let dizzyUntil = 0;

  const roamingTaunts = [
    'Hehe đố gõ trúng! 😜',
    'Né skill cực mượt! ⚡',
    'Lêu lêu! 😝',
    'Chậm thế này sao trúng? 🏃',
    'Không chạm được đâu nha!',
    'Thử bắt mình xem nào!'
  ];

  const panicTaunts = [
    'Á á né nè! 💨',
    'Hụt rồi nha! 🤣',
    'Bỏ cái thìa ra mau! 😱',
    'Úi giời xém trúng! ⚡',
    'Né gấp né gấp! 🏃💨'
  ];

  function initPotatoGame() {
    const startBtn = document.getElementById('startPotatoGameBtn');
    const mascotBox = document.getElementById('faceMascotInteractiveBox');
    const quitBtn = document.getElementById('quitGameBtn');
    const retryBtn = document.getElementById('retryGameBtn');
    const closePopupBtn = document.getElementById('closeGamePopupBtn');
    const openWheelBtn = document.getElementById('openLuckyWheelBtn');
    const arena = document.getElementById('potatoGameArena');
    const spoon = document.getElementById('spoonCursor');

    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        startPotatoGame();
      });
    }

    if (mascotBox) {
      mascotBox.addEventListener('click', (e) => {
        // Prevent click when dragging or clicking other controls
        startPotatoGame();
      });
    }

    if (quitBtn) {
      quitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        quitPotatoGame();
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startPotatoGame();
      });
    }

    if (closePopupBtn) {
      closePopupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        quitPotatoGame();
      });
    }

    if (openWheelBtn) {
      openWheelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        quitPotatoGame();
        openLuckyWheelModal();
      });
    }

    function updateSpoonPosition(x, y, isStriking = false) {
      if (!spoon) return;
      const angle = isStriking ? -65 : -25;
      const scale = isStriking ? 0.92 : 1;
      spoon.style.transform = `translate3d(${x - 26}px, ${y - 20}px, 0) rotate(${angle}deg) scale(${scale})`;
    }

    // Track spoon cursor across viewport with instantaneous zero-lag GPU transform
    window.addEventListener('pointermove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (spoon && gameRunning) {
        updateSpoonPosition(cursorX, cursorY, spoon.classList.contains('striking'));
      }
    });

    // Bonk striking on arena click/tap
    if (arena) {
      arena.addEventListener('pointerdown', (e) => {
        if (!gameRunning) return;
        cursorX = e.clientX;
        cursorY = e.clientY;

        // Spoon strike animation with instant visual feedback
        if (spoon) {
          spoon.classList.add('striking');
          updateSpoonPosition(cursorX, cursorY, true);
          setTimeout(() => {
            spoon.classList.remove('striking');
            if (gameRunning) {
              updateSpoonPosition(cursorX, cursorY, false);
            }
          }, 110);
        }

        playSound('whoosh');

        // Check collision with potato
        const dist = Math.hypot(potatoX - cursorX, potatoY - cursorY);
        const hudTaunt = document.getElementById('hudTauntMsg');
        const potato = document.getElementById('dodgingPotato');

        if (isDizzy) {
          // In dizzy state, potato is vulnerable to spoon bonk!
          const HIT_RADIUS = 78;
          if (dist <= HIT_RADIUS) {
            // HIT CONFIRMED!
            handlePotatoHit(potatoX, potatoY);
          } else {
            showPotatoBubble('Chệch rồi! Đập mau kẻo tỉnh! 😱');
          }
        } else {
          // ACTIVE REACTION DODGE: The potato immediately detects the strike and leaps away!
          dodgeCount++;

          // Leap vector away from tap location
          const angle = Math.atan2(potatoY - cursorY, potatoX - cursorX) + (Math.random() - 0.5) * 0.7;
          const leapDist = 135 + Math.random() * 85;
          potatoX += Math.cos(angle) * leapDist;
          potatoY += Math.sin(angle) * leapDist;

          // Clamp within screen boundaries
          const margin = 80;
          const topMargin = 130;
          potatoX = Math.max(margin, Math.min(window.innerWidth - margin, potatoX));
          potatoY = Math.max(topMargin, Math.min(window.innerHeight - margin, potatoY));

          // Give a high sprint speed in leap direction
          const LEAP_SPEED = 960;
          potatoVx = Math.cos(angle) * LEAP_SPEED;
          potatoVy = Math.sin(angle) * LEAP_SPEED;

          if (potato) {
            potato.style.left = potatoX + 'px';
            potato.style.top = potatoY + 'px';
          }

          if (dodgeCount >= 3) {
            // Potato is exhausted & dizzy for 1.15s!
            isDizzy = true;
            dizzyUntil = performance.now() + 1150;
            if (potato) {
              potato.classList.add('dizzy');
              const avatarWrap = potato.querySelector('.potato-avatar-wrap');
              if (avatarWrap) avatarWrap.style.transform = '';
            }
            potatoVx *= 0.1;
            potatoVy *= 0.1;
            showPotatoBubble('Thở không ra hơi rồi... 😵 ĐẬP MAU!');
            if (hudTaunt) hudTaunt.textContent = '⚡ KHOAI TÂY ĐANG CHOÁNG VÁNG! ĐẬP NGAY BÂY GIỜ! 💥🔨';
            playSound('beep');
          } else {
            const dodgeMsg = [
              `Né phát ${dodgeCount}/3! 🏃💨`,
              `Hụt rồi nha! 😜 (${dodgeCount}/3)`,
              'Thìa chậm quá! ⚡',
              'Gió thoảng qua thôi! 💨'
            ];
            const msg = dodgeMsg[(dodgeCount - 1) % dodgeMsg.length];
            showPotatoBubble(msg);
            if (hudTaunt) hudTaunt.textContent = `🥔 Khoai tây vừa né (${dodgeCount}/3 lần)! Gõ nhanh để làm nó choáng!`;
          }
        }
      });
    }
  }

  function startPotatoGame() {
    getAudioContext(); // Pre-warm audio on user click
    const arena = document.getElementById('potatoGameArena');
    const potato = document.getElementById('dodgingPotato');
    const timerVal = document.getElementById('gameTimerVal');
    const hudTaunt = document.getElementById('hudTauntMsg');
    const gameOverPopup = document.getElementById('gameOverPopup');
    const gameVictoryPopup = document.getElementById('gameVictoryPopup');
    const shatterBox = document.getElementById('shatterContainer');
    const impactBurst = document.getElementById('impactBurst');
    const spoon = document.getElementById('spoonCursor');

    if (!arena || !potato) return;

    // Reset visual states
    arena.classList.remove('hidden');
    arena.classList.remove('arena-screen-shake');
    arena.classList.remove('popup-active');
    if (gameOverPopup) gameOverPopup.classList.add('hidden');
    if (gameVictoryPopup) gameVictoryPopup.classList.add('hidden');
    if (shatterBox) shatterBox.innerHTML = '';
    if (impactBurst) impactBurst.classList.add('hidden');

    potato.style.display = 'block';
    potato.classList.remove('evading');
    potato.classList.remove('dizzy');
    dodgeCount = 0;
    isDizzy = false;
    dizzyUntil = 0;

    // Initial position: center of viewport
    potatoX = window.innerWidth / 2;
    potatoY = window.innerHeight / 2;

    // Random initial trajectory at roaming speed
    const initAngle = Math.random() * Math.PI * 2;
    const initSpeed = 420;
    potatoVx = Math.cos(initAngle) * initSpeed;
    potatoVy = Math.sin(initAngle) * initSpeed;

    potato.style.left = potatoX + 'px';
    potato.style.top = potatoY + 'px';

    if (timerVal) {
      timerVal.textContent = '10.0s';
      timerVal.className = 'hud-value';
    }

    if (hudTaunt) {
      hudTaunt.textContent = '🥄 Di chuyển thìa và nhấp để gõ trúng khoai tây!';
    }

    showPotatoBubble('Thách bạn gõ trúng mình đấy! 😜');

    // Position spoon initially
    if (spoon) {
      spoon.style.display = 'block';
      const initialX = cursorX > 0 ? cursorX : window.innerWidth / 2 + 100;
      const initialY = cursorY > 0 ? cursorY : window.innerHeight / 2;
      spoon.style.transform = `translate3d(${initialX - 26}px, ${initialY - 20}px, 0) rotate(-25deg)`;
    }

    gameRunning = true;
    gameStartTime = performance.now();
    lastFrameTime = performance.now();
    lastWobbleTime = performance.now();
    lastBubbleTime = performance.now();
    lastBeepSec = -1;

    if (gameAnimId) cancelAnimationFrame(gameAnimId);
    gameAnimId = requestAnimationFrame(gameLoop);
  }

  function quitPotatoGame() {
    gameRunning = false;
    if (gameAnimId) {
      cancelAnimationFrame(gameAnimId);
      gameAnimId = null;
    }
    const arena = document.getElementById('potatoGameArena');
    if (arena) {
      arena.classList.add('hidden');
      arena.classList.remove('popup-active');
    }
  }

  function showPotatoBubble(text) {
    const bubble = document.getElementById('potatoBubble');
    if (!bubble) return;
    bubble.textContent = text;
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateX(-50%) scale(1.08)';
    setTimeout(() => {
      bubble.style.transform = 'translateX(-50%) scale(1)';
    }, 150);
  }

  // Main high-frequency game physics loop (RequestAnimationFrame)
  function gameLoop(timestamp) {
    if (!gameRunning) return;

    const dt = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
    lastFrameTime = timestamp;

    const elapsed = timestamp - gameStartTime;
    const remaining = Math.max(0, (GAME_DURATION - elapsed) / 1000);

    const timerVal = document.getElementById('gameTimerVal');
    const potato = document.getElementById('dodgingPotato');
    const sweat = document.getElementById('potatoSweat');
    const hudTaunt = document.getElementById('hudTauntMsg');

    // Update Timer HUD
    if (timerVal) {
      timerVal.textContent = remaining.toFixed(1) + 's';
      if (remaining <= 3.0) {
        timerVal.className = 'hud-value timer-danger';
        const currentSec = Math.floor(remaining);
        if (currentSec !== lastBeepSec) {
          lastBeepSec = currentSec;
          playSound('beep');
        }
      } else if (remaining <= 6.0) {
        timerVal.className = 'hud-value timer-warning';
      } else {
        timerVal.className = 'hud-value';
      }
    }

    // Check Timeout
    if (remaining <= 0) {
      handleGameTimeout();
      return;
    }

    // ── DIZZY STATE HANDLING & RECOVERY ──
    if (isDizzy) {
      if (timestamp > dizzyUntil) {
        // Recover from dizziness!
        isDizzy = false;
        dodgeCount = 0;
        if (potato) potato.classList.remove('dizzy');
        const recoverSpeed = 460;
        const randAng = Math.random() * Math.PI * 2;
        potatoVx = Math.cos(randAng) * recoverSpeed;
        potatoVy = Math.sin(randAng) * recoverSpeed;
        showPotatoBubble('Hồi sức rồi, đố bắt được! 🏃💨');
        if (hudTaunt) hudTaunt.textContent = '🥄 Khoai tây đã tỉnh! Nhấp gõ nhanh 3 lần để làm nó choáng!';
      } else {
        // Drifting weakly while dizzy
        potatoVx *= 0.93;
        potatoVy *= 0.93;
      }
    } else {
      // ── AI DODGING & REACTION ENGINE (MỨC ĐỘ KHÓ) ──
      const dx = potatoX - cursorX;
      const dy = potatoY - cursorY;
      const dist = Math.hypot(dx, dy);
      const DANGER_RADIUS = 185; // Proximity evasion radar

      if (dist < DANGER_RADIUS) {
        // PANIC EVASION: The potato actively spots the spoon and dashes away!
        isEvading = true;
        if (potato) potato.classList.add('evading');

        // Unit vector directly away from spoon
        const ux = dx / (dist || 1);
        const uy = dy / (dist || 1);

        // Perpendicular evasive sidestep (feint)
        const perpX = -uy * dodgeSign;
        const perpY = ux * dodgeSign;

        // Burst velocity: 850px/sec sprint!
        const BURST_SPEED = 850;
        const targetVx = (ux * 0.72 + perpX * 0.65) * BURST_SPEED;
        const targetVy = (uy * 0.72 + perpY * 0.65) * BURST_SPEED;

        // Quick acceleration
        potatoVx += (targetVx - potatoVx) * 0.38;
        potatoVy += (targetVy - potatoVy) * 0.38;

        if (timestamp - lastBubbleTime > 1200) {
          lastBubbleTime = timestamp;
          const randTaunt = panicTaunts[Math.floor(Math.random() * panicTaunts.length)];
          showPotatoBubble(randTaunt);
          if (hudTaunt) hudTaunt.textContent = randTaunt;
        }
      } else {
        // NORMAL AGILE DRIFT
        isEvading = false;
        if (potato) potato.classList.remove('evading');

        // Periodic random course wobble to be unpredictable
        if (timestamp - lastWobbleTime > 380) {
          lastWobbleTime = timestamp;
          dodgeSign = Math.random() > 0.5 ? 1 : -1;
          const currentSpeed = Math.hypot(potatoVx, potatoVy) || 400;
          const currentAngle = Math.atan2(potatoVy, potatoVx);
          const newAngle = currentAngle + (Math.random() - 0.5) * 1.2;
          const targetSpeed = 380 + Math.random() * 80;
          potatoVx = Math.cos(newAngle) * targetSpeed;
          potatoVy = Math.sin(newAngle) * targetSpeed;
        }

        if (timestamp - lastBubbleTime > 2200) {
          lastBubbleTime = timestamp;
          const randTaunt = roamingTaunts[Math.floor(Math.random() * roamingTaunts.length)];
          showPotatoBubble(randTaunt);
        }
      }
    }

    // Bounce off viewport boundaries
    const margin = 75;
    const topMargin = 120; // Room for top HUD
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    if (potatoX < margin) {
      potatoX = margin;
      potatoVx = Math.abs(potatoVx) * 1.05;
      dodgeSign = -dodgeSign;
    } else if (potatoX > screenW - margin) {
      potatoX = screenW - margin;
      potatoVx = -Math.abs(potatoVx) * 1.05;
      dodgeSign = -dodgeSign;
    }

    if (potatoY < topMargin) {
      potatoY = topMargin;
      potatoVy = Math.abs(potatoVy) * 1.05;
      dodgeSign = -dodgeSign;
    } else if (potatoY > screenH - margin) {
      potatoY = screenH - margin;
      potatoVy = -Math.abs(potatoVy) * 1.05;
      dodgeSign = -dodgeSign;
    }

    // Update position
    potatoX += potatoVx * dt;
    potatoY += potatoVy * dt;

    if (potato) {
      potato.style.left = potatoX + 'px';
      potato.style.top = potatoY + 'px';

      const avatarWrap = potato.querySelector('.potato-avatar-wrap');
      if (avatarWrap) {
        if (isDizzy) {
          avatarWrap.style.transform = '';
        } else {
          const tilt = Math.max(-25, Math.min(25, potatoVx * 0.035));
          avatarWrap.style.transform = `rotate(${tilt}deg) scale(${isEvading ? '1.12, 0.88' : '1, 1'})`;
        }
      }
    }

    gameAnimId = requestAnimationFrame(gameLoop);
  }

  // Timeout handler (Khi hết 10 giây)
  function handleGameTimeout() {
    gameRunning = false;
    if (gameAnimId) {
      cancelAnimationFrame(gameAnimId);
      gameAnimId = null;
    }

    showPotatoBubble('🏃💨 Hehe thoát rồi! Lêu lêu!');
    const arena = document.getElementById('potatoGameArena');
    if (arena) arena.classList.add('popup-active');
    const popup = document.getElementById('gameOverPopup');
    if (popup) popup.classList.remove('hidden');
  }

  // Hit handler (Khi gõ trúng khoai tây vỡ vụn như thật)
  function handlePotatoHit(hitX, hitY) {
    gameRunning = false;
    if (gameAnimId) {
      cancelAnimationFrame(gameAnimId);
      gameAnimId = null;
    }

    const arena = document.getElementById('potatoGameArena');
    const potato = document.getElementById('dodgingPotato');
    const shatterContainer = document.getElementById('shatterContainer');
    const impactBurst = document.getElementById('impactBurst');
    const victoryPopup = document.getElementById('gameVictoryPopup');

    // Immediately hide original potato sprite
    if (potato) potato.style.display = 'none';

    // Play crisp crunch sound
    playSound('crunch');

    // Screen micro-shake
    if (arena) {
      arena.classList.remove('arena-screen-shake');
      void arena.offsetWidth; // trigger reflow
      arena.classList.add('arena-screen-shake');
    }

    // Comic impact text & shockwave
    if (impactBurst) {
      impactBurst.style.left = hitX + 'px';
      impactBurst.style.top = hitY + 'px';
      impactBurst.classList.remove('hidden');
    }

    // ── SHATTER PHYSICS GENERATOR ──
    // 1. Eight large textured potato chip shards flying outward
    if (shatterContainer) {
      shatterContainer.innerHTML = '';
      const shardsCount = 8;
      const shards = [];

      for (let i = 1; i <= shardsCount; i++) {
        const shardEl = document.createElement('div');
        shardEl.className = 'shatter-shard';
        const img = document.createElement('img');
        img.src = `assets/shards/shard_${i}.png`;
        img.alt = 'Chip Fragment';
        shardEl.appendChild(img);

        const shardSize = 55 + Math.random() * 50;
        shardEl.style.width = shardSize + 'px';
        shardEl.style.height = shardSize + 'px';
        shardEl.style.left = hitX + 'px';
        shardEl.style.top = hitY + 'px';
        shatterContainer.appendChild(shardEl);

        const angle = (i / shardsCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
        const speed = 280 + Math.random() * 420;

        shards.push({
          el: shardEl,
          x: hitX - shardSize / 2,
          y: hitY - shardSize / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 160, // initial upward blast
          rot: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 650,
          opacity: 1
        });
      }

      // 2. Twenty-four crispy golden crumbs & seaweed particles
      const crumbsCount = 24;
      const crumbs = [];
      const crumbColors = ['#f59e0b', '#fbbf24', '#fde047', '#d97706', '#2e7d32', '#166534'];

      for (let i = 0; i < crumbsCount; i++) {
        const crumbEl = document.createElement('div');
        crumbEl.className = 'shatter-crumb';
        const size = 6 + Math.random() * 10;
        const color = crumbColors[Math.floor(Math.random() * crumbColors.length)];
        crumbEl.style.width = size + 'px';
        crumbEl.style.height = size + 'px';
        crumbEl.style.background = color;
        crumbEl.style.boxShadow = `0 2px 6px ${color}88`;
        crumbEl.style.left = hitX + 'px';
        crumbEl.style.top = hitY + 'px';
        shatterContainer.appendChild(crumbEl);

        const angle = Math.random() * Math.PI * 2;
        const speed = 180 + Math.random() * 500;

        crumbs.push({
          el: crumbEl,
          x: hitX,
          y: hitY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 120,
          rot: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 800,
          opacity: 1
        });
      }

      // Particle physics animation loop
      let animStartTime = performance.now();
      const GRAVITY = 1100; // px/s^2

      function stepParticles(now) {
        const pElapsed = (now - animStartTime) / 1000;
        if (pElapsed > 1.25) return;

        const pDt = 0.016;

        // Update shards
        shards.forEach((s) => {
          s.x += s.vx * pDt;
          s.y += s.vy * pDt;
          s.vy += GRAVITY * pDt;
          s.rot += s.rotSpeed * pDt;
          s.opacity = Math.max(0, 1 - pElapsed / 1.15);

          s.el.style.transform = `translate3d(${s.x - hitX}px, ${s.y - hitY}px, 0) rotate(${s.rot}deg)`;
          s.el.style.opacity = s.opacity;
        });

        // Update crumbs
        crumbs.forEach((c) => {
          c.x += c.vx * pDt;
          c.y += c.vy * pDt;
          c.vy += (GRAVITY * 0.9) * pDt;
          c.rot += c.rotSpeed * pDt;
          c.opacity = Math.max(0, 1 - pElapsed / 1.0);

          c.el.style.transform = `translate3d(${c.x - hitX}px, ${c.y - hitY}px, 0) rotate(${c.rot}deg)`;
          c.el.style.opacity = c.opacity;
        });

        requestAnimationFrame(stepParticles);
      }
      requestAnimationFrame(stepParticles);
    }

    // Qualify game session cryptographically (Proof of Play for Lucky Wheel)
    if (window.VoucherSecurity) {
      window.VoucherSecurity.createQualifiedGameSession();
    }

    // After 1.1s: Victory fanfare and reveal Victory Modal
    setTimeout(() => {
      playSound('win');
      if (arena) arena.classList.add('popup-active');
      if (victoryPopup) victoryPopup.classList.remove('hidden');
    }, 1100);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // LUCKY WHEEL ENGINE (VÒNG QUAY MAY MẮN)
  // Tỉ lệ chuẩn xác:
  // 1. Chúc bạn may mắn lần sau: 20%
  // 2. Evoucher giảm 5%: 50%
  // 3. Evoucher giảm 10%: 15%
  // 4. Evoucher giảm 15%: 15%
  // ═════════════════════════════════════════════════════════════════════════
  const WHEEL_PRIZES = [
    {
      id: 0,
      title: 'Chúc bạn may mắn lần sau',
      shortTitle: 'CHÚC MAY MẮN',
      subTitle: 'LẦN SAU',
      icon: '🥔',
      color: '#64748B',
      textColor: '#FFFFFF',
      rate: 20
    },
    {
      id: 1,
      title: 'Evoucher giảm 5%',
      shortTitle: 'EVOUCHER',
      subTitle: 'GIẢM 5%',
      icon: '🎟️',
      color: '#F59E0B',
      textColor: '#1B1B1B',
      code: 'MAMMAM5',
      percent: 5,
      rate: 50
    },
    {
      id: 2,
      title: 'Evoucher giảm 10%',
      shortTitle: 'EVOUCHER',
      subTitle: 'GIẢM 10%',
      icon: '🎁',
      color: '#DC2626',
      textColor: '#FFFFFF',
      code: 'MAMMAM10',
      percent: 10,
      rate: 15
    },
    {
      id: 3,
      title: 'Evoucher giảm 15%',
      shortTitle: 'JACKPOT',
      subTitle: 'GIẢM 15%',
      icon: '👑',
      color: '#EAB308',
      textColor: '#1B1B1B',
      code: 'MAMMAM15',
      percent: 15,
      rate: 15
    }
  ];

  let currentWheelRotation = 0;
  let isWheelSpinning = false;

  function initLuckyWheel() {
    drawLuckyWheelCanvas();

    const spinBtn = document.getElementById('spinWheelBtn');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        spinLuckyWheel();
      });
    }
  }

  function openLuckyWheelModal() {
    drawLuckyWheelCanvas();
    const resultCard = document.getElementById('wheelResultCard');
    if (resultCard) resultCard.classList.add('hidden');
    const spinBtn = document.getElementById('spinWheelBtn');
    if (spinBtn) spinBtn.disabled = false;
    openModal('luckyWheelModal');
  }

  function drawLuckyWheelCanvas() {
    const canvas = document.getElementById('luckyWheelCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 400;
    canvas.width = size * 2; // high-dpi
    canvas.height = size * 2;
    ctx.scale(2, 2);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 12;
    const numSlices = WHEEL_PRIZES.length; // 4
    const sliceAngle = (2 * Math.PI) / numSlices; // 90 deg = PI/2

    ctx.clearRect(0, 0, size, size);

    // Draw Slices
    for (let i = 0; i < numSlices; i++) {
      const p = WHEEL_PRIZES[i];
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();

      // Slice divider border
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Slice Text & Icon
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sliceAngle / 2);

      // Icon
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.icon, radius * 0.76, 0);

      // Title
      ctx.fillStyle = p.textColor;
      ctx.font = 'bold 15px "Saira Condensed", sans-serif';
      ctx.fillText(p.shortTitle, radius * 0.50, -9);
      ctx.font = '900 17px "Coiny", cursive, sans-serif';
      ctx.fillText(p.subTitle, radius * 0.50, 11);

      ctx.restore();
    }

    // Outer golden rim with LED lights
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#FFD750';
    ctx.stroke();

    // 16 LED bulb pins
    const numPins = 16;
    for (let j = 0; j < numPins; j++) {
      const pinAngle = j * ((2 * Math.PI) / numPins);
      const px = cx + (radius - 1) * Math.cos(pinAngle);
      const py = cy + (radius - 1) * Math.sin(pinAngle);

      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = j % 2 === 0 ? '#FFFFFF' : '#FFD750';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#1b1b1b';
      ctx.stroke();
    }
  }

  function spinLuckyWheel() {
    if (isWheelSpinning) return;

    // ── ANTI-CHEAT: VERIFY QUALIFIED MINIGAME PLAY ──
    if (window.VoucherSecurity) {
      const playCheck = window.VoucherSecurity.validateAndConsumeGameSession();
      if (!playCheck.valid) {
        showToast(playCheck.message || '⚠️ Bạn cần hoàn thành thử thách gõ khoai tây trước khi quay thưởng!', 'error');
        return;
      }
    }

    isWheelSpinning = true;

    const spinBtn = document.getElementById('spinWheelBtn');
    const canvas = document.getElementById('luckyWheelCanvas');
    const resultCard = document.getElementById('wheelResultCard');
    if (resultCard) resultCard.classList.add('hidden');
    if (spinBtn) spinBtn.disabled = true;

    // ── EXACT PROBABILITY ALLOCATION ──
    // 1: 20%, 2: 50%, 3: 15%, 4: 15%
    const rand = Math.random() * 100;
    let wonIndex;
    if (rand < 20) {
      wonIndex = 0; // Chúc bạn may mắn lần sau (20%)
    } else if (rand < 70) {
      wonIndex = 1; // Evoucher giảm 5% (50%)
    } else if (rand < 85) {
      wonIndex = 2; // Evoucher giảm 10% (15%)
    } else {
      wonIndex = 3; // Evoucher giảm 15% (15%)
    }

    const wonPrize = WHEEL_PRIZES[wonIndex];

    // Issue unique, cryptographically signed 5-character voucher
    let dynamicVoucherCode = wonPrize.code;
    if (wonIndex > 0 && window.VoucherSecurity) {
      const issued = window.VoucherSecurity.issueLuckyWheelVoucher(wonPrize.percent);
      dynamicVoucherCode = issued.code;
    }

    // Math for stopping angle at top indicator (12 o'clock = 270 deg)
    // Slices are 90deg each. Center of slice wonIndex is: (wonIndex + 0.5) * 90deg.
    // Random jitter ±20deg inside the 90deg slice so it lands naturally
    const jitter = (Math.random() - 0.5) * 40;
    const targetAngle = 270 - (wonIndex + 0.5) * 90 + jitter;
    const fullSpins = 7 * 360; // 7 full revolutions
    const currentMod = (currentWheelRotation % 360 + 360) % 360;
    const deltaAngle = (targetAngle - currentMod + 360) % 360;

    currentWheelRotation += fullSpins + deltaAngle;

    // Apply rotation transition
    if (canvas) {
      canvas.style.transform = `rotate(${currentWheelRotation}deg)`;
    }

    // Sound effect: Tick sounds during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      playSound('tick');
      tickCount++;
      if (tickCount > 28) clearInterval(tickInterval);
    }, 140);

    // After spin ends (4.8s)
    setTimeout(() => {
      isWheelSpinning = false;
      clearInterval(tickInterval);

      renderWheelResult(wonPrize, dynamicVoucherCode);
    }, 4900);
  }

  function renderWheelResult(prize, dynamicCode) {
    const resultCard = document.getElementById('wheelResultCard');
    const resultBody = document.getElementById('wheelResultBody');
    if (!resultCard || !resultBody) return;

    const voucherCode = dynamicCode || prize.code;

    if (prize.id === 0) {
      // Chúc bạn may mắn lần sau
      resultBody.innerHTML = `
        <div class="luck-next-time-box">
          <div style="font-size:3rem;">🥔🍀</div>
          <h3 class="luck-next-time-title font-modak">Chúc Bạn May Mắn Lần Sau!</h3>
          <p class="luck-next-time-desc">
            Tiếc quá, suýt chút nữa là trúng rồi! Bạn có muốn đập củ khoai tây thêm lần nữa để săn voucher 15% không?
          </p>
          <div style="display:flex; gap:0.6rem; justify-content:center; flex-wrap:wrap; margin-top:0.6rem;">
            <button type="button" class="btn-retry-from-wheel" onclick="window.mammamApp.retryPotatoFromWheel()">
              🔄 Chơi Lại Game (Săn Voucher 15%)
            </button>
            <button type="button" class="popup-btn btn-secondary" onclick="window.mammamApp.closeModal('luckyWheelModal')">
              ✕ Đóng
            </button>
          </div>
        </div>
      `;
    } else {
      // Won Voucher (5%, 10%, 15%) -> Generated 5-character cryptographic token
      playSound('win');
      resultBody.innerHTML = `
        <div class="voucher-won-ticket">
          <div class="voucher-won-badge">🎉🎁✨</div>
          <h3 class="voucher-won-title">CHÚC MỪNG BẠN TRÚNG ${prize.title.toUpperCase()}!</h3>
          <p style="font-size:0.95rem; color:#cbd5e1;">Mã giảm giá độc quyền dành riêng cho bạn hôm nay:</p>
          
          <div class="voucher-won-code-box">
            <span class="voucher-won-code" id="wonVoucherCode">${voucherCode}</span>
            <button type="button" class="btn-copy-voucher" onclick="window.mammamApp.copyText('${voucherCode}', 'Mã Voucher')">
              📋 Sao chép
            </button>
          </div>

          <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(34,197,94,0.15); border:1px solid #22c55e; border-radius:20px; padding:3px 12px; margin-bottom:0.7rem; font-size:0.8rem; color:#86efac;">
            <span>🛡️ Mã 5 ký tự bảo mật độc quyền (Dùng 1 lần trong 24h)</span>
          </div>

          <p style="font-size:0.85rem; color:#fde047; margin-bottom:0.8rem;">
            ⚡ Áp dụng giảm trực tiếp <strong>${prize.percent}%</strong> trên tổng đơn hàng!
          </p>

          <button type="button" class="btn-apply-voucher-direct" onclick="window.mammamApp.applyLuckyVoucher('${voucherCode}', ${prize.percent})">
            🛒 ÁP DỤNG VÀO GIỎ HÀNG NGAY
          </button>
        </div>
      `;
    }

    resultCard.classList.remove('hidden');
    setTimeout(() => {
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  function applyLuckyVoucher(code, percent) {
    if (window.VoucherSecurity) {
      const res = window.VoucherSecurity.verifyVoucher(code);
      if (!res.valid) {
        showToast(res.error || 'Mã không hợp lệ!', 'error');
        return;
      }
      const v = res.voucher;
      state.voucher = {
        code: v.code,
        percent: v.percent,
        discountType: v.discountType,
        fixedAmount: v.fixedAmount,
        desc: v.desc
      };
    } else {
      state.voucher = {
        code: code,
        percent: percent,
        desc: `Giảm ${percent}% từ Vòng Quay May Mắn 🎁`
      };
    }
    renderCart();
    closeModal('luckyWheelModal');
    openModal('cartDrawer');
    showToast(`Đã áp dụng mã giảm giá ${code} (-${percent}%) vào giỏ hàng! 🎉`);
  }

  function retryPotatoFromWheel() {
    closeModal('luckyWheelModal');
    startPotatoGame();
  }

  // Export globally for inline onclick handlers
  window.mammamApp = {
    addToCart,
    removeFromCart,
    updateCartQty,
    openModal,
    closeModal,
    openCheckout,
    openAdmin,
    adminConfirmMomo,
    adminUpdateOrderStatus,
    adminDeleteOrder,
    printOrderBill,
    copyText,
    showToast,
    submitChatShop,
    startPotatoGame,
    quitPotatoGame,
    openLuckyWheelModal,
    spinLuckyWheel,
    applyLuckyVoucher,
    retryPotatoFromWheel,
    openFaqBot: () => openModal('faqBotModal'),
    askFaqQuestion: (id) => window.mammamFaqBot && window.mammamFaqBot.ask(id),
    handleFaqAction: (type) => window.mammamFaqBot && window.mammamFaqBot.handleAction(type),
    switchFaqMode: (mode) => window.mammamFaqBot && window.mammamFaqBot.switchMode(mode)
  };
})();

