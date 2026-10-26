import React from 'react';
import { Star, ShoppingCart, Eye, Cpu, Zap } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="group relative flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100">
      
      {/* Product Image Area */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative aspect-4/3 overflow-hidden bg-gray-100 cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent opacity-60" />

        {/* Discount & Stock indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {product.discountPercent > 0 && (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md backdrop-blur-md tabular-nums shadow-xs">
              -{product.discountPercent}%
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs">
              Chỉ còn {product.stock} máy
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25 backdrop-blur-[2px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="px-4 py-2 rounded-xl bg-white/95 border border-gray-200 text-gray-900 text-xs font-semibold flex items-center gap-2 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-lg"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem thông số chi tiết</span>
          </button>
        </div>
      </div>

      {/* Product Information Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Unboxed clean metadata (NO PILL BADGES) */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-semibold text-blue-600 uppercase tracking-wider text-[11px]">{product.brand}</span>
          <span aria-hidden="true" className="text-gray-300">·</span>
          <span>{product.warranty}</span>
        </div>

        {/* Product Title */}
        <h3 
          onClick={() => onViewDetails(product)}
          className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
        >
          {product.name}
        </h3>

        {/* Key Hardware Specs Snippet */}
        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200 text-[11px] text-gray-700 space-y-1">
          <div className="flex items-center gap-1.5 truncate">
            <Cpu className="w-3 h-3 text-blue-600 shrink-0" />
            <span className="truncate">{product.specs.cpu}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Zap className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">{product.specs.gpu}</span>
          </div>
          <div className="text-[10px] text-gray-500 flex items-center gap-2 pt-0.5">
            <span>RAM: {product.specs.ram.split(' ')[0]}</span>
            <span aria-hidden="true">·</span>
            <span>Ổ cứng: {product.specs.storage.split(' ')[0]}</span>
          </div>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="ml-1 font-semibold text-gray-800 tabular-nums">{product.rating}</span>
          </div>
          <span aria-hidden="true" className="text-gray-300">·</span>
          <span className="tabular-nums">({product.reviewCount} đánh giá)</span>
        </div>

        {/* Price and Add to Cart Action */}
        <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-base font-extrabold text-blue-600 tabular-nums">
              {formatVND(product.price)}
            </div>
            {product.originalPrice > product.price && (
              <div className="text-[11px] text-gray-400 line-through tabular-nums">
                {formatVND(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock === 0}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95'
            }`}
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{product.stock === 0 ? 'Hết hàng' : 'Thêm giỏ'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
