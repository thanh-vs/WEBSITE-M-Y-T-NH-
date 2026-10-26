import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { db } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Kiem tra bien moi truong JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('Lỗi: Biến môi trường JWT_SECRET chưa được cấu hình trong file .env!');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();

// Middleware bao mat HTTP headers bang helmet
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Gioi han tan suat dang nhap de chong tan cong brute-force (toi da 5 lan / 15 phut)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phut
  max: 5, // Gioi han toi da 5 lan gui yeu cau
  message: { error: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());

// Tap hop ket noi SSE thoi gian thuc
interface SSEClient {
  id: string;
  res: Response;
  userId?: string;
  role?: string;
}
const sseClients = new Set<SSEClient>();

export function thongBaoDonHangMoi(event: { type: string; order: any; message: string }) {
  const data = JSON.stringify(event);
  for (const client of sseClients) {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Thong tin xac thuc nguoi dung
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'staff' | 'customer';
    name: string;
  };
}

// Middleware xac thuc JWT
function xacThucToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Chưa đăng nhập. Vui lòng cung cấp mã xác thực JWT.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      res.status(403).json({ error: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' });
      return;
    }
    req.user = decodedUser as any;
    next();
  });
}

// Middleware chi danh cho Admin
function chiAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Quyền truy cập bị từ chối. Chức năng này chỉ dành riêng cho Quản trị viên cao nhất (Admin).' });
    return;
  }
  next();
}

// Middleware chi danh cho Nhan vien hoac Admin
function chiNhanVienHoacAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
    res.status(403).json({ error: 'Quyền truy cập bị từ chối. Chỉ dành cho Nhân viên hoặc Quản trị viên hệ thống.' });
    return;
  }
  next();
}

// Endpoint kenh su kien realtime SSE
app.get('/api/orders/realtime-stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const clientObj: SSEClient = { id: clientId, res };
  sseClients.add(clientObj);

  // Gui thong bao ket noi ban dau
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId, message: 'Đã kết nối theo dõi thời gian thực' })}\n\n`);

  req.on('close', () => {
    sseClients.delete(clientObj);
  });
});

// Dang ky tai khoan khach hang
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ họ tên, email và mật khẩu.' });
      return;
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await db.createUser({
      name,
      email,
      role: 'customer',
      phone: phone || '',
      address: address || '',
      status: 'active',
      passwordHash,
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({ user: safeUser, token, message: 'Đăng ký tài khoản thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi server khi đăng ký' });
  }
});

// Dang nhap tai khoan (gioi han tan suat bang loginLimiter de tranh tan cong brute-force)
app.post('/api/auth/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
      return;
    }

    if (user.status === 'blocked') {
      res.status(403).json({ error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ ban quản trị.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, token, message: 'Đăng nhập thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi server khi đăng nhập' });
  }
});

// Lay thong tin tai khoan hien tai
app.get('/api/auth/me', xacThucToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await db.findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'Không tìm thấy thông tin tài khoản.' });
      return;
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Kiem tra trang thai co so du lieu
app.get('/api/database/status', async (_req: Request, res: Response) => {
  res.json(db.getStatus());
});

// Lay danh sach san pham co bo loc va tim kiem
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { q, category, brand, minPrice, maxPrice, sort } = req.query;
    const products = await db.getProducts({
      q: q ? String(q) : undefined,
      category: category ? String(category) : undefined,
      brand: brand ? String(brand) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort ? String(sort) : undefined,
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Lay chi tiet san pham theo ma
app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
      return;
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Them san pham moi
app.post('/api/products', xacThucToken, chiNhanVienHoacAdmin, async (req: Request, res: Response) => {
  try {
    const newProduct = await db.createProduct(req.body);
    res.status(201).json({ product: newProduct, message: 'Thêm sản phẩm thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cap nhat thong tin san pham
app.put('/api/products/:id', xacThucToken, chiNhanVienHoacAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Không tìm thấy sản phẩm để cập nhật.' });
      return;
    }
    res.json({ product: updated, message: 'Cập nhật sản phẩm thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Xoa san pham khoi he thong
app.delete('/api/products/:id', xacThucToken, chiAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.deleteProduct(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Không tìm thấy sản phẩm để xóa.' });
      return;
    }
    res.json({ product: deleted, message: 'Đã xóa sản phẩm thành công.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Lay danh sach don hang
app.get('/api/orders', xacThucToken, async (req: AuthRequest, res: Response) => {
  try {
    const isStaffOrAdmin = req.user?.role === 'admin' || req.user?.role === 'staff';
    const orders = await db.getOrders(req.user?.id, isStaffOrAdmin);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Lay chi tiet mot don hang
app.get('/api/orders/:id', xacThucToken, async (req: AuthRequest, res: Response) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
      return;
    }
    if (req.user?.role !== 'admin' && order.userId !== req.user?.id) {
      res.status(403).json({ error: 'Bạn không có quyền xem đơn hàng này.' });
      return;
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Tao don hang moi
app.post('/api/orders', xacThucToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      note,
      items,
      subtotal,
      shippingFee,
      discount,
      total,
      couponCode,
      paymentMethod,
    } = req.body;

    if (!items || !items.length) {
      res.status(400).json({ error: 'Giỏ hàng đang trống.' });
      return;
    }

    const newOrder = await db.createOrder({
      userId: req.user!.id,
      customerName: customerName || req.user!.name,
      customerEmail: customerEmail || req.user!.email,
      customerPhone: customerPhone || '',
      shippingAddress: shippingAddress || '',
      note: note || '',
      items,
      subtotal,
      shippingFee: shippingFee || 0,
      discount: discount || 0,
      total,
      couponCode,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'vietqr' || paymentMethod === 'bank' ? 'completed' : 'pending',
      orderStatus: 'pending',
    });

    thongBaoDonHangMoi({
      type: 'ORDER_CREATED',
      order: newOrder,
      message: `Đơn hàng mới ${newOrder.orderCode} vừa được đặt bởi ${newOrder.customerName}`
    });

    res.status(201).json({ order: newOrder, message: 'Đặt hàng thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cap nhat trang thai don hang
app.put('/api/orders/:id/status', xacThucToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, adminNote } = req.body;
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
      return;
    }

    // Chi admin hoac nhan vien moi duoc doi sang dang xu ly, giao hang, da giao
    // Khach hang chi co the huy don khi con o trang thai cho xac nhan
    if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
      if (order.userId !== req.user?.id) {
        res.status(403).json({ error: 'Không có quyền thao tác trên đơn hàng này.' });
        return;
      }
      if (status !== 'cancelled' || order.orderStatus !== 'pending') {
        res.status(400).json({ error: 'Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận.' });
        return;
      }
    }

    const updated = await db.updateOrderStatus(req.params.id, status, adminNote);
    if (!updated) {
      res.status(404).json({ error: 'Không thể cập nhật đơn hàng.' });
      return;
    }

    thongBaoDonHangMoi({
      type: 'ORDER_STATUS_UPDATED',
      order: updated,
      message: `Trạng thái đơn hàng ${updated.orderCode} đã cập nhật thành ${status}`
    });

    res.json({ order: updated, message: 'Cập nhật trạng thái đơn hàng thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Quan ly danh sach nguoi dung
app.get('/api/users', xacThucToken, chiNhanVienHoacAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Thay doi phan quyen nguoi dung
app.put('/api/users/:id/role', xacThucToken, chiAdmin, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const updated = await db.updateUserRole(req.params.id, role);
    if (!updated) {
      res.status(404).json({ error: 'Không tìm thấy người dùng.' });
      return;
    }
    const { passwordHash: _, ...safeUser } = updated;
    res.json({ user: safeUser, message: 'Cập nhật quyền thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Khoa hoac mo khoa tai khoan nguoi dung
app.put('/api/users/:id/status', xacThucToken, chiAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await db.updateUserStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ error: 'Không tìm thấy người dùng.' });
      return;
    }
    const { passwordHash: _, ...safeUser } = updated;
    res.json({ user: safeUser, message: 'Cập nhật trạng thái người dùng thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Lay danh sach nhan vien
app.get('/api/staff', xacThucToken, chiNhanVienHoacAdmin, async (_req: Request, res: Response) => {
  try {
    const employees = await db.getEmployees();
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Them tai khoan nhan vien moi
app.post('/api/staff', xacThucToken, chiAdmin, async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address, department, position, role } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Vui lòng cung cấp họ tên, email và mật khẩu cho nhân viên.' });
      return;
    }
    const staff = await db.createStaffUser({
      name,
      email,
      password,
      phone,
      address,
      department,
      position,
      role: role || 'staff',
    });
    res.status(201).json({ staff, message: 'Thêm nhân viên mới thành công!' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Lay danh sach danh muc
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Them danh muc moi
app.post('/api/categories', xacThucToken, chiNhanVienHoacAdmin, async (req: Request, res: Response) => {
  try {
    const newCat = await db.createCategory(req.body);
    res.status(201).json({ category: newCat, message: 'Thêm danh mục thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cap nhat thong tin danh muc
app.put('/api/categories/:id', xacThucToken, chiNhanVienHoacAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.updateCategory(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Không tìm thấy danh mục để cập nhật.' });
      return;
    }
    res.json({ category: updated, message: 'Cập nhật danh mục thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Xoa danh muc
app.delete('/api/categories/:id', xacThucToken, chiAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.deleteCategory(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Không tìm thấy danh mục để xóa.' });
      return;
    }
    res.json({ category: deleted, message: 'Đã xóa danh mục thành công.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Lay danh sach ma giam gia
app.get('/api/coupons', xacThucToken, chiNhanVienHoacAdmin, async (_req: Request, res: Response) => {
  try {
    const coupons = await db.getCoupons();
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Tao ma giam gia moi
app.post('/api/coupons', xacThucToken, chiAdmin, async (req: Request, res: Response) => {
  try {
    const newCoupon = await db.createCoupon(req.body);
    res.status(201).json({ coupon: newCoupon, message: 'Tạo mã giảm giá thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cap nhat ma giam gia
app.put('/api/coupons/:id', xacThucToken, chiAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.updateCoupon(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Không tìm thấy mã giảm giá.' });
      return;
    }
    res.json({ coupon: updated, message: 'Cập nhật mã giảm giá thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Xoa ma giam gia
app.delete('/api/coupons/:id', xacThucToken, chiAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.deleteCoupon(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Không tìm thấy mã giảm giá để xóa.' });
      return;
    }
    res.json({ coupon: deleted, message: 'Đã xóa mã giảm giá thành công.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Lay danh sach de xuat nhap hang
app.get('/api/restock-proposals', xacThucToken, chiNhanVienHoacAdmin, async (_req: Request, res: Response) => {
  try {
    const proposals = await db.getRestockProposals();
    res.json(proposals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Tao de xuat nhap hang
app.post('/api/restock-proposals', xacThucToken, chiNhanVienHoacAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const proposal = await db.createRestockProposal({
      ...req.body,
      createdByName: req.user?.name || 'Nhân viên hệ thống',
    });
    res.status(201).json({ proposal, message: 'Tạo đề xuất nhập hàng thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cap nhat trang thai de xuat nhap hang
app.put('/api/restock-proposals/:id/status', xacThucToken, chiNhanVienHoacAdmin, async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    const updated = await db.updateRestockProposalStatus(req.params.id, status, notes);
    if (!updated) {
      res.status(404).json({ error: 'Không tìm thấy đề xuất nhập hàng.' });
      return;
    }
    res.json({ proposal: updated, message: 'Cập nhật trạng thái đề xuất thành công!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Lay so lieu thong ke bao cao quan tri
app.get('/api/admin/stats', xacThucToken, chiNhanVienHoacAdmin, async (_req: Request, res: Response) => {
  try {
    const stats = await db.getAdminStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Lay danh gia cua san pham
app.get('/api/reviews/:productId', async (req: Request, res: Response) => {
  try {
    const reviews = await db.getProductReviews(req.params.productId);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Gui danh gia san pham
app.post('/api/reviews', xacThucToken, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      res.status(400).json({ error: 'Vui lòng cung cấp số sao đánh giá và nội dung bình luận.' });
      return;
    }
    const review = await db.addReview({
      productId,
      userId: req.user!.id,
      userName: req.user!.name,
      rating: Number(rating),
      comment: String(comment).trim(),
    });
    res.status(201).json({ review, message: 'Cảm ơn bạn đã gửi đánh giá!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Khoi dong server backend va tich hop Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[TechCore Server] Backend & Frontend running smoothly on http://localhost:${PORT}`);
  });
}

startServer();
