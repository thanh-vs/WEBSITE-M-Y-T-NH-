import React, { useState } from 'react';
import { X, CheckCircle2, QrCode, CreditCard, Banknote, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, PaymentMethod } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onOpenAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  onOpenAuth,
}) => {
  const { items, subtotal, discount, shippingFee, totalAmount, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vietqr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const simulatedOrderCode = `TC-${Math.floor(10000 + Math.random() * 90000)}`;
  const qrUrl = `https://api.vietqr.io/image/970422-0988776655-compact2.jpg?amount=${totalAmount}&addInfo=${simulatedOrderCode}&accountName=TECHCORE%20VIETNAM`;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        price: item.product.price,
        quantity: item.quantity,
        specsSummary: `${item.product.specs.cpu} / ${item.product.specs.gpu} / ${item.product.specs.ram}`
      }));

      const payload = {
        customerName,
        customerPhone,
        shippingAddress,
        note,
        items: orderItems,
        subtotal,
        shippingFee,
        discount,
        total: totalAmount,
        couponCode: appliedCoupon || undefined,
        paymentMethod,
      };

      const result = await api.createOrder(payload);
      clearCart();
      onOrderSuccess(result.order);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi đặt hàng, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-white border border-gray-200 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-colors mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">Xác Nhận Đơn Hàng & Thanh Toán</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-6">
          
          {/* Auth Check Warning if not logged in */}
          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-amber-800">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Bạn cần đăng nhập để lưu trữ đơn hàng và theo dõi hành trình giao nhận thời gian thực.</span>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1.5 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 whitespace-nowrap shadow-sm"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Customer Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                1. Thông Tin Nhận Hàng
              </h3>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Họ và tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ví dụ: 0912 345 678"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Địa chỉ giao hàng chi tiết *</label>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Ghi chú giao hàng (Tùy chọn)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Giao giờ hành chính, gọi điện trước 15 phút..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Right: Payment Method & QR code preview */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                2. Phương Thức Thanh Toán
              </h3>

              <div className="space-y-2">
                {/* Option 1: VietQR */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'vietqr'
                    ? 'border-blue-600 bg-blue-50/60'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="vietqr"
                    checked={paymentMethod === 'vietqr'}
                    onChange={() => setPaymentMethod('vietqr')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      <span>Quét mã VietQR / MoMo (Khuyên dùng)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Tự động điền số tiền và nội dung đơn hàng, xác nhận tức thì.
                    </p>
                  </div>
                </label>

                {/* Option 2: COD */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-blue-600 bg-blue-50/60'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Thanh toán tiền mặt khi nhận hàng (COD)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Được kiểm tra máy và tem bảo hành trước khi thanh toán.
                    </p>
                  </div>
                </label>

                {/* Option 3: Bank Transfer */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'bank'
                    ? 'border-blue-600 bg-blue-50/60'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                    className="mt-0.5 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span>Chuyển khoản ngân hàng trực tiếp</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      MBBank: 0988776655 - TECHCORE VIETNAM
                    </p>
                  </div>
                </label>
              </div>

              {/* VietQR Preview Box */}
              {paymentMethod === 'vietqr' && (
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-center space-y-2">
                  <div className="text-[11px] text-gray-600">Mã QR Thanh Toán Tự Động (NAPAS 24/7):</div>
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-xs border border-gray-200">
                    <img
                      src={qrUrl}
                      alt="VietQR Code"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Mở app ngân hàng quét mã để thanh toán đúng số tiền {formatVND(totalAmount)}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Order Summary Strip */}
          <div className="border-t border-gray-200 pt-4 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-3xl space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Số lượng sản phẩm ({items.length} mặt hàng)</span>
              <span>Tổng tiền thanh toán: <strong className="text-blue-600 text-base font-bold tabular-nums">{formatVND(totalAmount)}</strong></span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-medium transition-colors border border-gray-200 shadow-xs"
              >
                Quay lại giỏ hàng
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý đơn hàng...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hoàn Tất Đặt Hàng Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
