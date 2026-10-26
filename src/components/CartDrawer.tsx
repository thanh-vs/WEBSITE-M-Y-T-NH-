import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    shippingFee,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isCartOpen) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-md bg-white border-l border-gray-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Giỏ Hàng Của Bạn</h2>
            <span className="text-xs text-gray-500 tabular-nums">({items.length} món)</span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            title="Đóng giỏ hàng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Notice */}
        <div className="bg-blue-50/70 px-4 py-2.5 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-900">
          <Truck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {subtotal >= 2000000
              ? 'Đơn hàng của bạn đủ điều kiện Miễn phí giao hàng hỏa tốc!'
              : `Mua thêm ${formatVND(2000000 - subtotal)} để được Freeship toàn quốc`}
          </span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 text-gray-400 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-300" />
              <p className="text-sm text-gray-500">Giỏ hàng của bạn đang trống</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-blue-600 border border-gray-200 rounded-xl text-xs font-semibold"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            items.map(item => (
              <div 
                key={item.product.id}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex gap-3 items-center"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-200">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">{item.product.name}</h4>
                  <div className="text-[11px] text-blue-600 font-semibold tabular-nums mt-0.5">
                    {formatVND(item.product.price)}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-gray-200 bg-white rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:text-blue-600 text-gray-500 transition-colors"
                        title="Giảm số lượng"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-gray-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:text-blue-600 text-gray-500 transition-colors"
                        title="Tăng số lượng"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                      title="Xóa khỏi giỏ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal for item */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-gray-900 tabular-nums">
                    {formatVND(item.product.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Module */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-200 bg-white space-y-4">
            
            {/* Voucher Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs">
                  <span className="text-blue-700 font-medium">Mã voucher: <strong>{appliedCoupon}</strong></span>
                  <button
                    onClick={removeCoupon}
                    className="text-gray-500 hover:text-rose-600 text-xs underline"
                  >
                    Bỏ mã
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Nhập TECHCORENEW hoặc VIPGAMER"
                      className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap border border-gray-200"
                  >
                    Áp dụng
                  </button>
                </form>
              )}
              {couponFeedback && (
                <div className={`text-[11px] mt-1.5 ${couponFeedback.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {couponFeedback.message}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Tạm tính tiền hàng:</span>
                <span className="text-gray-800 tabular-nums">{formatVND(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Giảm giá khuyến mãi:</span>
                  <span className="tabular-nums">-{formatVND(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="text-gray-800 tabular-nums">
                  {shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Tổng cộng:</span>
                <span className="text-blue-600 tabular-nums">{formatVND(totalAmount)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <span>Tiến Hành Đặt Hàng & Thanh Toán</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full py-1 text-center text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Xóa toàn bộ giỏ hàng
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
