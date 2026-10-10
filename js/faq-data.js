/**
 * THE MĂM MĂM - HỆ THỐNG DỮ LIỆU 100 CÂU HỎI ĐÁP PHỔ BIẾN NHẤT
 * Trợ lý ảo AI & Điều hướng hỏi đáp nhanh
 * Danh mục:
 * 1. Món Bán Chạy & Hương Vị (Q1 - Q15)
 * 2. Nguyên Liệu & Nguồn Gốc Tự Nhiên (Q16 - Q28)
 * 3. Hạn Sử Dụng & Hướng Dẫn Bảo Quản (Q29 - Q42)
 * 4. Dinh Dưỡng, Ăn Kiêng & Sức Khỏe (Q43 - Q55)
 * 5. Đóng Gói & Vận Chuyển 63 Tỉnh Thành (Q56 - Q70)
 * 6. Đồng Kiểm, Đổi Trả & Bồi Hoàn (Q71 - Q82)
 * 7. Khuyến Mãi, Voucher & Mini Game (Q83 - Q93)
 * 8. Đặt Hàng, Thanh Toán & Hỗ Trợ (Q94 - Q100)
 */

const MAMMAM_FAQ_DATA = {
  categories: [
    { id: "all", name: "Tất Cả (100)", icon: "✨" },
    { id: "best-seller", name: "Món Bán Chạy", icon: "🥔" },
    { id: "ingredients", name: "Nguyên Liệu & Xuất Xứ", icon: "🌿" },
    { id: "shelf-life", name: "HSD & Bảo Quản", icon: "⏳" },
    { id: "diet", name: "Dinh Dưỡng & Ăn Chay", icon: "🥗" },
    { id: "shipping", name: "Giao Hàng 63 Tỉnh", icon: "🚚" },
    { id: "return", name: "Đổi Trả & Đồng Kiểm", icon: "🔄" },
    { id: "promo", name: "Voucher & Game", icon: "🎁" },
    { id: "payment", name: "Thanh Toán & Hỗ Trợ", icon: "💳" }
  ],

  questions: [
    // ════════════════ NHÓM 1: MÓN BÁN CHẠY & HƯƠNG VỊ (Q1 - Q15) ════════════════
    {
      id: 1,
      category: "best-seller",
      question: "Khoai tây sấy giòn The Măm Măm có những hương vị nào?",
      keywords: ["khoai tay", "huong vi", "vi nao", "vi gi", "cac vi", "menu khoai tay"],
      answer: "Khoai tây sấy giòn The Măm Măm hiện có 4 hương vị đặc trưng cực cuốn: 1) Rong Biển Muối Hồng (bán chạy nhất), 2) Phô Mai Cheddar Béo Ngậy, 3) Trứng Muối Hoàng Kim, 4) Vị Cay Tứ Xuyên Nồng Nàn. Toàn bộ lát khoai được bào mỏng nguyên củ từ khoai tây vàng Đà Lạt!",
      relatedIds: [2, 3, 4],
      action: { type: "menu", label: "Xem Khoai Tây Trong Menu ➔" }
    },
    {
      id: 2,
      category: "best-seller",
      question: "Vị khoai tây nào bán chạy và được yêu thích nhất?",
      keywords: ["vi ban chay nhat", "best seller", "ngon nhat", "khuyen nghi vi"],
      answer: "Vị 'Rong Biển Muối Hồng' là Best Seller số 1 tại tiệm, chiếm hơn 45% tổng lượt đặt. Lát khoai mỏng giòn rụm kết hợp rong biển sấy thơm lừng và muối hồng Himalaya thanh nhẹ, ăn hoài không hề bị ngấy!",
      relatedIds: [1, 3, 5],
      action: { type: "menu", label: "Đặt Khoai Tây Rong Biển ➔" }
    },
    {
      id: 3,
      category: "best-seller",
      question: "Khoai tây sấy vị rong biển có bị mặn hay ngấy dầu không?",
      keywords: ["rong bien man khong", "ngay dau", "vi rong bien"],
      answer: "Hoàn toàn KHÔNG mặn và KHÔNG ngấy bạn nhé! Tiệm sử dụng muối khoáng hồng Himalaya với độ mặn dịu êm, cùng công nghệ sấy ly tâm tách dầu hiện đại giúp lát khoai ráo tinh tươm, giữ độ giòn tan tự nhiên.",
      relatedIds: [1, 2, 5]
    },
    {
      id: 4,
      category: "best-seller",
      question: "Khoai tây sấy vị phô mai và cay có hợp với trẻ em không?",
      keywords: ["tre em an duoc khong", "vi pho mai", "vi cay", "con nit"],
      answer: "Vị Phô Mai Cheddar rất thơm ngọt béo dịu, các bé nhỏ cực kỳ mê tít! Còn vị Cay Tứ Xuyên có độ cay nồng vừa phải, thích hợp cho người lớn nhâm nhi hoặc ăn vặt giải trí, không khuyến khích cho bé dưới 6 tuổi.",
      relatedIds: [1, 48, 51]
    },
    {
      id: 5,
      category: "best-seller",
      question: "Khoai tây sấy giòn có bị ỉu khi để lâu không?",
      keywords: ["bi iu khong", "gion lau khong", "khoai bi mem"],
      answer: "Mỗi hũ khoai The Măm Măm đều được ép màng nhôm seal nhiệt kín khí và kèm gói hút ẩm chuyên dụng cho thực phẩm. Khi chưa mở seal, khoai giữ độ giòn rụm hoàn hảo trong 6 tháng!",
      relatedIds: [29, 30, 32]
    },
    {
      id: 6,
      category: "best-seller",
      question: "Một hũ khoai tây sấy trọng lượng và quy cách bao nhiêu gram?",
      keywords: ["trong luong", "bao nhieu gram", "quy cach hu", "khoi luong"],
      answer: "Tiệm đóng hũ pet nắp nhôm cao cấp với trọng lượng tịnh 200g và túi zip lớn 350g tiện lợi. Hũ cầm rất chắc tay, bên trong đầy ắp những lát khoai nguyên vẹn được bọc bóng khí an toàn.",
      relatedIds: [1, 58, 62]
    },
    {
      id: 7,
      category: "best-seller",
      question: "Bánh bò thốt nốt nướng tại tiệm có điểm gì đặc biệt?",
      keywords: ["banh bo thot not", "banh bo nuong", "banh bo"],
      answer: "Bánh bò thốt nốt nướng The Măm Măm được làm 100% từ đường thốt nốt nguyên chất An Giang nấu sánh và nước cốt dừa tươi Bến Tre ép trong ngày. Bánh có rễ tre dày đặc, thơm ngậy, mềm dai dẻo quẹo ăn nóng hay lạnh đều ngon tuyệt!",
      relatedIds: [8, 33, 34],
      action: { type: "menu", label: "Xem Bánh Bò Thốt Nốt ➔" }
    },
    {
      id: 8,
      category: "best-seller",
      question: "Bánh chuối nướng An Yên có vị như thế nào?",
      keywords: ["banh chuoi nuong", "an yen", "vi banh chuoi"],
      answer: "Bánh chuối nướng An Yên sử dụng chuối sứ chín muồi ngâm mật ong và rượu rum nhẹ, nướng xém mặt caramen béo thơm mùi nước cốt dừa và bơ Pháp. Vị ngọt thanh tao tự nhiên từ chuối mà không gắt đường.",
      relatedIds: [7, 35, 47]
    },
    {
      id: 9,
      category: "best-seller",
      question: "Bánh mì hoa cúc của The Măm Măm có mềm thơm chuẩn vị không?",
      keywords: ["banh mi hoa cuc", "hoa cuc", "banh mi tuoi"],
      answer: "Bánh mì hoa cúc tại tiệm được thắt bím thủ công từ bơ động vật Anchor New Zealand nguyên chất, nước hoa cam tự nhiên và trứng gà tươi. Thớ bánh tơ sợi dài, xé ra mềm mịn và thơm ngát hương hoa cam đặc trưng.",
      relatedIds: [10, 35, 36]
    },
    {
      id: 10,
      category: "best-seller",
      question: "Bánh su kem The Măm Măm có những vị nhân nào?",
      keywords: ["banh su kem", "su kem", "nhan su kem"],
      answer: "Bánh su kem vỏ giòn Craquelin của tiệm gồm 3 vị nhân kem tươi mát lạnh: Vani trứng sữa truyền thống, Chocolate Bỉ đậm đà, và Matcha Nhật Bản thanh mát. Bánh được bơm nhân tươi mỗi sáng.",
      relatedIds: [9, 36, 68]
    },
    {
      id: 11,
      category: "best-seller",
      question: "New York Cookie của tiệm gồm những vị nào?",
      keywords: ["new york cookie", "cookie", "banh quy"],
      answer: "Dòng bánh quy New York Cookie đẫm nhân nổi tiếng của tiệm có 4 vị: 1) Chocolate Chip hạt óc chó, 2) Red Velvet kem phô mai chảy, 3) Matcha hạnh nhân sô-cô-la trắng, 4) Double Dark Chocolate hạt macca giòn bùi.",
      relatedIds: [1, 37, 49]
    },
    {
      id: 12,
      category: "best-seller",
      question: "Dâu tây sấy thăng hoa Đà Lạt có giòn xốp không?",
      keywords: ["dau tay say", "say thang hoa", "dau da lat"],
      answer: "Cực kỳ giòn xốp và giữ nguyên vẹn 100% hình dáng quả dâu tươi! Công nghệ sấy thăng hoa chân không ở nhiệt độ âm giúp giữ lại trọn vẹn vị chua ngọt thanh nhẹ và toàn bộ hàm lượng Vitamin C quý giá.",
      relatedIds: [13, 38, 53]
    },
    {
      id: 13,
      category: "best-seller",
      question: "Hồng treo gió Đà Lạt tại tiệm có phủ phấn trắng tự nhiên không?",
      keywords: ["hong treo gio", "phan trang", "hong da lat"],
      answer: "Đúng rồi bạn nhé! Hồng treo gió công nghệ Nhật Bản tại Đà Lạt sau 3-4 tuần lên men tự nhiên sẽ sinh ra lớp phấn đường quả trắng mịn vô hại. Trái hồng mềm dẻo, ứa mật ngọt lịm như giọt nắng cao nguyên.",
      relatedIds: [12, 39, 40]
    },
    {
      id: 14,
      category: "best-seller",
      question: "Trà Atiso túi lọc và cao atiso có tác dụng gì?",
      keywords: ["tra atiso", "cao atiso", "atiso da lat"],
      answer: "Atiso Đà Lạt nổi tiếng với tác dụng thanh nhiệt giải độc gan, hỗ trợ tiêu hóa, mát da và giúp ngủ sâu giấc. Sản phẩm của tiệm 100% búp hoa và lá atiso nguyên chất, không pha tạp hương liệu.",
      relatedIds: [15, 54, 94]
    },
    {
      id: 15,
      category: "best-seller",
      question: "Kẹo dâu tây và dâu tằm dẻo ăn có bị ngọt khé cổ không?",
      keywords: ["keo dau tay", "keo dau tam", "keo deo"],
      answer: "Kẹo dẻo dâu The Măm Măm nấu thủ công từ cốt dâu tươi và đường phèn, vị chua ngọt thanh dịu kích thích vị giác, dẻo dai tự nhiên mà không hề ngọt gắt hay bám răng.",
      relatedIds: [12, 40, 52]
    },

    // ════════════════ NHÓM 2: NGUYÊN LIỆU & NGUỒN GỐC XUẤT XỨ (Q16 - Q28) ════════════════
    {
      id: 16,
      category: "ingredients",
      question: "Khoai tây làm sấy giòn có nguồn gốc từ đâu?",
      keywords: ["nguon goc khoai tay", "khoai tay o dau", "xuat xu"],
      answer: "100% khoai tây tươi của The Măm Măm được trồng tại các nông trại đối tác ở Đà Lạt và Đơn Dương (Lâm Đồng) theo quy trình canh tác sạch tự nhiên, củ to chắc ruột vàng ngọt bùi tự nhiên.",
      relatedIds: [17, 18, 26]
    },
    {
      id: 17,
      category: "ingredients",
      question: "Tiệm có sử dụng khoai tây biến đổi gen (GMO) không?",
      keywords: ["gmo", "bien doi gen", "khoai sach"],
      answer: "The Măm Măm cam kết 100% KHÔNG sử dụng giống cây biến đổi gen (Non-GMO). Toàn bộ khoai tây là giống củ vàng tự nhiên thuần chủng của vùng đất đỏ bazan Lâm Đồng.",
      relatedIds: [16, 26, 27]
    },
    {
      id: 18,
      category: "ingredients",
      question: "Sản phẩm của The Măm Măm có dùng chất bảo quản công nghiệp không?",
      keywords: ["chat bao quan", "phu gia", "chat hoa hoc"],
      answer: "Tuyệt đối KHÔNG có chất bảo quản hóa học! Tiệm áp dụng công nghệ sấy chân không, đóng gói kín khí màng nhôm và gói hút ẩm tự nhiên để giữ trọn vẹn độ tươi giòn và hương vị mộc.",
      relatedIds: [19, 20, 25]
    },
    {
      id: 19,
      category: "ingredients",
      question: "Tiệm có dùng phẩm màu nhân tạo hay chất tạo giòn hàn the không?",
      keywords: ["pham mau", "chat tao gion", "han the"],
      answer: "Tuyệt đối KHÔNG! Màu vàng óng của khoai và màu hồng của bánh là màu tự nhiên từ củ khoai tươi, thốt nốt, cốt dâu và bột gấc. Tiệm cam kết không hàn the, không chất tạo giòn nhân tạo.",
      relatedIds: [18, 20, 26]
    },
    {
      id: 20,
      category: "ingredients",
      question: "Dầu dùng để chiên/sấy khoai tây có phải là dầu mới không?",
      keywords: ["dau chien", "dau an", "tai su dung dau"],
      answer: "Tiệm sử dụng 100% dầu thực vật tinh luyện cao cấp chỉ dùng trong quy trình sấy ly tâm trong ngày, có máy đo chỉ số axit FFA và tuyệt đối KHÔNG tái sử dụng dầu chiên đi chiên lại nhiều lần.",
      relatedIds: [18, 19, 21]
    },
    {
      id: 21,
      category: "ingredients",
      question: "Bơ dùng làm bánh tươi là bơ thực vật hay bơ động vật?",
      keywords: ["bo lam banh", "bo dong vat", "bo thuc vat", "anchor"],
      answer: "The Măm Măm chỉ sử dụng bơ động vật Anchor nhập khẩu từ New Zealand và bơ Elle & Vire Pháp cao cấp. Tiệm nói không với bơ thực vật chứa chất béo chuyển hóa (Trans fat) có hại.",
      relatedIds: [9, 11, 44]
    },
    {
      id: 22,
      category: "ingredients",
      question: "Đường thốt nốt làm bánh bò có nguồn gốc từ đâu?",
      keywords: ["duong thot not", "nguon goc duong", "an giang"],
      answer: "Đường thốt nốt được thu hoạch từ cây thốt nốt vùng Bảy Núi (Tri Tôn, An Giang) của bà con đồng bào Khmer, nấu thủ công nguyên chất không pha đường cát trắng, giữ trọn vị thơm ngát đặc trưng.",
      relatedIds: [7, 47, 52]
    },
    {
      id: 23,
      category: "ingredients",
      question: "Trứng gà làm bánh của tiệm có qua kiểm dịch thú y không?",
      keywords: ["trung ga", "kiem dich", "trung sach"],
      answer: "100% trứng gà tươi sạch dùng trong ngày từ các trang trại công nghệ cao được kiểm dịch thú y nghiêm ngặt và xử lý tia UV diệt khuẩn trước khi đưa vào dây chuyền nhào bột.",
      relatedIds: [9, 10, 26]
    },
    {
      id: 24,
      category: "ingredients",
      question: "Dâu tây làm dâu sấy là giống dâu nào tại Đà Lạt?",
      keywords: ["giong dau", "dau tay da lat", "dau my da"],
      answer: "Tiệm tuyển chọn những quả dâu giống Nhật Hana và dâu New Zealand trồng trong nhà kính bán thủy canh tại Đà Lạt, quả mọng nước, thơm đậm đà và có vị ngọt thanh tự nhiên.",
      relatedIds: [12, 15, 38]
    },
    {
      id: 25,
      category: "ingredients",
      question: "Bánh tươi tại The Măm Măm được làm và nướng như thế nào?",
      keywords: ["banh tuoi", "nuong moi ngay", "quy trinh lam banh"],
      answer: "Toàn bộ bánh tươi tại The Măm Măm đều được nhào nặn và nướng mới mỗi sáng từ nguyên liệu tự nhiên chọn lọc, không dùng chất bảo quản hóa học, thơm ngon nóng hổi giao tận tay khách hàng.",
      relatedIds: [24, 28, 29]
    },
    {
      id: 26,
      category: "ingredients",
      question: "Quy trình đóng gói các món ăn vặt và bánh tại tiệm ra sao?",
      keywords: ["dong goi", "quy trinh dong goi", "bao quan mon an"],
      answer: "Tiệm sử dụng bao bì hũ nắp nhôm xé tiện lợi và túi zip tráng bạc 3 lớp kín khí, kèm gói hút ẩm chuyên dụng giúp giữ nguyên độ giòn ngon và hương vị thơm lừng.",
      relatedIds: [25, 28, 58]
    },
    {
      id: 27,
      category: "ingredients",
      question: "Nông sản Đà Lạt được The Măm Măm chọn lọc từ đâu?",
      keywords: ["nguon goc nong san", "nong san da lat", "nguyen lieu tuoi"],
      answer: "Các nguồn nguyên liệu củ quả tươi (khoai tây, dâu tây, rau củ quả, búp atiso) đều được thu hoạch trực tiếp từ các nhà vườn và nông trại sạch tại Đà Lạt, Đơn Dương và Lạc Dương, đảm bảo tươi ngon và chất lượng tự nhiên.",
      relatedIds: [16, 24, 28]
    },
    {
      id: 28,
      category: "ingredients",
      question: "Xưởng sản xuất của The Măm Măm đặt tại đâu?",
      keywords: ["dia chi xuong", "xuoing o dau", "da lat"],
      answer: "Xưởng bánh và cơ sở chế biến đặc sản The Măm Măm tọa lạc tại trung tâm thành phố Đà Lạt, tỉnh Lâm Đồng - nơi có khí hậu ôn đới mát mẻ quanh năm lý tưởng nhất để chế biến và bảo quản nông sản ngon.",
      relatedIds: [16, 25, 61]
    },

    // ════════════════ NHÓM 3: HẠN SỬ DỤNG & BẢO QUẢN (Q29 - Q42) ════════════════
    {
      id: 29,
      category: "shelf-life",
      question: "Khoai tây sấy giòn có hạn sử dụng (HSD) bao lâu?",
      keywords: ["hsd khoai tay", "han su dung", "de duoc bao lau"],
      answer: "Hạn sử dụng của khoai tây sấy giòn là 06 tháng kể từ ngày sản xuất khi còn nguyên seal nắp nhôm. Sau khi khui nắp, tiệm khuyến khích thưởng thức trong vòng 15-20 ngày để cảm nhận độ giòn rụm đỉnh nhất.",
      relatedIds: [5, 30, 31]
    },
    {
      id: 30,
      category: "shelf-life",
      question: "Sau khi mở nắp nhôm khoai tây thì bảo quản như thế nào?",
      keywords: ["cach bao quan khoai", "mo nap roi", "bao quan the nao"],
      answer: "Sau khi mở nắp nhôm, bạn chỉ cần đậy kín nắp nhựa kèm theo và để nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Không làm mất gói hút ẩm bên trong hũ để giữ khoai luôn giòn tan.",
      relatedIds: [29, 31, 32]
    },
    {
      id: 31,
      category: "shelf-life",
      question: "Khoai tây sấy giòn có cần bỏ vào tủ lạnh không?",
      keywords: ["bo tu lanh khong", "de tu lanh", "ngan mat"],
      answer: "Ở điều kiện bình thường không cần để tủ lạnh. Tuy nhiên, nếu bạn ở vùng có độ ẩm cao, việc đậy kín nắp và để ngăn mát tủ lạnh sẽ giúp khoai càng thêm giòn mát rượi cực kỳ thú vị!",
      relatedIds: [29, 30, 32]
    },
    {
      id: 32,
      category: "shelf-life",
      question: "Nếu khoai tây lỡ bị mềm/ỉu thì có cách nào làm giòn lại không?",
      keywords: ["khoai bi mem lam sao", "lam gion lai", "noi chien khong dau"],
      answer: "Mẹo nhỏ cực dễ: Bạn trải lát khoai vào nồi chiên không dầu hoặc lò nướng sấy ở 120°C trong 3-5 phút (hoặc áp chảo không dầu 2 phút lửa nhỏ), để nguội 2 phút là khoai sẽ giòn tan như mới ra lò!",
      relatedIds: [5, 30, 31]
    },
    {
      id: 33,
      category: "shelf-life",
      question: "Bánh bò thốt nốt nướng để được mấy ngày?",
      keywords: ["hsd banh bo", "banh bo de duoc bao lau", "ngay"],
      answer: "Bánh bò nướng để nhiệt độ phòng mát mẻ được 2-3 ngày. Nếu bọc kín để ngăn mát tủ lạnh sẽ giữ được 7 ngày, để ngăn đông cấp đông giữ được tới 30 ngày.",
      relatedIds: [7, 34, 68]
    },
    {
      id: 34,
      category: "shelf-life",
      question: "Cách hâm nóng lại bánh bò thốt nốt để bánh mềm thơm như mới?",
      keywords: ["ham nong banh bo", "quay lo vi song", "hap banh"],
      answer: "Có 2 cách siêu ngon: 1) Hấp cách thủy 5 phút cho bánh phồng mềm mướt nước cốt dừa; 2) Bọc màng bọc/đĩa sứ quay lò vi sóng 30-45 giây (lát bánh) hoặc 2-3 phút (nguyên ổ). Tuyệt đối không nướng nhiệt độ cao làm khô bánh.",
      relatedIds: [7, 33, 68]
    },
    {
      id: 35,
      category: "shelf-life",
      question: "Bánh mì tươi (bánh mì hoa cúc, bánh gối) bảo quản thế nào?",
      keywords: ["bao quan banh mi", "banh mi de duoc may ngay", "hsd banh mi"],
      answer: "Bánh mì tươi bảo quản ở nhiệt độ phòng từ 3-5 ngày (buộc kín miệng túi). Muốn để lâu hơn bạn nên trữ ngăn đông tủ lạnh đến 2 tuần, khi ăn chỉ cần rã đông 10 phút hoặc áp chảo 1 phút là mềm thơm như mới.",
      relatedIds: [9, 36, 68]
    },
    {
      id: 36,
      category: "shelf-life",
      question: "Bánh su kem vỏ giòn bảo quản được bao lâu?",
      keywords: ["bao quan su kem", "su kem de duoc may ngay", "hsd su kem"],
      answer: "Vì nhân kem tươi tiệm làm từ sữa tươi và whipping cream nguyên chất không chất ổn định, bạn nên bảo quản ngay trong ngăn mát tủ lạnh và dùng ngon nhất trong vòng 48 giờ.",
      relatedIds: [10, 68, 69]
    },
    {
      id: 37,
      category: "shelf-life",
      question: "New York Cookie bảo quản thế nào và HSD bao lâu?",
      keywords: ["hsd cookie", "bao quan cookie", "banh quy de duoc lau khong"],
      answer: "Bánh quy Cookie bảo quản nhiệt độ phòng 14 ngày, ngăn mát 30 ngày. Trước khi ăn, bạn có thể quay lò vi sóng 15 giây để phần nhân sô-cô-la tan chảy dẻo quánh cực kỳ hấp dẫn!",
      relatedIds: [11, 49, 68]
    },
    {
      id: 38,
      category: "shelf-life",
      question: "Dâu tây sấy thăng hoa sau khi mở túi bảo quản ra sao?",
      keywords: ["bao quan dau say", "dau say thang hoa", "hsd dau say"],
      answer: "Dâu sấy thăng hoa rất nhạy cảm với độ ẩm không khí. Bạn cần kéo chặt miệng túi zip sau khi lấy ăn hoặc cất hũ đậy nắp kín. Hạn sử dụng nguyên túi là 06 tháng kể từ ngày sản xuất.",
      relatedIds: [12, 24, 41]
    },
    {
      id: 39,
      category: "shelf-life",
      question: "Hồng treo gió Đà Lạt nên bảo quản ngăn đông hay ngăn mát?",
      keywords: ["bao quan hong treo gio", "hong treo gio de tu lanh", "ngan dong"],
      answer: "Tiệm khuyến khích bảo quản hồng treo gió trong ngăn đông tủ lạnh (-18°C). Quả hồng có hàm lượng mật quả cao nên không bị đóng đá cứng ngắc, lấy ra ăn dẻo mềm man mát cực đỉnh và để được tới 12 tháng!",
      relatedIds: [13, 40, 41]
    },
    {
      id: 40,
      category: "shelf-life",
      question: "Kẹo dâu tằm và kẹo dâu tây Đà Lạt để được bao lâu?",
      keywords: ["hsd keo dau", "keo dau tam de duoc lau khong", "bao quan keo"],
      answer: "Hạn sử dụng kẹo dẻo dâu là 06 tháng ở nhiệt độ thường nơi thoáng mát. Tránh để nơi có nhiệt độ cao hoặc ánh nắng trực tiếp chiếu vào để kẹo không bị chảy đường.",
      relatedIds: [15, 39, 41]
    },
    {
      id: 41,
      category: "shelf-life",
      question: "Bao bì sản phẩm có in rõ ngày sản xuất (NSX) và hạn sử dụng (HSD) không?",
      keywords: ["in nsx", "in hsd", "ngay san xuat tren bao bi"],
      answer: "100% bao bì hũ nắp nhôm, hộp bánh và túi zip của The Măm Măm đều được in nhiệt laser rõ ràng Ngày Sản Xuất (NSX), Hạn Sử Dụng (HSD) và Mã Lô Hàng kiểm định phía dưới đáy hoặc sau thân bao bì.",
      relatedIds: [25, 29, 80]
    },
    {
      id: 42,
      category: "shelf-life",
      question: "Các sản phẩm gửi bưu điện đi xa các tỉnh có bị hỏng không?",
      keywords: ["gui di xa co bi hong khong", "van chuyen xa", "ship tinh"],
      answer: "Các dòng đặc sản sấy (khoai tây sấy giòn, dâu sấy, hồng treo gió, kẹo dâu) được thiết kế chuyên biệt để vận chuyển toàn quốc 63 tỉnh mà chất lượng vẫn nguyên vẹn 100%. Tiệm bọc màng khí chống sốc 3 lớp cẩn thận.",
      relatedIds: [56, 57, 68]
    },

    // ════════════════ NHÓM 4: DINH DƯỠNG, ĂN KIÊNG & SỨC KHỎE (Q43 - Q55) ════════════════
    {
      id: 43,
      category: "diet",
      question: "Người ăn chay có ăn được khoai tây sấy giòn không?",
      keywords: ["an chay duoc khong", "khoai tay an chay", "chay man"],
      answer: "Có! Vị Rong Biển Muối Hồng hoàn toàn thuần chay (Vegan). Riêng vị Phô Mai và Trứng Muối có thành phần từ sữa và trứng gà thích hợp cho người ăn chay có dùng trứng/sữa (Ovo-Lacto Vegetarian).",
      relatedIds: [1, 2, 44]
    },
    {
      id: 44,
      category: "diet",
      question: "Những món bánh và đặc sản nào tại tiệm phù hợp cho người ăn chay?",
      keywords: ["mon an chay", "banh chay", "thuc don chay"],
      answer: "Các món ăn chay tiêu biểu: Khoai tây sấy rong biển muối hồng, Dâu tây sấy thăng hoa, Hồng treo gió Đà Lạt, Kẹo dâu tằm dẻo, Trà Atiso thanh nhiệt, và Bánh bò thốt nốt nướng (chay dùng được cốt dừa thốt nốt).",
      relatedIds: [43, 45, 52]
    },
    {
      id: 45,
      category: "diet",
      question: "Một khẩu phần khoai tây sấy giòn chứa bao nhiêu calo?",
      keywords: ["bao nhieu calo", "ham luong calo", "calories"],
      answer: "Một khẩu phần chuẩn 50g khoai tây sấy giòn The Măm Măm cung cấp khoảng 230 - 250 kcal. Lượng calo vừa vặn cho bữa xế năng động hoặc nạp nhanh năng lượng sau giờ học, giờ làm việc mệt mỏi.",
      relatedIds: [46, 47, 50]
    },
    {
      id: 46,
      category: "diet",
      question: "Người đang trong chế độ giảm cân (Eat Clean / Diet) có dùng được không?",
      keywords: ["giam can an duoc khong", "eat clean", "diet", "khoai giam can"],
      answer: "Nhờ công nghệ sấy ly tâm tách dầu và sử dụng muối hồng Himalaya, lượng chất béo bão hòa và natri thấp hơn 35% so với bim bim công nghiệp thông thường. Bạn hoàn toàn có thể thưởng thức một lượng vừa phải vào bữa phụ nhé!",
      relatedIds: [45, 47, 55]
    },
    {
      id: 47,
      category: "diet",
      question: "Tiệm có sản phẩm nào ít đường hoặc không ngọt cho người ăn kiêng không?",
      keywords: ["it duong", "it ngot", "tieu duong", "khong ngot"],
      answer: "Tiệm có dòng Trà Atiso nguyên chất không đường, Dâu tây sấy mộc thăng hoa (vị chua ngọt tự nhiên của quả dâu), và Khoai tây rong biển mộc vị mặn thanh không gia vị đường, rất phù hợp cho người kiêng đường.",
      relatedIds: [12, 14, 46]
    },
    {
      id: 48,
      category: "diet",
      question: "Trẻ em từ mấy tuổi thì ăn được khoai tây sấy của tiệm?",
      keywords: ["tre em may tuoi", "be an duoc khong", "tuoi an khoai"],
      answer: "Bé từ 2 tuổi trở lên khi đã biết nhai nuốt thuần thục là có thể ăn được khoai tây sấy Rong Biển hoặc Phô Mai. Lát khoai giòn xốp dễ tan, không chứa phẩm màu hóa học nên cha mẹ hoàn toàn an tâm.",
      relatedIds: [4, 49, 51]
    },
    {
      id: 49,
      category: "diet",
      question: "Phụ nữ mang thai và mẹ đang cho con bú có ăn được không?",
      keywords: ["ba bau an duoc khong", "me sau sinh", "mang thai"],
      answer: "Được bạn nhé! Tất cả sản phẩm The Măm Măm đều làm từ nguyên liệu nông sản sạch tự nhiên, không hóa chất bảo quản. Mẹ bầu dùng các món dâu tây sấy, khoai tây rong biển, hồng treo gió rất lành tính và giàu chất xơ.",
      relatedIds: [50, 53, 54]
    },
    {
      id: 50,
      category: "diet",
      question: "Sản phẩm của The Măm Măm có chứa Gluten không?",
      keywords: ["gluten", "di ung gluten", "gluten free"],
      answer: "Khoai tây sấy giòn, dâu tây sấy thăng hoa và hồng treo gió bản chất là không chứa Gluten (Gluten-Free tự nhiên). Tuy nhiên các dòng bánh mì và bánh ngọt có sử dụng bột mì thông thường nên người dị ứng nặng với Gluten cần lưu ý.",
      relatedIds: [9, 51, 52]
    },
    {
      id: 51,
      category: "diet",
      question: "Người dị ứng đạm sữa bò hoặc bất dung nạp Lactose có dùng được không?",
      keywords: ["di ung sua", "lactose", "sua bo"],
      answer: "Bạn nên chọn Khoai tây sấy Rong Biển Muối Hồng, Dâu sấy thăng hoa, Hồng treo gió hoặc Trà Atiso (hoàn toàn không chứa sữa). Tránh chọn vị Phô Mai, Bánh Su Kem hoặc New York Cookie vì có bơ và sữa bò.",
      relatedIds: [1, 10, 43]
    },
    {
      id: 52,
      category: "diet",
      question: "Người dị ứng đậu phộng hoặc các loại hạt cây có ăn được không?",
      keywords: ["di ung dau phong", "hat oc cho", "di ung hat"],
      answer: "Khoai tây sấy giòn The Măm Măm không sử dụng đậu phộng trong thành phần. Riêng dòng New York Cookie có chứa hạt óc chó, hạnh nhân và hạt macca được chế biến riêng biệt và có cảnh báo dị ứng rõ ràng trên bao bì.",
      relatedIds: [11, 50, 51]
    },
    {
      id: 53,
      category: "diet",
      question: "Dâu tây sấy thăng hoa có giữ được hàm lượng Vitamin C không?",
      keywords: ["vitamin c", "dinh duong dau say", "chat dinh duong"],
      answer: "Công nghệ sấy thăng hoa chân không ở nhiệt độ âm giúp giữ lại hơn 95% cấu trúc dưỡng chất tự nhiên và hàm lượng Vitamin C quý giá của quả dâu tươi, tốt hơn nhiều so với phương pháp sấy nhiệt thông thường.",
      relatedIds: [12, 24, 38]
    },
    {
      id: 54,
      category: "diet",
      question: "Bà bầu có uống được Trà Atiso Đà Lạt không?",
      keywords: ["ba bau uong tra atiso", "atiso thai ky", "uong atiso"],
      answer: "Mẹ bầu có thể uống 1 ly trà atiso ấm loãng mỗi ngày để giải nhiệt, giảm tình trạng táo bón thai kỳ và mát gan. Không nên uống quá nhiều hoặc uống thay hoàn toàn nước lọc trong ngày.",
      relatedIds: [14, 49]
    },
    {
      id: 55,
      category: "diet",
      question: "Ăn khoai tây sấy The Măm Măm có bị nóng trong hay nổi mụn không?",
      keywords: ["bi nong trong", "noi mun", "nong hay mat"],
      answer: "Khoai tây của tiệm được tách dầu triệt để bằng máy ly tâm tốc độ cao và sử dụng muối khoáng hồng thiên nhiên nên giảm tối đa tình trạng sinh nhiệt nóng trong. Bạn nhớ uống thêm nước lọc và ăn kèm hoa quả để cơ thể luôn tươi tắn nhé!",
      relatedIds: [3, 20, 46]
    },

    // ════════════════ NHÓM 5: ĐÓNG GÓI & VẬN CHUYỂN 63 TỈNH (Q56 - Q70) ════════════════
    {
      id: 56,
      category: "shipping",
      question: "The Măm Măm có giao hàng tận nơi trên toàn quốc 63 tỉnh thành không?",
      keywords: ["giao hang toan quoc", "63 tinh thanh", "ship toan quoc", "ship tinh"],
      answer: "Dạ có! The Măm Măm liên kết cùng các đơn vị vận chuyển hàng đầu (Viettel Post, GHTK, EMS Hỏa Tốc) để giao hàng tận cửa nhà bạn trên toàn bộ 63 tỉnh thành cả nước từ thành thị đến huyện xã đảo.",
      relatedIds: [57, 59, 60],
      action: { type: "checkout", label: "Kiểm Tra Địa Chỉ Giao Hàng ➔" }
    },
    {
      id: 57,
      category: "shipping",
      question: "Đóng gói gửi đi xa có bị vỡ vụn hoặc móp méo hộp không?",
      keywords: ["dong goi", "bi vo vun", "mop meo", "chong soc"],
      answer: "Tiệm cam kết đóng gói chuẩn an toàn 100%: Lớp 1 là seal nhôm ép nhiệt giữ khoai cố định; Lớp 2 là màng bóng khí chống sốc quấn quanh hũ; Lớp 3 là thùng carton sóng 3 lớp dán băng keo niêm phong và tem cảnh báo 'Hàng Dễ Vỡ'.",
      relatedIds: [5, 58, 72]
    },
    {
      id: 58,
      category: "shipping",
      question: "Quy cách đóng gói hũ nắp nhôm và túi zip của tiệm thế nào?",
      keywords: ["quy cach hu", "hu pet", "tui zip", "dong goi"],
      answer: "Tiệm sử dụng hũ nhựa nguyên sinh PET cao cấp nắp nhôm xé tiện lợi, kèm nắp nhựa đậy ngoài để bảo quản lại sau khi mở. Túi zip tráng bạc 3 lớp dày dặn ngăn ngừa độ ẩm và tia UV tuyệt đối.",
      relatedIds: [6, 30, 57]
    },
    {
      id: 59,
      category: "shipping",
      question: "Giao hàng từ Đà Lạt ra Hà Nội mất bao lâu?",
      keywords: ["ship ha noi", "ha noi bao lau", "thoi gian giao ha noi"],
      answer: "Thời gian giao hàng ra Hà Nội chỉ từ 24 đến 36 giờ (khoảng 1 - 1.5 ngày) thông qua đường bay hỏa tốc bưu điện. Bánh và khoai tới nơi vẫn giòn rụm thơm lừng!",
      relatedIds: [56, 60, 63]
    },
    {
      id: 60,
      category: "shipping",
      question: "Giao hàng từ Đà Lạt về TP. Hồ Chí Minh mất bao lâu?",
      keywords: ["ship tphcm", "ho chi minh bao lau", "giao trong ngay hcm"],
      answer: "TP. Hồ Chí Minh nhận hàng cực nhanh trong ngày hoặc tối đa 24 giờ kể từ khi gửi hàng nhờ các chuyến xe trung chuyển liên tục giữa Đà Lạt và TP.HCM.",
      relatedIds: [56, 59, 63]
    },
    {
      id: 61,
      category: "shipping",
      question: "Giao hàng nội thành thành phố Đà Lạt mất bao lâu?",
      keywords: ["ship da lat", "giao noi thanh", "da lat bao lau"],
      answer: "Khách tại nội thành Đà Lạt sẽ nhận hàng hỏa tốc chỉ sau 15 - 30 phút đặt món! Bánh nướng nóng hổi vừa ra lò được shipper trao tận tay bạn ngay.",
      relatedIds: [28, 56, 63]
    },
    {
      id: 62,
      category: "shipping",
      question: "Phí vận chuyển toàn quốc được tính như thế nào?",
      keywords: ["phi ship", "cuoc van chuyen", "phi giao hang bao nhieu"],
      answer: "Phí ship tiêu chuẩn toàn quốc đồng giá chỉ từ 25.000đ - 35.000đ tùy khu vực địa lý. Nội thành Đà Lạt chỉ 15.000đ. Đơn hàng từ 200.000đ được MIỄN PHÍ VẬN CHUYỂN 100%!",
      relatedIds: [63, 64, 65]
    },
    {
      id: 63,
      category: "shipping",
      question: "Đơn hàng bao nhiêu tiền thì được Miễn Phí Vận Chuyển (Freeship)?",
      keywords: ["freeship", "mien phi ship", "don bao nhieu freeship"],
      answer: "Tất cả đơn hàng có giá trị từ 200.000đ trở lên đều được The Măm Măm tài trợ MIỄN PHÍ SHIP 100% toàn quốc! Hệ thống sẽ tự động trừ phí ship khi giỏ hàng của bạn đạt 200.000đ.",
      relatedIds: [62, 64, 83],
      action: { type: "menu", label: "Mua Đủ 200k Nhận Freeship ➔" }
    },
    {
      id: 64,
      category: "shipping",
      question: "Tôi có thể hẹn giờ giao hàng hoặc ghi chú cho shipper không?",
      keywords: ["hen gio giao", "ghi chu shipper", "giao gio hanh chinh"],
      answer: "Hoàn toàn được! Ở bước điền thông tin thanh toán, bạn chỉ cần nhập vào ô 'Ghi Chú Đơn Hàng' (ví dụ: 'Giao giờ hành chính', 'Gọi trước 15 phút', 'Gửi bảo vệ'). Shop sẽ in nổi bật dòng chữ này lên phiếu giao hàng.",
      relatedIds: [65, 66, 94]
    },
    {
      id: 65,
      category: "shipping",
      question: "Shipper có gọi điện trước khi giao hàng không?",
      keywords: ["goi dien truoc", "shipper goi", "lien he truoc khi giao"],
      answer: "Dạ có! Theo quy định bưu tá bắt buộc phải gọi điện thoại cho bạn ít nhất 2-3 cuộc trước khi giao hàng tận nơi. Nếu bận bạn có thể hẹn bưu tá dời sang ca giao sau hoặc ngày hôm sau.",
      relatedIds: [64, 66, 71]
    },
    {
      id: 66,
      category: "shipping",
      question: "Có thể giao hàng vào bệnh viện, cơ quan hoặc trường học không?",
      keywords: ["giao benh vien", "giao truong hoc", "giao co quan"],
      answer: "Được bạn nhé! Bạn chỉ cần ghi rõ tên Khoa/Phòng/Cổng nhận hàng cụ thể và dặn bưu tá gọi trước để bạn tiện ra cổng nhận bánh thuận tiện nhất.",
      relatedIds: [64, 65, 67]
    },
    {
      id: 67,
      category: "shipping",
      question: "Tôi ở chung cư thì shipper có giao tận cửa căn hộ không?",
      keywords: ["chung cu", "giao tan cua", "gui le tan"],
      answer: "Tùy theo quy định an ninh của từng tòa chung cư, shipper có thể mang lên tận cửa căn hộ hoặc gửi tại quầy lễ tân / phòng bảo vệ theo đúng yêu cầu ghi chú của bạn.",
      relatedIds: [64, 66, 71]
    },
    {
      id: 68,
      category: "shipping",
      question: "Bánh bò thốt nốt và bánh tươi có ship được đi các tỉnh miền Bắc không?",
      keywords: ["ship banh tuoi ra bac", "ship banh bo ra ha noi", "banh tuoi di xa"],
      answer: "Bánh bò thốt nốt nướng tại tiệm hút chân không và đóng thùng xốp lạnh bay hỏa tốc 24h nên giao tốt ra Hà Nội và các tỉnh phía Bắc. Các dòng bánh mềm kem tươi như Su kem chỉ phục vụ ship gần nội thành Đà Lạt để đảm bảo độ tươi ngon nhất.",
      relatedIds: [7, 10, 59]
    },
    {
      id: 69,
      category: "shipping",
      question: "Sau khi đặt hàng thì bao lâu shop sẽ đóng gói và bàn giao bưu cục?",
      keywords: ["bao lau gui hang", "thoi gian chuan bi", "dong goi gui di"],
      answer: "Các đơn đặt trước 15h00 hàng ngày sẽ được đóng gói và bàn giao ngay trong ngày. Đơn sau 15h00 sẽ được gửi vào chuyến bay sớm nhất sáng hôm sau để hàng đến tay bạn nhanh nhất.",
      relatedIds: [59, 60, 70]
    },
    {
      id: 70,
      category: "shipping",
      question: "Làm thế nào để tra cứu hành trình bưu kiện của tôi?",
      keywords: ["tra cuu don hang", "ma van don", "kiem tra hanh trinh"],
      answer: "Sau khi shop gửi hàng, mã vận đơn sẽ được gửi tin nhắn SMS xác nhận cho bạn. Bạn cũng có thể bấm nút 'Chat Cho Tiệm' hoặc gọi hotline 0974 449 708 để nhân viên kiểm tra tức thì vị trí đơn hàng.",
      relatedIds: [69, 71, 100],
      action: { type: "contact", label: "Kiểm Tra Đơn Qua Hotline ➔" }
    },

    // ════════════════ NHÓM 6: ĐỒNG KIỂM, ĐỔI TRẢ & BỒI HOÀN (Q71 - Q82) ════════════════
    {
      id: 71,
      category: "return",
      question: "Tôi có được mở hộp đồng kiểm tra hàng trước khi thanh toán không?",
      keywords: ["dong kiem", "kiem tra hang truoc khi nhan", "xem hang"],
      answer: "DẠ CÓ 100%! The Măm Măm áp dụng chính sách 'ĐỒNG KIỂM TẬN CỬA' theo chuẩn Luật Bảo vệ quyền lợi người tiêu dùng. Bạn hoàn toàn có quyền mở thùng carton kiểm tra đủ số lượng hũ và tem nhãn trước khi ký nhận tiền.",
      relatedIds: [72, 73, 76],
      action: { type: "policy", label: "Xem Chi Tiết Chính Sách Đồng Kiểm ➔" }
    },
    {
      id: 72,
      category: "return",
      question: "Nếu sản phẩm bị vỡ nát, móp méo do vận chuyển thì shop xử lý sao?",
      keywords: ["bi vo nat", "mop meo do ship", "hang hong"],
      answer: "Tiệm CAM KẾT BỒI HOÀN HOẶC GỬI ĐƠN MỚI 100% MIỄN PHÍ! Bạn chỉ cần chụp ảnh tình trạng hũ bánh gửi cho tiệm, tiệm sẽ gửi ngay đơn mới hỏa tốc mà bạn không mất thêm bất kỳ chi phí nào.",
      relatedIds: [71, 73, 74]
    },
    {
      id: 73,
      category: "return",
      question: "Nếu bưu kiện bị giao thiếu món hoặc sai vị thì phải làm sao?",
      keywords: ["giao thieu mon", "sai vi", "giao nham"],
      answer: "Bạn liên hệ ngay qua hotline 0974 449 708 hoặc nhắn tin qua chat web, tiệm sẽ lập tức gửi bù các món còn thiếu hỏa tốc hoặc hoàn tiền chuyển khoản ngay trong 15 phút.",
      relatedIds: [71, 72, 75]
    },
    {
      id: 74,
      category: "return",
      question: "Thời gian tiếp nhận yêu cầu đổi trả và khiếu nại trong bao lâu?",
      keywords: ["thoi gian doi tra", "bao nhieu ngay", "tiep nhan khieu nai"],
      answer: "Tiệm tiếp nhận khiếu nại và hỗ trợ đổi trả trong vòng 48 giờ kể từ thời điểm bưu tá cập nhật trạng thái 'Giao hàng thành công'. Đội ngũ trực giải quyết 24/7.",
      relatedIds: [72, 75, 78]
    },
    {
      id: 75,
      category: "return",
      question: "Khách hàng có phải trả phí ship khi đổi trả hàng lỗi không?",
      keywords: ["phi ship doi tra", "ai tra phi ship", "tra hang"],
      answer: "KHÔNG! Đối với bất kỳ lỗi nào xuất phát từ phía The Măm Măm hoặc đơn vị vận chuyển (hàng móp méo, thiếu món, sai vị), tiệm chịu 100% chi phí vận chuyển phát sinh 2 chiều.",
      relatedIds: [72, 73, 76]
    },
    {
      id: 76,
      category: "return",
      question: "Chính sách hoàn tiền mặt hoặc chuyển khoản như thế nào?",
      keywords: ["hoan tien", "tra lai tien", "chuyen khoan tra"],
      answer: "Tiệm sẽ hoàn tiền 100% qua số tài khoản ngân hàng hoặc ví MoMo của bạn ngay trong ngày (trong vòng 2-4 tiếng sau khi xác nhận thông tin khiếu nại).",
      relatedIds: [72, 74, 75]
    },
    {
      id: 77,
      category: "return",
      question: "Trường hợp nào không được áp dụng chính sách đổi trả?",
      keywords: ["khong duoc doi tra", "tu choi doi tra", "ngoai le"],
      answer: "Các trường hợp không áp dụng: Sản phẩm đã bị bóc seal sử dụng quá 50% khối lượng, quá thời hạn 48h thông báo mà không có lý do chính đáng, hoặc bảo quản sai hướng dẫn (để bánh kem ngoài nắng gắt kéo dài).",
      relatedIds: [71, 74, 78]
    },
    {
      id: 78,
      category: "return",
      question: "Tôi có cần quay video mở hộp (unboxing) khi nhận hàng không?",
      keywords: ["video unboxing", "quay video mo hop", "clip nhan hang"],
      answer: "Quay video unboxing mở kiện hàng là một thói quen rất tốt để bảo vệ quyền lợi của bạn! Tuy nhiên nếu không kịp quay video, chỉ cần chụp rõ ảnh nhãn bưu bưu kiện và sản phẩm lỗi là tiệm vẫn hỗ trợ hết mình.",
      relatedIds: [71, 72, 73]
    },
    {
      id: 79,
      category: "return",
      question: "Sản phẩm ăn thử thấy không hợp khẩu vị có được đổi trả không?",
      keywords: ["khong hop khau vi", "an khong hop", "doi vi"],
      answer: "Do đặc thù an toàn vệ sinh thực phẩm, tiệm chưa hỗ trợ đổi trả vì lý do không hợp gu cá nhân. Bạn hãy tham khảo kỹ mô tả hương vị hoặc hỏi Trợ lý ảo tư vấn để chọn vị hợp gu nhất trước khi đặt nhé!",
      relatedIds: [1, 2, 77]
    },
    {
      id: 80,
      category: "return",
      question: "Shop có cam kết bồi thường 100% nếu phát hiện hàng cận date không?",
      keywords: ["hang can date", "het han", "boi thuong"],
      answer: "CAM KẾT TUYỆT ĐỐI! The Măm Măm áp dụng chính sách 'Luôn Gửi Hàng Mới Sản Xuất Trong 24-48 Giờ'. Nếu quý khách phát hiện bất kỳ sản phẩm nào cận date dưới 30 ngày, tiệm bồi hoàn gấp đôi giá trị đơn hàng!",
      relatedIds: [25, 29, 41]
    },
    {
      id: 81,
      category: "return",
      question: "Quy trình xử lý bảo hành thực phẩm mất bao lâu?",
      keywords: ["quy trinh bao hanh", "mat bao lau", "toc do xu ly"],
      answer: "Chỉ từ 15 đến 30 phút sau khi tiệm nhận được phản hồi qua hotline hoặc form Chat Cho Tiệm! Tiệm ưu tiên tối đa quyền lợi khách hàng, không thủ tục rườm rà.",
      relatedIds: [73, 76, 82]
    },
    {
      id: 82,
      category: "return",
      question: "Kênh nào tiếp nhận khiếu nại và hỗ trợ nhanh nhất?",
      keywords: ["kenh khieu nai", "hotline", "chat truc tiep", "ho tro nhanh"],
      answer: "Hotline trực tiếp: 0974 449 708 (gọi điện/Zalo) hoặc bấm nút 'Chat Cho Tiệm' ngay trên website để được bộ phận chăm sóc khách hàng tiếp nhận xử lý ngay lập tức.",
      relatedIds: [81, 99, 100],
      action: { type: "contact", label: "Gọi Hotline 0974 449 708 ➔" }
    },

    // ════════════════ NHÓM 7: KHUYẾN MÃI, VOUCHER & MINI GAME (Q83 - Q93) ════════════════
    {
      id: 83,
      category: "promo",
      question: "Hiện tại The Măm Măm đang có những chương trình ưu đãi nào?",
      keywords: ["chuong trinh khuyen mai", "uu dai hien tai", "giam gia"],
      answer: "Tiệm đang có 4 ưu đãi cực hot: 1) Freeship toàn quốc cho đơn từ 200k; 2) Chơi Game Gõ Thìa Đập Khoai Tây săn mã giảm giá; 3) Quay Vòng May Mắn trúng voucher đến 25%; 4) Tích điểm thành viên 5% cho mỗi đơn hàng!",
      relatedIds: [63, 84, 85],
      action: { type: "game", label: "Chơi Game Săn Voucher Ngay ➔" }
    },
    {
      id: 84,
      category: "promo",
      question: "Mini game 'Đập Khoai Tây Nhận Quà' chơi như thế nào?",
      keywords: ["game dap khoai tay", "go thia khoai tay", "cach choi game"],
      answer: "Bạn dùng thìa gõ nhanh vào chú Khoai Tây đang né tránh trên màn hình trong vòng 30 giây để đạt mốc 15 điểm. Thắng game bạn sẽ mở khóa ngay Vòng Quay May Mắn nhận mã voucher giảm giá cực khủng!",
      relatedIds: [83, 85, 87],
      action: { type: "game", label: "Thử Thách Gõ Thìa ➔" }
    },
    {
      id: 85,
      category: "promo",
      question: "Bấm vào đâu để quay 'Vòng Quay May Mắn' nhận voucher?",
      keywords: ["vong quay may man", "quay voucher", "lucky wheel"],
      answer: "Sau khi hoàn thành mini game Đập Khoai Tây, màn hình Vòng Quay May Mắn sẽ tự động hiện ra. Bạn nhấn nút 'QUAY NGAY' để nhận ngẫu nhiên các voucher: GIAM10 (10%), GIAM15 (15%), GIAM20 (20%) hoặc quà tặng đặc biệt!",
      relatedIds: [84, 86, 87]
    },
    {
      id: 86,
      category: "promo",
      question: "Mã voucher của tiệm có cơ chế bảo mật chống gian lận không?",
      keywords: ["bao mat voucher", "ma 5 ky tu", "chong hack voucher"],
      answer: "Có! Hệ thống The Măm Măm tích hợp công cụ mã hóa bảo mật tạo mã voucher ngẫu nhiên kèm chữ ký xác thực (checksum token) chống hack và kiểm tra tính hợp lệ tức thì khi áp dụng vào giỏ hàng.",
      relatedIds: [85, 87, 88]
    },
    {
      id: 87,
      category: "promo",
      question: "Cách nhập mã giảm giá (voucher) khi đặt hàng như thế nào?",
      keywords: ["nhap ma giam gia", "ap dung voucher", "dung ma"],
      answer: "Ở thanh giỏ hàng hoặc bước Thanh Toán, bạn nhập mã vào ô 'Nhập Mã Giảm Giá' rồi bấm nút 'Áp Dụng'. Hệ thống sẽ tự động trừ số tiền giảm trực tiếp vào tổng đơn hàng cho bạn.",
      relatedIds: [85, 86, 88],
      action: { type: "cart", label: "Xem Giỏ Hàng & Mã Giảm Giá ➔" }
    },
    {
      id: 88,
      category: "promo",
      question: "Một đơn hàng có được dùng nhiều mã giảm giá cùng lúc không?",
      keywords: ["dung nhieu ma cung luc", "cong don voucher", "ap dung nhieu ma"],
      answer: "Mỗi đơn hàng áp dụng tối đa 01 mã voucher giảm giá % hoặc giảm tiền. Tuy nhiên mã voucher VẪN ĐƯỢC CỘNG DỒN cùng chính sách MIỄN PHÍ VẬN CHUYỂN toàn quốc khi đơn đạt từ 200.000đ!",
      relatedIds: [63, 86, 87]
    },
    {
      id: 89,
      category: "promo",
      question: "Mã giảm giá sau khi trúng thưởng có hạn sử dụng bao lâu?",
      keywords: ["hsd ma giam gia", "voucher dung duoc may ngay", "han voucher"],
      answer: "Mã voucher trúng thưởng từ game có hạn sử dụng trong vòng 24 giờ đến 7 ngày tùy theo sự kiện. Khi trúng thưởng, hệ thống sẽ lưu tự động vào trình duyệt của bạn để bạn tiện dùng ngay.",
      relatedIds: [85, 87, 88]
    },
    {
      id: 90,
      category: "promo",
      question: "Làm sao để đăng ký tài khoản thành viên để tích điểm?",
      keywords: ["dang ky tai khoan", "tich diem", "thanh vien"],
      answer: "Bạn bấm nút '👤 Tài Khoản' ở góc trên thanh menu, chọn tab 'Đăng Ký' và nhập Số điện thoại + Tên của bạn. Ngay sau khi tạo bạn sẽ được tặng 50 điểm thưởng đầu tiên!",
      relatedIds: [91, 92, 94],
      action: { type: "account", label: "Đăng Ký Thành Viên Ngay ➔" }
    },
    {
      id: 91,
      category: "promo",
      question: "1 điểm tích lũy quy đổi tương đương bao nhiêu tiền?",
      keywords: ["quy doi diem", "1 diem bang bao nhieu tien", "diem thuong"],
      answer: "Cứ 1 điểm tích lũy tương đương 1.000 VNĐ. Điểm thưởng sẽ được tích tự động 5% giá trị mỗi đơn hàng hoàn thành và bạn có thể cấn trừ trực tiếp vào các lần mua tiếp theo.",
      relatedIds: [90, 92, 94]
    },
    {
      id: 92,
      category: "promo",
      question: "Khách hàng mới (đơn hàng đầu tiên) có ưu đãi chào mừng gì không?",
      keywords: ["khach hang moi", "don dau tien", "uu dai chao mung"],
      answer: "Khách hàng mới tạo tài khoản sẽ được nhận ngay 50 điểm tích lũy (~50.000đ) và tặng voucher chào mừng giảm 10% áp dụng cho đơn hàng đầu tiên!",
      relatedIds: [85, 90, 91]
    },
    {
      id: 93,
      category: "promo",
      question: "Tiệm có chính sách chiết khấu khi mua sỉ hoặc làm quà biếu doanh nghiệp không?",
      keywords: ["mua si", "chiet khau", "qua tang doanh nghiep", "so luong lon"],
      answer: "Dạ có! Với các đơn hàng từ 10 hũ hoặc đơn quà tặng doanh nghiệp theo set hộp quà sang trọng, tiệm có mức chiết khấu từ 10% - 25% kèm in thiệp thương hiệu riêng. Vui lòng gọi 0974 449 708 để nhận bảng báo giá chi tiết.",
      relatedIds: [83, 99, 100],
      action: { type: "contact", label: "Tư Vấn Đơn Quà Doanh Nghiệp ➔" }
    },

    // ════════════════ NHÓM 8: ĐẶT HÀNG, THANH TOÁN & HỖ TRỢ (Q94 - Q100) ════════════════
    {
      id: 94,
      category: "payment",
      question: "Làm thế nào để đặt hàng nhanh chóng trên website The Măm Măm?",
      keywords: ["cach dat hang", "huong dan mua hang", "dat hang online"],
      answer: "Chỉ 3 bước đơn giản: 1) Chọn món ngon trong Thực Đơn và bấm 'Thêm Vào Giỏ'; 2) Bấm xem 'Giỏ Hàng' và nhập mã voucher (nếu có); 3) Bấm 'Đặt Hàng Ngay', điền thông tin địa chỉ và bấm 'Xác Nhận Đơn Hàng'.",
      relatedIds: [56, 87, 95],
      action: { type: "menu", label: "Khám Phá Thực Đơn 106 Món ➔" }
    },
    {
      id: 95,
      category: "payment",
      question: "Tiệm chấp nhận những hình thức thanh toán nào?",
      keywords: ["hinh thuc thanh toan", "tra tien the nao", "phuong thuc"],
      answer: "The Măm Măm hỗ trợ 2 hình thức thanh toán an toàn và tiện lợi: 1) Thanh toán tiền mặt khi nhận hàng (COD); 2) Chuyển khoản ví điện tử MoMo hoặc quét mã QR ngân hàng tiện lợi.",
      relatedIds: [96, 97, 98]
    },
    {
      id: 96,
      category: "payment",
      question: "Thanh toán khi nhận hàng (COD) có bị thu thêm phụ phí không?",
      keywords: ["phi cod", "thanh toan khi nhan hang", "phu phi cod"],
      answer: "HOÀN TOÀN KHÔNG! Tiệm miễn phí 100% cước thu hộ COD. Bạn chỉ cần thanh toán đúng số tiền hàng và tiền ship hiển thị trên hóa đơn, không phát sinh bất kỳ khoản phụ thu nào khác.",
      relatedIds: [71, 95, 97]
    },
    {
      id: 97,
      category: "payment",
      question: "Thông tin chuyển khoản MoMo chính thức của The Măm Măm là gì?",
      keywords: ["so momo", "chuyen khoan momo", "thong tin momo"],
      answer: "Số MoMo chính thức: 0974 449 708 - Chủ tài khoản: NGUYEN THI KIM OANH. Hệ thống sẽ tạo sẵn mã QR MoMo kèm nội dung mã đơn hàng để bạn quét một chạm cực nhanh.",
      relatedIds: [95, 98, 100]
    },
    {
      id: 98,
      category: "payment",
      question: "Sau khi chuyển khoản MoMo tôi cần làm gì để xác nhận đơn?",
      keywords: ["xac nhan chuyen khoan", "sau khi ck", "thong bao chuyen tien"],
      answer: "Sau khi quét mã MoMo thành công, hệ thống website sẽ tự động lưu trạng thái chờ duyệt. Bạn có thể chụp màn hình giao dịch gửi qua hotline/Zalo hoặc form chat để nhân viên xác nhận trong 1 phút!",
      relatedIds: [97, 99, 100]
    },
    {
      id: 99,
      category: "payment",
      question: "Tiệm có xuất hóa đơn bán lẻ hoặc hóa đơn bán hàng không?",
      keywords: ["xuat hoa don", "hoa don ban le", "bill thanh toan"],
      answer: "Có! Mỗi bưu kiện gửi đi đều đính kèm Phiếu Giao Hàng & Hóa Đơn Bán Lẻ có in đầy đủ chi tiết mã món, số lượng, ngày đóng gói và thông tin cửa hàng. Khách hàng doanh nghiệp cần xuất hóa đơn vui lòng liên hệ hotline.",
      relatedIds: [94, 95, 100]
    },
    {
      id: 100,
      category: "payment",
      question: "Làm sao để liên hệ trực tiếp với nhân viên tư vấn The Măm Măm?",
      keywords: ["lien he shop", "so dien thoai hotline", "chat truc tiep", "nhan vien ho tro"],
      answer: "Bạn có thể liên hệ trực tiếp qua: 1) Hotline/Zalo: 0974 449 708; 2) Bấm nút 'Chat Cho Tiệm' trực tuyến; 3) Hoặc để lại lời nhắn trong form tư vấn. Đội ngũ The Măm Măm luôn sẵn sàng phục vụ bạn 24/7!",
      relatedIds: [82, 94, 97],
      action: { type: "contact", label: "Gọi Ngay Hotline 0974 449 708 ➔" }
    }
  ]
};

// Đảm bảo dữ liệu truy cập được toàn cục
if (typeof window !== "undefined") {
  window.MAMMAM_FAQ_DATA = MAMMAM_FAQ_DATA;
}
