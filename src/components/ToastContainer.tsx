import React, { useEffect } from 'react';
import { CheckCircle2, Bell, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRealtime } from '../context/RealtimeContext';

export const ToastContainer: React.FC = () => {
  const { toastMessage, clearToast } = useCart();
  const { notifications, clearNotifications } = useRealtime();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {/* Cart toast */}
      {toastMessage && (
        <div className="pointer-events-auto bg-white border border-blue-500/50 text-gray-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="text-xs font-medium leading-snug">{toastMessage}</span>
          <button onClick={clearToast} className="text-gray-400 hover:text-gray-700 ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Realtime Event SSE Notifications */}
      {notifications.length > 0 && notifications.map((msg, index) => (
        <div 
          key={index} 
          className="pointer-events-auto bg-white border border-amber-500/40 text-gray-800 px-4 py-3 rounded-2xl shadow-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Bell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs leading-snug flex-1">
            <span className="font-bold text-amber-600 block text-[11px]">Thông Báo Đơn Hàng</span>
            {msg}
          </div>
          <button onClick={clearNotifications} className="text-gray-400 hover:text-gray-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
