import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductCatalogProps {
  products: Product[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onViewProduct: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  activeCategory,
  onSelectCategory,
  onViewProduct,
  searchQuery,
  setSearchQuery,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  // Cập nhật isLoading khi danh sách sản phẩm được tải về
  useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [products]);

  // Extract unique brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.brand)));
    return ['all', ...list];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(q);
        const matchBrand = product.brand.toLowerCase().includes(q);
        const matchCpu = product.specs.cpu.toLowerCase().includes(q);
        const matchGpu = product.specs.gpu.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCpu && !matchGpu) return false;
      }

      // Category
      if (activeCategory !== 'all' && product.category !== activeCategory) {
        return false;
      }

      // Brand
      if (selectedBrand !== 'all' && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // Price Range
      if (priceRange === 'under30') {
        if (product.price >= 30000000) return false;
      } else if (priceRange === '30to60') {
        if (product.price < 30000000 || product.price > 60000000) return false;
      } else if (priceRange === '60to90') {
        if (product.price < 60000000 || product.price > 90000000) return false;
      } else if (priceRange === 'above90') {
        if (product.price <= 90000000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      return 0; // default featured
    });
  }, [products, searchQuery, activeCategory, selectedBrand, priceRange, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    onSelectCategory('all');
    setSelectedBrand('all');
    setPriceRange('all');
    setSortBy('featured');
  };

  const hasActiveFilters = searchQuery !== '' || activeCategory !== 'all' || selectedBrand !== 'all' || priceRange !== 'all' || sortBy !== 'featured';

  return (
    <section id="catalog" className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Search Bar Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Kho Sản Phẩm Công Nghệ
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span>Tìm thấy <strong className="text-blue-600 tabular-nums">{filteredProducts.length}</strong> cấu hình phù hợp</span>
              {hasActiveFilters && (
                <>
                  <span aria-hidden="true">·</span>
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đặt lại bộ lọc</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search Box & Mobile Filter Trigger */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm laptop, RTX 4090, CPU Ultra..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="md:hidden px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 flex items-center gap-2 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Lọc</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row (Desktop & Mobile) */}
        <div className={`mt-6 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4 shadow-sm">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Category Segment */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Dòng máy & Thiết bị
                </label>
                <select
                  value={activeCategory}
                  onChange={(e) => onSelectCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="laptop-gaming">Laptop Gaming Flagship</option>
                  <option value="pc-gaming">PC Gaming Custom</option>
                  <option value="laptop-office">Creator & Workstation</option>
                  <option value="pc-workstation">PC Đồ Họa & Máy Trạm</option>
                  <option value="components">Linh Kiện & VGA</option>
                  <option value="monitors">Màn Hình Chuyên Nghiệp</option>
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Thương hiệu
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">Tất cả thương hiệu</option>
                  {brands.filter(b => b !== 'all').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Khoảng giá (VND)
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">Mọi mức giá</option>
                  <option value="under30">Dưới 30.000.000₫</option>
                  <option value="30to60">Từ 30.000.000₫ - 60.000.000₫</option>
                  <option value="60to90">Từ 60.000.000₫ - 90.000.000₫</option>
                  <option value="above90">Trên 90.000.000₫ (Ultra High-End)</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Sắp xếp theo
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="featured">Sản phẩm tiêu biểu</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="rating">Đánh giá sao cao nhất</option>
                  <option value="discount">Khuyến mãi nhiều nhất</option>
                </select>
              </div>

            </div>

          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={onViewProduct}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <Filter className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Vui lòng thử tìm kiếm bằng từ khóa khác hoặc xóa bỏ các điều kiện lọc giá và thương hiệu.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-medium transition-colors border border-gray-200"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
