/**
 * THE MĂM MĂM - TRỢ LÝ ẢO AI & ĐIỀU HƯỚNG HỎI ĐÁP NHANH 100 CÂU HỎI
 * Xử lý NLP tiếng Việt, tìm kiếm tức thì, điều hướng câu hỏi và trả lời tự động
 */

(function () {
  'use strict';

  // Helper chuẩn hóa tiếng Việt loại bỏ dấu
  function removeVietnameseTones(str) {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/[\u0300\u0301\u0303\u0309\u0323]/g, ''); // huyền sắc ngã hỏi nặng
    str = str.replace(/[\u02C6\u0306\u031B]/g, ''); // ˆ, ˘, ̛
    return str.trim();
  }

  const faqData = window.MAMMAM_FAQ_DATA || { categories: [], questions: [] };

  // Trạng thái chatbot
  let currentCategory = 'all';
  let chatHistory = [];
  let isTyping = false;

  // Lấy câu hỏi theo ID
  function getFaqById(id) {
    return faqData.questions.find(q => q.id === Number(id));
  }

  // Thuật toán chấm điểm tìm kiếm thông minh trong 100 câu hỏi
  function findBestMatches(rawQuery, limit = 5) {
    if (!rawQuery || !rawQuery.trim()) return [];
    const query = rawQuery.trim().toLowerCase();
    const queryNoTone = removeVietnameseTones(query);
    const queryWords = queryNoTone.split(/\s+/).filter(w => w.length > 1);

    const scored = faqData.questions.map(item => {
      let score = 0;
      const qLower = item.question.toLowerCase();
      const qNoTone = removeVietnameseTones(qLower);
      const aLower = item.answer.toLowerCase();
      const aNoTone = removeVietnameseTones(aLower);

      // 1. Khớp chính xác câu hỏi
      if (qLower === query || qNoTone === queryNoTone) score += 200;
      else if (qLower.includes(query) || qNoTone.includes(queryNoTone)) score += 100;

      // 2. Khớp từ khóa keywords
      if (item.keywords && Array.isArray(item.keywords)) {
        item.keywords.forEach(kw => {
          const kwLower = kw.toLowerCase();
          const kwNoTone = removeVietnameseTones(kwLower);
          if (query.includes(kwLower) || queryNoTone.includes(kwNoTone)) score += 50;
          if (kwLower.includes(query) || kwNoTone.includes(queryNoTone)) score += 40;
        });
      }

      // 3. Khớp từng từ (Word tokens)
      let matchedWords = 0;
      queryWords.forEach(word => {
        if (qNoTone.includes(word)) {
          score += 20;
          matchedWords++;
        } else if (aNoTone.includes(word)) {
          score += 8;
          matchedWords++;
        }
      });

      if (matchedWords === queryWords.length && queryWords.length > 1) {
        score += 35; // Thưởng nếu khớp tất cả các từ
      }

      return { item, score };
    });

    return scored
      .filter(s => s.score > 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.item);
  }

  // Khởi tạo Chatbot
  function initFaqBot() {
    const modal = document.getElementById('faqBotModal');
    if (!modal) return;

    // Render danh mục tab
    renderFaqCategoryTabs();

    // Render danh sách câu hỏi theo tab
    renderFaqDirectory();

    // Thiết lập tin nhắn chào mừng
    if (chatHistory.length === 0) {
      addBotGreeting();
    }

    // Lắng nghe sự kiện tìm kiếm nhanh
    const searchInput = document.getElementById('faqLiveSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        handleLiveSearch(e.target.value);
      });
    }

    // Lắng nghe submit chat
    const chatForm = document.getElementById('faqBotChatForm');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('faqBotMsgInput');
        if (input && input.value.trim()) {
          sendUserMessage(input.value.trim());
          input.value = '';
        }
      });
    }

    // Gắn listener mở modal
    const fabBtn = document.getElementById('fabFaqBotBtn');
    if (fabBtn) {
      fabBtn.addEventListener('click', () => {
        if (window.mammamApp && window.mammamApp.openModal) {
          window.mammamApp.openModal('faqBotModal');
        } else {
          modal.classList.add('open');
        }
        scrollChatToBottom();
      });
    }

    const navBtn = document.getElementById('navFaqBotBtn');
    if (navBtn) {
      navBtn.addEventListener('click', () => {
        if (window.mammamApp && window.mammamApp.openModal) {
          window.mammamApp.openModal('faqBotModal');
        } else {
          modal.classList.add('open');
        }
        scrollChatToBottom();
      });
    }

    // Chuyển đổi giữa chế độ Chat vs Chế độ Duyệt 100 câu hỏi
    const toggleChatViewBtn = document.getElementById('faqToggleChatViewBtn');
    const toggleDirViewBtn = document.getElementById('faqToggleDirViewBtn');
    if (toggleChatViewBtn && toggleDirViewBtn) {
      toggleChatViewBtn.addEventListener('click', () => {
        switchViewMode('chat');
      });
      toggleDirViewBtn.addEventListener('click', () => {
        switchViewMode('dir');
      });
    }
  }

  function switchViewMode(mode) {
    const chatView = document.getElementById('faqChatViewSection');
    const dirView = document.getElementById('faqDirectoryViewSection');
    const btnChat = document.getElementById('faqToggleChatViewBtn');
    const btnDir = document.getElementById('faqToggleDirViewBtn');

    if (mode === 'chat') {
      if (chatView) chatView.style.display = 'flex';
      if (dirView) dirView.style.display = 'none';
      if (btnChat) btnChat.classList.add('active');
      if (btnDir) btnDir.classList.remove('active');
      scrollChatToBottom();
    } else {
      if (chatView) chatView.style.display = 'none';
      if (dirView) dirView.style.display = 'block';
      if (btnChat) btnChat.classList.remove('active');
      if (btnDir) btnDir.classList.add('active');
    }
  }

  // Render các nút danh mục
  function renderFaqCategoryTabs() {
    const container = document.getElementById('faqCategoryTabs');
    if (!container) return;

    container.innerHTML = faqData.categories.map(cat => `
      <button type="button" class="faq-cat-pill ${cat.id === currentCategory ? 'active' : ''}" data-cat-id="${cat.id}">
        <span>${cat.icon}</span>
        <span>${cat.name}</span>
      </button>
    `).join('');

    container.querySelectorAll('.faq-cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.getAttribute('data-cat-id');
        container.querySelectorAll('.faq-cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderFaqDirectory();
        
        // Gợi ý vào chat nếu đang ở màn hình chat
        const catObj = faqData.categories.find(c => c.id === currentCategory);
        if (currentCategory !== 'all' && catObj) {
          sendCategoryQuestionsToChat(currentCategory, catObj.name);
        }
      });
    });
  }

  // Render danh mục 100 câu hỏi (Dạng Accordion / Danh sách tìm kiếm)
  function renderFaqDirectory(filterList = null) {
    const listEl = document.getElementById('faqDirectoryList');
    const countEl = document.getElementById('faqFilteredCount');
    if (!listEl) return;

    let items = filterList;
    if (!items) {
      if (currentCategory === 'all') {
        items = faqData.questions;
      } else {
        items = faqData.questions.filter(q => q.category === currentCategory);
      }
    }

    if (countEl) {
      countEl.textContent = `${items.length} câu hỏi phù hợp`;
    }

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="faq-empty-state">
          <div style="font-size:2.5rem; margin-bottom:0.5rem;">🔍</div>
          <div style="font-weight:700; color:#1b1b1b; margin-bottom:0.3rem;">Không tìm thấy câu hỏi phù hợp</div>
          <p style="font-size:0.88rem; color:#666;">Bạn thử tìm với từ khóa khác (ví dụ: khoai tây, bảo quản, freeship, voucher) hoặc chat trực tiếp với Bé Măm Măm nhé!</p>
          <button type="button" class="faq-quick-chip" onclick="window.mammamApp.switchFaqMode('chat')">💬 Chuyển sang Trò chuyện AI ➔</button>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items.map((q, idx) => `
      <details class="faq-accordion-item" id="faq-item-${q.id}">
        <summary class="faq-accordion-header">
          <span class="faq-q-num">#${q.id}</span>
          <span class="faq-q-title">${q.question}</span>
          <span class="faq-q-icon">➕</span>
        </summary>
        <div class="faq-accordion-body">
          <p class="faq-a-text">${q.answer}</p>
          ${q.action ? `
            <div style="margin-top:0.6rem;">
              <button type="button" class="faq-action-btn" onclick="window.mammamApp.handleFaqAction('${q.action.type}')">
                ${q.action.label}
              </button>
            </div>
          ` : ''}
          <div class="faq-ask-in-chat-wrap">
            <button type="button" class="faq-ask-direct-btn" onclick="window.mammamApp.askFaqQuestion(${q.id})">
              💬 Hỏi Bé Măm Măm câu này trong Chat ➔
            </button>
          </div>
        </div>
      </details>
    `).join('');
  }

  // Tìm kiếm trực tiếp
  function handleLiveSearch(query) {
    if (!query || !query.trim()) {
      renderFaqDirectory();
      return;
    }
    const matches = findBestMatches(query, 30);
    renderFaqDirectory(matches);
  }

  // Thêm lời chào ban đầu của Trợ lý ảo
  function addBotGreeting() {
    const container = document.getElementById('faqChatMessages');
    if (!container) return;

    const greetingHTML = `
      <div class="faq-chat-msg bot-msg">
        <div class="bot-avatar-wrap" style="width:38px; height:38px; min-width:38px; max-width:38px; min-height:38px; max-height:38px; border-radius:50%; flex-shrink:0; overflow:hidden; position:relative; box-shadow:1px 2px 0 #1b1b1b; background:#ffd166; border:1.5px solid #1b1b1b;">
          <img src="assets/mammam-logo.png" alt="Bé Măm Măm AI" class="bot-avatar-img" width="38" height="38" style="width:100%; height:100%; max-width:38px; max-height:38px; border-radius:50%; object-fit:cover; display:block;" />
          <span class="bot-status-dot" style="position:absolute; bottom:0; right:0; width:8px; height:8px; background:#25d366; border-radius:50%; border:1.5px solid #fff;"></span>
        </div>
        <div class="msg-bubble-wrap">
          <div class="msg-sender-name">Bé Măm Măm 🥔 (Trợ Lý Ảo AI)</div>
          <div class="msg-bubble">
            <p>Xin chào bạn! Mình là <strong>Bé Măm Măm</strong> – Trợ lý ảo thông minh của tiệm <strong>The Măm Măm</strong> Đà Lạt.</p>
            <p style="margin-top:0.4rem;">Mình được trang bị dữ liệu <strong>100 câu hỏi đáp chi tiết nhất</strong> về hương vị bánh, đặc sản Đà Lạt, hạn sử dụng, bảo quản, đóng gói ship 63 tỉnh và cách săn voucher giảm giá!</p>
            <p style="margin-top:0.4rem; font-weight:700;">🔥 Bạn có thể bấm chọn nhanh các câu hỏi được quan tâm nhất hôm nay:</p>
            <div class="faq-quick-chips-row">
              <button type="button" class="faq-chip" onclick="window.mammamApp.askFaqQuestion(1)">Khoai tây sấy có những vị nào?</button>
              <button type="button" class="faq-chip" onclick="window.mammamApp.askFaqQuestion(63)">Đơn bao nhiêu được Freeship?</button>
              <button type="button" class="faq-chip" onclick="window.mammamApp.askFaqQuestion(29)">Hạn sử dụng và cách bảo quản?</button>
              <button type="button" class="faq-chip" onclick="window.mammamApp.askFaqQuestion(71)">Có được đồng kiểm xem hàng trước không?</button>
              <button type="button" class="faq-chip" onclick="window.mammamApp.askFaqQuestion(84)">Cách chơi game săn voucher?</button>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = greetingHTML;
  }

  // Khi bấm vào 1 danh mục -> hiển thị câu hỏi gợi ý trong Chat
  function sendCategoryQuestionsToChat(catId, catName) {
    const catQuestions = faqData.questions.filter(q => q.category === catId).slice(0, 5);
    if (catQuestions.length === 0) return;

    const chipsHTML = catQuestions.map(q => `
      <button type="button" class="faq-chip" onclick="window.mammamApp.askFaqQuestion(${q.id})">${q.question}</button>
    `).join('');

    renderBotMessage(`
      <p>Dưới đây là một số câu hỏi phổ biến trong mục <strong>${catName}</strong> bạn có thể bấm xem ngay:</p>
      <div class="faq-quick-chips-row" style="margin-top:0.5rem;">
        ${chipsHTML}
      </div>
    `);
  }

  // Người dùng gửi tin nhắn chat tự do
  function sendUserMessage(text) {
    if (isTyping) return;
    renderUserMessage(text);

    showTypingIndicator();

    setTimeout(() => {
      hideTypingIndicator();
      processBotAnswer(text);
    }, 450);
  }

  // Xử lý câu trả lời tự động cho truy vấn của người dùng
  function processBotAnswer(query) {
    const matches = findBestMatches(query, 4);

    if (matches.length > 0) {
      const best = matches[0];
      const related = matches.slice(1);

      // Thêm gợi ý từ relatedIds nếu có
      let additionalRelated = [];
      if (best.relatedIds && best.relatedIds.length > 0) {
        additionalRelated = best.relatedIds
          .map(id => getFaqById(id))
          .filter(q => q && q.id !== best.id);
      }

      // Hợp nhất câu hỏi liên quan duy nhất
      const allRelated = [...new Map([...related, ...additionalRelated].map(item => [item.id, item])).values()].slice(0, 4);

      let actionHTML = '';
      if (best.action) {
        actionHTML = `
          <div style="margin-top:0.75rem;">
            <button type="button" class="faq-action-btn" onclick="window.mammamApp.handleFaqAction('${best.action.type}')">
              ${best.action.label}
            </button>
          </div>
        `;
      }

      let relatedHTML = '';
      if (allRelated.length > 0) {
        relatedHTML = `
          <div style="margin-top:0.75rem; border-top:1px dashed rgba(0,0,0,0.12); padding-top:0.6rem;">
            <div style="font-size:0.82rem; font-weight:800; color:#555; margin-bottom:0.4rem;">💡 CÂU HỎI LIÊN QUAN BẠN CÓ THỂ QUAN TÂM:</div>
            <div class="faq-quick-chips-row">
              ${allRelated.map(q => `
                <button type="button" class="faq-chip" onclick="window.mammamApp.askFaqQuestion(${q.id})">${q.question}</button>
              `).join('')}
            </div>
          </div>
        `;
      }

      const replyContent = `
        <div style="font-weight:800; color:var(--red); margin-bottom:0.35rem; display:flex; align-items:center; gap:6px;">
          <span>📌</span> <span>${best.question}</span>
        </div>
        <div class="faq-answer-main" style="line-height:1.6; font-size:0.92rem;">
          ${best.answer}
        </div>
        ${actionHTML}
        ${relatedHTML}
      `;

      renderBotMessage(replyContent);
    } else {
      // Khi không tìm thấy câu nào khớp rõ ràng
      renderBotMessage(`
        <p>Bé Măm Măm chưa tìm thấy câu trả lời chính xác cho câu hỏi: <em>"${escapeHtml(query)}"</em> trong dữ liệu 100 câu hỏi thường gặp.</p>
        <p style="margin-top:0.45rem;">Đừng lo lắng! Bạn có thể thử các gợi ý sau:</p>
        <div class="faq-quick-chips-row" style="margin-top:0.5rem;">
          <button type="button" class="faq-chip" onclick="window.mammamApp.askFaqQuestion(1)">Các vị khoai tây sấy</button>
          <button type="button" class="faq-chip" onclick="window.mammamApp.askFaqQuestion(63)">Chính sách Freeship 200k</button>
          <button type="button" class="faq-chip" onclick="window.mammamApp.askFaqQuestion(71)">Chính sách đồng kiểm</button>
          <button type="button" class="faq-chip" onclick="window.mammamApp.askFaqQuestion(100)">Liên hệ nhân viên hỗ trợ</button>
        </div>
        <div style="margin-top:0.8rem; display:flex; gap:8px; flex-wrap:wrap;">
          <a href="tel:0974449708" class="faq-action-btn" style="background:#25d366; text-decoration:none;">
            📞 Gọi Hotline 0974 449 708
          </a>
          <button type="button" class="faq-action-btn" onclick="window.mammamApp.handleFaqAction('chatShop')" style="background:#0088cc;">
            ✈️ Chat Telegram Với Nhân Viên
          </button>
        </div>
      `);
    }
  }

  // Trả lời theo ID câu hỏi cụ thể (khi người dùng click chip câu hỏi)
  function askFaqQuestion(id) {
    const q = getFaqById(id);
    if (!q) return;

    switchViewMode('chat');
    renderUserMessage(q.question);
    showTypingIndicator();

    setTimeout(() => {
      hideTypingIndicator();
      processBotAnswer(q.question);
    }, 350);
  }

  // Render message bong bóng người dùng
  function renderUserMessage(text) {
    const container = document.getElementById('faqChatMessages');
    if (!container) return;

    const userMsgHTML = `
      <div class="faq-chat-msg user-msg">
        <div class="msg-bubble-wrap">
          <div class="msg-bubble">
            ${escapeHtml(text)}
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', userMsgHTML);
    scrollChatToBottom();
  }

  // Render message bong bóng của bot
  function renderBotMessage(htmlContent) {
    const container = document.getElementById('faqChatMessages');
    if (!container) return;

    const botMsgHTML = `
      <div class="faq-chat-msg bot-msg">
        <div class="bot-avatar-wrap" style="width:38px; height:38px; min-width:38px; max-width:38px; min-height:38px; max-height:38px; border-radius:50%; flex-shrink:0; overflow:hidden; position:relative; box-shadow:1px 2px 0 #1b1b1b; background:#ffd166; border:1.5px solid #1b1b1b;">
          <img src="assets/mammam-logo.png" alt="Bé Măm Măm AI" class="bot-avatar-img" width="38" height="38" style="width:100%; height:100%; max-width:38px; max-height:38px; border-radius:50%; object-fit:cover; display:block;" />
          <span class="bot-status-dot" style="position:absolute; bottom:0; right:0; width:8px; height:8px; background:#25d366; border-radius:50%; border:1.5px solid #fff;"></span>
        </div>
        <div class="msg-bubble-wrap">
          <div class="msg-sender-name">Bé Măm Măm 🥔</div>
          <div class="msg-bubble">
            ${htmlContent}
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', botMsgHTML);
    scrollChatToBottom();
  }

  function showTypingIndicator() {
    isTyping = true;
    const container = document.getElementById('faqChatMessages');
    if (!container) return;

    const typingHTML = `
      <div class="faq-chat-msg bot-msg" id="faqTypingIndicator">
        <div class="bot-avatar-wrap" style="width:38px; height:38px; min-width:38px; max-width:38px; min-height:38px; max-height:38px; border-radius:50%; flex-shrink:0; overflow:hidden; position:relative; box-shadow:1px 2px 0 #1b1b1b; background:#ffd166; border:1.5px solid #1b1b1b;">
          <img src="assets/mammam-logo.png" alt="Bé Măm Măm AI" class="bot-avatar-img" width="38" height="38" style="width:100%; height:100%; max-width:38px; max-height:38px; border-radius:50%; object-fit:cover; display:block;" />
        </div>
        <div class="msg-bubble-wrap">
          <div class="msg-bubble typing-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', typingHTML);
    scrollChatToBottom();
  }

  function hideTypingIndicator() {
    isTyping = false;
    const el = document.getElementById('faqTypingIndicator');
    if (el) el.remove();
  }

  function scrollChatToBottom() {
    const container = document.getElementById('faqChatMessages');
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }

  function escapeHtml(string) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
    return String(string).replace(/[&<>"'\/]/g, s => entityMap[s]);
  }

  // Xử lý các nút hành động điều hướng (Menu, Voucher Game, Policy, Checkout, Contact...)
  function handleFaqAction(type) {
    if (window.mammamApp && window.mammamApp.closeModal) {
      window.mammamApp.closeModal('faqBotModal');
    }

    setTimeout(() => {
      switch (type) {
        case 'menu':
          const menuSection = document.getElementById('menu');
          if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'game':
          const gameSection = document.getElementById('gameSection');
          if (gameSection) gameSection.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'cart':
          if (window.mammamApp && window.mammamApp.openModal) {
            window.mammamApp.openModal('cartDrawer');
          }
          break;
        case 'checkout':
          if (window.mammamApp && window.mammamApp.openCheckout) {
            window.mammamApp.openCheckout();
          }
          break;
        case 'policy':
          window.location.href = 'chinh-sach.html';
          break;
        case 'account':
          const userBtn = document.getElementById('navUserBtn');
          if (userBtn) userBtn.click();
          break;
        case 'chatShop':
          if (window.mammamApp && window.mammamApp.openModal) {
            window.mammamApp.openModal('chatShopModal');
          }
          break;
        case 'contact':
          window.location.href = 'tel:0974449708';
          break;
        default:
          break;
      }
    }, 150);
  }

  // Khởi động khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaqBot);
  } else {
    initFaqBot();
  }

  // Export các hàm điều khiển ra global
  window.mammamFaqBot = {
    init: initFaqBot,
    ask: askFaqQuestion,
    handleAction: handleFaqAction,
    switchMode: switchViewMode,
    search: handleLiveSearch
  };

  // Tích hợp liền mạch vào window.mammamApp
  if (window.mammamApp) {
    window.mammamApp.askFaqQuestion = askFaqQuestion;
    window.mammamApp.handleFaqAction = handleFaqAction;
    window.mammamApp.switchFaqMode = switchViewMode;
  }
})();
