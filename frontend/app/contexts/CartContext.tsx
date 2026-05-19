"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, ItemOptions } from '../lib/types';

export interface OrderItem {
  cartId: string;
  menuItem: MenuItem;
  quantity: number;
  options: ItemOptions;
}

interface CartContextType {
  items: OrderItem[];
  addItem: (item: MenuItem, quantity: number, options: ItemOptions) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
  count: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial cart from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('havi-cart');
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error('Failed to load cart from local storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('havi-cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (menuItem: MenuItem, quantity: number, options: ItemOptions) => {
    const cartId = `${menuItem.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems(prev => [...prev, { cartId, menuItem, quantity, options }]);
  };

  const removeItem = (cartId: string) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.cartId === cartId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

