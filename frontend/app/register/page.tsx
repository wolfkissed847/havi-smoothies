"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirm) {
      setError('รหัสผ่านไม่ตรงกัน / Passwords do not match');
      return;
    }
    
    setLoading(true);

    // Auto-append @gmail.com if they typed a username without @
    let signupEmail = form.email.trim();
    if (!signupEmail.includes('@')) {
      signupEmail = `${signupEmail}@gmail.com`;
    }

    const res = await register(form.name, signupEmail, form.phone, form.password);
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setError(res.error || 'สมัครสมาชิกไม่สำเร็จ / Registration failed');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#D8F2FF] via-white to-[#F0FBFF] dark:from-[#030d1a] dark:via-[#060f1e] dark:to-[#030d1a] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-[#00BDFE] mx-auto mb-4" />
          <h2 className="text-gray-800 dark:text-white mb-2">สมัครสมาชิกสำเร็จ!</h2>
          <p className="text-gray-500 text-sm">กำลังพาไปหน้าเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#D8F2FF] via-white to-[#F0FBFF] dark:from-[#030d1a] dark:via-[#060f1e] dark:to-[#030d1a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00BDFE] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('login')}
        </Link>

        <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#D8F2FF] dark:border-[#0a2540] p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#D8F2FF] dark:bg-[#00BDFE]/15 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🍹</span>
            </div>
            <h1 className="text-gray-800 dark:text-white">{t('registerTitle')}</h1>
            <p className="text-gray-400 text-sm mt-1">{t('registerSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('fullName')}</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="ชื่อ-นามสกุล"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white outline-none focus:border-[#00BDFE] transition-colors text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('userLabel')}</label>
              <input
                name="email"
                type="text"
                value={form.email}
                onChange={handleChange}
                placeholder="user"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white outline-none focus:border-[#00BDFE] transition-colors text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('phone')}</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="08X-XXX-XXXX"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white outline-none focus:border-[#00BDFE] transition-colors text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('passwordLabel')}</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white outline-none focus:border-[#00BDFE] transition-colors text-sm pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">{t('confirmPassword')}</label>
              <input
                name="confirm"
                type={showPass ? 'text' : 'password'}
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white outline-none focus:border-[#00BDFE] transition-colors text-sm"
                required
              />
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
              {loading ? t('loading') : t('register')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('haveAccount')}{' '}
            <Link href="/login" className="text-[#00BDFE] hover:underline font-medium">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


export default RegisterPage;
