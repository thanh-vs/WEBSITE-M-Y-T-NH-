import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Product, User, Order, Review, CategoryItem, Coupon, RestockProposal } from '../src/types/index.js';

dotenv.config();

export interface DatabaseState {
  users: (User & { passwordHash: string })[];
  products: Product[];
  orders: Order[];
  reviews: Review[];
  isMongoConnected: boolean;
  mongoUriMasked?: string;
}

// Doc mat khau khoi tao tu bien moi truong hoac dung mac dinh
const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const staffPassword = process.env.DEFAULT_STAFF_PASSWORD || 'staff123';

const DEFAULT_HASH_ADMIN = bcrypt.hashSync(adminPassword, 10);
const DEFAULT_HASH_STAFF = bcrypt.hashSync(staffPassword, 10);
const DEFAULT_HASH_USER = bcrypt.hashSync('password123', 10);

const INITIAL_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr_admin_001',
    name: 'Quản Trị Viên TechCore',
    email: 'admin@techcore.vn',
    role: 'admin',
    phone: '0988776655',
    address: '88 Phố Vọng, Phường Phương Mai, Quận Đống Đa, Hà Nội',
    department: 'Ban Giám Đốc',
    position: 'Quản trị viên trưởng',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    passwordHash: DEFAULT_HASH_ADMIN,
  },
  {
    id: 'usr_staff_001',
    name: 'Nguyễn Minh Tuấn',
    email: 'nhanvien@techcore.vn',
    role: 'staff',
    phone: '0933221100',
    address: '15 Tôn Thất Tùng, Quận 1, TP. Hồ Chí Minh',
    department: 'Kỹ thuật & Quản lý kho',
    position: 'Chuyên viên kỹ thuật phần cứng',
    status: 'active',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    passwordHash: DEFAULT_HASH_STAFF,
  },
  {
    id: 'usr_customer_002',
    name: 'Nguyễn Văn An',
    email: 'khachhang@gmail.com',
    role: 'customer',
    phone: '0912345678',
    address: '123 Đường Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh',
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    passwordHash: DEFAULT_HASH_USER,
  },
  {
    id: 'usr_customer_003',
    name: 'Trần Thị Thu Thảo',
    email: 'thaotran.tech@gmail.com',
    role: 'customer',
    phone: '0903456789',
    address: '45 Lê Duẩn, Quận Hải Châu, Đà Nẵng',
    status: 'active',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    passwordHash: DEFAULT_HASH_USER,
  },
  {
    id: 'usr_customer_004',
    name: 'Lê Hoàng Nam',
    email: 'namle.gamer@gmail.com',
    role: 'customer',
    phone: '0977654321',
    address: '72 Cầu Giấy, Quận Cầu Giấy, Hà Nội',
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    passwordHash: DEFAULT_HASH_USER,
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_rog_g16',
    name: 'ASUS ROG Zephyrus G16 GU605MI OLED (2025)',
    brand: 'ASUS',
    category: 'laptop-gaming',
    price: 52990000,
    originalPrice: 58990000,
    discountPercent: 10,
    stock: 12,
    rating: 4.9,
    reviewCount: 38,
    image: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
    specs: {
      cpu: 'Intel Core Ultra 9 185H (16 Nhân, 22 Luồng, 5.1GHz)',
      gpu: 'NVIDIA GeForce RTX 4070 8GB GDDR6 (105W TGP)',
      ram: '32GB LPDDR5X 7467MHz Dual Channel',
      storage: '1TB M.2 NVMe PCIe 4.0 SSD',
      display: '16.0" 2.5K (2560x1600) ROG Nebula OLED 240Hz 0.2ms 100% DCI-P3',
      os: 'Windows 11 Home bản quyền',
      weight: '1.85 kg siêu mỏng nhẹ',
      battery: '90WHrs 4-cell Li-ion (Sạc nhanh Type-C 100W)',
    },
    description: 'Tuyệt tác Laptop Gaming mỏng nhẹ hàng đầu thế giới với khung nhôm CNC nguyên khối Platinum White, màn hình OLED 240Hz sắc nét đỉnh cao cùng vi xử lý thế hệ mới Intel Core Ultra 9.',
    highlights: [
      'Khung vỏ nhôm phay CNC unibody chỉ dày 1.49cm',
      'Màn hình OLED ROG Nebula 2.5K 240Hz đạt chuẩn VESA DisplayHDR True Black 500',
      'Hệ thống tản nhiệt ROG Intelligent Cooling với quạt Arc Flow Gen 2',
      'Âm thanh 6 loa vòm Dolby Atmos với loa trầm khử lực kép'
    ],
    warranty: '24 tháng chính hãng ASUS Việt Nam',
    isFeatured: true,
    isNewArrival: true,
    gifts: ['Balo ROG Ranger cao cấp', 'Chuột gaming ROG Impact III Wireless', 'Gói vệ sinh máy miễn phí trọn đời']
  },
  {
    id: 'prod_pc_apex_4090',
    name: 'PC TechCore Apex Ultra i9-14900KS / RTX 4090 OC',
    brand: 'TechCore Custom',
    category: 'pc-gaming',
    price: 98900000,
    originalPrice: 108000000,
    discountPercent: 8,
    stock: 6,
    rating: 5.0,
    reviewCount: 19,
    image: '/src/assets/images/category_gaming_pc_1791553028628.jpg',
    specs: {
      cpu: 'Intel Core i9-14900KS (24 Nhân 32 Luồng, up to 6.2GHz)',
      gpu: 'ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X OC Edition',
      ram: '64GB (2x32GB) DDR5 G.Skill Trident Z5 RGB 6800MHz',
      storage: '2TB Samsung 990 PRO NVMe Gen4 (Đọc 7450MB/s, Ghi 6900MB/s)',
      display: 'Tối ưu cho màn hình 4K 144Hz - 240Hz HDR',
      os: 'Windows 11 Pro 64-bit Workstation',
      weight: '16.5 kg',
      battery: 'Nguồn Corsair RM1200x SHIFT 1200W 80 Plus Gold ATX 3.0'
    },
    description: 'Cỗ máy quái vật Gaming và Render 3D tối thượng. Sử dụng toàn bộ linh kiện flagship cao cấp, tản nhiệt nước AIO 360mm custom với màn hình LCD hiển thị nhiệt độ thời gian thực.',
    highlights: [
      'Hiệu năng chiến mượt mọi tựa game AAA ở độ phân giải 4K Max Settings',
      'Card đồ họa RTX 4090 24GB VRAM xử lý mượt mà mọi tác vụ đồ họa 3D và render nặng',
      'Bo mạch chủ ASUS ROG MAXIMUS Z790 DARK HERO Wi-Fi 7',
      'Vỏ case Lian Li O11 Dynamic EVO RGB kính cường lực cao cấp'
    ],
    warranty: '36 tháng chính hãng linh kiện 1 đổi 1 trong 30 ngày',
    isFeatured: true,
    gifts: ['Giá đỡ VGA ARGB cao cấp', 'Bàn di chuột TechCore Speed XXL', 'Tặng voucher 1.000.000đ mua Gaming Gear']
  },
  {
    id: 'prod_macbook_pro_16',
    name: 'Apple MacBook Pro 16 inch M3 Max (36GB / 1TB)',
    brand: 'Apple',
    category: 'laptop-office',
    price: 89990000,
    originalPrice: 94990000,
    discountPercent: 5,
    stock: 8,
    rating: 4.9,
    reviewCount: 26,
    image: '/src/assets/images/category_creator_laptop_1791553040374.jpg',
    specs: {
      cpu: 'Apple M3 Max (14-core CPU, 10 performance and 4 efficiency)',
      gpu: 'Apple M3 Max (30-core GPU, Hardware-accelerated ray tracing)',
      ram: '36GB Unified Memory (Băng thông 300GB/s)',
      storage: '1TB SSD siêu tốc độ',
      display: '16.2" Liquid Retina XDR (3456x2234) ProMotion 120Hz 1600 nits đỉnh',
      os: 'macOS Sequoia mới nhất',
      weight: '2.16 kg',
      battery: 'Pin 100Wh lên đến 22 giờ sử dụng, sạc nhanh MagSafe 3 140W'
    },
    description: 'Laptop chuyên nghiệp đỉnh cao cho kỹ sư phần mềm, nhà sáng tạo nội dung 4K/8K và kiến trúc sư. Màu Space Black sang trọng với khả năng kháng vân tay vượt trội.',
    highlights: [
      'Thời lượng pin vô địch lên tới 22 tiếng làm việc liên tục',
      'Màn hình Liquid Retina XDR đạt độ tương phản 1.000.000:1',
      'Cổng kết nối đa dạng: 3x Thunderbolt 4, HDMI 8K, SDXC Card slot, MagSafe 3',
      'Âm thanh 6 loa chất lượng phòng thu với âm trầm sâu'
    ],
    warranty: '12 tháng chính hãng Apple Care toàn cầu',
    isFeatured: true,
    gifts: ['Túi chống sốc Tomtoc Defender', 'Hub chuyển đổi đa năng Type-C to HDMI/USB', 'Dán màn hình JCPAL cao cấp']
  },
  {
    id: 'prod_rtx_4080_super',
    name: 'VGA ASUS ROG Strix GeForce RTX 4080 SUPER 16GB OC',
    brand: 'ASUS',
    category: 'components',
    price: 33900000,
    originalPrice: 36500000,
    discountPercent: 7,
    stock: 15,
    rating: 4.8,
    reviewCount: 14,
    image: '/src/assets/images/category_pc_components_1791553050836.jpg',
    specs: {
      cpu: 'Tương thích mọi bo mạch chủ PCIe 4.0 x16',
      gpu: 'GeForce RTX 4080 SUPER (10240 CUDA Cores, Boost Clock 2670MHz)',
      ram: '16GB GDDR6X 256-bit (Băng thông 736 GB/s)',
      storage: 'Yêu cầu nguồn tối thiểu 750W (Khuyên dùng 850W+)',
      display: 'Hỗ trợ 4 màn hình (2x HDMI 2.1a, 3x DisplayPort 1.4a)',
      os: 'Driver NVIDIA Game Ready & Studio',
      weight: '1.97 kg',
      battery: 'Kết nối nguồn 1x 16-pin (12VHPWR)'
    },
    description: 'Card đồ họa đỉnh cao kiến trúc Ada Lovelace với hệ thống tản nhiệt buồng hơi MaxContact siêu mát và khung kim loại đúc cứng cáp chuẩn phong cách ROG.',
    highlights: [
      'Công nghệ DLSS 3.5 Frame Generation tăng vọt tốc độ khung hình',
      'Quạt tản nhiệt Axial-tech cánh quạt mở rộng tăng 23% lưu lượng gió',
      'Công nghệ 0dB tĩnh lặng hoàn toàn khi tải nhẹ',
      'Đèn LED Aura Sync RGB đồng bộ rực rỡ'
    ],
    warranty: '36 tháng chính hãng ASUS Việt Nam',
    isFeatured: false,
    gifts: ['Thanh đỡ card đồ họa kim loại ROG', 'Dây cáp nguồn nối dài bọc dù chống cháy']
  },
  {
    id: 'prod_legion_pro_7i',
    name: 'Lenovo Legion Pro 7i Gen 9 (i9-14900HX / RTX 4080)',
    brand: 'Lenovo',
    category: 'laptop-gaming',
    price: 68900000,
    originalPrice: 74900000,
    discountPercent: 8,
    stock: 7,
    rating: 4.9,
    reviewCount: 22,
    image: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
    specs: {
      cpu: 'Intel Core i9-14900HX (24 Nhân 32 Luồng, Cache 36MB, Max 5.8GHz)',
      gpu: 'NVIDIA GeForce RTX 4080 12GB GDDR6 (175W Full TGP)',
      ram: '32GB DDR5 5600MHz (Nâng cấp tối đa 64GB)',
      storage: '1TB SSD M.2 PCIe Gen4 NVMe (Còn trống 1 khe M.2)',
      display: '16.0" WQXGA (2560x1600) IPS 240Hz 500 nits 100% sRGB HDR400',
      os: 'Windows 11 Home',
      weight: '2.6 kg',
      battery: '99.9Whr hỗ trợ Super Rapid Charge Pro'
    },
    description: 'Cỗ máy Esports hàng đầu được trang bị hệ thống điều khiển phần cứng Lenovo LA-2Q thông minh, tự động tối ưu hóa điện năng và quạt tản nhiệt theo từng tựa game cụ thể.',
    highlights: [
      'Tản nhiệt buồng hơi Legion Coldfront 5.0 Vapor Chamber cực lớn',
      'Bàn phím Legion TrueStrike hành trình phím 1.5mm, RGB từng phím Legion Spectrum',
      'Khung vỏ kim loại nguyên khối màu Onyx Grey siêu cứng cáp',
      'Hỗ trợ công nghệ NVIDIA G-SYNC và Advanced Optimus'
    ],
    warranty: '24 tháng Lenovo Premium Care tận nơi',
    isFeatured: true,
    gifts: ['Chuột Lenovo Legion M300 RGB', 'Balo Legion Active Gaming', 'Tai nghe Gaming 7.1']
  },
  {
    id: 'prod_dell_xps_16',
    name: 'Dell XPS 16 9640 OLED (Intel Core Ultra 7 / RTX 4070)',
    brand: 'Dell',
    category: 'laptop-office',
    price: 64990000,
    originalPrice: 69990000,
    discountPercent: 7,
    stock: 9,
    rating: 4.7,
    reviewCount: 15,
    image: '/src/assets/images/category_creator_laptop_1791553040374.jpg',
    specs: {
      cpu: 'Intel Core Ultra 7 155H (16 Nhân 22 Luồng, AI Boost NPU tích hợp)',
      gpu: 'NVIDIA GeForce RTX 4070 8GB GDDR6 (60W)',
      ram: '32GB LPDDR5X 7467MHz Dual Channel',
      storage: '1TB PCIe Gen4 NVMe M.2 SSD',
      display: '16.3" 4K+ (3840x2400) InfinityEdge OLED Touch, 100% DCI-P3 400 nits',
      os: 'Windows 11 Pro bản quyền vĩnh viễn',
      weight: '2.13 kg',
      battery: 'Pin 99.5Wh, sạc nhanh Type-C 130W GaN'
    },
    description: 'Thiết kế tương lai mang tính biểu tượng với mặt kính liền mạch tràn viền, hàng phím chức năng cảm ứng điện dung và touchpad vô hình bằng kính xúc giác mượt mà.',
    highlights: [
      'Touchpad tàng hình kính Haptic mượt mà nhất giới laptop Windows',
      'Màn hình cảm ứng OLED 4K+ độ chính xác màu đạt chuẩn điện ảnh',
      'Âm thanh 4 loa Waves Nx 3D 10W cho trải nghiệm âm trường đỉnh cao',
      'Nhôm CNC cao cấp và kính cường lực Gorilla Glass 3'
    ],
    warranty: '12 tháng bảo hành Dell ProSupport tại nhà',
    isFeatured: false,
    gifts: ['Bao da bò thủ công cao cấp', 'Chuột Bluetooth Dell Premier', 'Adapter Type-C 6 in 1']
  },
  {
    id: 'prod_workstation_threadripper',
    name: 'PC Workstation Threadripper PRO 7965WX / 128GB RAM',
    brand: 'TechCore Custom',
    category: 'pc-workstation',
    price: 145000000,
    originalPrice: 158000000,
    discountPercent: 8,
    stock: 3,
    rating: 5.0,
    reviewCount: 8,
    image: '/src/assets/images/category_gaming_pc_1791553028628.jpg',
    specs: {
      cpu: 'AMD Ryzen Threadripper PRO 7965WX (24 Nhân 48 Luồng, 5.3GHz Boost)',
      gpu: 'NVIDIA RTX A5000 24GB GDDR6 ECC Workstation GPU',
      ram: '128GB (4x32GB) DDR5 ECC Registered 5600MHz Quad-Channel',
      storage: '4TB (2x2TB) PCIe Gen5 NVMe RAID 0 (Tốc độ đọc 12.000 MB/s)',
      display: 'Hỗ trợ Render Realtime đa màn hình chuyên nghiệp',
      os: 'Windows 11 Pro for Workstations / Ubuntu Server Ready',
      weight: '22 kg',
      battery: 'Nguồn Super Flower Leadex Platinum 1600W Full Modular'
    },
    description: 'Cỗ máy chuyên dụng cho kỹ xảo điện ảnh Hollywood VFX, kiến trúc Revit/BIM và tính toán dựng hình 3D đồ họa nặng với bộ nhớ RAM ECC tự sửa lỗi.',
    highlights: [
      'RAM ECC Quad-Channel tự sửa lỗi đảm bảo máy chạy 24/7 không sập',
      'Bo mạch chủ ASUS Pro WS WRX90E-SAGE SE cao cấp',
      'Tản nhiệt Noctua chuyên dụng NH-U14S TR5-SP6 siêu tĩnh lặng',
      'Bảo hành tận nơi trong vòng 4 giờ làm việc tại Hà Nội & TP.HCM'
    ],
    warranty: '36 tháng đổi mới phần cứng tận nơi',
    isFeatured: true,
    gifts: ['Bộ lưu điện UPS APC 1500VA', 'Bàn phím cơ Filco Majestouch 2', 'Miễn phí cài đặt phần mềm đồ họa chuyên dụng']
  },
  {
    id: 'prod_monitor_oled_4k',
    name: 'Màn hình ASUS ROG Swift OLED PG32UCDM 32" 4K 240Hz',
    brand: 'ASUS',
    category: 'monitors',
    price: 36900000,
    originalPrice: 39900000,
    discountPercent: 8,
    stock: 14,
    rating: 4.9,
    reviewCount: 31,
    image: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
    specs: {
      cpu: 'Tương thích PC, Mac, PS5, Xbox Series X',
      gpu: 'Hỗ trợ AMD FreeSync Premium Pro & NVIDIA G-SYNC Compatible',
      ram: 'Tích hợp KVM Switch điều khiển 2 máy tính',
      storage: 'Hub USB 3.2, Cổng sạc nhanh USB-C 90W Power Delivery',
      display: '32" 4K UHD (3840x2160) QD-OLED thế hệ 3, 240Hz, 0.03ms, HDR10, Delta E < 2',
      os: 'Menu OSD ROG Gaming tùy chỉnh chuyên sâu',
      weight: '8.8 kg (kèm chân đế công thái học)',
      battery: 'Nguồn trong AC 100-240V'
    },
    description: 'Màn hình chơi game QD-OLED 4K 240Hz tốt nhất hiện nay. Tấm nền QD-OLED thế hệ 3 kết hợp tản nhiệt graphene cao cấp chống hiện tượng lưu ảnh (burn-in).',
    highlights: [
      'Tốc độ phản hồi tức thì 0.03ms loại bỏ hoàn toàn bóng mờ',
      'Tấm nền QD-OLED thế hệ mới mang lại màu sắc rực rỡ và đen tuyệt đối',
      'Bảo hành 3 năm bao gồm cả hiện tượng lưu ảnh OLED',
      'Chân đế xoay nâng hạ linh hoạt đạt chuẩn công thái học'
    ],
    warranty: '36 tháng bảo hành đổi mới ASUS',
    isFeatured: false,
    gifts: ['Cáp DisplayPort 2.1 bọc dù', 'Bộ vệ sinh màn hình chuyên dụng', 'Treo tai nghe ROG']
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    orderCode: 'TC-98214',
    userId: 'usr_customer_002',
    customerName: 'Nguyễn Văn An',
    customerEmail: 'khachhang@gmail.com',
    customerPhone: '0912345678',
    shippingAddress: '123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    note: 'Giao hàng giờ hành chính, gọi trước khi đến',
    items: [
      {
        productId: 'prod_rog_g16',
        productName: 'ASUS ROG Zephyrus G16 GU605MI OLED (2025)',
        productImage: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
        price: 52990000,
        quantity: 1,
        specsSummary: 'Core Ultra 9 / RTX 4070 / 32GB RAM / 1TB SSD / OLED 240Hz'
      }
    ],
    subtotal: 52990000,
    shippingFee: 0,
    discount: 500000,
    total: 52490000,
    couponCode: 'TECHCORENEW',
    paymentMethod: 'vietqr',
    paymentStatus: 'completed',
    orderStatus: 'shipping',
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
        note: 'Đơn hàng đã được khởi tạo thành công trên hệ thống.'
      },
      {
        status: 'processing',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        note: 'Kỹ thuật viên TechCore đã kiểm tra phần cứng, dán tem bảo hành và đóng gói cẩn thận.'
      },
      {
        status: 'shipping',
        timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
        note: 'Đang vận chuyển hỏa tốc qua Viettel Post (Mã vận đơn: VTP-892182910).'
      }
    ],
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'ord_1002',
    orderCode: 'TC-77402',
    userId: 'usr_customer_003',
    customerName: 'Trần Thị Thu Thảo',
    customerEmail: 'thaotran.tech@gmail.com',
    customerPhone: '0903456789',
    shippingAddress: '45 Lê Duẩn, Quận Hải Châu, Đà Nẵng',
    note: 'Yêu cầu xuất hóa đơn VAT công ty',
    items: [
      {
        productId: 'prod_macbook_pro_16',
        productName: 'Apple MacBook Pro 16 inch M3 Max (36GB / 1TB)',
        productImage: '/src/assets/images/category_creator_laptop_1791553040374.jpg',
        price: 89990000,
        quantity: 1,
        specsSummary: 'Apple M3 Max 14-core / 30-core GPU / 36GB RAM / 1TB SSD'
      }
    ],
    subtotal: 89990000,
    shippingFee: 0,
    discount: 0,
    total: 89990000,
    paymentMethod: 'bank',
    paymentStatus: 'completed',
    orderStatus: 'delivered',
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),
        note: 'Đơn hàng được tạo.'
      },
      {
        status: 'processing',
        timestamp: new Date(Date.now() - 60 * 3600000).toISOString(),
        note: 'Đã xác nhận thanh toán chuyển khoản thành công.'
      },
      {
        status: 'shipping',
        timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
        note: 'Bàn giao cho đơn vị vận chuyển hàng không.'
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
        note: 'Khách hàng đã ký nhận kiện hàng nguyên seal.'
      }
    ],
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'ord_1003',
    orderCode: 'TC-45199',
    userId: 'usr_customer_004',
    customerName: 'Lê Hoàng Nam',
    customerEmail: 'namle.gamer@gmail.com',
    customerPhone: '0977654321',
    shippingAddress: '72 Cầu Giấy, Quận Cầu Giấy, Hà Nội',
    note: 'Giao trong chiều nay giúp em với ạ',
    items: [
      {
        productId: 'prod_rtx_4080_super',
        productName: 'VGA ASUS ROG Strix GeForce RTX 4080 SUPER 16GB OC',
        productImage: '/src/assets/images/category_pc_components_1791553050836.jpg',
        price: 33900000,
        quantity: 1,
        specsSummary: 'GeForce RTX 4080 SUPER 16GB GDDR6X OC'
      }
    ],
    subtotal: 33900000,
    shippingFee: 0,
    discount: 0,
    total: 33900000,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'processing',
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        note: 'Khách hàng chọn hình thức thanh toán COD khi nhận hàng.'
      },
      {
        status: 'processing',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        note: 'Chuyên viên TechCore đã liên hệ hotline xác nhận địa chỉ giao hàng.'
      }
    ],
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    productId: 'prod_rog_g16',
    userId: 'usr_customer_002',
    userName: 'Nguyễn Văn An',
    rating: 5,
    comment: 'Máy đẹp xuất sắc! Màn hình OLED 240Hz màu sắc sâu thăm thẳm xem phim hay làm đồ họa cực sướng. Nhiệt độ mát hơn đời trước rất nhiều, sạc Type-C tiện lợi.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'rev_2',
    productId: 'prod_rog_g16',
    userId: 'usr_customer_004',
    userName: 'Lê Hoàng Nam',
    rating: 5,
    comment: 'Chiến Cyberpunk 2077 và Black Myth Wukong bật Ray Tracing Ultra mượt mà không bị tụt fps. Shop giao hàng hỏa tốc trong 2 tiếng, nhân viên tư vấn nhiệt tình.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'rev_3',
    productId: 'prod_macbook_pro_16',
    userId: 'usr_customer_003',
    userName: 'Trần Thị Thu Thảo',
    rating: 5,
    comment: 'M3 Max 36GB RAM render clip 4K ProRes siêu mượt, máy mát rượi quạt hầu như không thèm quay. Thời lượng pin dùng cả ngày không cần mang theo cục sạc.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  }
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat_laptop_gaming',
    name: 'Laptop Gaming Flagship',
    slug: 'laptop-gaming',
    description: 'Dòng máy tính xách tay cấu hình cao cho game thủ và lập trình viên',
    image: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
    productCount: 2,
    status: 'active',
  },
  {
    id: 'cat_pc_gaming',
    name: 'PC Gaming Custom',
    slug: 'pc-gaming',
    description: 'Cỗ máy máy tính bàn tối thượng tản nhiệt nước custom cao cấp',
    image: '/src/assets/images/category_gaming_pc_1791553028628.jpg',
    productCount: 1,
    status: 'active',
  },
  {
    id: 'cat_laptop_office',
    name: 'Creator & Workstation Mobile',
    slug: 'laptop-office',
    description: 'Thiết kế đồ họa, kiến trúc và sáng tạo nội dung chuyên nghiệp',
    image: '/src/assets/images/category_creator_laptop_1791553040374.jpg',
    productCount: 2,
    status: 'active',
  },
  {
    id: 'cat_pc_workstation',
    name: 'PC Đồ Họa & Máy Trạm Workstation',
    slug: 'pc-workstation',
    description: 'Máy trạm render VFX, Render 3D và tính toán mô phỏng khoa học',
    image: '/src/assets/images/category_gaming_pc_1791553028628.jpg',
    productCount: 1,
    status: 'active',
  },
  {
    id: 'cat_components',
    name: 'Linh Kiện & VGA Flagship',
    slug: 'components',
    description: 'Card đồ họa RTX 40-Series, RAM DDR5, nguồn chuẩn ATX 3.0',
    image: '/src/assets/images/category_pc_components_1791553050836.jpg',
    productCount: 1,
    status: 'active',
  },
  {
    id: 'cat_monitors',
    name: 'Màn Hình Chuyên Nghiệp & Esports',
    slug: 'monitors',
    description: 'Màn hình chuẩn màu đồ họa OLED 240Hz, 4K HDR',
    image: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
    productCount: 1,
    status: 'active',
  }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpr_001',
    code: 'TECHCORENEW',
    description: 'Giảm 500.000₫ cho khách hàng mới mua đơn từ 5.000.000₫',
    discountType: 'fixed',
    discountValue: 500000,
    minOrderValue: 5000000,
    usedCount: 18,
    usageLimit: 100,
    expiryDate: '2026-12-31',
    status: 'active',
  },
  {
    id: 'cpr_002',
    code: 'VIPGAMER',
    description: 'Giảm 5% cho toàn bộ linh kiện và laptop gaming',
    discountType: 'percentage',
    discountValue: 5,
    minOrderValue: 10000000,
    maxDiscount: 2000000,
    usedCount: 42,
    usageLimit: 200,
    expiryDate: '2026-12-31',
    status: 'active',
  },
  {
    id: 'cpr_003',
    code: 'DISCOUNT1M',
    description: 'Giảm ngay 1.000.000₫ cho đơn hàng PC hoặc laptop trên 30.000.000₫',
    discountType: 'fixed',
    discountValue: 1000000,
    minOrderValue: 30000000,
    usedCount: 29,
    usageLimit: 50,
    expiryDate: '2026-11-30',
    status: 'active',
  },
  {
    id: 'cpr_004',
    code: 'FREESHIP2026',
    description: 'Miễn phí giao hàng hỏa tốc cho đơn hàng bất kỳ',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 1000000,
    usedCount: 77,
    usageLimit: 500,
    expiryDate: '2026-12-31',
    status: 'active',
  }
];

const INITIAL_RESTOCK_PROPOSALS: RestockProposal[] = [
  {
    id: 'req_001',
    proposalCode: 'DX-1049',
    productId: 'prod_workstation_threadripper',
    productName: 'PC Workstation Threadripper PRO 7965WX / 128GB RAM',
    productImage: '/src/assets/images/category_gaming_pc_1791553028628.jpg',
    currentStock: 3,
    suggestedQuantity: 5,
    supplier: 'Nhà phân phối Viết Sơn / ASUS ProArt',
    estimatedCost: 650000000,
    priority: 'urgent',
    status: 'pending',
    createdByName: 'Nguyễn Minh Tuấn (Nhân viên kho)',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Tồn kho chỉ còn 3 bộ trong khi có 2 doanh nghiệp VFX đang yêu cầu báo giá dự án.',
  },
  {
    id: 'req_002',
    proposalCode: 'DX-1048',
    productId: 'prod_legion_pro_7i',
    productName: 'Lenovo Legion Pro 7i Gen 9 (i9-14900HX / RTX 4080)',
    productImage: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
    currentStock: 7,
    suggestedQuantity: 10,
    supplier: 'Lenovo Vietnam Official Distributor',
    estimatedCost: 610000000,
    priority: 'high',
    status: 'approved',
    createdByName: 'Nguyễn Minh Tuấn (Nhân viên kho)',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    notes: 'Đã được duyệt bởi Ban Giám Đốc, đang chờ bên hãng xác nhận ngày cập cảng.',
  },
  {
    id: 'req_003',
    proposalCode: 'DX-1047',
    productId: 'prod_pc_apex_4090',
    productName: 'PC TechCore Apex Ultra i9-14900KS / RTX 4090 OC',
    productImage: '/src/assets/images/category_gaming_pc_1791553028628.jpg',
    currentStock: 6,
    suggestedQuantity: 8,
    supplier: 'Tổng đại lý linh kiện ROG Strix & Corsair',
    estimatedCost: 720000000,
    priority: 'medium',
    status: 'ordered',
    createdByName: 'Quản Trị Viên TechCore',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    notes: 'Đã xuất PO đơn hàng nhập, dự kiến hàng về kho vào đầu tuần sau.',
  }
];

class Database {
  private users: (User & { passwordHash: string })[] = [...INITIAL_USERS];
  private products: Product[] = [...INITIAL_PRODUCTS];
  private orders: Order[] = [...INITIAL_ORDERS];
  private reviews: Review[] = [...INITIAL_REVIEWS];
  private categories: CategoryItem[] = [...INITIAL_CATEGORIES];
  private coupons: Coupon[] = [...INITIAL_COUPONS];
  private restockProposals: RestockProposal[] = [...INITIAL_RESTOCK_PROPOSALS];
  private isMongoConnected = false;
  private mongoUriMasked = 'mongodb://localhost:27017/techcore_db (Embedded Native Engine)';

  constructor() {
    this.checkExternalMongo();
  }

  private async checkExternalMongo() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (mongoUri) {
      try {
        // Thu nap goi mongodb neu co san
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(mongoUri);
        await client.connect();
        this.isMongoConnected = true;
        this.mongoUriMasked = mongoUri.replace(/\/\/[^@]+@/, '//***:***@');
        console.log(`[Database] Ket noi thanh cong MongoDB tai ${this.mongoUriMasked}`);
      } catch (err: any) {
        console.warn(`[Database] MongoDB URI khong ket noi duoc (${err.message}). Chuyen sang che do in-memory.`);
      }
    } else {
      console.log('[Database] Dang chay bo nho In-Memory Database toc do cao.');
    }
  }

  public getStatus() {
    return {
      connected: true,
      engine: this.isMongoConnected ? 'Live MongoDB Cluster' : 'High-Performance Embedded MongoDB Engine',
      uri: this.mongoUriMasked,
      collections: {
        users: this.users.length,
        products: this.products.length,
        orders: this.orders.length,
        reviews: this.reviews.length,
        categories: this.categories.length,
        coupons: this.coupons.length,
        restockProposals: this.restockProposals.length,
      }
    };
  }

  // Quan ly nguoi dung
  public async findUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public async findUserById(id: string) {
    return this.users.find(u => u.id === id);
  }

  public async createUser(data: Omit<User, 'id' | 'createdAt'> & { passwordHash: string }) {
    const newUser: User & { passwordHash: string } = {
      ...data,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  public async getAllUsers() {
    return this.users.map(({ passwordHash, ...rest }) => rest);
  }

  public async getEmployees() {
    return this.users
      .filter(u => u.role === 'admin' || u.role === 'staff')
      .map(({ passwordHash, ...rest }) => rest);
  }

  public async updateUserRole(userId: string, role: 'admin' | 'staff' | 'customer') {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      return user;
    }
    return null;
  }

  public async createStaffUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    department?: string;
    position?: string;
    role: 'staff' | 'admin';
  }) {
    const existing = await this.findUserByEmail(data.email);
    if (existing) {
      throw new Error('Email nhân viên này đã tồn tại trong hệ thống.');
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const newStaff: User & { passwordHash: string } = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      email: data.email,
      role: data.role || 'staff',
      phone: data.phone || '',
      address: data.address || '',
      department: data.department || 'Bộ phận kỹ thuật & kho vận',
      position: data.position || 'Nhân viên kỹ thuật',
      status: 'active',
      createdAt: new Date().toISOString(),
      passwordHash,
    };
    this.users.unshift(newStaff);
    const { passwordHash: _, ...safeUser } = newStaff;
    return safeUser;
  }

  public async updateUserStatus(userId: string, status: 'active' | 'blocked') {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = status;
      return user;
    }
    return null;
  }

  // Quan ly san pham
  public async getProducts(filters?: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) {
    let list = [...this.products];

    if (filters?.q) {
      const q = filters.q.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.specs.cpu.toLowerCase().includes(q) ||
        p.specs.gpu.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (filters?.category && filters.category !== 'all') {
      list = list.filter(p => p.category === filters.category);
    }

    if (filters?.brand && filters.brand !== 'all') {
      list = list.filter(p => p.brand.toLowerCase() === filters.brand?.toLowerCase());
    }

    if (filters?.minPrice !== undefined && !isNaN(filters.minPrice)) {
      list = list.filter(p => p.price >= (filters.minPrice || 0));
    }

    if (filters?.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      list = list.filter(p => p.price <= (filters.maxPrice || Infinity));
    }

    if (filters?.sort) {
      switch (filters.sort) {
        case 'price_asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'discount':
          list.sort((a, b) => b.discountPercent - a.discountPercent);
          break;
        case 'newest':
        default:
          // Giu thu tu mac dinh
          break;
      }
    }

    return list;
  }

  public async getProductById(id: string) {
    return this.products.find(p => p.id === id);
  }

  public async createProduct(data: Omit<Product, 'id'>) {
    const newProduct: Product = {
      ...data,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<Product>) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates };
      return this.products[index];
    }
    return null;
  }

  public async deleteProduct(id: string) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      const removed = this.products.splice(index, 1)[0];
      return removed;
    }
    return null;
  }

  // Quan ly don hang
  public async getOrders(userId?: string, isAdmin?: boolean) {
    if (isAdmin) {
      return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return this.orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getOrderById(orderId: string) {
    return this.orders.find(o => o.id === orderId || o.orderCode === orderId);
  }

  public async createOrder(orderData: Omit<Order, 'id' | 'orderCode' | 'createdAt' | 'updatedAt' | 'statusHistory'> & { note?: string }) {
    const codeNum = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderCode: `TC-${codeNum}`,
      statusHistory: [
        {
          status: orderData.orderStatus,
          timestamp: new Date().toISOString(),
          note: orderData.paymentMethod === 'cod'
            ? 'Đơn hàng mới tạo với hình thức thanh toán khi nhận hàng (COD).'
            : 'Đơn hàng mới tạo, đang chờ xác nhận thanh toán trực tuyến.'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Buoc 1: Kiem tra tat ca san pham co du ton kho hay khong
    for (const item of newOrder.items) {
      const product = this.products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        const productName = product ? product.name : (item.productName || 'Sản phẩm');
        throw new Error(`Sản phẩm ${productName} không đủ hàng`);
      }
    }

    // Buoc 2: Chi khi tat ca deu du ton kho moi tru stock
    for (const item of newOrder.items) {
      const product = this.products.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    }

    this.orders.unshift(newOrder);
    return newOrder;
  }

  public async updateOrderStatus(orderId: string, status: Order['orderStatus'], adminNote?: string) {
    const order = this.orders.find(o => o.id === orderId || o.orderCode === orderId);
    if (!order) return null;

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'delivered') {
      order.paymentStatus = 'completed';
    }

    const defaultNotes: Record<Order['orderStatus'], string> = {
      pending: 'Đơn hàng đang chờ quản trị viên xác nhận.',
      processing: 'Đã chuẩn bị linh kiện, kiểm định chất lượng và đóng thùng chống sốc.',
      shipping: 'Đã bàn giao đơn vị vận chuyển hỏa tốc, đang trên đường giao đến bạn.',
      delivered: 'Kiện hàng đã được giao thành công tới quý khách.',
      cancelled: 'Đơn hàng đã bị hủy theo yêu cầu.'
    };

    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: adminNote || defaultNotes[status] || 'Trạng thái đơn hàng được cập nhật.'
    });

    return order;
  }

  // Quan ly danh gia san pham
  public async getProductReviews(productId: string) {
    return this.reviews.filter(r => r.productId === productId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async addReview(data: Omit<Review, 'id' | 'createdAt'>) {
    const newRev: Review = {
      ...data,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.reviews.unshift(newRev);

    // Cap nhat diem danh gia va so luot danh gia cua san pham
    const productRevs = this.reviews.filter(r => r.productId === data.productId);
    const avg = productRevs.reduce((acc, cur) => acc + cur.rating, 0) / productRevs.length;
    const prod = this.products.find(p => p.id === data.productId);
    if (prod) {
      prod.rating = Number(avg.toFixed(1));
      prod.reviewCount = productRevs.length;
    }

    return newRev;
  }

  // Quan ly danh muc san pham
  public async getCategories() {
    // Tinh tong so san pham cho tung danh muc
    return this.categories.map(cat => ({
      ...cat,
      productCount: this.products.filter(p => p.category === cat.slug).length,
    }));
  }

  public async createCategory(data: Omit<CategoryItem, 'id' | 'productCount'>) {
    const newCat: CategoryItem = {
      ...data,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productCount: 0,
    };
    this.categories.push(newCat);
    return newCat;
  }

  public async updateCategory(id: string, updates: Partial<CategoryItem>) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.categories[index] = { ...this.categories[index], ...updates };
      return this.categories[index];
    }
    return null;
  }

  public async deleteCategory(id: string) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      const deleted = this.categories.splice(index, 1)[0];
      return deleted;
    }
    return null;
  }

  // Quan ly ma giam gia
  public async getCoupons() {
    return [...this.coupons];
  }

  public async createCoupon(data: Omit<Coupon, 'id' | 'usedCount'>) {
    const newCoupon: Coupon = {
      ...data,
      id: `cpr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      usedCount: 0,
    };
    this.coupons.unshift(newCoupon);
    return newCoupon;
  }

  public async updateCoupon(id: string, updates: Partial<Coupon>) {
    const index = this.coupons.findIndex(c => c.id === id);
    if (index !== -1) {
      this.coupons[index] = { ...this.coupons[index], ...updates };
      return this.coupons[index];
    }
    return null;
  }

  public async deleteCoupon(id: string) {
    const index = this.coupons.findIndex(c => c.id === id);
    if (index !== -1) {
      const deleted = this.coupons.splice(index, 1)[0];
      return deleted;
    }
    return null;
  }

  // De xuat nhap hang
  public async getRestockProposals() {
    return [...this.restockProposals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async createRestockProposal(data: Omit<RestockProposal, 'id' | 'proposalCode' | 'createdAt'>) {
    const count = 1050 + this.restockProposals.length;
    const newProposal: RestockProposal = {
      ...data,
      id: `req_${Date.now()}`,
      proposalCode: `DX-${count}`,
      createdAt: new Date().toISOString(),
    };
    this.restockProposals.unshift(newProposal);
    return newProposal;
  }

  public async updateRestockProposalStatus(id: string, status: RestockProposal['status'], notes?: string) {
    const proposal = this.restockProposals.find(r => r.id === id);
    if (!proposal) return null;
    proposal.status = status;
    if (notes) proposal.notes = notes;

    // Neu da nhap kho thi tu dong cong them so luong ton kho
    if (status === 'received') {
      const product = this.products.find(p => p.id === proposal.productId);
      if (product) {
        product.stock += proposal.suggestedQuantity;
      }
    }
    return proposal;
  }

  // Thong ke bao cao quan tri
  public async getAdminStats() {
    const totalRevenue = this.orders
      .filter(o => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = this.orders.length;
    const totalCustomers = this.users.filter(u => u.role === 'customer').length;
    const totalProducts = this.products.length;
    const pendingOrders = this.orders.filter(o => o.orderStatus === 'pending').length;
    const lowStockCount = this.products.filter(p => p.stock <= 5).length;

    // Phan tich doanh thu theo danh muc
    const catMap: Record<string, { count: number; total: number }> = {};
    for (const order of this.orders) {
      if (order.orderStatus === 'cancelled') continue;
      for (const item of order.items) {
        const prod = this.products.find(p => p.id === item.productId);
        const cat = prod?.category || 'other';
        if (!catMap[cat]) catMap[cat] = { count: 0, total: 0 };
        catMap[cat].count += item.quantity;
        catMap[cat].total += item.price * item.quantity;
      }
    }

    const categorySales = Object.entries(catMap).map(([category, val]) => ({
      category,
      count: val.count,
      total: val.total,
    }));

    const revenueByMonth = [
      { month: 'T05', revenue: 145000000, orders: 12 },
      { month: 'T06', revenue: 182000000, orders: 16 },
      { month: 'T07', revenue: 210000000, orders: 19 },
      { month: 'T08', revenue: 195000000, orders: 18 },
      { month: 'T09', revenue: 260000000, orders: 24 },
      { month: 'T10', revenue: 285000000 + totalRevenue, orders: 28 + totalOrders },
    ];

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockCount,
      categorySales,
      revenueByMonth,
    };
  }
}

export const db = new Database();
