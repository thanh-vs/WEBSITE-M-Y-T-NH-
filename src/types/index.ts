export type UserRole = 'customer' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  status: 'active' | 'blocked';
  createdAt: string;
}

export interface ProductSpecs {
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  display: string;
  os?: string;
  weight?: string;
  battery?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'laptop-gaming' | 'laptop-office' | 'pc-gaming' | 'pc-workstation' | 'components' | 'monitors' | 'accessories';
  price: number;
  originalPrice: number;
  discountPercent: number;
  stock: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  specs: ProductSpecs;
  description: string;
  highlights: string[];
  warranty: string; // e.g. "24 tháng chính hãng"
  isFeatured?: boolean;
  isNewArrival?: boolean;
  gifts?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  customNote?: string;
}

export type PaymentMethod = 'cod' | 'vietqr' | 'momo' | 'bank';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type OrderStatus = 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  specsSummary: string;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockCount: number;
  categorySales: { category: string; count: number; total: number }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  status: 'active' | 'inactive';
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usedCount: number;
  usageLimit: number;
  expiryDate: string;
  status: 'active' | 'expired' | 'disabled';
}

export interface RestockProposal {
  id: string;
  proposalCode: string;
  productId: string;
  productName: string;
  productImage: string;
  currentStock: number;
  suggestedQuantity: number;
  supplier: string;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'ordered' | 'received';
  createdByName: string;
  createdAt: string;
  notes?: string;
}
