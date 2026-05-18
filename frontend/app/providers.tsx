"use client";

import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OrderHistoryProvider } from './contexts/OrderHistoryContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <OrderHistoryProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </OrderHistoryProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
