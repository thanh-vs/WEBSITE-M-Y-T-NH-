import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, ShieldCheck, Gift, Cpu, CheckCircle2 } from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onOpenAuth }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      api.getReviews(product.id)
        .then(data => setReviews(data))
        .catch(err => console.error('Failed to load reviews', err));
    }
  }, [product]);

  if (!product) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleAddToCartAndOpen = () => {
    addToCart(product, 1);
    setIsCartOpen(true);
    onClose();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!userComment.trim()) return;

    setIsSubmittingReview(true);
    setReviewMsg(null);
    try {
      const res = await api.addReview(product.id, userRating, userComment);
      setReviews(prev => [res.review, ...prev]);
      setUserComment('');
      setReviewMsg('Cảm ơn bạn! Đánh giá đã được ghi nhận.');
    } catch (err: any) {
      setReviewMsg(err.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-white border border-gray-200 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Top Section: Split Gallery & Contiguous Purchase Module */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Gallery Left */}
            <div className="space-y-4">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {product.discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums shadow-sm">
                    Giảm {product.discountPercent}%
                  </div>
                )}
              </div>

              {/* Warranty & Guarantee badges */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Bảo hành: <strong className="text-gray-900 font-semibold">{product.warranty}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% linh kiện chính hãng, bảo hiểm rơi vỡ năm đầu</span>
                </div>
              </div>
            </div>

            {/* Contiguous Purchase Module Right */}
            <div className="space-y-5">
              
              {/* Unboxed clean metadata */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-bold text-blue-600 uppercase tracking-wider">{product.brand}</span>
                <span aria-hidden="true" className="text-gray-300">·</span>
                <span>Mã SKU: {product.id.toUpperCase()}</span>
                <span aria-hidden="true" className="text-gray-300">·</span>
                <span className={product.stock > 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                  {product.stock > 0 ? `Còn hàng (${product.stock} máy)` : 'Tạm hết hàng'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                {product.name}
              </h2>

              {/* Price Block */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-1">
                <div className="text-xs text-gray-500">Giá bán niêm yết (Đã gồm 10% VAT):</div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tabular-nums">
                    {formatVND(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through tabular-nums">
                      {formatVND(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Included Gifts */}
              {product.gifts && product.gifts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
                  <div className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>Quà tặng khuyến mãi kèm theo:</span>
                  </div>
                  <ul className="text-xs text-gray-700 space-y-1 pl-5 list-disc marker:text-amber-500">
                    {product.gifts.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Purchase Action */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleAddToCartAndOpen}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    product.stock === 0
                      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-[0.98]'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Mua Ngay & Thêm Vào Giỏ</span>
                </button>
              </div>

            </div>

          </div>

          {/* Middle Section: Detailed Specifications Sheet */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <span>Bảng Thông Số Kỹ Thuật Chi Tiết (Hardware Specs)</span>
            </h3>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 divide-y divide-gray-200 overflow-hidden text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                <span className="font-semibold text-gray-600">Bộ vi xử lý (CPU)</span>
                <span className="sm:col-span-2 text-gray-900 font-medium">{product.specs.cpu}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                <span className="font-semibold text-gray-600">Card đồ họa (VGA)</span>
                <span className="sm:col-span-2 text-blue-600 font-semibold">{product.specs.gpu}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                <span className="font-semibold text-gray-600">Bộ nhớ trong (RAM)</span>
                <span className="sm:col-span-2 text-gray-900">{product.specs.ram}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                <span className="font-semibold text-gray-600">Ổ cứng lưu trữ (Storage)</span>
                <span className="sm:col-span-2 text-gray-900">{product.specs.storage}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                <span className="font-semibold text-gray-600">Màn hình hiển thị</span>
                <span className="sm:col-span-2 text-gray-900">{product.specs.display}</span>
              </div>
              {product.specs.os && (
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                  <span className="font-semibold text-gray-600">Hệ điều hành</span>
                  <span className="sm:col-span-2 text-gray-700">{product.specs.os}</span>
                </div>
              )}
              {product.specs.weight && (
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                  <span className="font-semibold text-gray-600">Trọng lượng & Kích thước</span>
                  <span className="sm:col-span-2 text-gray-700">{product.specs.weight}</span>
                </div>
              )}
              {product.specs.battery && (
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                  <span className="font-semibold text-gray-600">Pin / Nguồn cấp</span>
                  <span className="sm:col-span-2 text-gray-700">{product.specs.battery}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description & Key Highlights */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Đặc Điểm Nổi Bật</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {product.highlights && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 pt-2">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Reviews & Ratings Section */}
          <div className="border-t border-gray-200 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-current" />
                <span>Đánh Giá Từ Khách Hàng ({reviews.length})</span>
              </h3>
              <div className="text-xs text-gray-500">
                Điểm trung bình: <strong className="text-amber-600 font-bold tabular-nums">{product.rating} / 5.0</strong>
              </div>
            </div>

            {/* Submit Review Form */}
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Viết đánh giá của bạn:</span>
                
                {/* Rating selector */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="p-1 text-gray-300 hover:text-amber-500 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${star <= userRating ? 'text-amber-500 fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder={user ? "Chia sẻ cảm nhận về hiệu năng, độ mát, chất lượng hiển thị của sản phẩm..." : "Vui lòng đăng nhập để gửi đánh giá..."}
                rows={2}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600"
              />

              <div className="flex items-center justify-between">
                {reviewMsg && <span className="text-xs text-blue-600 font-medium">{reviewMsg}</span>}
                <div className="ml-auto">
                  {user ? (
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !userComment.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Đăng nhập để đánh giá
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.map(rev => (
                <div key={rev.id} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-900">{rev.userName}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                      <span className="text-gray-400 text-[10px] ml-1">
                        {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{rev.comment}</p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
