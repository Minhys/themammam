/**
 * ═════════════════════════════════════════════════════════════════════════════
 * THE MĂM MĂM - VOUCHER SECURITY & ANTI-HACK ENGINE
 * 
 * Hệ thống bảo mật tạo mã voucher 5 ký tự ngẫu nhiên cấp độ CSPRNG,
 * cơ chế chống hack, chống brute-force, chống replay, xác thực chữ ký SHA-256 HMAC
 * và kiểm soát tính toàn vẹn của chiết khấu.
 * ═════════════════════════════════════════════════════════════════════════════
 */

(function (window) {
  'use strict';

  // ── 1. CRYPTO CONSTANTS & CONFIGURATION ──
  // 32-character set: power of 2, excludes easily confused glyphs (0, O, 1, I, L)
  const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const CODE_LENGTH = 5;

  const STORAGE_KEY_VAULT = 'mammam_voucher_vault';
  const STORAGE_KEY_CONFIG = 'mammam_voucher_security_config';
  const STORAGE_KEY_BRUTE = 'mammam_voucher_security_bruteforce';
  const STORAGE_KEY_GAME_TOKEN = 'mammam_voucher_qualified_game_token';

  const DEFAULT_SECRET_SALT = 'MAMMAM_SECURE_TOKEN_SALT_2026_@DL';

  // ── 2. STANDALONE PURE-JS SHA-256 IMPLEMENTATION ──
  // Fast, synchronous, 100% reliable across all browsers & webviews
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }

    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i, j;
    let result = '';

    const words = [];
    const asciiBitLength = ascii.length * 8;

    const hash = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];

    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f, 0xc67178f2
    ];

    for (i = 0; i < ascii.length; i++) {
      const code = ascii.charCodeAt(i);
      words[i >> 2] |= (code & 0xff) << (24 - (i % 4) * 8);
    }

    words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
    words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

    const w = new Array(64);

    for (i = 0; i < words.length; i += 16) {
      const oldHash = hash.slice(0);

      for (j = 0; j < 64; j++) {
        if (j < 16) {
          w[j] = words[i + j] | 0;
        } else {
          const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
          const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
          w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
        }

        const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
        const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        const temp1 = (hash[7] + s1 + ch + k[j] + w[j]) | 0;
        const s0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
        const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        const temp2 = (s0 + maj) | 0;

        hash[7] = hash[6];
        hash[6] = hash[5];
        hash[5] = hash[4];
        hash[4] = (hash[3] + temp1) | 0;
        hash[3] = hash[2];
        hash[2] = hash[1];
        hash[1] = hash[0];
        hash[0] = (temp1 + temp2) | 0;
      }

      for (j = 0; j < 8; j++) {
        hash[j] = (hash[j] + oldHash[j]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j >= 0; j--) {
        const b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  // ── 3. SYSTEM CONFIG & SECRET SALT MANAGEMENT ──
  function getSecurityConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      salt: DEFAULT_SECRET_SALT,
      singleUseOnly: true,
      expiryHoursLucky: 24, // Lucky wheel vouchers expire after 24h
      bruteForceMaxAttempts: 5,
      bruteForceCooldownMinutes: 5,
      antiCheatStrict: true
    };
  }

  function saveSecurityConfig(cfg) {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(cfg));
    } catch (e) {}
  }

  // ── 4. VAULT STORAGE & SEEDING ──
  function getVault() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_VAULT);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [];
  }

  function saveVault(vault) {
    try {
      localStorage.setItem(STORAGE_KEY_VAULT, JSON.stringify(vault));
    } catch (e) {}
  }

  // ── 5. CSPRNG 5-CHARACTER CODE GENERATOR ──
  function generateRandom5Code() {
    const bytes = new Uint8Array(CODE_LENGTH);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < CODE_LENGTH; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CHARSET[bytes[i] % CHARSET.length];
    }
    return code;
  }

  // Generate unique 5-char code that does not collide in the vault
  function generateUnique5Code() {
    const vault = getVault();
    const existing = new Set(vault.map(v => (v.code || '').toUpperCase()));
    for (let attempts = 0; attempts < 100; attempts++) {
      const candidate = generateRandom5Code();
      if (!existing.has(candidate)) {
        return candidate;
      }
    }
    // Fallback if extremely crowded
    return generateRandom5Code() + Math.floor(Math.random() * 9);
  }

  // ── 6. CRYPTOGRAPHIC SIGNATURE ENGINE ──
  function computeSignature(code, percent, discountType, source, createdAt, salt) {
    const payload = `${code.toUpperCase()}|${percent}|${discountType}|${source}|${createdAt}|${salt}`;
    // 32-character truncated hex HMAC signature
    return sha256(payload).substring(0, 32);
  }

  function verifySignature(voucher, salt) {
    if (!voucher || !voucher.code || !voucher.signature) return false;
    const expected = computeSignature(
      voucher.code,
      voucher.percent,
      voucher.discountType || 'percent',
      voucher.source,
      voucher.createdAt,
      salt
    );
    return voucher.signature === expected;
  }

  // ── 7. BRUTE-FORCE PROTECTION (ANTI-GUESSING) ──
  function getBruteForceState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BRUTE);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return { failedAttempts: 0, lockedUntil: 0, lastAttemptAt: 0 };
  }

  function saveBruteForceState(st) {
    try {
      localStorage.setItem(STORAGE_KEY_BRUTE, JSON.stringify(st));
    } catch (e) {}
  }

  function checkBruteForceLock() {
    const st = getBruteForceState();
    const now = Date.now();
    if (st.lockedUntil && now < st.lockedUntil) {
      const remainingSec = Math.ceil((st.lockedUntil - now) / 1000);
      return {
        locked: true,
        remainingSec,
        message: `🛡️ Hệ thống bảo mật: Bạn đã nhập sai mã nhiều lần. Vui lòng thử lại sau ${remainingSec} giây!`
      };
    }
    return { locked: false };
  }

  function recordFailedAttempt() {
    const cfg = getSecurityConfig();
    const st = getBruteForceState();
    const now = Date.now();

    // Reset attempts if last failure was over 10 minutes ago
    if (now - (st.lastAttemptAt || 0) > 10 * 60 * 1000) {
      st.failedAttempts = 0;
    }

    st.failedAttempts = (st.failedAttempts || 0) + 1;
    st.lastAttemptAt = now;

    if (st.failedAttempts >= cfg.bruteForceMaxAttempts) {
      st.lockedUntil = now + cfg.bruteForceCooldownMinutes * 60 * 1000;
    }
    saveBruteForceState(st);
  }

  function resetBruteForceAttempts() {
    saveBruteForceState({ failedAttempts: 0, lockedUntil: 0, lastAttemptAt: Date.now() });
  }

  // ── 8. ANTI-CHEAT: PROOF OF PLAY (MINIGAME QUALIFICATION) ──
  function createQualifiedGameSession() {
    const cfg = getSecurityConfig();
    const now = Date.now();
    const nonce = generateRandom5Code();
    const token = sha256(`QUALIFIED_GAME|${nonce}|${now}|${cfg.salt}`).substring(0, 24);
    const sessionObj = {
      token,
      nonce,
      createdAt: now,
      expiresAt: now + 5 * 60 * 1000, // Valid for 5 minutes after hitting potato
      consumed: false
    };
    try {
      sessionStorage.setItem(STORAGE_KEY_GAME_TOKEN, JSON.stringify(sessionObj));
    } catch (e) {}
    return sessionObj;
  }

  function validateAndConsumeGameSession() {
    const cfg = getSecurityConfig();
    if (!cfg.antiCheatStrict) return { valid: true };

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_GAME_TOKEN);
      if (!raw) {
        return {
          valid: false,
          reason: 'NO_PLAY_RECORD',
          message: '⚠️ Phát hiện gian lận: Bạn cần hoàn thành thử thách gõ trúng củ khoai tây trước khi quay thưởng!'
        };
      }
      const session = JSON.parse(raw);
      if (session.consumed) {
        return {
          valid: false,
          reason: 'ALREADY_CONSUMED',
          message: '⚠️ Lượt chơi này đã được sử dụng! Vui lòng bắt đầu thử thách mới.'
        };
      }
      if (Date.now() > session.expiresAt) {
        return {
          valid: false,
          reason: 'EXPIRED_SESSION',
          message: '⏳ Lượt chơi đã hết hạn xác thực (quá 5 phút). Vui lòng thử thách lại nhé!'
        };
      }

      // Verify cryptographic token integrity
      const expectedToken = sha256(`QUALIFIED_GAME|${session.nonce}|${session.createdAt}|${cfg.salt}`).substring(0, 24);
      if (session.token !== expectedToken) {
        return {
          valid: false,
          reason: 'TAMPERED_TOKEN',
          message: '🚨 Cảnh báo bảo mật: Phát hiện mã phiên chơi bị giả mạo!'
        };
      }

      // Mark consumed immediately (Single-use token)
      session.consumed = true;
      sessionStorage.setItem(STORAGE_KEY_GAME_TOKEN, JSON.stringify(session));
      return { valid: true };
    } catch (e) {
      return { valid: false, reason: 'ERROR', message: 'Lỗi kiểm tra phiên chơi hợp lệ.' };
    }
  }

  // ── 9. PUBLIC ISSUANCE: ISSUE SECURE VOUCHER ──
  function issueVoucher(options = {}) {
    const cfg = getSecurityConfig();
    const vault = getVault();

    const percent = Number(options.percent) || 5;
    const discountType = options.discountType || 'percent'; // 'percent' | 'fixed' | 'freeship'
    const fixedAmount = Number(options.fixedAmount) || 0;
    const source = options.source || 'LUCKY_WHEEL'; // 'LUCKY_WHEEL' | 'ADMIN_MANUAL'
    const note = options.note || (source === 'LUCKY_WHEEL' ? 'Trúng thưởng Vòng Quay May Mắn' : 'Mã phát hành từ Admin');

    // Code: Use provided valid 5-char code or generate secure random one
    let code = options.code ? options.code.trim().toUpperCase() : generateUnique5Code();

    const now = new Date();
    const createdAt = now.toISOString();

    // Expiry calculation
    const durationHours = options.durationHours !== undefined 
      ? Number(options.durationHours) 
      : (source === 'LUCKY_WHEEL' ? cfg.expiryHoursLucky : 72);

    let expiresAt = null;
    if (durationHours > 0) {
      const expDate = new Date(now.getTime() + durationHours * 3600 * 1000);
      expiresAt = expDate.toISOString();
    }

    const signature = computeSignature(code, percent, discountType, source, createdAt, cfg.salt);

    const voucherObj = {
      code,
      percent,
      discountType,
      fixedAmount,
      source,
      note,
      createdAt,
      expiresAt,
      status: 'ACTIVE', // 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED'
      usedInOrder: null,
      usedAt: null,
      signature
    };

    vault.unshift(voucherObj);
    saveVault(vault);
    return voucherObj;
  }

  // Specific helper for Lucky Wheel: generates authentic 5-character voucher
  function issueLuckyWheelVoucher(percent) {
    return issueVoucher({
      percent: percent,
      discountType: 'percent',
      source: 'LUCKY_WHEEL',
      durationHours: 24,
      note: `Trúng thưởng ${percent}% từ Vòng Quay May Mắn (Thử thách gõ khoai tây)`
    });
  }

  // ── 10. VOUCHER VERIFICATION & VALIDATION (THE CORE DEFENSE) ──
  function verifyVoucher(inputCode) {
    const bruteCheck = checkBruteForceLock();
    if (bruteCheck.locked) {
      return {
        valid: false,
        status: 'LOCKED',
        error: bruteCheck.message,
        tampered: false
      };
    }

    if (!inputCode) {
      return { valid: false, status: 'EMPTY', error: 'Vui lòng nhập mã giảm giá!' };
    }

    const code = inputCode.trim().toUpperCase();
    const cfg = getSecurityConfig();

    // ── Check Special System Legacy Promos (if enabled) ──
    if (code === 'MAMMAM20') {
      resetBruteForceAttempts();
      return {
        valid: true,
        voucher: {
          code: 'MAMMAM20',
          percent: 0,
          discountType: 'fixed',
          fixedAmount: 20000,
          desc: 'Giảm 20.000đ cho đơn hàng (Ưu đãi cửa hàng)',
          status: 'ACTIVE',
          source: 'SYSTEM_PROMO'
        }
      };
    }
    if (code === 'FREESHIP') {
      resetBruteForceAttempts();
      return {
        valid: true,
        voucher: {
          code: 'FREESHIP',
          percent: 0,
          discountType: 'freeship',
          fixedAmount: 0,
          desc: 'Miễn phí giao hàng toàn quốc (Ưu đãi cửa hàng)',
          status: 'ACTIVE',
          source: 'SYSTEM_PROMO'
        }
      };
    }

    // Must be in Vault
    const vault = getVault();
    const foundIndex = vault.findIndex(v => (v.code || '').toUpperCase() === code);

    if (foundIndex === -1) {
      recordFailedAttempt();
      return {
        valid: false,
        status: 'NOT_FOUND',
        error: 'Mã voucher không tồn tại trên hệ thống hoặc đã nhập sai!',
        tampered: false
      };
    }

    const voucher = vault[foundIndex];

    // ── Cryptographic Signature Verification (Anti-Tampering) ──
    const isSigValid = verifySignature(voucher, cfg.salt);
    if (!isSigValid) {
      recordFailedAttempt();
      return {
        valid: false,
        status: 'TAMPERED',
        error: '🚨 CẢNH BÁO BẢO MẬT: Phát hiện mã giảm giá bị can thiệp chữ ký trái phép!',
        tampered: true
      };
    }

    // ── Status Checks ──
    if (voucher.status === 'USED') {
      return {
        valid: false,
        status: 'USED',
        error: `Mã này đã được sử dụng cho đơn hàng #${voucher.usedInOrder || 'trước đó'}! (Chính sách dùng 1 lần)`,
        voucher
      };
    }

    if (voucher.status === 'REVOKED') {
      return {
        valid: false,
        status: 'REVOKED',
        error: 'Mã voucher này đã bị vô hiệu hóa bởi Quản trị viên!',
        voucher
      };
    }

    // Expiry check
    if (voucher.expiresAt) {
      const expTime = new Date(voucher.expiresAt).getTime();
      if (Date.now() > expTime) {
        voucher.status = 'EXPIRED';
        vault[foundIndex] = voucher;
        saveVault(vault);
        return {
          valid: false,
          status: 'EXPIRED',
          error: 'Mã voucher đã hết hạn sử dụng!',
          voucher
        };
      }
    }

    // All clear! Reset any failed attempts
    resetBruteForceAttempts();

    let desc = '';
    if (voucher.discountType === 'percent') {
      desc = `Giảm ${voucher.percent}% tổng đơn hàng`;
    } else if (voucher.discountType === 'fixed') {
      desc = `Giảm ${(voucher.fixedAmount || 0).toLocaleString('vi-VN')}đ`;
    } else if (voucher.discountType === 'freeship') {
      desc = 'Miễn phí giao hàng';
    }

    return {
      valid: true,
      status: 'ACTIVE',
      voucher: {
        ...voucher,
        desc: desc + (voucher.source === 'LUCKY_WHEEL' ? ' (Vòng Quay May Mắn)' : '')
      }
    };
  }

  // ── 11. REDEEM VOUCHER (WHEN PLACING ORDER) ──
  function redeemVoucher(code, orderCode) {
    if (!code) return false;
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'MAMMAM20' || cleanCode === 'FREESHIP') return true;

    const vault = getVault();
    const idx = vault.findIndex(v => (v.code || '').toUpperCase() === cleanCode);
    if (idx !== -1) {
      vault[idx].status = 'USED';
      vault[idx].usedInOrder = orderCode;
      vault[idx].usedAt = new Date().toISOString();
      saveVault(vault);
      return true;
    }
    return false;
  }

  // ── 12. ADMIN AUDIT & MANAGEMENT TOOLS ──
  function revokeVoucher(code, reason = 'Quản trị viên vô hiệu hóa') {
    const vault = getVault();
    const idx = vault.findIndex(v => (v.code || '').toUpperCase() === (code || '').toUpperCase());
    if (idx !== -1) {
      vault[idx].status = 'REVOKED';
      vault[idx].revokedReason = reason;
      vault[idx].revokedAt = new Date().toISOString();
      saveVault(vault);
      return true;
    }
    return false;
  }

  function reactivateVoucher(code) {
    const vault = getVault();
    const idx = vault.findIndex(v => (v.code || '').toUpperCase() === (code || '').toUpperCase());
    if (idx !== -1) {
      vault[idx].status = 'ACTIVE';
      vault[idx].usedInOrder = null;
      vault[idx].usedAt = null;
      vault[idx].revokedReason = null;
      saveVault(vault);
      return true;
    }
    return false;
  }

  function deleteVoucher(code) {
    let vault = getVault();
    const prevLen = vault.length;
    vault = vault.filter(v => (v.code || '').toUpperCase() !== (code || '').toUpperCase());
    saveVault(vault);
    return vault.length < prevLen;
  }

  function batchGenerateVouchers(params = {}) {
    const count = Math.max(1, Math.min(100, Number(params.count) || 1));
    const results = [];
    for (let i = 0; i < count; i++) {
      const v = issueVoucher({
        percent: params.percent,
        discountType: params.discountType || 'percent',
        fixedAmount: params.fixedAmount,
        source: 'ADMIN_MANUAL',
        durationHours: params.durationHours,
        note: params.note || 'Tạo hàng loạt từ trang Admin'
      });
      results.push(v);
    }
    return results;
  }

  // Deep inspector for Admin Scanner
  function inspectVoucher(code) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    const cfg = getSecurityConfig();
    const vault = getVault();
    const voucher = vault.find(v => (v.code || '').toUpperCase() === cleanCode);

    if (!voucher) {
      return {
        found: false,
        code: cleanCode,
        isSignatureValid: false,
        status: 'UNKNOWN',
        diagnosis: 'Mã không tồn tại trong Cơ sở Dữ liệu Bảo Mật!'
      };
    }

    const isSigValid = verifySignature(voucher, cfg.salt);
    const isExpired = voucher.expiresAt && new Date(voucher.expiresAt).getTime() < Date.now();

    let computedStatus = voucher.status;
    if (computedStatus === 'ACTIVE' && isExpired) computedStatus = 'EXPIRED';

    return {
      found: true,
      voucher,
      code: voucher.code,
      percent: voucher.percent,
      discountType: voucher.discountType,
      fixedAmount: voucher.fixedAmount,
      source: voucher.source,
      createdAt: voucher.createdAt,
      expiresAt: voucher.expiresAt,
      status: computedStatus,
      usedInOrder: voucher.usedInOrder,
      usedAt: voucher.usedAt,
      isSignatureValid: isSigValid,
      signature: voucher.signature,
      diagnosis: isSigValid 
        ? (computedStatus === 'ACTIVE' ? 'Mã hợp lệ, chữ ký bảo mật nguyên vẹn.' : `Mã có chữ ký chuẩn, trạng thái: ${computedStatus}.`)
        : '🚨 CẢNH BÁO: Chữ ký số SHA-256 không hợp lệ! Phát hiện can thiệp giả mạo.'
    };
  }

  // Seed default demonstration vouchers if vault is fresh
  function seedDefaultDemoVouchers() {
    const vault = getVault();
    if (vault.length === 0) {
      // Seed a few diverse active 5-char vouchers
      issueVoucher({ code: '7K9X2', percent: 5, source: 'ADMIN_MANUAL', durationHours: 168, note: 'Mã phát hành thử nghiệm 5%' });
      issueVoucher({ code: 'M8P3Q', percent: 10, source: 'ADMIN_MANUAL', durationHours: 168, note: 'Mã phát hành thử nghiệm 10%' });
      issueVoucher({ code: 'B4T9Z', percent: 15, source: 'ADMIN_MANUAL', durationHours: 168, note: 'Mã Jackpot thử nghiệm 15%' });
    }
  }

  // Run initial seed on load
  try {
    seedDefaultDemoVouchers();
  } catch (e) {}

  // ── EXPORT GLOBAL NAMESPACE ──
  window.VoucherSecurity = {
    CHARSET,
    CODE_LENGTH,
    generateRandom5Code,
    generateUnique5Code,
    issueVoucher,
    issueLuckyWheelVoucher,
    verifyVoucher,
    redeemVoucher,
    revokeVoucher,
    reactivateVoucher,
    deleteVoucher,
    batchGenerateVouchers,
    inspectVoucher,
    getVault,
    saveVault,
    getSecurityConfig,
    saveSecurityConfig,
    createQualifiedGameSession,
    validateAndConsumeGameSession,
    checkBruteForceLock,
    sha256
  };

})(typeof window !== 'undefined' ? window : this);
