import React from 'react';
import { Laptop, Cpu, Monitor, Sparkles } from 'lucide-react';

interface CategoryStripProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

const CATEGORIES = [
  {
    id: 'laptop-gaming',
    name: 'Laptop Gaming Flagship',
    desc: 'OLED 240Hz, Core Ultra 9, RTX 40-Series',
    image: '/src/assets/images/hero_flagship_laptop_1791553011691.jpg',
    icon: Laptop,
    badge: 'Hot 2026'
  },
  {
    id: 'pc-gaming',
    name: 'PC Gaming Custom Watercool',
    desc: 'Cỗ máy tối thượng i9-14900KS / RTX 4090',
    image: '/src/assets/images/category_gaming_pc_1791553028628.jpg',
    icon: Cpu,
    badge: 'Hiệu năng cao'
  },
  {
    id: 'laptop-office',
    name: 'Creator & Workstation Mobile',
    desc: 'MacBook M3 Max, Dell XPS OLED 4K+',
    image: '/src/assets/images/category_creator_laptop_1791553040374.jpg',
    icon: Sparkles,
    badge: 'Chuyên nghiệp'
  },
  {
    id: 'components',
    name: 'Linh Kiện & VGA Flagship',
    desc: 'ASUS ROG Strix RTX 4080 Super, DDR5 RGB',
    image: '/src/assets/images/category_pc_components_1791553050836.jpg',
    icon: Monitor,
    badge: 'Chính hãng'
  }
];

export const CategoryStrip: React.FC<CategoryStripProps> = ({ activeCategory, onSelectCategory }) => {
  return (
    <section className="py-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Danh Mục Nổi Bật</h2>
            <p className="text-xs text-gray-500">Chọn dòng thiết bị chuyên biệt theo nhu cầu làm việc và chiến game</p>
          </div>
          {activeCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Hiện tất cả danh mục
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                }`}
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent" />
                  
                  {/* Subtle top label */}
                  <div className="absolute top-2.5 left-2.5 text-[11px] font-semibold text-blue-700 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-gray-200 shadow-xs">
                    {cat.badge}
                  </div>
                </div>

                <div className="p-3.5 space-y-1">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
