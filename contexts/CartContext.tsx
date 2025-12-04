import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number, size: string, color: string) => void;
  updateQuantity: (id: number, size: string, color: string, change: number) => void;
  clearCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      // Tìm sản phẩm có cùng id, size VÀ color
      const existingItem = prev.find(
        (cartItem) =>
          cartItem.id === item.id &&
          cartItem.size === item.size &&
          cartItem.color === item.color
      );

      if (existingItem) {
        // Nếu đã có, tăng quantity
        return prev.map((cartItem) =>
          cartItem.id === item.id &&
            cartItem.size === item.size &&
            cartItem.color === item.color
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      // Nếu chưa có, thêm mới với quantity = 1
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number, size: string, color: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === id && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (id: number, size: string, color: string, change: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id && item.size === size && item.color === color) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}