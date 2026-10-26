import React from 'react';
import { ShieldCheck, Truck, Clock, Headphones } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-500 text-xs">
      
      {/* 4 Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-900 text-sm">Chính Hãng 100%</div>
              <p className="text-gray-500 mt-0.5 leading-relaxed">Phân phối ủy quyền từ ASUS, Apple, Lenovo, Dell, MSI, Intel, NVIDIA.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-900 text-sm">Giao Hỏa Tốc Toàn Quốc</div>
              <p className="text-gray-500 mt-0.5 leading-relaxed">Nội thành 2 giờ, liên tỉnh 24-48 giờ. Miễn phí vận chuyển đơn từ 2 triệu.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-900 text-sm">Đổi Mới 30 Ngày</div>
              <p className="text-gray-500 mt-0.5 leading-relaxed">Lỗi phần cứng từ nhà sản xuất được đổi máy mới nguyên seal ngay lập tức.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Headphones className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-900 text-sm">Hỗ Trợ Kỹ Thuật 24/7</div>
              <p className="text-gray-500 mt-0.5 leading-relaxed">Đội ngũ kỹ sư build PC chuyên sâu, tối ưu hệ điều hành & driver tận tình.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Col 1 */}
        <div className="space-y-3">
          <div className="text-lg font-bold text-gray-900 tracking-tight">
            TechCore<span className="text-blue-600">.</span>
          </div>
          <p className="text-gray-500 leading-relaxed">
            Hệ thống bán lẻ máy tính và linh kiện công nghệ cao cấp. Cung cấp giải pháp phần cứng tối ưu cho game thủ, nhà sáng tạo nội dung và doanh nghiệp.
          </p>
          <div className="text-gray-500 text-[11px]">
            Hotline đặt hàng: <strong className="text-gray-800">1800 6868</strong> (8:00 - 21:30)
          </div>
        </div>

        {/* Col 2: Categories */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-900">Danh Mục Sản Phẩm</div>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onSelectCategory('laptop-gaming')} className="hover:text-blue-600 transition-colors">
                Laptop Gaming Flagship
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('pc-gaming')} className="hover:text-blue-600 transition-colors">
                PC Gaming Custom Watercool
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('laptop-office')} className="hover:text-blue-600 transition-colors">
                Creator & Workstation Mobile
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('components')} className="hover:text-blue-600 transition-colors">
                Linh kiện CPU, GPU RTX 40-Series
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-900">Chính Sách & Hỗ Trợ</div>
          <ul className="space-y-2 text-gray-500">
            <li>Chính sách bảo hành tận nơi</li>
            <li>Hướng dẫn quét mã thanh toán VietQR</li>
            <li>Chính sách bảo mật thông tin khách hàng</li>
            <li>Hóa đơn tài chính điện tử VAT</li>
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500 text-[11px]">
        <div>© 2026 TechCore Vietnam. All rights reserved. Bản quyền thuộc về TechCore Technology.</div>
        <div className="flex items-center gap-4">
          <span>Cam kết chính hãng</span>
          <span>·</span>
          <span>Đổi trả 30 ngày</span>
          <span>·</span>
          <span>Giao hàng toàn quốc</span>
        </div>
      </div>

    </footer>
  );
};
