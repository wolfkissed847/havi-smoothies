"use client";
import React, { createContext, useContext, useState } from 'react';
import { CustomerOrder, CustomerOrderItem, mockCustomerOrders } from '../data/mockData';
import { OrderItem } from './CartContext';

interface OrderHistoryContextType {
  myOrders: CustomerOrder[];
  addOrder: (items: OrderItem[], address: string, notes: string) => string;
  confirmReceipt: (orderId: string) => void;
  submitReview: (orderId: string, rating: number, review: string) => void;
  cancelOrder: (orderId: string) => void;
}

const OrderHistoryContext = createContext<OrderHistoryContextType>({
  myOrders: [],
  addOrder: () => '',
  confirmReceipt: () => {},
  submitReview: () => {},
  cancelOrder: () => {},
});

export function OrderHistoryProvider({ children }: { children: React.ReactNode }) {
  const [myOrders, setMyOrders] = useState<CustomerOrder[]>(mockCustomerOrders);

  const addOrder = (items: OrderItem[], address: string, notes: string): string => {
    const id = `FS-${Date.now().toString().slice(-6)}`;
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
      id,
      items: customerItems,
      total,
      status: 'pending',
      createdAt: new Date(),
      address,
      notes,
      isReceived: false,
    };
    setMyOrders(prev => [newOrder, ...prev]);
    return id;
  };

  const confirmReceipt = (orderId: string) => {
    setMyOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, status: 'delivered', isReceived: true } : o
      )
    );
  };

  const submitReview = (orderId: string, rating: number, review: string) => {
    setMyOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, rating, review } : o
      )
    );
  };

  const cancelOrder = (orderId: string) => {
    setMyOrders(prev =>
      prev.map(o =>
        o.id === orderId && o.status === 'pending' ? { ...o, status: 'cancelled' } : o
      )
    );
  };

  return (
    <OrderHistoryContext.Provider value={{ myOrders, addOrder, confirmReceipt, submitReview, cancelOrder }}>
      {children}
    </OrderHistoryContext.Provider>
  );
}

export const useOrderHistory = () => useContext(OrderHistoryContext);

