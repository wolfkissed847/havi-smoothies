"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { CustomerNavbar } from './CustomerNavbar';
import { BottomTabBar } from './BottomTabBar';
import { AIChat } from '../shared/AIChat';

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className="min-h-screen bg-white dark:bg-[#030d1a] flex flex-col">
      <CustomerNavbar />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <BottomTabBar />
      {isHome && <AIChat />}
    </div>
  );
}
