import React from 'react';

// Khung xương giả lập loading thẻ sản phẩm (skeleton card với hiệu ứng shimmer)
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col p-4 animate-pulse shadow-xs">
      {/* Khối xám đại diện cho ảnh sản phẩm */}
      <div className="w-full aspect-square bg-gray-200 rounded-xl mb-4" />

      {/* Khối xám đại diện cho danh mục & nhãn */}
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>

      {/* Khối xám đại diện cho tên sản phẩm */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-3/5" />
      </div>

      {/* Khối xám đại diện cho thông số specs */}
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-gray-100 rounded px-2 w-16 border border-gray-200" />
        <div className="h-5 bg-gray-100 rounded px-2 w-20 border border-gray-200" />
      </div>

      {/* Khối xám đại diện cho giá & nút mua */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="space-y-1.5 w-1/2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200/60 rounded w-1/2" />
        </div>
        <div className="h-9 w-24 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
