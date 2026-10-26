import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  toastMessage: string | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('techcore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('techcore_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setToastMessage(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Tinh tien giam gia
  let discount = 0;
  if (appliedCoupon === 'TECHCORENEW') {
    discount = Math.min(500000, subtotal);
  } else if (appliedCoupon === 'VIPGAMER') {
    discount = Math.round(subtotal * 0.05); // Giam 5%
  } else if (appliedCoupon === 'DISCOUNT1M' && subtotal >= 30000000) {
    discount = 1000000;
  }

  // Mien phi van chuyen cho don tren 2 trieu dong
  const shippingFee = subtotal > 2000000 || subtotal === 0 ? 0 : 50000;
  const totalAmount = Math.max(0, subtotal - discount + shippingFee);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'TECHCORENEW') {
      setAppliedCoupon('TECHCORENEW');
      return { success: true, message: 'Đã áp dụng mã TECHCORENEW: Giảm 500.000₫' };
    }
    if (cleanCode === 'VIPGAMER') {
      setAppliedCoupon('VIPGAMER');
      return { success: true, message: 'Đã áp dụng mã VIPGAMER: Giảm 5% tổng hóa đơn' };
    }
    if (cleanCode === 'DISCOUNT1M') {
      if (subtotal < 30000000) {
        return { success: false, message: 'Mã DISCOUNT1M chỉ áp dụng cho đơn hàng từ 30 triệu đồng trở lên' };
      }
      setAppliedCoupon('DISCOUNT1M');
      return { success: true, message: 'Đã áp dụng mã DISCOUNT1M: Giảm ngay 1.000.000₫' };
    }
    return { success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const clearToast = () => {
    setToastMessage(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        discount,
        shippingFee,
        totalAmount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
