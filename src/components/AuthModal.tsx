import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminMode?: boolean;
  onSuccessRole?: (role: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, adminMode = false, onSuccessRole }) => {
  const { login, register, user } = useAuth();
  
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (tab === 'login') {
        await login(email, password);
        const safeEmail = email.toLowerCase().trim();
        if (adminMode && !safeEmail.includes('admin')) {
          // If expecting admin role
        }
      } else {
        await register({ name, email, password, phone, address });
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Thao tác không thành công');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative bg-white border border-gray-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch header */}
        <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => { setTab('login'); setErrorMessage(null); }}
            className={`py-3 text-xs font-bold rounded-2xl transition-all ${
              tab === 'login'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMessage(null); }}
            className={`py-3 text-xs font-bold rounded-2xl transition-all ${
              tab === 'register'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Đăng Ký Tài Khoản
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {adminMode && (
            <div className="flex items-start gap-2.5 text-xs text-red-900 bg-red-50 p-3 rounded-2xl border border-red-200">
              <Shield className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-700">Yêu Cầu Tài Khoản Quản Trị / Nhân Viên</div>
                <div className="text-[11px] text-gray-600 mt-0.5">
                  Vui lòng đăng nhập bằng tài khoản Quản trị viên (Admin) hoặc Nhân viên (Staff) để truy cập hệ thống quản trị.
                </div>
                <div className="text-[11px] text-gray-700 font-mono mt-2 space-y-0.5 bg-white p-2 rounded-xl border border-red-200 shadow-xs">
                  <div>Quản trị viên: <strong className="text-red-600">admin@techcore.vn</strong> / MK: <strong className="text-gray-800">admin123</strong></div>
                  <div>Nhân viên: <strong className="text-amber-600">nhanvien@techcore.vn</strong> / MK: <strong className="text-gray-800">staff123</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {adminMode 
                ? 'Đăng nhập Quản Trị / Nhân Viên' 
                : tab === 'login' ? 'Đăng nhập tài khoản' : 'Đăng ký tài khoản mới'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {adminMode
                ? 'Nhập email và mật khẩu tài khoản quản trị viên hoặc nhân viên để tiếp tục.'
                : tab === 'login' 
                  ? 'Đăng nhập để theo dõi đơn hàng, quản lý thông tin bảo hành và giỏ hàng.'
                  : 'Tạo tài khoản để nhận ưu đãi thành viên và theo dõi đơn hàng dễ dàng.'}
            </p>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  Họ và tên *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn An"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Địa chỉ Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Mật khẩu *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1">
                    Địa chỉ mặc định
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, đường, quận/huyện, TP"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>{tab === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Mới'}</span>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
