"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Sun, Moon, Globe, Bell, LogOut, ExternalLink } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface AdminTopBarProps {
  onMenuClick: () => void;
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-[#060f1e] border-b border-[#D8F2FF] dark:border-[#0a2540] px-4 md:px-6">
      <div className="flex items-center justify-between h-14">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-[#D8F2FF] dark:hover:bg-[#0a2540]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center">
          <p className="text-sm text-gray-400">{t('adminPanel')}</p>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {/* View Customer Site */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#00BDFE] border border-[#00BDFE]/30 hover:bg-[#D8F2FF] dark:hover:bg-[#00BDFE]/10 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Site</span>
          </Link>

          {/* Language */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-[#D8F2FF] dark:hover:bg-[#0a2540] transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#D8F2FF] dark:hover:bg-[#0a2540] transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notification */}
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-[#D8F2FF] dark:hover:bg-[#0a2540] transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
