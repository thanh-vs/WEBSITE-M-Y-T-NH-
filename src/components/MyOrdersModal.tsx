import React, { useState, useEffect } from 'react';
import { X, PackageCheck, Eye, Clock, Truck, CheckCircle2, Ban } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { useRealtime } from '../context/RealtimeContext';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({ isOpen, onClose, onSelectOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { eventCounter } = useRealtime();

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, eventCounter]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Chờ xác nhận</span>;
      case 'processing':
        return <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1"><PackageCheck className="w-3 h-3" /> Đang xử lý</span>;
      case 'shipping':
        return <span className="text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1"><Truck className="w-3 h-3" /> Đang giao hàng</span>;
      case 'delivered':
        return <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Đã giao thành công</span>;
      case 'cancelled':
        return <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1"><Ban className="w-3 h-3" /> Đã hủy</span>;
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
            <PackageCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Lịch Sử Đơn Hàng Của Bạn</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {isLoading ? (
            <div className="text-center py-16 text-gray-500 text-xs">Đang tải lịch sử đơn hàng...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-gray-500 space-y-2">
              <PackageCheck className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-sm">Bạn chưa có đơn hàng nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 hover:border-gray-300 shadow-xs transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{order.orderCode}</span>
                      <span className="text-gray-500 text-xs ml-2">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.orderStatus)}
                      <button
                        onClick={() => {
                          onSelectOrder(order);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-gray-100 text-blue-600 border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-1.5 text-xs text-gray-700">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="truncate max-w-sm">{it.productName} (x{it.quantity})</span>
                        <span className="text-gray-500 font-mono tabular-nums">{formatVND(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total Amount */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs">
                    <span className="text-gray-600">Phương thức: <strong className="text-gray-800 uppercase">{order.paymentMethod}</strong></span>
                    <div>
                      <span className="text-gray-600 mr-2">Tổng tiền:</span>
                      <span className="text-blue-600 font-bold text-sm tabular-nums">{formatVND(order.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
