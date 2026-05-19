"use client";
import React, { useEffect, useState } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, ShoppingBag, ReceiptText, ArrowUpRight, ArrowDownRight, Clock,
  Users, Sparkles, Activity, Package, ChevronRight, GlassWater, Star
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllOrders, getMenuItems } from '../lib/db';
import { CustomerOrder, OrderStatus, MenuItem } from '../lib/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  preparing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  delivered: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS_TH: Record<string, string> = {
  pending: 'รอดำเนินการ', preparing: 'กำลังเตรียม', ready: 'พร้อมส่ง', delivered: 'จัดส่งแล้ว', cancelled: 'ยกเลิก',
};
const STATUS_LABELS_EN: Record<string, string> = {
  pending: 'Pending', preparing: 'Preparing', ready: 'Ready', delivered: 'Delivered', cancelled: 'Cancelled',
};

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function StatCard({ icon, label, value, sub, growth, gradient, delay = 0, prefix = '', decimals = 0 }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  growth?: number;
  gradient: string;
  delay?: number;
  prefix?: string;
  decimals?: number;
}) {
  const display = useCountUp(value);
  const positive = (growth ?? 0) >= 0;
  const formattedValue = decimals > 0 
    ? display.toFixed(decimals) 
    : Math.round(display).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5 overflow-hidden hover:shadow-lg hover:border-[#84E4F7] dark:hover:border-[#00BDFE]/40 transition-all"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10" style={{ background: gradient }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.15, type: 'spring', stiffness: 200 }}
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: gradient }}
          >
            {icon}
          </motion.div>
          {growth !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.4 }}
              className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full ${positive ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
              style={{ fontSize: '11px' }}
            >
              {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span className="font-semibold">{Math.abs(growth)}%</span>
            </motion.div>
          )}
        </div>
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-gray-800 dark:text-white font-bold tabular-nums" style={{ fontSize: '1.5rem' }}>
          {prefix}{formattedValue}
        </p>
        {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#0d1f35] border border-[#D8F2FF] dark:border-[#1e3a5f] rounded-xl px-3 py-2 shadow-xl">
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="text-[#00BDFE] font-semibold text-sm">฿{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const { t, isEn } = useLanguage();
  const [chartMode, setChartMode] = useState<'hour' | 'week'>('hour');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dbOrders, dbMenuItems] = await Promise.all([
          getAllOrders(),
          getMenuItems()
        ]);
        setOrders(dbOrders);
        setMenuItems(dbMenuItems);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = new Date();
  const isToday = (d: Date) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  
  const todayOrders = orders.filter(o => isToday(o.createdAt));
  const todaySales = todayOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const totalOrdersToday = todayOrders.length;
  const avgPerOrder = totalOrdersToday > 0 ? Math.round(todaySales / totalOrdersToday) : 0;
  
  const recentOrders = [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
  const liveOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length;

  const reviewedOrders = orders.filter(o => typeof o.rating === 'number' && o.rating > 0);
  const reviewCount = reviewedOrders.length;
  const averageRating = reviewCount > 0 ? reviewedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / reviewCount : 0.0;

  // Calculate dynamic hourly/weekly chart data based on real Supabase orders
  let chartData: { label: string; sales: number }[] = [];

  if (chartMode === 'hour') {
    // 2-hour slots for today
    const hours = [8, 10, 12, 14, 16, 18, 20, 22];
    chartData = hours.map(h => {
      const label = `${h.toString().padStart(2, '0')}:00`;
      let sales = 0;
      todayOrders.forEach(o => {
        const orderHour = o.createdAt.getHours();
        if (o.status !== 'cancelled' && orderHour >= h && orderHour < h + 2) {
          sales += o.total;
        }
      });
      return { label, sales };
    });
  } else {
    // Last 7 days
    const daysTh = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = isEn ? daysEn[d.getDay()] : daysTh[d.getDay()];
      
      let sales = 0;
      orders.forEach(o => {
        if (o.status !== 'cancelled' && o.createdAt.toDateString() === d.toDateString()) {
          sales += o.total;
        }
      });
      return { label, sales };
    });
  }

  // Calculate Category Mix Donut dynamic data
  const categoryMap = new Map<string, 'fruit' | 'vegetable'>();
  menuItems.forEach(item => {
    categoryMap.set(item.name.toLowerCase().trim(), item.category);
    categoryMap.set(item.nameEn.toLowerCase().trim(), item.category);
  });

  let fruitCount = 0;
  let vegetableCount = 0;

  orders.forEach(order => {
    if (order.status !== 'cancelled') {
      order.items.forEach(item => {
        const category = categoryMap.get(item.name.toLowerCase().trim()) || 
                         categoryMap.get(item.nameEn.toLowerCase().trim()) || 
                         (item.name.includes('ผัก') || item.nameEn.toLowerCase().includes('veggie') || item.nameEn.toLowerCase().includes('green') ? 'vegetable' : 'fruit');
        
        if (category === 'fruit') {
          fruitCount += item.quantity;
        } else {
          vegetableCount += item.quantity;
        }
      });
    }
  });

  const totalMix = fruitCount + vegetableCount;
  const fruitPercent = totalMix > 0 ? Math.round((fruitCount / totalMix) * 100) : 0;
  const vegetablePercent = totalMix > 0 ? 100 - fruitPercent : 0;

  const categoryMixData = totalMix > 0 ? [
    { name: isEn ? 'Fruit' : 'ผลไม้', value: fruitPercent, color: '#f97316' },
    { name: isEn ? 'Vegetable' : 'ผัก', value: vegetablePercent, color: '#22c55e' },
  ] : [];

  // Calculate dynamic Top Sellers from orders
  const itemSales: Record<string, { name: string; nameEn: string; emoji: string; count: number; sales: number }> = {};
  
  orders.forEach(order => {
    if (order.status !== 'cancelled') {
      order.items.forEach(item => {
        const key = item.name.toLowerCase().trim();
        if (!itemSales[key]) {
          itemSales[key] = {
            name: item.name,
            nameEn: item.nameEn,
            emoji: item.emoji || '🍹',
            count: 0,
            sales: 0
          };
        }
        itemSales[key].count += item.quantity;
        itemSales[key].sales += item.price * item.quantity;
      });
    }
  });

  const topSellers = Object.values(itemSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Loading indicator
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="h-28 bg-gray-200 dark:bg-[#060f1e] rounded-3xl animate-pulse"></div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-[#060f1e] border border-[#E8F5FF] dark:border-[#0a2540] rounded-2xl animate-pulse"></div>
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[340px] bg-gray-200 dark:bg-[#060f1e] border border-[#E8F5FF] dark:border-[#0a2540] rounded-2xl animate-pulse"></div>
          <div className="h-[340px] bg-gray-200 dark:bg-[#060f1e] border border-[#E8F5FF] dark:border-[#0a2540] rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-7 text-white shadow-md"
        style={{ background: 'linear-gradient(135deg, #00BDFE 0%, #5ADEFF 60%, #84E4F7 100%)' }}
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)', backgroundSize: '22px 22px', opacity: 0.35 }} />

        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-sm border border-white/30 mb-2">
              <Sparkles className="w-3 h-3 animate-spin-slow" />
              <span className="text-xs font-semibold">{isEn ? 'Live overview' : 'ภาพรวมเรียลไทม์'}</span>
            </div>
            <h1 className="text-white font-bold" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)' }}>
              {isEn ? 'Welcome back, Admin 👋' : 'สวัสดี, แอดมิน 👋'}
            </h1>
            <p className="text-white/85 text-sm mt-1">
              {isEn ? 'Today, ' : 'วันนี้, '}
              {new Date().toLocaleDateString(isEn ? 'en-US' : 'th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30"
          >
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-green-300 opacity-70 animate-ping" />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-green-400" />
            </span>
            <div>
              <p className="text-xs text-white/85">{isEn ? 'Active orders' : 'ออเดอร์ที่ค้างอยู่'}</p>
              <p className="font-bold text-sm tabular-nums">{liveOrders}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          gradient="linear-gradient(135deg, #00BDFE 0%, #0091cc 100%)"
          label={t('todaySales')}
          value={todaySales}
          prefix="฿"
          sub={isEn ? 'Revenue today' : 'รายได้วันนี้'}
          growth={5}
          delay={0}
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5 text-white" />}
          gradient="linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)"
          label={t('totalOrders')}
          value={totalOrdersToday}
          sub={isEn ? 'Orders today' : 'ออเดอร์วันนี้'}
          growth={2}
          delay={0.08}
        />
        <StatCard
          icon={<ReceiptText className="w-5 h-5 text-white" />}
          gradient="linear-gradient(135deg, #34D399 0%, #059669 100%)"
          label={t('avgPerOrder')}
          value={avgPerOrder}
          prefix="฿"
          sub={isEn ? 'Per order' : 'ต่อออเดอร์'}
          delay={0.16}
        />
        <StatCard
          icon={<Star className="w-5 h-5 text-white" />}
          gradient="linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)"
          label={isEn ? 'Average Rating' : 'คะแนนรีวิวเฉลี่ย'}
          value={averageRating}
          decimals={1}
          sub={isEn ? `${reviewCount} review(s) total` : `จากทั้งหมด ${reviewCount} รีวิว`}
          delay={0.24}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#D8F2FF] dark:bg-[#00BDFE]/15 flex items-center justify-center">
                <Activity className="w-4 h-4 text-[#00BDFE]" />
              </div>
              <div>
                <h3 className="text-gray-800 dark:text-gray-200 font-semibold">
                  {isEn ? 'Sales Trend' : 'แนวโน้มยอดขาย'}
                </h3>
                <p className="text-gray-400" style={{ fontSize: '11px' }}>
                  {chartMode === 'hour' ? (isEn ? 'Hourly performance' : 'ราย 2 ชั่วโมง') : (isEn ? 'This week' : 'สัปดาห์นี้')}
                </p>
              </div>
            </div>
            <div className="inline-flex p-1 bg-[#F0FBFF] dark:bg-[#0a1828] rounded-xl border border-[#D8F2FF] dark:border-[#0c223c]">
              {(['hour', 'week'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    chartMode === m
                      ? 'bg-white dark:bg-[#00BDFE] text-[#00BDFE] dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250'
                  }`}
                >
                  {m === 'hour' ? (isEn ? 'Hourly' : 'รายชั่วโมง') : (isEn ? 'Weekly' : 'รายสัปดาห์')}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer key={`dash-area-${chartMode}`} width="100%" height={240}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5FF" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={v => `฿${v.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F0FBFF', opacity: 0.5 }} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#00BDFE"
                strokeWidth={2.5}
                fill="#00BDFE"
                fillOpacity={0.18}
                dot={{ r: 3, fill: '#00BDFE', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#00BDFE', strokeWidth: 3, stroke: '#fff' }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#F0FBFF] dark:border-[#0a2540]">
            <div>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>{isEn ? 'Target Period' : 'เป้าหมายระยะสั้น'}</p>
              <p className="text-gray-800 dark:text-white font-semibold text-sm">{chartMode === 'hour' ? 'Today' : '7 Days'}</p>
            </div>
            <div>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>{isEn ? 'Total orders' : 'รวมออเดอร์'}</p>
              <p className="text-gray-800 dark:text-white font-semibold text-sm">{chartMode === 'hour' ? totalOrdersToday : orders.length}</p>
            </div>
            <div>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>{isEn ? 'Live Performance' : 'ผลงานจริง'}</p>
              <p className="text-green-500 font-semibold text-sm">Active</p>
            </div>
          </div>
        </motion.div>

        {/* Category Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="text-gray-800 dark:text-gray-200 font-semibold">
              {isEn ? 'Category Mix' : 'สัดส่วนหมวดหมู่'}
            </h3>
          </div>
          {totalMix === 0 ? (
            <div className="flex flex-col items-center justify-center h-[180px] text-gray-400 text-sm">
              <GlassWater className="w-8 h-8 mb-2 stroke-1" />
              {isEn ? 'No category mix data' : 'ไม่มีข้อมูลสัดส่วนสินค้า'}
            </div>
          ) : (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={categoryMixData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      isAnimationActive={true}
                    >
                      {categoryMixData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-gray-400" style={{ fontSize: '11px' }}>{isEn ? 'Total' : 'รวม'}</p>
                  <p className="text-gray-800 dark:text-white font-bold text-lg">100%</p>
                </div>
              </div>
              <div className="space-y-2 mt-3">
                {categoryMixData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-500 font-medium">{item.name}</span>
                    </div>
                    <span className="text-gray-800 dark:text-gray-200 font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Sellers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold">{t('topSellers')}</h3>
            </div>
          </div>
          <div className="space-y-3">
            {topSellers.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400">
                {isEn ? 'No top sellers yet' : 'ยังไม่มีประวัติการขายสินค้า'}
              </div>
            ) : (
              topSellers.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#030d1a] border border-gray-100 dark:border-[#0a2540] shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))' }}>{item.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-xs">{isEn ? item.nameEn : item.name}</p>
                      <p className="text-gray-450 text-[10px] font-medium mt-0.5">{item.count} {isEn ? 'cups sold' : 'แก้วที่ขายได้'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#00BDFE]">฿{item.sales.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] overflow-hidden shadow-sm"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8F5FF] dark:border-[#0a2540] bg-[#FAFCFE] dark:bg-[#040b15]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#D8F2FF] dark:bg-[#00BDFE]/15 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#00BDFE]" />
              </div>
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold">{t('recentOrders')}</h3>
            </div>
            <Link href="/admin/orders"
              className="flex items-center gap-1 text-[#00BDFE] text-xs font-semibold hover:underline"
            >
              {t('seeAll')} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0FBFF] dark:border-[#0a2540] bg-[#FAFCFE] dark:bg-[#050e1b]">
                  {[t('orderTime'), t('customerName'), t('items'), t('price'), t('status')].map((h, i) => (
                    <th key={`th-${i}`} className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0FBFF] dark:divide-[#0a2540]">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-xs text-gray-400">
                      {isEn ? 'No recent orders' : 'ไม่มีรายการสั่งซื้อล่าสุด'}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="hover:bg-[#F8FBFF] dark:hover:bg-[#0a1828] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-550 dark:text-gray-400 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {order.createdAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#84E4F7] to-[#00BDFE] flex items-center justify-center text-white font-bold" style={{ fontSize: '11px' }}>
                            {((order as any).customerName || 'C').charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">{(order as any).customerName || 'ลูกค้า'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[180px]">
                        <span className="truncate block font-medium">
                          {order.items.map(it => `${isEn ? it.nameEn : it.name} × ${it.quantity}`).join(', ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#00BDFE] tabular-nums">฿{order.total.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${STATUS_COLORS[order.status]}`}>
                          {isEn ? STATUS_LABELS_EN[order.status] : STATUS_LABELS_TH[order.status]}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardPage;
