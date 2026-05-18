"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CheckCircle, Clock, Home, Package } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function OrderConfirmationPage() {
  const { t, isEn } = useLanguage();
  const [orderNum] = useState(() => `ORD-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { label: isEn ? 'Order Received' : 'รับออเดอร์แล้ว', icon: '✅' },
    { label: isEn ? 'Preparing' : 'กำลังเตรียม', icon: '🥤' },
    { label: isEn ? 'Out for Delivery' : 'กำลังจัดส่ง', icon: '🛵' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D8F2FF] via-white to-[#F0FBFF] dark:from-[#030d1a] dark:via-[#060f1e] dark:to-[#030d1a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {/* Animated Check */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mx-auto mb-6 w-32 h-32"
        >
          {/* Outer ring animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'loop', delay: 0.5 }}
            className="absolute inset-0 rounded-full bg-[#00BDFE]/20"
          />
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00BDFE] to-[#5ADEFF] flex items-center justify-center shadow-lg shadow-[#00BDFE]/30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            >
              <CheckCircle className="w-16 h-16 text-white" strokeWidth={1.5} />
            </motion.div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-gray-800 dark:text-white mb-2">{t('orderSuccess')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('orderSuccessDesc')}</p>
        </motion.div>

        {/* Order Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#D8F2FF] dark:border-[#0a2540] p-5 mt-6 text-left"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">{t('orderNumber')}</p>
              <p className="text-gray-800 dark:text-white font-semibold">{orderNum}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs mb-0.5">{t('estimatedTime')}</p>
              <div className="flex items-center gap-1 text-[#00BDFE] font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>25-30 {t('minutes')}</span>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-2">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: step > i ? 1 : 0.3, x: 0 }}
                transition={{ delay: 0.8 + i * 0.2 }}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                  step > i ? 'bg-[#D8F2FF] dark:bg-[#00BDFE]/10' : 'bg-gray-50 dark:bg-[#0a1828]'
                }`}
              >
                <span className="text-lg">{s.icon}</span>
                <span className={`text-sm ${step > i ? 'text-[#00BDFE] font-medium' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {step > i && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <CheckCircle className="w-4 h-4 text-[#00BDFE]" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Floating Emojis */}
        <div className="relative h-12 my-2">
          {['🍊', '🍉', '🥭', '🍓'].map((emoji, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: -40 }}
              transition={{ delay: 0.8 + i * 0.3, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="absolute text-xl"
              style={{ left: `${20 + i * 20}%` }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex gap-3 mt-2"
        >
          <Link href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00BDFE] text-white text-sm font-medium hover:bg-[#00CBFE] transition-colors"
          >
            <Home className="w-4 h-4" />
            {t('backToHome')}
          </Link>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#00BDFE]/30 text-[#00BDFE] text-sm hover:bg-[#D8F2FF] dark:hover:bg-[#00BDFE]/10 transition-colors">
            <Package className="w-4 h-4" />
            {t('trackOrder')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}


export default OrderConfirmationPage;
