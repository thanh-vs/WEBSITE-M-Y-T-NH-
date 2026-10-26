import { Product, Order, User, Review, AdminStats, OrderStatus, CategoryItem, Coupon, RestockProposal, UserRole } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('techcore_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng nhập thất bại');
    return data;
  },

  async register(payload: { name: string; email: string; password: string; phone?: string; address?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không thể lấy thông tin phiên làm việc');
    return res.json();
  },

  async getDbStatus() {
    const res = await fetch(`${API_BASE}/database/status`);
    return res.json();
  },

  // Products
  async getProducts(params?: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.category) query.append('category', params.category);
    if (params?.brand) query.append('brand', params.brand);
    if (params?.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Lỗi khi tải danh sách sản phẩm');
    return res.json();
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
    return res.json();
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<{ product: Product; message: string }> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo sản phẩm');
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ product: Product; message: string }> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật sản phẩm');
    return data;
  },

  async deleteProduct(id: string): Promise<{ product: Product; message: string }> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa sản phẩm');
    return data;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Lỗi khi tải danh sách đơn hàng');
    return res.json();
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Không tìm thấy đơn hàng');
    return res.json();
  },

  async createOrder(orderPayload: any): Promise<{ order: Order; message: string }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo đơn hàng');
    return data;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, adminNote?: string): Promise<{ order: Order; message: string }> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminNote }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật trạng thái đơn hàng');
    return data;
  },

  // Admin & Staff Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Lỗi khi tải danh sách người dùng');
    return res.json();
  },

  async updateUserRole(id: string, role: UserRole): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/users/${id}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật quyền');
    return data;
  },

  async updateUserStatus(id: string, status: 'active' | 'blocked'): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/users/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật trạng thái');
    return data;
  },

  // Staff Management
  async getStaff(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/staff`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Lỗi khi tải danh sách nhân viên');
    return res.json();
  },

  async createStaff(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    department?: string;
    position?: string;
    role?: 'staff' | 'admin';
  }): Promise<{ staff: User; message: string }> {
    const res = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi thêm nhân viên');
    return data;
  },

  // Categories
  async getCategories(): Promise<CategoryItem[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Lỗi khi tải danh mục');
    return res.json();
  },

  async createCategory(category: Omit<CategoryItem, 'id' | 'productCount'>): Promise<{ category: CategoryItem; message: string }> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(category),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo danh mục');
    return data;
  },

  async updateCategory(id: string, updates: Partial<CategoryItem>): Promise<{ category: CategoryItem; message: string }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật danh mục');
    return data;
  },

  async deleteCategory(id: string): Promise<{ category: CategoryItem; message: string }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa danh mục');
    return data;
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    const res = await fetch(`${API_BASE}/coupons`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Lỗi khi tải danh sách mã giảm giá');
    return res.json();
  },

  async createCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>): Promise<{ coupon: Coupon; message: string }> {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(coupon),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo mã giảm giá');
    return data;
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<{ coupon: Coupon; message: string }> {
    const res = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật mã giảm giá');
    return data;
  },

  async deleteCoupon(id: string): Promise<{ coupon: Coupon; message: string }> {
    const res = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa mã giảm giá');
    return data;
  },

  // Restock Proposals (Đề xuất nhập hàng)
  async getRestockProposals(): Promise<RestockProposal[]> {
    const res = await fetch(`${API_BASE}/restock-proposals`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Lỗi khi tải danh sách đề xuất nhập hàng');
    return res.json();
  },

  async createRestockProposal(payload: {
    productId: string;
    productName: string;
    productImage: string;
    currentStock: number;
    suggestedQuantity: number;
    supplier: string;
    estimatedCost: number;
    priority: RestockProposal['priority'];
    notes?: string;
  }): Promise<{ proposal: RestockProposal; message: string }> {
    const res = await fetch(`${API_BASE}/restock-proposals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo đề xuất nhập hàng');
    return data;
  },

  async updateRestockProposalStatus(
    id: string,
    status: RestockProposal['status'],
    notes?: string
  ): Promise<{ proposal: RestockProposal; message: string }> {
    const res = await fetch(`${API_BASE}/restock-proposals/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật đề xuất nhập hàng');
    return data;
  },

  // Admin Stats
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Lỗi khi tải dữ liệu thống kê');
    return res.json();
  },

  // Reviews
  async getReviews(productId: string): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/reviews/${productId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async addReview(productId: string, rating: number, comment: string): Promise<{ review: Review; message: string }> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, rating, comment }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi gửi đánh giá');
    return data;
  },
};
