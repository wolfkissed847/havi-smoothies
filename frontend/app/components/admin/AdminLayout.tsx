"use client";

import React, { useState } from 'react';
import { redirect } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { AIChat } from '../shared/AIChat';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdmin) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#F8FBFF] dark:bg-[#030d1a] flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* AI Chat - always visible for admin */}
      <AIChat />
    </div>
  );
}
