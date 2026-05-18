"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ChevronRight,
  Star,
  Zap,
  Leaf,
  Search,
  Clock,
  Truck,
  Shield,
  Heart,
  Sparkles,
  TrendingUp,
  Quote,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { menuItems, MenuItem } from '../data/mockData';
import { OrderOptionsModal } from '../components/customer/OrderOptionsModal';

function MenuCard({ item, onOrder }: { item: MenuItem; onOrder: (item: MenuItem) => void }) {
  const { isEn } = useLanguage();
  return (
    <div className="group bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] overflow-hidden hover:border-[#84E4F7] dark:hover:border-[#00BDFE]/40 transition-all hover:shadow-lg hover:-translate-y-1">
      <div
        className="relative flex items-center justify-center h-36 overflow-hidden cursor-pointer"
        style={{ background: item.bgColor }}
        onClick={() => onOrder(item)}
      >
        <span
          className="select-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"
          style={{ fontSize: '68px', lineHeight: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.10))' }}
        >
          {item.emoji}
        </span>
        {item.isNew && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#00BDFE] text-white text-xs font-medium shadow-sm">ใหม่</span>
        )}
        {item.isFeatured && !item.isNew && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-white text-xs font-medium shadow-sm">⭐ ขายดี</span>
        )}
        <button
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Heart className="w-3.5 h-3.5 text-[#00BDFE]" />
        </button>
      </div>
      <div className="p-3">
        <p className="font-medium text-gray-800 dark:text-white text-sm">{isEn ? item.nameEn : item.name}</p>
        <p className="text-gray-400 mt-0.5 line-clamp-1" style={{ fontSize: '12px' }}>
          {isEn ? item.descriptionEn : item.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[#00BDFE] font-semibold text-sm">฿{item.price}</span>
          <button
            onClick={() => onOrder(item)}
            className="px-3 py-1.5 rounded-xl bg-[#00BDFE] text-white text-xs font-medium hover:bg-[#00CBFE] transition-colors active:scale-95"
          >
            สั่งเลย
          </button>
        </div>
      </div>
    </div>
  );
}

function FloatingEmoji({ emoji, top, left, delay, size = 32 }: { emoji: string; top: string; left: string; delay: number; size?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ top, left, fontSize: size, filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))' }}
      animate={{ y: [0, -14, 0], rotate: [0, 8, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      {emoji}
    </motion.div>
  );
}

export function HomePage() {
  const { t, isEn } = useLanguage();
  const [orderingItem, setOrderingItem] = useState<MenuItem | null>(null);
  const [search, setSearch] = useState('');

  const featuredItems = menuItems.filter(m => m.isFeatured).slice(0, 4);
  const newItems = menuItems.filter(m => m.isNew).slice(0, 4);
  const dailySpecial = menuItems.find(m => m.isFeatured) ?? menuItems[0];

  const categories = [
    { key: 'fruit', label: t('fruit'), emoji: '🍊', count: menuItems.filter(m => m.category === 'fruit').length, bg: 'linear-gradient(135deg, #FFF4D6 0%, #FFE4A0 100%)' },
    { key: 'vegetable', label: t('vegetable'), emoji: '🥕', count: menuItems.filter(m => m.category === 'vegetable').length, bg: 'linear-gradient(135deg, #DFFFD6 0%, #B6F5A4 100%)' },
  ];

  const benefits = [
    { icon: Truck, title: isEn ? 'Free Delivery' : 'ส่งฟรี', desc: isEn ? 'Orders over ฿199' : 'ออเดอร์ 199฿ ขึ้นไป' },
    { icon: Clock, title: isEn ? '20 min Express' : 'ส่งใน 20 นาที', desc: isEn ? 'Lightning fast' : 'ส่งไวทันใจ' },
    { icon: Shield, title: isEn ? 'Quality Guarantee' : 'รับประกันคุณภาพ', desc: isEn ? 'Or your money back' : 'ไม่พอใจคืนเงิน' },
    { icon: Leaf, title: isEn ? '100% Natural' : 'ธรรมชาติแท้', desc: isEn ? 'No preservatives' : 'ไม่ใส่สารกันบูด' },
  ];

  const testimonials = [
    { name: 'คุณนิว', emoji: '👩', text: isEn ? 'Best fresh juice in town! Always my morning routine.' : 'อร่อยสุดในย่านนี้! ติดใจทุกครั้งที่สั่ง', rating: 5 },
    { name: 'คุณบาส', emoji: '👨', text: isEn ? 'Super fast delivery, fruits taste so fresh.' : 'ส่งไวมาก รสชาติสดจริง ๆ', rating: 5 },
    { name: 'คุณมิ้น', emoji: '🧑', text: isEn ? 'Love the variety and the cute packaging!' : 'มีให้เลือกเยอะมาก แพ็กเกจน่ารักด้วย', rating: 5 },
  ];

  // Promo countdown
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 23, s: 47 });
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 5; m = 23; s = 47; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden mx-4 mt-4 md:mx-6 rounded-3xl">
        <div
          className="relative h-[420px] md:h-[460px] rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #00BDFE 0%, #5ADEFF 50%, #84E4F7 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 w-60 h-60 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)', backgroundSize: '22px 22px', opacity: 0.4 }} />

          {/* Floating emojis */}
          <FloatingEmoji emoji="🍊" top="12%" left="62%" delay={0} size={56} />
          <FloatingEmoji emoji="🥝" top="55%" left="78%" delay={1.5} size={48} />
          <FloatingEmoji emoji="🍓" top="72%" left="58%" delay={0.8} size={44} />
          <FloatingEmoji emoji="🍋" top="22%" left="84%" delay={2.2} size={40} />
          <FloatingEmoji emoji="🥕" top="40%" left="50%" delay={1.2} size={36} />

          <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/25 backdrop-blur-sm border border-white/30 mb-4 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-xs font-medium">{isEn ? '100% Cold-Pressed' : 'สดคั้นใหม่ทุกแก้ว'}</span>
              </div>
              <h1 className="text-white mb-3" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', lineHeight: 1.1 }}>
                {isEn ? (
                  <>Sip the<br /><span className="italic">Freshness</span> 🍹</>
                ) : (
                  <>จิบความสด<br /><span className="italic">จากธรรมชาติ</span> 🍹</>
                )}
              </h1>
              <p className="text-white/90 mb-6 max-w-md" style={{ fontSize: '15px' }}>
                {isEn
                  ? 'Hand-picked fruits & veggies, blended fresh and delivered in 20 minutes.'
                  : 'คัดผลไม้และผักสด ๆ คั้นใหม่ ส่งถึงมือคุณภายใน 20 นาที'}
              </p>

              {/* Search bar */}
              <div className="bg-white rounded-2xl p-1.5 flex items-center gap-1 shadow-xl max-w-md mb-5">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={isEn ? 'Search juice, fruit...' : 'ค้นหาน้ำผลไม้, ผัก...'}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 py-2"
                  />
                </div>
                <Link href={search ? `/menu?q=${encodeURIComponent(search)}` : '/menu'}
                  className="px-4 py-2 rounded-xl bg-[#00BDFE] text-white text-sm font-medium hover:bg-[#00CBFE] transition-colors"
                >
                  {t('exploreMenu')}
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex items-center gap-4 text-white/90 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    {['👩', '🧑', '👨'].map((e, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-white flex items-center justify-center border-2 border-white" style={{ fontSize: 14 }}>{e}</div>
                    ))}
                  </div>
                  <span>{isEn ? '10K+ happy customers' : 'ลูกค้ากว่า 10,000 คน'}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span className="font-semibold">4.9</span>
                  <span className="opacity-80">/ 5</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="mx-4 md:mx-6 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-3 flex items-center gap-3 hover:border-[#84E4F7] hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #D8F2FF 0%, #84E4F7 100%)' }}>
                  <Icon className="w-5 h-5 text-[#00BDFE]" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-800 dark:text-white font-medium text-sm truncate">{b.title}</p>
                  <p className="text-gray-400 truncate" style={{ fontSize: '11px' }}>{b.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Daily Special + Promo Countdown */}
      <section className="mx-4 md:mx-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Special */}
        <div
          className="lg:col-span-2 relative overflow-hidden rounded-3xl p-6 md:p-8 flex items-center gap-4 cursor-pointer group"
          style={{ background: 'linear-gradient(135deg, #FFF4D6 0%, #FFD9A0 60%, #FFB7B7 100%)' }}
          onClick={() => setOrderingItem(dailySpecial)}
        >
          <div className="flex-1 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 backdrop-blur-sm mb-3">
              <TrendingUp className="w-3 h-3 text-[#FF6B6B]" />
              <span className="text-[#FF6B6B] text-xs font-semibold">{isEn ? "Today's Special" : 'พิเศษวันนี้'}</span>
            </div>
            <h3 className="text-gray-900 mb-1" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
              {isEn ? dailySpecial.nameEn : dailySpecial.name}
            </h3>
            <p className="text-gray-700/80 text-sm mb-4 max-w-sm line-clamp-2">
              {isEn ? dailySpecial.descriptionEn : dailySpecial.description}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-[#FF6B6B] font-bold" style={{ fontSize: '24px' }}>฿{Math.round(dailySpecial.price * 0.8)}</span>
                <span className="text-gray-500 line-through text-sm">฿{dailySpecial.price}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FF6B6B] text-white text-xs font-semibold">-20%</span>
              </div>
            </div>
            <button className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors">
              {t('orderNow')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <motion.div
            className="relative z-10 select-none flex-shrink-0"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ fontSize: 'clamp(80px, 14vw, 140px)', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))' }}
          >
            {dailySpecial.emoji}
          </motion.div>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20" />
          <div className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full bg-white/15" />
        </div>

        {/* Promo Countdown */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 text-white flex flex-col justify-between"
          style={{ background: 'linear-gradient(135deg, #00BDFE 0%, #0091cc 100%)' }}
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-3">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-semibold">{isEn ? 'Flash Sale' : 'แฟลชเซล'}</span>
            </div>
            <h3 className="mb-1" style={{ fontSize: '20px' }}>
              {isEn ? 'Free delivery today!' : 'ส่งฟรีวันนี้เท่านั้น!'}
            </h3>
            <p className="text-white/85 text-sm mb-4">
              {isEn ? 'Use code HAVISMOOTHIES at checkout' : 'ใช้โค้ด HAVISMOOTHIES'}
            </p>
            <div className="flex gap-2 mb-4">
              {[
                { v: timeLeft.h, l: isEn ? 'HRS' : 'ชม.' },
                { v: timeLeft.m, l: isEn ? 'MIN' : 'นาที' },
                { v: timeLeft.s, l: isEn ? 'SEC' : 'วิ' },
              ].map((t, i) => (
                <div key={i} className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl py-2 text-center">
                  <p className="font-bold tabular-nums" style={{ fontSize: '22px', lineHeight: 1 }}>
                    {String(t.v).padStart(2, '0')}
                  </p>
                  <p className="text-white/80 mt-1" style={{ fontSize: '10px' }}>{t.l}</p>
                </div>
              ))}
            </div>
            <Link href="/menu"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#00BDFE] text-sm font-semibold hover:bg-[#F0FBFF] transition-colors"
            >
              {t('orderNow')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute -bottom-6 -right-6 select-none" style={{ fontSize: '120px', opacity: 0.18 }}>🎁</div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-4 md:mx-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-gray-800 dark:text-white" style={{ fontSize: '20px' }}>{t('categories')}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{isEn ? 'Browse by what you love' : 'เลือกตามที่คุณชอบ'}</p>
          </div>
          <Link href="/menu" className="flex items-center gap-1 text-[#00BDFE] text-sm hover:underline">
            {t('seeAll')} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.key}
              href={`/menu?cat=${cat.key}`}
              className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] hover:shadow-md transition-all"
              style={{ background: cat.bg }}
            >
              <div className="relative z-10">
                <p className="text-gray-800 font-semibold" style={{ fontSize: '17px' }}>{cat.label}</p>
                <p className="text-gray-700/70 text-sm">{cat.count} {isEn ? 'items' : 'รายการ'}</p>
                <div className="inline-flex items-center gap-1 mt-2 text-gray-800 text-sm font-medium">
                  {isEn ? 'Browse' : 'ดูเลย'} <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="ml-auto select-none" style={{ fontSize: '64px', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))' }}>
                {cat.emoji}
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/30" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Menu */}
      <section className="mx-4 md:mx-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-gray-800 dark:text-white" style={{ fontSize: '18px' }}>{t('featuredMenu')}</h2>
              <p className="text-gray-400" style={{ fontSize: '12px' }}>{isEn ? 'Customer favorites' : 'ที่ลูกค้าหลงรัก'}</p>
            </div>
          </div>
          <Link href="/menu" className="flex items-center gap-1 text-[#00BDFE] text-sm hover:underline">
            {t('seeAll')} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {featuredItems.map(item => (
            <MenuCard key={item.id} item={item} onOrder={setOrderingItem} />
          ))}
        </div>
      </section>

      {/* New Items */}
      <section className="mx-4 md:mx-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5FF] dark:bg-[#0a2540] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#00BDFE]" />
            </div>
            <div>
              <h2 className="text-gray-800 dark:text-white" style={{ fontSize: '18px' }}>{t('newMenu')}</h2>
              <p className="text-gray-400" style={{ fontSize: '12px' }}>{isEn ? 'Just landed' : 'มาใหม่ล่าสุด'}</p>
            </div>
          </div>
          <Link href="/menu" className="flex items-center gap-1 text-[#00BDFE] text-sm hover:underline">
            {t('seeAll')} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {newItems.map(item => (
            <MenuCard key={item.id} item={item} onOrder={setOrderingItem} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-4 md:mx-6 mt-10">
        <div className="text-center mb-6">
          <h2 className="text-gray-800 dark:text-white" style={{ fontSize: '20px' }}>
            {isEn ? 'How it works' : 'สั่งง่าย ๆ 3 ขั้นตอน'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isEn ? 'Fresh juice in three simple steps' : 'รับน้ำผลไม้สด ๆ ใน 3 ขั้นตอน'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { step: '01', emoji: '📱', title: isEn ? 'Choose your drink' : 'เลือกเมนูที่ชอบ', desc: isEn ? 'Browse 18+ fresh menus' : 'เลือกจากเมนูสด 18+ รายการ' },
            { step: '02', emoji: '🥤', title: isEn ? 'We blend it fresh' : 'เราคั้นสดใหม่', desc: isEn ? 'Cold-pressed on order' : 'คั้นใหม่ทุกออเดอร์' },
            { step: '03', emoji: '🛵', title: isEn ? 'Delivered fast' : 'ส่งถึงมือคุณ', desc: isEn ? 'In 20 minutes or less' : 'ภายใน 20 นาที' },
          ].map((s, i) => (
            <div key={i} className="relative bg-white dark:bg-[#060f1e] border border-[#E8F5FF] dark:border-[#0a2540] rounded-2xl p-5 hover:border-[#84E4F7] hover:shadow-md transition-all">
              <div className="absolute top-4 right-4 text-[#E8F5FF] dark:text-[#0a2540] font-bold" style={{ fontSize: '36px', lineHeight: 1 }}>{s.step}</div>
              <div className="text-4xl mb-3 select-none">{s.emoji}</div>
              <p className="text-gray-800 dark:text-white font-semibold mb-1">{s.title}</p>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-4 md:mx-6 mt-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-gray-800 dark:text-white" style={{ fontSize: '20px' }}>
              {isEn ? 'Loved by customers' : 'รีวิวจากลูกค้า'}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">{isEn ? 'Real words from real sippers' : 'เสียงจริงจากผู้ใช้จริง'}</p>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-gray-800 dark:text-white font-semibold">4.9</span>
            <span className="text-gray-400">({isEn ? '2,341 reviews' : '2,341 รีวิว'})</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {testimonials.map((tt, i) => (
            <div key={i} className="bg-white dark:bg-[#060f1e] border border-[#E8F5FF] dark:border-[#0a2540] rounded-2xl p-5 relative">
              <Quote className="absolute top-4 right-4 w-6 h-6 text-[#E8F5FF] dark:text-[#0a2540]" />
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: tt.rating }).map((_, k) => (
                  <Star key={k} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">"{tt.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#E8F5FF] dark:bg-[#0a2540] flex items-center justify-center" style={{ fontSize: 18 }}>
                  {tt.emoji}
                </div>
                <div>
                  <p className="text-gray-800 dark:text-white font-medium text-sm">{tt.name}</p>
                  <p className="text-gray-400" style={{ fontSize: '11px' }}>{isEn ? 'Verified buyer' : 'ลูกค้ายืนยันแล้ว'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-4 md:mx-6 mt-10">
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center"
          style={{ background: 'linear-gradient(135deg, #D8F2FF 0%, #84E4F7 50%, #00BDFE 100%)' }}
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-white/15" />
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs font-semibold">{isEn ? 'Limited time' : 'จำกัดเวลา'}</span>
            </div>
            <h3 className="text-white mb-2" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', lineHeight: 1.15 }}>
              {isEn ? 'Ready for your daily dose of fresh?' : 'พร้อมรับความสดของวันนี้แล้วหรือยัง?'}
            </h3>
            <p className="text-white/90 mb-5 text-sm">
              {isEn ? 'Join 10,000+ customers and get your first delivery on us.' : 'ลูกค้ากว่า 10,000 คนเลือกเรา ออเดอร์แรกส่งฟรี!'}
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Link href="/menu"
                className="px-5 py-2.5 rounded-xl bg-white text-[#00BDFE] font-semibold text-sm hover:bg-[#F0FBFF] transition-colors shadow-md"
              >
                {t('exploreMenu')}
              </Link>
              <Link href="/menu"
                className="px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold text-sm hover:bg-white/30 transition-colors border border-white/40"
              >
                {t('orderNow')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {orderingItem && (
        <OrderOptionsModal item={orderingItem} onClose={() => setOrderingItem(null)} />
      )}
    </div>
  );
}


export default HomePage;
