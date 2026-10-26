import React, { useState, useEffect, useRef } from 'react';
import {
  X, Package, ShoppingCart, Users, Database,
  Plus, Edit2, Trash2, CheckCircle2, Clock, Ban,
  TrendingUp, AlertTriangle, Shield, RefreshCw,
  UploadCloud, Image as ImageIcon,
  FolderTree, Ticket, Briefcase, ClipboardList, BarChart3,
  Home, LogOut, Search, FileText,
  CheckCheck, Info, ChevronRight
} from 'lucide-react';
import { Product, Order, User, AdminStats, OrderStatus, CategoryItem, Coupon, RestockProposal, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsUpdated?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, onProductsUpdated }) => {
  const { user: currentUser, logout } = useAuth();
  const { eventCounter } = useRealtime();

  const isAdmin = currentUser?.role === 'admin';
  const isStaff = currentUser?.role === 'staff';

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<
    'reports' | 'categories' | 'products' | 'orders' | 'customers' | 'coupons' | 'staff' | 'restock' | 'database'
  >('reports');

  // Core Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [restockProposals, setRestockProposals] = useState<RestockProposal[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Search & Filter local states
  const [productSearch, setProductSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');

  // 1. Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'ASUS',
    category: 'laptop-gaming' as Product['category'],
    price: 35000000,
    originalPrice: 38000000,
    discountPercent: 8,
    stock: 10,
    warranty: '24 tháng chính hãng',
    image: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
    description: '',
    cpu: '',
    gpu: '',
    ram: '',
    storage: '',
    display: '',
    os: 'Windows 11 Home',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // 2. Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: 'laptop-gaming',
    description: '',
    image: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
    status: 'active' as 'active' | 'inactive',
  });

  // 3. Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderValue: 2000000,
    maxDiscount: 1000000,
    usageLimit: 100,
    expiryDate: '2026-12-31',
    status: 'active' as 'active' | 'disabled',
  });

  // 4. Staff Modal State (Admin only)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    department: 'Kỹ thuật & Quản lý kho',
    position: 'Chuyên viên kỹ thuật',
    role: 'staff' as 'staff' | 'admin',
  });

  // 5. Restock Proposal Modal State (Both Staff & Admin can create)
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockForm, setRestockForm] = useState({
    productId: '',
    suggestedQuantity: 5,
    supplier: '',
    estimatedCost: 50000000,
    priority: 'high' as RestockProposal['priority'],
    notes: '',
  });

  // 6. Order Status Update State
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('processing');
  const [orderAdminNote, setOrderAdminNote] = useState('');

  // 7. Selected Order for detail view
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAllAdminData();
    }
  }, [isOpen, eventCounter]);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsData, prodsData, ordersData, usersData, categoriesData, couponsData, proposalsData, dbData] =
        await Promise.all([
          api.getAdminStats(),
          api.getProducts(),
          api.getOrders(),
          api.getUsers(),
          api.getCategories(),
          api.getCoupons(),
          api.getRestockProposals(),
          api.getDbStatus(),
        ]);
      setStats(statsData);
      setProducts(prodsData);
      setOrders(ordersData);
      setUsers(usersData);
      setCategories(categoriesData);
      setCoupons(couponsData);
      setRestockProposals(proposalsData);
      setDbStatus(dbData);
    } catch (err: any) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tu dong dong trang quan tri khi dang xuat hoac mat quyen
  useEffect(() => {
    if (isOpen && (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'staff'))) {
      onClose();
    }
  }, [isOpen, currentUser, onClose]);

  // Ham xu ly dang xuat
  const xuLyDangXuat = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Image Upload Handlers
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh vượt quá 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProductForm((prev) => ({
          ...prev,
          image: e.target!.result as string,
        }));
        setUploadedFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Product actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setUploadedFileName(null);
    setImageInputMode('file');
    setProductForm({
      name: '',
      brand: 'ASUS',
      category: 'laptop-gaming',
      price: 35000000,
      originalPrice: 38000000,
      discountPercent: 8,
      stock: 10,
      warranty: '24 tháng chính hãng',
      image: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
      description: 'Máy tính chính hãng bảo hành uy tín chất lượng cao.',
      cpu: 'Intel Core Ultra 7 155H',
      gpu: 'NVIDIA GeForce RTX 4060 8GB',
      ram: '16GB DDR5 5600MHz',
      storage: '1TB M.2 NVMe SSD',
      display: '16" QHD+ 240Hz 100% sRGB',
      os: 'Windows 11 Home',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setUploadedFileName(null);
    setImageInputMode('file');
    setProductForm({
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice,
      discountPercent: prod.discountPercent,
      stock: prod.stock,
      warranty: prod.warranty,
      image: prod.image,
      description: prod.description,
      cpu: prod.specs.cpu,
      gpu: prod.specs.gpu,
      ram: prod.specs.ram,
      storage: prod.specs.storage,
      display: prod.specs.display,
      os: prod.specs.os || 'Windows 11',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        brand: productForm.brand,
        category: productForm.category,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        discountPercent: Number(productForm.discountPercent),
        stock: Number(productForm.stock),
        warranty: productForm.warranty,
        image: productForm.image,
        description: productForm.description,
        rating: editingProduct ? editingProduct.rating : 5.0,
        reviewCount: editingProduct ? editingProduct.reviewCount : 1,
        highlights: [
          `${productForm.cpu}`,
          `${productForm.gpu}`,
          `Bảo hành ${productForm.warranty}`,
        ],
        specs: {
          cpu: productForm.cpu,
          gpu: productForm.gpu,
          ram: productForm.ram,
          storage: productForm.storage,
          display: productForm.display,
          os: productForm.os,
        },
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        setFeedbackMsg('Đã cập nhật thông tin sản phẩm thành công!');
      } else {
        await api.createProduct(payload as any);
        setFeedbackMsg('Đã thêm sản phẩm mới vào kho thành công!');
      }

      setIsProductModalOpen(false);
      loadAllAdminData();
      if (onProductsUpdated) onProductsUpdated();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin) mới có quyền xóa sản phẩm khỏi cơ sở dữ liệu.');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi cơ sở dữ liệu?')) return;
    try {
      await api.deleteProduct(id);
      setFeedbackMsg('Đã xóa sản phẩm khỏi kho hàng!');
      loadAllAdminData();
      if (onProductsUpdated) onProductsUpdated();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  // Category actions
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: 'laptop-gaming',
      description: '',
      image: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
      status: 'active',
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      status: cat.status,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryForm);
        setFeedbackMsg('Cập nhật danh mục thành công!');
      } else {
        await api.createCategory(categoryForm);
        setFeedbackMsg('Tạo danh mục mới thành công!');
      }
      setIsCategoryModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu danh mục');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin) mới có quyền xóa danh mục.');
      return;
    }
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await api.deleteCategory(id);
      setFeedbackMsg('Đã xóa danh mục thành công!');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa danh mục');
    }
  };

  // Coupon actions
  const handleOpenAddCoupon = () => {
    setCouponForm({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 2000000,
      maxDiscount: 1000000,
      usageLimit: 100,
      expiryDate: '2026-12-31',
      status: 'active',
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin) mới có quyền tạo mã giảm giá.');
      return;
    }
    try {
      await api.createCoupon({
        code: couponForm.code.toUpperCase().trim(),
        description: couponForm.description,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minOrderValue: Number(couponForm.minOrderValue),
        maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined,
        usageLimit: Number(couponForm.usageLimit),
        expiryDate: couponForm.expiryDate,
        status: couponForm.status,
      });
      setFeedbackMsg(`Đã tạo mã giảm giá ${couponForm.code.toUpperCase()}!`);
      setIsCouponModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo mã giảm giá');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin) mới có quyền xóa mã giảm giá.');
      return;
    }
    if (!confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
    try {
      await api.deleteCoupon(id);
      setFeedbackMsg('Đã xóa mã giảm giá!');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa mã giảm giá');
    }
  };

  // Staff Actions (Admin only)
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin) mới có quyền tạo tài khoản nhân viên.');
      return;
    }
    try {
      await api.createStaff(staffForm);
      setFeedbackMsg(`Đã thêm nhân viên "${staffForm.name}" thành công!`);
      setIsStaffModalOpen(false);
      setStaffForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        department: 'Kỹ thuật & Quản lý kho',
        position: 'Chuyên viên kỹ thuật',
        role: 'staff',
      });
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo nhân viên');
    }
  };

  const handleToggleUserRole = async (targetUser: User) => {
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin) mới có quyền phân quyền tài khoản.');
      return;
    }
    if (targetUser.id === currentUser?.id) {
      alert('Bạn không thể tự hạ quyền tài khoản của chính mình.');
      return;
    }
    const nextRole: UserRole = targetUser.role === 'admin' ? 'staff' : targetUser.role === 'staff' ? 'customer' : 'staff';
    if (!confirm(`Bạn có muốn đổi quyền của "${targetUser.name}" sang ${nextRole.toUpperCase()}?`)) return;
    try {
      await api.updateUserRole(targetUser.id, nextRole);
      setFeedbackMsg(`Đã cập nhật quyền của "${targetUser.name}" thành ${nextRole.toUpperCase()}!`);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật quyền');
    }
  };

  const handleToggleUserStatus = async (targetUser: User) => {
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin) mới có quyền khóa/mở khóa tài khoản.');
      return;
    }
    if (targetUser.id === currentUser?.id) {
      alert('Bạn không thể khóa tài khoản của chính mình.');
      return;
    }
    const nextStatus = targetUser.status === 'active' ? 'blocked' : 'active';
    if (!confirm(`Bạn có muốn ${nextStatus === 'blocked' ? 'KHÓA' : 'MỞ KHÓA'} tài khoản "${targetUser.name}"?`)) return;
    try {
      await api.updateUserStatus(targetUser.id, nextStatus);
      setFeedbackMsg(`Đã chuyển trạng thái tài khoản "${targetUser.name}" thành ${nextStatus}!`);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái');
    }
  };

  // Restock proposal actions
  const handleOpenAddRestock = () => {
    if (products.length > 0) {
      const first = products[0];
      setRestockForm({
        productId: first.id,
        suggestedQuantity: 5,
        supplier: `${first.brand} Official Distributor`,
        estimatedCost: first.price * 5 * 0.85,
        priority: 'high',
        notes: `Tồn kho hiện tại: ${first.stock} chiếc. Cần bổ sung để phục vụ bán lẻ.`,
      });
    }
    setIsRestockModalOpen(true);
  };

  const handleSaveRestockProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === restockForm.productId);
    if (!product) {
      alert('Vui lòng chọn sản phẩm cần nhập hàng.');
      return;
    }
    try {
      await api.createRestockProposal({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        currentStock: product.stock,
        suggestedQuantity: Number(restockForm.suggestedQuantity),
        supplier: restockForm.supplier,
        estimatedCost: Number(restockForm.estimatedCost),
        priority: restockForm.priority,
        notes: restockForm.notes,
      });
      setFeedbackMsg('Đã gửi đề xuất nhập hàng thành công!');
      setIsRestockModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi đề xuất nhập hàng');
    }
  };

  const handleUpdateRestockStatus = async (proposalId: string, nextStatus: RestockProposal['status']) => {
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin) mới có quyền duyệt và cập nhật tiến độ nhập kho.');
      return;
    }
    try {
      await api.updateRestockProposalStatus(
        proposalId,
        nextStatus,
        nextStatus === 'received' ? 'Đã nghiệm thu và nhập kho thành công. Số lượng tồn kho đã được cập nhật.' : undefined
      );
      setFeedbackMsg(`Đã cập nhật trạng thái đề xuất thành "${nextStatus}"!`);
      loadAllAdminData();
      if (onProductsUpdated) onProductsUpdated();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái đề xuất');
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string) => {
    try {
      await api.updateOrderStatus(orderId, newOrderStatus, orderAdminNote || undefined);
      setUpdatingOrderId(null);
      setOrderAdminNote('');
      setFeedbackMsg(`Đã cập nhật đơn hàng sang trạng thái "${newOrderStatus}"!`);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật đơn hàng');
    }
  };

  // Filters
  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.specs.cpu.toLowerCase().includes(q);
  });

  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus === 'all') return true;
    return o.orderStatus === orderFilterStatus;
  });

  const customerUsers = users.filter((u) => u.role === 'customer').filter((u) => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.includes(q));
  });

  const staffUsers = users.filter((u) => u.role === 'staff' || u.role === 'admin');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div
        className="relative bg-gray-50 border border-gray-200 rounded-3xl w-full max-w-7xl h-[94vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isAdmin ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-amber-50 border border-amber-200 text-amber-600'}`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Hệ Thống Quản Trị TechCore</h2>
                {isAdmin ? (
                  <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200 uppercase tracking-wide">
                    Admin Cấp Cao
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
                    Nhân Viên Vận Hành
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Đang đăng nhập: <strong className="text-gray-800">{currentUser?.name}</strong> ({currentUser?.email})
                {isStaff && <span className="text-amber-400 ml-1.5 font-medium">· Quyền hạn dưới Admin</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllAdminData}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              title="Làm mới toàn bộ dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              title="Đóng trang quản trị"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback alert banner */}
        {feedbackMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-5 py-2 text-xs flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-emerald-700 hover:text-gray-900 font-bold ml-4">
              ✕
            </button>
          </div>
        )}

        {/* Main Body Split: Navigation Sidebar & Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Admin Navigation Sidebar */}
          <div className="w-56 sm:w-64 bg-gray-50 border-r border-gray-200 p-3 space-y-1.5 shrink-0 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Mục Quản Trị Hệ Thống
              </div>

              {/* 1. Báo cáo thống kê */}
              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Báo Cáo Thống Kê</span>
              </button>

              {/* 2. Danh mục */}
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'categories'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FolderTree className="w-4 h-4 text-amber-400" />
                <span>Danh Mục Sản Phẩm</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-500">
                  {categories.length}
                </span>
              </button>

              {/* 3. Sản phẩm */}
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'products'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Quản Lý Sản Phẩm</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-500">
                  {products.length}
                </span>
              </button>

              {/* 4. Đơn hàng */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="w-4 h-4 text-blue-400" />
                <span>Quản Lý Đơn Hàng</span>
                {orders.filter(o => o.orderStatus === 'pending').length > 0 && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                    {orders.filter(o => o.orderStatus === 'pending').length}
                  </span>
                )}
              </button>

              {/* 5. Khách hàng */}
              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'customers'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Khách Hàng</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-500">
                  {customerUsers.length}
                </span>
              </button>

              {/* 6. Mã giảm giá */}
              <button
                onClick={() => setActiveTab('coupons')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'coupons'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Ticket className="w-4 h-4 text-pink-400" />
                <span>Mã Giảm Giá (Voucher)</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-500">
                  {coupons.length}
                </span>
              </button>

              {/* 7. Nhân viên */}
              <button
                onClick={() => setActiveTab('staff')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'staff'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Briefcase className="w-4 h-4 text-red-400" />
                <span>Nhân Viên & Quyền Hạn</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-500">
                  {staffUsers.length}
                </span>
              </button>

              {/* 8. Đề xuất nhập hàng */}
              <button
                onClick={() => setActiveTab('restock')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'restock'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-indigo-400" />
                <span>Đề Xuất Nhập Hàng</span>
                {restockProposals.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                    {restockProposals.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>

              {/* 9. Cơ sở dữ liệu */}
              <button
                onClick={() => setActiveTab('database')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeTab === 'database'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Kết Nối MongoDB</span>
              </button>
            </div>

            {/* Sidebar Bottom Action Controls */}
            <div className="pt-3 border-t border-gray-200 space-y-2 shrink-0">
              {/* Về trang chủ button */}
              <button
                onClick={onClose}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 shadow-xs flex items-center gap-2.5 transition-colors"
                title="Quay lại giao diện mua sắm khách hàng"
              >
                <Home className="w-4 h-4 text-blue-600" />
                <span>Về Trang Chủ</span>
              </button>

              {/* Đăng xuất tài khoản button */}
              <button
                onClick={xuLyDangXuat}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-2.5 transition-colors"
                title="Đăng xuất khỏi tài khoản"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng Xuất Tài Khoản</span>
              </button>
            </div>

          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
            
            {/* 1. TAB: BÁO CÁO THỐNG KÊ (REPORTS) */}
            {activeTab === 'reports' && stats && (
              <div className="space-y-6">
                
                {/* Header of Reports with Print/Export */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>Báo Cáo Thống Kê & Hiệu Suất Kinh Doanh</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Dữ liệu thời gian thực được đồng bộ từ cơ sở dữ liệu MongoDB</p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>In Báo Cáo</span>
                  </button>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tổng doanh thu</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-blue-600 tabular-nums">
                      {formatVND(stats.totalRevenue)}
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Tăng trưởng +18.4% tháng này</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tổng đơn hàng</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tabular-nums">
                      {stats.totalOrders} đơn
                    </div>
                    <div className="text-[10px] text-amber-400">
                      {stats.pendingOrders} đơn đang chờ xử lý
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Khách hàng thành viên</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tabular-nums">
                      {stats.totalCustomers} tài khoản
                    </div>
                    <div className="text-[10px] text-blue-600">Đã đăng ký xác thực JWT</div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tồn kho máy tính</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-gray-900 tabular-nums">
                      {stats.totalProducts} mẫu
                    </div>
                    <div className="text-[10px] text-rose-400">
                      {stats.lowStockCount} mẫu sắp hết (dưới 5 máy)
                    </div>
                  </div>
                </div>

                {/* Sales Chart Visualization */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Biểu Đồ Doanh Số Bán Hàng 6 Tháng Gần Nhất</span>
                    <span className="text-[11px] text-gray-500 normal-case font-normal">Đơn vị: Triệu VNĐ</span>
                  </h3>

                  <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 pt-6 border-b border-gray-200 pb-2">
                    {stats.revenueByMonth.map((m) => {
                      const max = 350000000;
                      const heightPercent = Math.min(100, Math.round((m.revenue / max) * 100));
                      return (
                        <div key={m.month} className="flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-[10px] text-gray-500 tabular-nums">
                            {Math.round(m.revenue / 1000000)}M
                          </span>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500"
                          />
                          <span className="text-xs font-semibold text-gray-700">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Categories share & Low stock warnings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Category share */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Cơ cấu doanh thu theo nhóm sản phẩm</h4>
                    <div className="space-y-2.5">
                      {stats.categorySales.map((c) => (
                        <div key={c.category} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-700 font-medium capitalize">{c.category}</span>
                            <span className="text-blue-600 font-semibold tabular-nums">{formatVND(c.total)} ({c.count} máy)</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, Math.round((c.total / (stats.totalRevenue || 1)) * 100))}%` }}
                              className="bg-blue-600 h-full rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Low stock notice */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cảnh Báo Tồn Kho Cần Nhập Thêm</span>
                      </h4>
                      <button
                        onClick={() => setActiveTab('restock')}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Tạo đề xuất</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {products.filter(p => p.stock <= 5).slice(0, 4).map((p) => (
                        <div key={p.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={p.image}
                              alt={p.name}
                              loading="lazy"
                              decoding="async"
                              className="w-7 h-7 rounded object-cover"
                            />
                            <div className="max-w-[200px] truncate text-gray-700">{p.name}</div>
                          </div>
                          <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            Còn {p.stock} máy
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 2. TAB: DANH MỤC SẢN PHẨM (CATEGORIES) */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-amber-400" />
                      <span>Quản Lý Danh Mục Ngành Hàng ({categories.length})</span>
                    </h3>
                    <p className="text-xs text-gray-500">Tổ chức nhóm sản phẩm hiển thị trên trang chủ và bộ lọc khách hàng</p>
                  </div>

                  <button
                    onClick={handleOpenAddCategory}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Danh Mục Mới</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            loading="lazy"
                            decoding="async"
                            className="w-12 h-12 rounded-xl object-cover bg-gray-50 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{cat.name}</h4>
                            <div className="text-[11px] text-gray-500 font-mono">slug: {cat.slug}</div>
                            <span className={`inline-block mt-1 text-[10px] px-2 py-0.2 rounded font-semibold ${cat.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-100 text-gray-500'}`}>
                              {cat.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{cat.description || 'Chưa có mô tả chi tiết'}</p>
                      </div>

                      <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">
                          <strong className="text-blue-600">{cat.productCount}</strong> sản phẩm trong kho
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            title="Sửa danh mục"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin ? (
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                              title="Xóa danh mục (Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 px-1" title="Chỉ Admin mới có quyền xóa">
                              Khóa xóa
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. TAB: QUẢN LÝ SẢN PHẨM (PRODUCTS) */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-400" />
                      <span>Kho Hàng Sản Phẩm & Cấu Hình Máy ({products.length})</span>
                    </h3>
                    <p className="text-xs text-gray-500">Thêm, sửa cấu hình và hỗ trợ tải ảnh từ máy tính hoặc dán link URL</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm theo tên, hãng..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 w-44"
                      />
                    </div>

                    <button
                      onClick={handleOpenAddProduct}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm shadow-blue-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Sản Phẩm</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-3">Sản phẩm</th>
                          <th className="p-3">Hãng</th>
                          <th className="p-3">Danh mục</th>
                          <th className="p-3">Giá bán</th>
                          <th className="p-3">Tồn kho</th>
                          <th className="p-3 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-gray-100 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-9 h-9 rounded-lg object-cover bg-gray-50 shrink-0"
                                />
                                <div className="max-w-xs">
                                  <div className="font-bold text-gray-900 truncate">{prod.name}</div>
                                  <div className="text-[10px] text-gray-500 truncate">{prod.specs.cpu} · {prod.specs.gpu}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-gray-700">{prod.brand}</td>
                            <td className="p-3 text-gray-500 capitalize">{prod.category}</td>
                            <td className="p-3 font-bold text-blue-600 tabular-nums">{formatVND(prod.price)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${prod.stock <= 5 ? 'bg-rose-950 text-rose-300 border border-rose-800/50' : 'bg-gray-100 text-gray-700'}`}>
                                {prod.stock} máy
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {isAdmin ? (
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                                    title="Xóa sản phẩm (Admin)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-400 px-1" title="Chỉ Admin mới có quyền xóa sản phẩm">
                                    Khóa xóa
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4. TAB: QUẢN LÝ ĐƠN HÀNG (ORDERS) */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-blue-400" />
                      <span>Quản Lý Đơn Hàng Thời Gian Thực ({orders.length})</span>
                    </h3>
                    <p className="text-xs text-gray-500">Cập nhật tiến độ xử lý và giao hàng tự động qua Server-Sent Events</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Lọc theo:</span>
                    <select
                      value={orderFilterStatus}
                      onChange={(e) => setOrderFilterStatus(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-blue-600"
                    >
                      <option value="all">Tất cả ({orders.length})</option>
                      <option value="pending">Chờ xác nhận</option>
                      <option value="processing">Đang chuẩn bị</option>
                      <option value="shipping">Đang giao hàng</option>
                      <option value="delivered">Đã hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-3">Mã đơn</th>
                          <th className="p-3">Khách hàng</th>
                          <th className="p-3">Sản phẩm</th>
                          <th className="p-3">Tổng tiền</th>
                          <th className="p-3">Thanh toán</th>
                          <th className="p-3">Trạng thái</th>
                          <th className="p-3 text-right">Cập nhật</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-gray-100 transition-colors">
                            <td className="p-3 font-mono font-bold text-gray-900">
                              {ord.orderCode}
                              <div className="text-[10px] text-gray-500 font-sans">
                                {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-gray-900">{ord.customerName}</div>
                              <div className="text-[10px] text-gray-500">{ord.customerPhone}</div>
                            </td>
                            <td className="p-3">
                              <div className="max-w-xs truncate text-gray-700">
                                {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                              </div>
                            </td>
                            <td className="p-3 font-bold text-blue-600 tabular-nums">
                              {formatVND(ord.total)}
                            </td>
                            <td className="p-3">
                              <span className="uppercase text-[10px] font-bold text-gray-500">
                                {ord.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  ord.orderStatus === 'delivered'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : ord.orderStatus === 'shipping'
                                    ? 'bg-blue-500/15 text-blue-400'
                                    : ord.orderStatus === 'processing'
                                    ? 'bg-purple-500/15 text-purple-400'
                                    : ord.orderStatus === 'pending'
                                    ? 'bg-amber-500/15 text-amber-400'
                                    : 'bg-rose-500/15 text-rose-400'
                                }`}
                              >
                                {ord.orderStatus === 'pending' && 'Chờ xác nhận'}
                                {ord.orderStatus === 'processing' && 'Đang chuẩn bị'}
                                {ord.orderStatus === 'shipping' && 'Đang giao'}
                                {ord.orderStatus === 'delivered' && 'Hoàn thành'}
                                {ord.orderStatus === 'cancelled' && 'Đã hủy'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setViewingOrder(ord)}
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[11px] font-semibold"
                                  title="Xem chi tiết đơn"
                                >
                                  Chi tiết
                                </button>
                                <button
                                  onClick={() => {
                                    setUpdatingOrderId(ord.id);
                                    setNewOrderStatus(ord.orderStatus);
                                    setOrderAdminNote('');
                                  }}
                                  className="px-2.5 py-1 bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-bold"
                                >
                                  Đổi trạng thái
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. TAB: KHÁCH HÀNG (CUSTOMERS) */}
            {activeTab === 'customers' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>Danh Sách Khách Hàng Đăng Ký ({customerUsers.length})</span>
                    </h3>
                    <p className="text-xs text-gray-500">Xem hồ sơ khách hàng, lịch sử mua sắm và trạng thái tài khoản</p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm khách hàng..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 w-52"
                    />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-3">Khách hàng</th>
                          <th className="p-3">Số điện thoại</th>
                          <th className="p-3">Địa chỉ giao hàng</th>
                          <th className="p-3">Số đơn đã đặt</th>
                          <th className="p-3">Trạng thái</th>
                          <th className="p-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {customerUsers.map((cust) => {
                          const orderCount = orders.filter((o) => o.userId === cust.id || o.customerEmail === cust.email).length;
                          return (
                            <tr key={cust.id} className="hover:bg-gray-100 transition-colors">
                              <td className="p-3">
                                <div className="font-bold text-gray-900">{cust.name}</div>
                                <div className="text-[10px] text-gray-500 font-mono">{cust.email}</div>
                              </td>
                              <td className="p-3 text-gray-700">{cust.phone || 'Chưa cập nhật'}</td>
                              <td className="p-3 text-gray-500 max-w-xs truncate">{cust.address || 'Chưa cung cấp'}</td>
                              <td className="p-3 font-semibold text-blue-600">{orderCount} đơn hàng</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cust.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                  {cust.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {isAdmin ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleToggleUserRole(cust)}
                                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-[11px]"
                                      title="Thăng cấp thành Nhân viên"
                                    >
                                      Thăng cấp
                                    </button>
                                    <button
                                      onClick={() => handleToggleUserStatus(cust)}
                                      className={`px-2 py-1 rounded-lg text-[11px] font-bold ${cust.status === 'active' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                                    >
                                      {cust.status === 'active' ? 'Khóa' : 'Mở'}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-gray-500 italic">Chế độ xem</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. TAB: MÃ GIẢM GIÁ (COUPONS) */}
            {activeTab === 'coupons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-pink-400" />
                      <span>Quản Lý Mã Giảm Giá & Voucher Ưu Đãi ({coupons.length})</span>
                    </h3>
                    <p className="text-xs text-gray-500">Các mã khuyến mãi có thể áp dụng trực tiếp tại giỏ hàng và thanh toán</p>
                  </div>

                  {isAdmin ? (
                    <button
                      onClick={handleOpenAddCoupon}
                      className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tạo Mã Mới</span>
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500 italic bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                      Chỉ Admin mới có quyền tạo mới mã
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons.map((cpr) => (
                    <div key={cpr.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="font-mono text-base font-extrabold text-pink-400 tracking-wider">
                            {cpr.code}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${cpr.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-100 text-gray-500'}`}>
                            {cpr.status === 'active' ? 'Hiệu lực' : 'Hết hạn'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 mt-1">{cpr.description}</p>
                      </div>

                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-[11px] space-y-1">
                        <div className="flex justify-between text-gray-500">
                          <span>Mức giảm:</span>
                          <strong className="text-gray-900">
                            {cpr.discountType === 'percentage' ? `${cpr.discountValue}%` : formatVND(cpr.discountValue)}
                          </strong>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Đơn tối thiểu:</span>
                          <strong className="text-gray-800">{formatVND(cpr.minOrderValue)}</strong>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Đã dùng:</span>
                          <strong className="text-blue-600">{cpr.usedCount} / {cpr.usageLimit} lượt</strong>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Hạn dùng:</span>
                          <strong className="text-gray-700">{cpr.expiryDate}</strong>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => handleDeleteCoupon(cpr.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa voucher</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. TAB: NHÂN VIÊN & PHÂN QUYỀN (STAFF) */}
            {activeTab === 'staff' && (
              <div className="space-y-6">
                
                {/* Header & Role Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-red-400" />
                      <span>Quản Lý Nhân Viên & Phân Quyền Hệ Thống ({staffUsers.length})</span>
                    </h3>
                    <p className="text-xs text-gray-500">Danh mục nhân sự phụ trách kho vận, kỹ thuật phần cứng và chăm sóc khách hàng</p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setIsStaffModalOpen(true)}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-red-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Nhân Viên Mới</span>
                    </button>
                  )}
                </div>

                {/* Staff Notice banner if logged in as staff */}
                {isStaff && (
                  <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-300">Thông báo phân quyền Nhân viên:</div>
                      <p className="text-gray-700 mt-0.5">
                        Bạn đang đăng nhập với tư cách <strong>Nhân viên (Staff)</strong>. Bạn có quyền xem danh sách đồng nghiệp để phối hợp công việc, nhưng <strong>chỉ Quản trị viên (Admin) mới có quyền tạo mới, khóa hoặc điều chỉnh quyền nhân sự</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Permission Matrix Table */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bảng Ma Trận Phân Quyền TechCore (Admin vs Nhân Viên)</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-2.5">Chức năng & Tác vụ</th>
                          <th className="p-2.5 text-center text-red-400 font-bold">Quản Trị Viên (Admin)</th>
                          <th className="p-2.5 text-center text-amber-400 font-bold">Nhân Viên (Staff)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-xs">
                        <tr>
                          <td className="p-2.5">Quản lý kho sản phẩm & Tải ảnh từ máy tính</td>
                          <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Toàn quyền (Thêm/Sửa/Xóa)</td>
                          <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Thêm & Cập nhật kho</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">Xử lý & Cập nhật trạng thái đơn hàng thời gian thực</td>
                          <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Toàn quyền (Kể cả hủy đơn)</td>
                          <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Chuyển trạng thái giao hàng</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">Tạo Đề xuất nhập hàng (Restock Proposal)</td>
                          <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Tạo & Duyệt phiếu</td>
                          <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Gửi phiếu đề xuất</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">Phê duyệt nhập kho & Cộng số lượng tồn kho tự động</td>
                          <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Phê duyệt & Nghiệm thu</td>
                          <td className="p-2.5 text-center text-gray-500 font-semibold">✗ Cần Admin phê duyệt</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">Thêm/Xóa danh mục & Quản lý mã giảm giá</td>
                          <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Toàn quyền tạo & xóa</td>
                          <td className="p-2.5 text-center text-amber-400 font-semibold">△ Xem & Cập nhật</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">Thêm nhân viên mới, phân quyền & khóa tài khoản</td>
                          <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Độc quyền Admin</td>
                          <td className="p-2.5 text-center text-gray-500 font-semibold">✗ Không có quyền</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Staff Directory Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staffUsers.map((st) => (
                    <div key={st.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${st.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                              {st.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm">{st.name}</div>
                              <div className="text-[11px] text-gray-500 font-mono">{st.email}</div>
                            </div>
                          </div>
                          
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${st.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                            {st.role === 'admin' ? 'Admin' : 'Nhân viên'}
                          </span>
                        </div>

                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-[11px] space-y-1">
                          <div className="flex justify-between text-gray-500">
                            <span>Chức vụ:</span>
                            <strong className="text-gray-800">{st.position || 'Chuyên viên kỹ thuật'}</strong>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Phòng ban:</span>
                            <strong className="text-gray-800">{st.department || 'Vận hành kho & bán hàng'}</strong>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Điện thoại:</span>
                            <strong className="text-blue-600 font-mono">{st.phone || '0988 776 655'}</strong>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Trạng thái:</span>
                            <span className={`font-semibold ${st.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {st.status === 'active' ? 'Đang làm việc' : 'Đã khóa tài khoản'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleToggleUserRole(st)}
                            disabled={st.id === currentUser?.id}
                            className="text-[11px] text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500"
                          >
                            Đổi vai trò
                          </button>
                          
                          <button
                            onClick={() => handleToggleUserStatus(st)}
                            disabled={st.id === currentUser?.id}
                            className={`text-[11px] font-bold ${st.status === 'active' ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'} disabled:opacity-30`}
                          >
                            {st.status === 'active' ? 'Khóa quyền' : 'Kích hoạt'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* 8. TAB: ĐỀ XUẤT NHẬP HÀNG (RESTOCK PROPOSALS) */}
            {activeTab === 'restock' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-indigo-400" />
                      <span>Đề Xuất Nhập Hàng & Tồn Kho ({restockProposals.length})</span>
                    </h3>
                    <p className="text-xs text-gray-500">Nhân viên gửi đề xuất nhập linh kiện/máy tính — Ban quản trị phê duyệt và nhập kho</p>
                  </div>

                  <button
                    onClick={handleOpenAddRestock}
                    className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-indigo-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Gửi Đề Xuất Nhập Hàng Mới</span>
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                        <tr>
                          <th className="p-3">Mã phiếu</th>
                          <th className="p-3">Sản phẩm</th>
                          <th className="p-3">Tồn / Đề xuất</th>
                          <th className="p-3">Nhà cung cấp</th>
                          <th className="p-3">Dự toán</th>
                          <th className="p-3">Mức ưu tiên</th>
                          <th className="p-3">Trạng thái</th>
                          <th className="p-3 text-right">Phê duyệt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {restockProposals.map((req) => (
                          <tr key={req.id} className="hover:bg-gray-100 transition-colors">
                            <td className="p-3 font-mono font-bold text-gray-900">
                              {req.proposalCode}
                              <div className="text-[10px] text-gray-500 font-sans">
                                {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={req.productImage}
                                  alt={req.productName}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-8 h-8 rounded object-cover bg-gray-50 shrink-0"
                                />
                                <div className="max-w-xs">
                                  <div className="font-bold text-gray-900 truncate">{req.productName}</div>
                                  <div className="text-[10px] text-gray-500">Người tạo: {req.createdByName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-gray-500">Tồn: <strong className="text-gray-900">{req.currentStock}</strong></div>
                              <div className="text-indigo-400 font-bold">Cần thêm: +{req.suggestedQuantity}</div>
                            </td>
                            <td className="p-3 text-gray-700 max-w-xs truncate">{req.supplier}</td>
                            <td className="p-3 font-bold text-blue-600 tabular-nums">{formatVND(req.estimatedCost)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' : req.priority === 'high' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                {req.priority === 'urgent' ? 'Khẩn cấp' : req.priority === 'high' ? 'Ưu tiên cao' : 'Bình thường'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.status === 'received' ? 'bg-emerald-500/20 text-emerald-400' : req.status === 'ordered' ? 'bg-blue-500/20 text-blue-400' : req.status === 'approved' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-300'}`}>
                                {req.status === 'pending' && 'Chờ duyệt'}
                                {req.status === 'approved' && 'Đã duyệt'}
                                {req.status === 'ordered' && 'Đang đặt hàng'}
                                {req.status === 'received' && 'Đã nhập kho'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {isAdmin ? (
                                <div className="flex items-center justify-end gap-1">
                                  {req.status === 'pending' && (
                                    <button
                                      onClick={() => handleUpdateRestockStatus(req.id, 'approved')}
                                      className="px-2 py-1 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded text-[11px] font-bold"
                                    >
                                      Duyệt
                                    </button>
                                  )}
                                  {req.status === 'approved' && (
                                    <button
                                      onClick={() => handleUpdateRestockStatus(req.id, 'ordered')}
                                      className="px-2 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded text-[11px] font-bold"
                                    >
                                      Đặt hàng
                                    </button>
                                  )}
                                  {req.status === 'ordered' && (
                                    <button
                                      onClick={() => handleUpdateRestockStatus(req.id, 'received')}
                                      className="px-2 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded text-[11px] font-bold"
                                    >
                                      Nhập kho (+SL)
                                    </button>
                                  )}
                                  {req.status === 'received' && (
                                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                                      <CheckCheck className="w-3.5 h-3.5" />
                                      Xong
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-500 italic">Chờ Admin duyệt</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 9. TAB: KẾT NỐI MONGODB (DATABASE) */}
            {activeTab === 'database' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>Thông Tin Máy Chủ Dữ Liệu MongoDB</span>
                    </h3>
                    <p className="text-xs text-gray-500">Trạng thái kết nối, số lượng tài liệu (documents) và phân quyền JWT</p>
                  </div>

                  <button
                    onClick={loadAllAdminData}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Kiểm tra lại kết nối</span>
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <div className="text-sm font-bold text-emerald-400">Hệ Thống Cơ Sở Dữ Liệu Đang Trực Tuyến & Ổn Định</div>
                      <div className="text-xs text-gray-500">Động cơ: {dbStatus?.engine || 'High-Performance Embedded Native Engine'}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-700">
                    <span className="text-gray-500 select-none">URI: </span>
                    <span>{dbStatus?.uri || 'mongodb://localhost:27017/techcore_db'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Người dùng</span>
                      <strong className="text-lg text-gray-900 tabular-nums">{users.length}</strong>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Sản phẩm</span>
                      <strong className="text-lg text-blue-600 tabular-nums">{products.length}</strong>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Đơn hàng</span>
                      <strong className="text-lg text-emerald-400 tabular-nums">{orders.length}</strong>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Đề xuất nhập</span>
                      <strong className="text-lg text-indigo-400 tabular-nums">{restockProposals.length}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* --- MODAL 1: ADD / EDIT PRODUCT --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border border-gray-200 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>{editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</span>
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="VD: ASUS ROG Zephyrus G16"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Thương hiệu *</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="ASUS, Apple, Lenovo, Dell..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Danh mục *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="laptop-gaming">Laptop Gaming</option>
                    <option value="pc-gaming">PC Gaming Custom</option>
                    <option value="laptop-office">Creator & Workstation</option>
                    <option value="components">Linh kiện & VGA</option>
                    <option value="monitors">Màn hình hiển thị</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Tồn kho ban đầu *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* IMAGE SELECTION WITH BOTH LOCAL FILE & URL SUPPORT */}
              <div className="space-y-2 pt-1 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gray-700 uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Hình ảnh sản phẩm *</span>
                  </label>
                  <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded-lg border border-gray-200 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('file')}
                      className={`px-2 py-0.5 rounded font-semibold transition-colors ${imageInputMode === 'file' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Tải từ máy tính
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2 py-0.5 rounded font-semibold transition-colors ${imageInputMode === 'url' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Dán liên kết URL
                    </button>
                  </div>
                </div>

                {imageInputMode === 'file' ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFile(file);
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <UploadCloud className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-xs text-gray-900 font-medium">Bấm để chọn tệp ảnh từ máy tính hoặc kéo thả ảnh vào đây</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Hỗ trợ PNG, JPG, JPEG, WEBP tối đa 10MB</div>
                    {uploadedFileName && (
                      <div className="mt-2 text-xs text-emerald-400 font-semibold">Đã tải lên: {uploadedFileName}</div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://example.com/laptop.jpg"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                )}

                {/* Image preview */}
                {productForm.image && (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
                    <img
                      src={productForm.image}
                      alt="Xem trước"
                      loading="lazy"
                      decoding="async"
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                    />
                    <div className="text-xs text-gray-500">Xem trước ảnh hiển thị trên thẻ sản phẩm</div>
                  </div>
                )}
              </div>

              {/* Hardware Specs */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase mb-1">Vi xử lý (CPU)</label>
                  <input
                    type="text"
                    value={productForm.cpu}
                    onChange={(e) => setProductForm({ ...productForm, cpu: e.target.value })}
                    placeholder="Core Ultra 7 / i9-14900KS"
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase mb-1">Card đồ họa (GPU)</label>
                  <input
                    type="text"
                    value={productForm.gpu}
                    onChange={(e) => setProductForm({ ...productForm, gpu: e.target.value })}
                    placeholder="RTX 4060 / RTX 4090"
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                >
                  {editingProduct ? 'Cập Nhật Sản Phẩm' : 'Thêm Vào Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD / EDIT CATEGORY --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-amber-400" />
                <span>{editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</span>
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="VD: Laptop Gaming Cao Cấp"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Mã nhận diện (Slug) *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="laptop-gaming"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Ảnh đại diện danh mục *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Mô tả ngành hàng..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs"
                >
                  Lưu Danh Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ADD COUPON --- */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-pink-400" />
                <span>Tạo Mã Giảm Giá Mới</span>
              </h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Mã Voucher *</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  placeholder="VD: TECHCORE2026"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Mô tả hiển thị</label>
                <input
                  type="text"
                  required
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="Giảm 10% tối đa 1 triệu..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Loại giảm</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Giá trị giảm *</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Đơn tối thiểu</label>
                  <input
                    type="number"
                    value={couponForm.minOrderValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Hạn sử dụng</label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs"
                >
                  Tạo Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ADD STAFF (ADMIN ONLY) --- */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-red-400" />
                <span>Thêm Nhân Viên Mới Vào Hệ Thống</span>
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Họ và tên nhân viên *</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="Nguyễn Văn Kỹ Thuật"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="nhanvien.moi@techcore.vn"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Mật khẩu khởi tạo *</label>
                <input
                  type="password"
                  required
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Phòng ban</label>
                  <input
                    type="text"
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Chức vụ</label>
                  <input
                    type="text"
                    value={staffForm.position}
                    onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Vai trò quyền hạn</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                >
                  <option value="staff">Nhân viên (Staff - Dưới quyền Admin)</option>
                  <option value="admin">Quản trị viên (Admin - Toàn quyền hệ thống)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: CREATE RESTOCK PROPOSAL (STAFF & ADMIN) --- */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-400" />
                <span>Lập Phiếu Đề Xuất Nhập Hàng</span>
              </h3>
              <button onClick={() => setIsRestockModalOpen(false)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>

            <form onSubmit={handleSaveRestockProposal} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Chọn sản phẩm cần nhập *</label>
                <select
                  required
                  value={restockForm.productId}
                  onChange={(e) => {
                    const prod = products.find(p => p.id === e.target.value);
                    setRestockForm({
                      ...restockForm,
                      productId: e.target.value,
                      supplier: prod ? `${prod.brand} Official Distributor` : '',
                      estimatedCost: prod ? prod.price * restockForm.suggestedQuantity * 0.85 : 50000000,
                    });
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Tồn kho hiện tại: {p.stock} máy)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Số lượng đề xuất *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={restockForm.suggestedQuantity}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      const prod = products.find(p => p.id === restockForm.productId);
                      setRestockForm({
                        ...restockForm,
                        suggestedQuantity: qty,
                        estimatedCost: prod ? prod.price * qty * 0.85 : 50000000,
                      });
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Mức độ ưu tiên</label>
                  <select
                    value={restockForm.priority}
                    onChange={(e) => setRestockForm({ ...restockForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  >
                    <option value="urgent">Khẩn cấp (Sắp hết)</option>
                    <option value="high">Ưu tiên cao</option>
                    <option value="medium">Bình thường</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Nhà cung cấp đề xuất *</label>
                <input
                  type="text"
                  required
                  value={restockForm.supplier}
                  onChange={(e) => setRestockForm({ ...restockForm, supplier: e.target.value })}
                  placeholder="Nhà phân phối chính hãng..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Dự toán ngân sách (VNĐ)</label>
                <input
                  type="number"
                  value={restockForm.estimatedCost}
                  onChange={(e) => setRestockForm({ ...restockForm, estimatedCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Ghi chú / Lý do đề xuất</label>
                <textarea
                  rows={2}
                  value={restockForm.notes}
                  onChange={(e) => setRestockForm({ ...restockForm, notes: e.target.value })}
                  placeholder="Nhu cầu khách hàng hỏi nhiều, hàng sắp cạn kho..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs"
                >
                  Gửi Ban Giám Đốc Duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 6: UPDATE ORDER STATUS MODAL --- */}
      {updatingOrderId && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border border-gray-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Đổi Trạng Thái Đơn Hàng</span>
              </h3>
              <button onClick={() => setUpdatingOrderId(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Trạng thái mới *</label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="processing">Đang chuẩn bị hàng & đóng gói</option>
                  <option value="shipping">Đang giao hàng hỏa tốc</option>
                  <option value="delivered">Đã giao hàng thành công</option>
                  {isAdmin && <option value="cancelled">Hủy đơn hàng (Admin)</option>}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Ghi chú gửi khách hàng</label>
                <textarea
                  rows={2}
                  value={orderAdminNote}
                  onChange={(e) => setOrderAdminNote(e.target.value)}
                  placeholder="Ghi chú đóng thùng, mã vận đơn đối tác..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setUpdatingOrderId(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(updatingOrderId)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                >
                  Cập Nhật Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 7: VIEW ORDER DETAIL MODAL --- */}
      {viewingOrder && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative bg-white border border-gray-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Chi Tiết Đơn Hàng {viewingOrder.orderCode}</span>
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">
                  Ngày đặt: {new Date(viewingOrder.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                <div>Khách hàng: <strong className="text-gray-900">{viewingOrder.customerName}</strong></div>
                <div>Điện thoại: <strong className="text-blue-600 font-mono">{viewingOrder.customerPhone}</strong></div>
                <div>Email: <span className="text-gray-700">{viewingOrder.customerEmail}</span></div>
                <div>Địa chỉ nhận: <span className="text-gray-700">{viewingOrder.shippingAddress}</span></div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-gray-500 uppercase text-[10px]">Danh sách máy đã đặt:</div>
                {viewingOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        loading="lazy"
                        decoding="async"
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{item.productName}</div>
                        <div className="text-[10px] text-gray-500">Số lượng: x{item.quantity}</div>
                      </div>
                    </div>
                    <span className="font-bold text-blue-600 tabular-nums">{formatVND(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm">
                <span>Tổng giá trị đơn:</span>
                <span className="text-blue-600 tabular-nums">{formatVND(viewingOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
