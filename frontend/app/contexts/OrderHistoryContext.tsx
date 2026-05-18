"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerOrder, CustomerOrderItem, mockCustomerOrders } from '../data/mockData';
import { OrderItem } from './CartContext';
import { useAuth } from './AuthContext';
import {
  placeOrder,
  getCustomerOrders,
  confirmOrderReceipt,
  submitOrderReview,
  updateOrderStatus,
} from '../lib/db';

interface OrderHistoryContextType {
  myOrders: CustomerOrder[];
  addOrder: (items: OrderItem[], address: string, notes: string) => Promise<string>;
  confirmReceipt: (orderId: string) => Promise<void>;
  submitReview: (orderId: string, rating: number, review: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  loading: boolean;
}

const OrderHistoryContext = createContext<OrderHistoryContextType>({
  myOrders: [],
  addOrder: async () => '',
  confirmReceipt: async () => {},
  submitReview: async () => {},
  cancelOrder: async () => {},
  loading: false,
});

export function OrderHistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [myOrders, setMyOrders] = useState<CustomerOrder[]>(mockCustomerOrders);
  const [loading, setLoading] = useState(false);

  // Load orders from Supabase on mount / login
  useEffect(() => {
    async function loadOrders() {
      if (user && user.id) {
        setLoading(true);
        try {
          const dbOrders = await getCustomerOrders(user.id);
          if (dbOrders && dbOrders.length > 0) {
            setMyOrders(dbOrders);
          } else {
            // Keep fallback demo orders so UI is not empty
            setMyOrders(mockCustomerOrders);
          }
        } catch (err) {
          console.error('Failed to load user orders from database:', err);
          setMyOrders(mockCustomerOrders);
        } finally {
          setLoading(false);
        }
      } else {
        setMyOrders(mockCustomerOrders);
      }
    }
    loadOrders();
  }, [user]);

  const addOrder = async (items: OrderItem[], address: string, notes: string): Promise<string> => {
    const fallbackNumber = `HS-${Date.now().toString().slice(-6)}`;
    try {
      const customerName = user?.name || 'Customer';
      const userId = user?.id || null;

      // 1. Save to Supabase
      const newOrderId = await placeOrder(items, address, notes, userId, customerName);

      // 2. Map to local state
      const customerItems: CustomerOrderItem[] = items.map(({ menuItem, quantity, options }) => ({
        name: menuItem.name,
        nameEn: menuItem.nameEn,
        quantity,
        price: menuItem.price,
        emoji: menuItem.emoji,
        bgColor: menuItem.bgColor,
        options,
      }));
      const total = items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);

      const newOrder: CustomerOrder = {
        id: newOrderId || fallbackNumber,
        items: customerItems,
        total,
        status: 'pending',
        createdAt: new Date(),
        address,
        notes,
        isReceived: false,
      };

      setMyOrders(prev => [newOrder, ...prev]);
      return newOrderId || fallbackNumber;
    } catch (err) {
      console.error('Error placing order in context:', err);
      return fallbackNumber;
    }
  };

  const confirmReceipt = async (orderId: string) => {
    try {
      // 1. Update in Supabase
      const success = await confirmOrderReceipt(orderId);
      
      // 2. Update local state
      if (success) {
        setMyOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: 'delivered', isReceived: true } : o))
        );
      }
    } catch (err) {
      console.error('Failed to confirm receipt in database:', err);
    }
  };

  const submitReview = async (orderId: string, rating: number, reviewText: string) => {
    try {
      const userId = user?.id;
      if (!userId) return;

      // 1. Submit review to Supabase
      const success = await submitOrderReview(orderId, userId, rating, reviewText);

      // 2. Update local state
      if (success) {
        setMyOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, rating, review: reviewText } : o))
        );
      }
    } catch (err) {
      console.error('Failed to submit review in database:', err);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      // 1. Update status in Supabase
      const success = await updateOrderStatus(orderId, 'cancelled', 'User cancelled');

      // 2. Update local state
      if (success) {
        setMyOrders(prev =>
          prev.map(o => (o.id === orderId && o.status === 'pending' ? { ...o, status: 'cancelled' } : o))
        );
      }
    } catch (err) {
      console.error('Failed to cancel order in database:', err);
    }
  };

  return (
    <OrderHistoryContext.Provider
      value={{ myOrders, addOrder, confirmReceipt, submitReview, cancelOrder, loading }}
    >
      {children}
    </OrderHistoryContext.Provider>
  );
}

export const useOrderHistory = () => useContext(OrderHistoryContext);
