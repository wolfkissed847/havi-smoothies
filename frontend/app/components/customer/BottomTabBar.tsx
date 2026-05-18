"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrderHistory } from '../../contexts/OrderHistoryContext';

export function BottomTabBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { count } = useCart();
  const { isLoggedIn } = useAuth();
  const { myOrders } = useOrderHistory();

  // Count orders that need action (ready to confirm OR need rating)
  const actionableOrders = myOrders.filter(
    o => (o.status === 'ready' && !o.isReceived) || (o.status === 'delivered' && o.isReceived && !o.rating)
  ).length;

  const tabs = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/menu', icon: UtensilsCrossed, label: t('menu') },
    { path: '/cart', icon: ShoppingCart, label: t('cart'), badge: count },
    { path: '/my-orders', icon: ClipboardList, label: t('myOrders'), badge: actionableOrders },
    { path: '/login', icon: User, label: t('profile') },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#030d1a] border-t border-[#D8F2FF] dark:border-[#0a2540] safe-area-pb">
      <div className="flex">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex-1 flex flex-col items-center justify-center py-3 relative transition-colors ${
                isActive ? 'text-[#00BDFE]' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#00BDFE] text-white rounded-full flex items-center justify-center" style={{ fontSize: '10px' }}>
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-1" style={{ fontSize: '9px', fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00BDFE] rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}