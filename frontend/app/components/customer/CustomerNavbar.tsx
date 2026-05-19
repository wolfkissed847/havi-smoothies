"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Sun, Moon, Globe, User, LogOut, ChevronDown, ClipboardList } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrderHistory } from '../../contexts/OrderHistoryContext';

export function CustomerNavbar() {
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { count } = useCart();
  const { user, logout, isLoggedIn } = useAuth();
  const { myOrders } = useOrderHistory();
  const router = useRouter();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const actionableOrders = myOrders.filter(
    o => (o.status === 'ready' && !o.isReceived) || (o.status === 'delivered' && o.isReceived && !o.rating)
  ).length;

  const navLinks = [
    { path: '/', label: t('home') },
    { path: '/menu', label: t('menu') },
    { path: '/my-orders', label: t('myOrders'), badge: actionableOrders },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-[#030d1a]/90 backdrop-blur-md border-b border-[#D8F2FF] dark:border-[#0a2540]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#00BDFE] flex items-center justify-center">
              <span className="text-white text-lg">🍹</span>
            </div>
            <span className="text-[#00BDFE] font-semibold tracking-tight">Havi-Smoothies</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.path}
                href={link.path}
                className={`relative text-sm transition-colors ${
                  pathname === link.path
                    ? 'text-[#00BDFE] font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#00BDFE]'
                }`}
              >
                {link.label}
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-3 w-4 h-4 bg-[#00BDFE] text-white rounded-full flex items-center justify-center" style={{ fontSize: '9px' }}>
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-[#D8F2FF] dark:hover:bg-[#0a2540] transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex w-9 h-9 rounded-lg items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#D8F2FF] dark:hover:bg-[#0a2540] transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <div className="w-4 h-4" />}
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-[#D8F2FF] dark:hover:bg-[#0a2540] transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00BDFE] text-white rounded-full flex items-center justify-center" style={{ fontSize: '11px' }}>
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* User Menu (Desktop) */}
            <div className="hidden md:block relative">
              {isLoggedIn ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#D8F2FF] dark:hover:bg-[#0a2540] transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#00BDFE] flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-xl bg-[#00BDFE] text-white text-sm hover:bg-[#00CBFE] transition-colors"
                >
                  {t('login')}
                </Link>
              )}
              {userMenuOpen && isLoggedIn && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#0d1f35] rounded-xl shadow-lg border border-[#D8F2FF] dark:border-[#0a2540] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E8F5FF] dark:border-[#0a2540]">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name}</p>
                    <p className="text-gray-400" style={{ fontSize: '12px' }}>{user?.username || user?.name}</p>
                  </div>
                  <Link
                    href="/my-orders"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-[#F0FBFF] dark:hover:bg-[#0a2540]"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <ClipboardList className="w-4 h-4 text-[#00BDFE]" />
                    {t('myOrders')}
                    {actionableOrders > 0 && (
                      <span className="ml-auto w-5 h-5 bg-[#00BDFE] text-white rounded-full flex items-center justify-center" style={{ fontSize: '10px' }}>
                        {actionableOrders}
                      </span>
                    )}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-[#F0FBFF] dark:hover:bg-[#0a2540]"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t('adminPanel')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
