"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, BarChart2, Settings, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('dashboard'), end: true },
    { path: '/admin/orders', icon: ClipboardList, label: t('orders') },
    { path: '/admin/menu', icon: UtensilsCrossed, label: t('menuManagement') },
    { path: '/admin/reports', icon: BarChart2, label: t('reports') },
    { path: '/admin/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-30 w-64 bg-white dark:bg-[#060f1e] border-r border-[#D8F2FF] dark:border-[#0a2540] flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#D8F2FF] dark:border-[#0a2540]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#00BDFE] flex items-center justify-center">
            <span className="text-white text-xl">🍹</span>
          </div>
          <div>
            <p className="text-[#00BDFE] font-semibold tracking-tight text-sm">Havi-Smoothies</p>
            <p className="text-gray-400" style={{ fontSize: '11px' }}>{t('adminPanel')}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-[#D8F2FF] dark:hover:bg-[#0a2540]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.end ? pathname === item.path : pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-[#D8F2FF] dark:bg-[#00BDFE]/15 text-[#00BDFE] font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-[#F0FBFF] dark:hover:bg-[#0a2540] hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-[#D8F2FF] dark:border-[#0a2540]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#00BDFE] flex items-center justify-center">
            <span className="text-white text-xs font-semibold">AD</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">แอดมิน ร้าน</p>
            <p className="text-gray-400" style={{ fontSize: '11px' }}>admin@havi-smoothies.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}