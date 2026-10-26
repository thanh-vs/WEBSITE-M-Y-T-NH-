import React, { useState } from 'react';
import { ShoppingBag, Shield, Search, LogOut, PackageCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRealtime } from '../context/RealtimeContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenMyOrders: () => void;
  onOpenAdmin: () => void;
  onSelectCategory: (cat: string) => void;
  activeCategory: string;
  onSearchClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenMyOrders,
  onOpenAdmin,
  onSelectCategory,
  activeCategory,
  onSearchClick,
}) => {
  const { user, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { isConnected } = useRealtime();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); onSelectCategory('all'); }}
          className="flex items-center gap-2 group whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:border-blue-500 transition-colors">
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
            TechCore<span className="text-blue-600">.</span>
          </span>
        </a>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <button
            onClick={() => onSelectCategory('all')}
            className={`transition-colors whitespace-nowrap shrink-0 ${activeCategory === 'all' ? 'text-blue-600 font-semibold' : 'hover:text-gray-900'}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => onSelectCategory('laptop-gaming')}
            className={`transition-colors whitespace-nowrap shrink-0 ${activeCategory === 'laptop-gaming' ? 'text-blue-600 font-semibold' : 'hover:text-gray-900'}`}
          >
            Laptop Gaming
          </button>
          <button
            onClick={() => onSelectCategory('pc-gaming')}
            className={`transition-colors whitespace-nowrap shrink-0 ${activeCategory === 'pc-gaming' ? 'text-blue-600 font-semibold' : 'hover:text-gray-900'}`}
          >
            PC Custom
          </button>
          <button
            onClick={() => onSelectCategory('laptop-office')}
            className={`transition-colors whitespace-nowrap shrink-0 ${activeCategory === 'laptop-office' ? 'text-blue-600 font-semibold' : 'hover:text-gray-900'}`}
          >
            Creator & Workstation
          </button>
          <button
            onClick={() => onSelectCategory('components')}
            className={`transition-colors whitespace-nowrap shrink-0 ${activeCategory === 'components' ? 'text-blue-600 font-semibold' : 'hover:text-gray-900'}`}
          >
            Linh kiện & VGA
          </button>
        </nav>

        {/* Zone 3: Functional interactive actions */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Quick Search */}
          <button
            onClick={onSearchClick}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Tìm kiếm sản phẩm"
            aria-label="Tìm kiếm sản phẩm"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
            title="Giỏ hàng"
            aria-label="Mở giỏ hàng"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Account / Menu */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-gray-800 shadow-sm transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline">{user.name}</span>
                {user.role === 'admin' ? (
                  <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-semibold uppercase">
                    Admin
                  </span>
                ) : user.role === 'staff' ? (
                  <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-semibold uppercase">
                    Nhân viên
                  </span>
                ) : null}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm shadow-blue-500/20"
              >
                Đăng nhập
              </button>
            )}

            {/* Dropdown Menu */}
            {isUserMenuOpen && user && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 text-xs text-gray-700"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="font-semibold text-gray-900 truncate">{user.name}</div>
                  <div className="text-gray-500 truncate">{user.email}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span>Vai trò:</span>
                    <span className={`font-medium ${
                      user.role === 'admin' 
                        ? 'text-red-600' 
                        : user.role === 'staff' 
                          ? 'text-amber-600' 
                          : 'text-blue-600'
                    }`}>
                      {user.role === 'admin' 
                        ? 'Quản trị viên (Admin)' 
                        : user.role === 'staff' 
                          ? 'Nhân viên (Staff)' 
                          : 'Khách hàng (Customer)'}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={onOpenMyOrders}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                  >
                    <PackageCheck className="w-4 h-4 text-gray-400" />
                    <span>Lịch sử đơn hàng của tôi</span>
                  </button>

                  {(user.role === 'admin' || user.role === 'staff') && (
                    <button
                      onClick={onOpenAdmin}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 font-medium flex items-center gap-2.5 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{user.role === 'admin' ? 'Bảng quản trị Admin' : 'Trang quản lý Nhân viên'}</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-500 hover:text-red-600 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
