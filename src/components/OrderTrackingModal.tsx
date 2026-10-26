import React, { useState } from 'react';
import { X, CheckCircle, Clock, Truck, PackageCheck, Ban } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useRealtime } from '../context/RealtimeContext';
import { api } from '../services/api';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderUpdated?: (updated: Order) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose, onOrderUpdated }) => {
  const { isConnected } = useRealtime();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (!order) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const steps: { key: OrderStatus; label: string; icon: any; desc: string }[] = [
    { key: 'pending', label: 'Chờ xác nhận', icon: Clock, desc: 'Đơn hàng đã được tiếp nhận và mã hóa bảo mật' },
    { key: 'processing', label: 'Đang xử lý & Kiểm tra', icon: PackageCheck, desc: 'Kỹ thuật viên test linh kiện, đóng hộp nguyên seal' },
    { key: 'shipping', label: 'Đang vận chuyển hỏa tốc', icon: Truck, desc: 'Bàn giao Viettel Post giao tận tay khách hàng' },
    { key: 'delivered', label: 'Đã giao thành công', icon: CheckCircle, desc: 'Kiện hàng đã đến nơi an toàn' },
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    if (order.orderStatus === 'cancelled') return 'cancelled';
    const orderIndex = steps.findIndex(s => s.key === order.orderStatus);
    const stepIndex = steps.findIndex(s => s.key === stepKey);
    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  const handleCancelOrder = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const res = await api.updateOrderStatus(order.id, 'cancelled', 'Khách hàng chủ động yêu cầu hủy đơn');
      if (onOrderUpdated) onOrderUpdated(res.order);
    } catch (err: any) {
      setCancelError(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-white border border-gray-200 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Theo Dõi Đơn Hàng {order.orderCode}</h2>
              {/* Realtime Live Indicator */}
              <span className="flex items-center gap-1.5 text-[11px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Cập nhật thời gian thực</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Thời gian đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          
          {cancelError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
              {cancelError}
            </div>
          )}

          {/* Stepper Timeline */}
          {order.orderStatus === 'cancelled' ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-800 text-xs">
              <Ban className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <div className="font-bold">Đơn hàng này đã bị hủy</div>
                <div className="text-rose-700 text-[11px] mt-0.5">
                  Lý do: {order.statusHistory[order.statusHistory.length - 1]?.note || 'Đã hủy'}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-6">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Hành Trình Đơn Hàng (Real-Time Tracker)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                {steps.map((st, idx) => {
                  const status = getStepStatus(st.key);
                  const Icon = st.icon;

                  return (
                    <div key={st.key} className="flex flex-col items-center text-center relative z-10">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
                        status === 'completed'
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                          : status === 'current'
                          ? 'bg-blue-50 border-blue-600 text-blue-600 ring-2 ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="mt-2.5">
                        <div className={`text-xs font-bold ${
                          status === 'current' ? 'text-blue-600' : status === 'completed' ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {st.label}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5 max-w-[130px] line-clamp-2">
                          {st.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status History Logs */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="text-[11px] font-semibold text-gray-600">Nhật ký cập nhật:</div>
                <div className="space-y-2 max-h-36 overflow-y-auto text-xs">
                  {order.statusHistory.map((hist, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-gray-200 text-gray-700 shadow-xs">
                      <span className="text-blue-600 font-mono text-[10px] shrink-0 mt-0.5 font-semibold">
                        {new Date(hist.timestamp).toLocaleTimeString('vi-VN')}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-[11px] leading-tight">{hist.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Itemized Order Details */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Sản Phẩm Đã Mua ({order.items.length})
            </h3>

            <div className="space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-200 last:border-none">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={it.productImage}
                      alt={it.productName}
                      loading="lazy"
                      decoding="async"
                      className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-gray-900 truncate">{it.productName}</div>
                      <div className="text-[10px] text-gray-500 truncate">{it.specsSummary}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="font-semibold text-blue-600 tabular-nums">{formatVND(it.price * it.quantity)}</div>
                    <div className="text-[10px] text-gray-500 tabular-nums">Số lượng: x{it.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Details */}
            <div className="pt-2 border-t border-gray-200 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Phương thức thanh toán:</span>
                <span className="text-gray-800 font-medium uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái thanh toán:</span>
                <span className={order.paymentStatus === 'completed' ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                  {order.paymentStatus === 'completed' ? 'Đã thanh toán đủ' : 'Chờ thanh toán khi nhận hàng'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
                <span>Tổng tiền:</span>
                <span className="text-blue-600 tabular-nums font-extrabold">{formatVND(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs text-gray-600 space-y-1">
            <div><strong className="text-gray-800">Người nhận:</strong> {order.customerName} - {order.customerPhone}</div>
            <div><strong className="text-gray-800">Địa chỉ:</strong> {order.shippingAddress}</div>
            {order.note && <div><strong className="text-gray-800">Ghi chú:</strong> {order.note}</div>}
          </div>

          {/* Cancel Order Action (only if pending) */}
          {order.orderStatus === 'pending' && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng này'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
