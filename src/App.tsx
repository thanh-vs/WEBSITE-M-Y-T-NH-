/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { RealtimeProvider, useRealtime } from './context/RealtimeContext';
import { api } from './services/api';
import { Product, Order } from './types';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryStrip } from './components/CategoryStrip';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';

function MainApp() {
  const { user } = useAuth();
  const { eventCounter } = useRealtime();

  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authAdminMode, setAuthAdminMode] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [eventCounter]);

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    const catalogElem = document.getElementById('catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    handleSelectCategory('all');
  };

  const handleFeaturedClick = () => {
    handleSelectCategory('laptop-gaming');
  };

  const { logout } = useAuth();

  const handleOpenAdmin = () => {
    if (!user) {
      setAuthAdminMode(true);
      setIsAuthOpen(true);
    } else if (user.role !== 'admin' && user.role !== 'staff') {
      const confirmLogout = window.confirm(
        'Tài khoản hiện tại của bạn là Khách hàng, không có quyền Quản trị hoặc Nhân viên. Bạn có muốn đăng xuất để đăng nhập bằng tài khoản Quản trị viên (admin@techcore.vn) hoặc Nhân viên (nhanvien@techcore.vn) không?'
      );
      if (confirmLogout) {
        logout();
        setAuthAdminMode(true);
        setIsAuthOpen(true);
      }
    } else {
      setIsAdminOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={() => {
          setAuthAdminMode(false);
          setIsAuthOpen(true);
        }}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onSelectCategory={handleSelectCategory}
        activeCategory={activeCategory}
        onSearchClick={() => {
          const catalogElem = document.getElementById('catalog');
          if (catalogElem) catalogElem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onExploreClick={handleExploreClick}
          onFeaturedClick={handleFeaturedClick}
        />

        {/* Featured Category Strip */}
        <CategoryStrip
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Product Catalog & Detailed Filter */}
        <ProductCatalog
          products={products}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onViewProduct={(prod) => setSelectedProduct(prod)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenAuth={() => {
          setAuthAdminMode(false);
          setIsAuthOpen(true);
        }}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Modals & Drawers */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenAuth={() => {
          setAuthAdminMode(false);
          setIsAuthOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(newOrder) => setTrackingOrder(newOrder)}
        onOpenAuth={() => {
          setAuthAdminMode(false);
          setIsAuthOpen(true);
        }}
      />

      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
        onOrderUpdated={(updated) => setTrackingOrder(updated)}
      />

      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        onSelectOrder={(ord) => setTrackingOrder(ord)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        adminMode={authAdminMode}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onProductsUpdated={loadProducts}
      />

      {/* Live Toast Container */}
      <ToastContainer />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RealtimeProvider>
          <MainApp />
        </RealtimeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
