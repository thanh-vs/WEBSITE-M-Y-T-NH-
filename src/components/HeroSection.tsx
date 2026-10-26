import React from 'react';
import { ArrowRight, Cpu, ShieldCheck, Truck } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onFeaturedClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onFeaturedClick }) => {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Quiet kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <span className="uppercase tracking-wider">Hệ Thống Bán Lẻ Máy Tính & Gaming Gear</span>
              <span aria-hidden="true" className="text-gray-300">·</span>
              <span className="text-gray-500 font-normal">Cam Kết Chính Hãng 100%</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight text-balance">
              Hiệu Năng Vượt Trội. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                Trải Nghiệm Đỉnh Cao.
              </span>
            </h1>

            <p className="text-base text-gray-600 max-w-xl leading-relaxed">
              Chuyên phân phối Laptop Gaming, PC Đồ Họa và Máy Trạm cao cấp. Cam kết linh kiện mới nguyên seal từ các thương hiệu hàng đầu, hỗ trợ trả góp và giao hàng hỏa tốc toàn quốc.
            </p>

            {/* Spec highlights */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-1">
              <span className="text-gray-800 font-semibold">Cấu hình tiêu biểu:</span>
              <span>Intel Core i9 / Core Ultra</span>
              <span aria-hidden="true" className="text-gray-300">/</span>
              <span>GeForce RTX 4090 24GB</span>
              <span aria-hidden="true" className="text-gray-300">/</span>
              <span>Màn hình OLED 240Hz</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 group whitespace-nowrap"
              >
                <span>Xem danh mục sản phẩm</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onFeaturedClick}
                className="px-6 py-3 rounded-xl bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-medium text-sm transition-colors whitespace-nowrap shadow-sm"
              >
                Sản phẩm nổi bật
              </button>
            </div>

            {/* Trust markers */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Bảo hành chính hãng 24-36T</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Giao hàng hỏa tốc toàn quốc</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
                <span>100% linh kiện mới nguyên seal</span>
              </div>
            </div>

          </div>

          {/* Right Image Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xl">
              <img
                src="/src/assets/images/hero_flagship_laptop_1791553011691.jpg"
                alt="Laptop Flagship ROG Zephyrus G16 OLED"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full aspect-16/10 object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent flex items-end p-5">
                <div className="w-full flex items-center justify-between text-xs text-gray-700 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-gray-200 shadow-md">
                  <div>
                    <div className="font-semibold text-gray-900">ROG Zephyrus G16 OLED (2025)</div>
                    <div className="text-gray-500 text-[11px]">Core Ultra 9 · RTX 4070 · OLED 240Hz</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600 tabular-nums">52.990.000₫</div>
                    <div className="text-[10px] text-gray-500">Giảm 10%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
