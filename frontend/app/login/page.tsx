"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      router.push('/');
    } else {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง / Invalid email or password');
    }
  };

  const demoLogin = async (type: 'admin' | 'user') => {
    setLoading(true);
    if (type === 'admin') {
      await login('admin@havi-smoothies.com', 'admin123');
      router.push('/admin');
    } else {
      await login('user@havi-smoothies.com', 'user123');
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D8F2FF] via-white to-[#F0FBFF] dark:from-[#030d1a] dark:via-[#060f1e] dark:to-[#030d1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00BDFE] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('home')}
        </Link>

        <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#D8F2FF] dark:border-[#0a2540] p-8 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#D8F2FF] dark:bg-[#00BDFE]/15 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🍹</span>
            </div>
            <h1 className="text-gray-800 dark:text-white">{t('loginTitle')}</h1>
            <p className="text-gray-400 text-sm mt-1">{t('loginSubtitle')}</p>
          </div>

          {/* Demo Credentials Info */}
          <div className="mb-6 p-3 rounded-xl bg-[#D8F2FF] dark:bg-[#00BDFE]/10 border border-[#84E4F7] dark:border-[#00BDFE]/20">
            <p className="text-[#00BDFE] text-xs font-medium mb-1">Demo Accounts:</p>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }}>Admin: admin@havi-smoothies.com / admin123</p>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }}>User: user@havi-smoothies.com / user123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('emailLabel')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white outline-none focus:border-[#00BDFE] transition-colors text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('passwordLabel')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white outline-none focus:border-[#00BDFE] transition-colors text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-1">
                <button type="button" className="text-[#00BDFE] hover:underline" style={{ fontSize: '12px' }}>
                  {t('forgotPassword')}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#00BDFE] text-white font-medium hover:bg-[#00CBFE] transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? t('loading') : t('login')}
            </button>
          </form>

          {/* Quick Demo Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => demoLogin('user')}
              className="py-2.5 rounded-xl border border-[#00BDFE]/40 text-[#00BDFE] hover:bg-[#D8F2FF] dark:hover:bg-[#00BDFE]/10 transition-colors text-sm"
            >
              Demo User
            </button>
            <button
              onClick={() => demoLogin('admin')}
              className="py-2.5 rounded-xl bg-[#D8F2FF] dark:bg-[#00BDFE]/15 text-[#00BDFE] hover:bg-[#C0E8F8] dark:hover:bg-[#00BDFE]/25 transition-colors text-sm font-medium"
            >
              Demo Admin
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-[#00BDFE] hover:underline font-medium">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


export default LoginPage;
