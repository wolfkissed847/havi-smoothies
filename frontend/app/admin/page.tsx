"use client";
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, ShoppingBag, ReceiptText, ArrowUpRight, ArrowDownRight, Clock,
  Users, Sparkles, Activity, Package, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { dashboardStats, hourlyData, topSellers, mockOrders, categoryData, weeklyData } from '../data/mockData';

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
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function StatCard({ icon, label, value, sub, growth, gradient, delay = 0, prefix = '' }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  growth?: number;
  gradient: string;
  delay?: number;
  prefix?: string;
}) {
  const display = useCountUp(value);
  const positive = (growth ?? 0) >= 0;
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
        <p className="text-gray-800 dark:text-white font-semibold tabular-nums" style={{ fontSize: '1.5rem' }}>
          {prefix}{display.toLocaleString()}
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
  const recentOrders = mockOrders.slice(0, 5);
  const [chartMode, setChartMode] = useState<'hour' | 'week'>('hour');

  const chartData = (
    chartMode === 'hour'
      ? hourlyData.map(d => ({ ...d, label: d.hour }))
      : weeklyData.map(d => ({ ...d, label: isEn ? d.dayEn : d.day }))
  ) as any[];

  const totalOrdersToday = hourlyData.reduce((s, h) => s + h.orders, 0);
  const liveOrders = mockOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-7 text-white"
        style={{ background: 'linear-gradient(135deg, #00BDFE 0%, #5ADEFF 60%, #84E4F7 100%)' }}
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)', backgroundSize: '22px 22px', opacity: 0.35 }} />

        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-sm border border-white/30 mb-2">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-medium">{isEn ? 'Live overview' : 'ภาพรวมเรียลไทม์'}</span>
            </div>
            <h1 className="text-white" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)' }}>
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
              <p className="text-xs text-white/80">{isEn ? 'Live orders' : 'ออเดอร์กำลังดำเนินการ'}</p>
              <p className="font-semibold text-sm tabular-nums">{liveOrders}</p>
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
          value={dashboardStats.todaySales}
          prefix="฿"
          sub={isEn ? 'Revenue today' : 'รายได้วันนี้'}
          growth={dashboardStats.growthRate}
          delay={0}
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5 text-white" />}
          gradient="linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)"
          label={t('totalOrders')}
          value={dashboardStats.totalOrders}
          sub={isEn ? 'Orders today' : 'ออเดอร์วันนี้'}
          growth={dashboardStats.ordersGrowth}
          delay={0.08}
        />
        <StatCard
          icon={<ReceiptText className="w-5 h-5 text-white" />}
          gradient="linear-gradient(135deg, #34D399 0%, #059669 100%)"
          label={t('avgPerOrder')}
          value={dashboardStats.avgPerOrder}
          prefix="฿"
          sub={isEn ? 'Per order' : 'ต่อออเดอร์'}
          delay={0.16}
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-white" />}
          gradient="linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)"
          label={isEn ? 'Active Customers' : 'ลูกค้าแอคทีฟ'}
          value={64}
          sub={isEn ? 'Online now' : 'กำลังใช้งาน'}
          growth={5.2}
          delay={0.24}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5"
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
                  {chartMode === 'hour' ? (isEn ? 'Hourly performance' : 'ราย ๆ ชั่วโมง') : (isEn ? 'This week' : 'สัปดาห์นี้')}
                </p>
              </div>
            </div>
            <div className="inline-flex p-1 bg-[#F0FBFF] dark:bg-[#0a1828] rounded-xl">
              {(['hour', 'week'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    chartMode === m
                      ? 'bg-white dark:bg-[#00BDFE] text-[#00BDFE] dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'hour' ? (isEn ? 'Hourly' : 'ชั่วโมง') : (isEn ? 'Weekly' : 'สัปดาห์')}
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
                tickFormatter={v => `฿${(v / 1000).toFixed(0)}k`}
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
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#F0FBFF] dark:border-[#0a2540]">
            <div>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>{isEn ? 'Peak hour' : 'ชั่วโมงพีค'}</p>
              <p className="text-gray-800 dark:text-white font-semibold text-sm">12:00 - 13:00</p>
            </div>
            <div>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>{isEn ? 'Total orders' : 'รวมออเดอร์'}</p>
              <p className="text-gray-800 dark:text-white font-semibold text-sm">{totalOrdersToday}</p>
            </div>
            <div>
              <p className="text-gray-400" style={{ fontSize: '11px' }}>{isEn ? 'Conversion' : 'อัตราซื้อ'}</p>
              <p className="text-green-500 font-semibold text-sm">+12.5%</p>
            </div>
          </div>
        </motion.div>

        {/* Category Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="text-gray-800 dark:text-gray-200 font-semibold">
              {isEn ? 'Category Mix' : 'สัดส่วนหมวดหมู่'}
            </h3>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={`dashboard-category-cell-${entry.color}-${i}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-gray-400" style={{ fontSize: '11px' }}>{isEn ? 'Total' : 'รวม'}</p>
              <p className="text-gray-800 dark:text-white font-semibold text-lg">100%</p>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            {categoryData.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{isEn ? c.nameEn : c.name}</span>
                </div>
                <span className="text-gray-800 dark:text-white font-semibold text-sm">{c.value}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Sellers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5"
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
            {topSellers.map((item, i) => {
              const maxCups = topSellers[0].cups;
              const pct = (item.cups / maxCups) * 100;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white font-semibold flex-shrink-0"
                        style={{ background: item.color, fontSize: '10px' }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 text-xs truncate">
                        {isEn ? item.nameEn : item.name}
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2 tabular-nums" style={{ fontSize: '11px' }}>
                      {item.cups} {t('cups')}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F0FBFF] dark:bg-[#0a2540] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.6 + i * 0.08, duration: 0.9, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}cc 100%)` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8F5FF] dark:border-[#0a2540]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#D8F2FF] dark:bg-[#00BDFE]/15 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#00BDFE]" />
              </div>
              <h3 className="text-gray-800 dark:text-gray-200 font-semibold">{t('recentOrders')}</h3>
            </div>
            <Link href="/admin/orders"
              className="flex items-center gap-1 text-[#00BDFE] text-sm hover:underline"
            >
              {t('seeAll')} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0FBFF] dark:border-[#0a2540]">
                  {[t('orderTime'), t('customerName'), t('items'), t('price'), t('status')].map((h, i) => (
                    <th key={`th-${i}`} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0FBFF] dark:divide-[#0a2540]">
                {recentOrders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    className="hover:bg-[#F8FBFF] dark:hover:bg-[#0a1828] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        {order.time}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#84E4F7] to-[#00BDFE] flex items-center justify-center text-white font-semibold" style={{ fontSize: '11px' }}>
                          {order.customerName.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-800 dark:text-white">{order.customerName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[180px]">
                      <span className="truncate block">
                        {order.items.map(it => `${isEn ? it.nameEn : it.name}×${it.quantity}`).join(', ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-[#00BDFE] tabular-nums">฿{order.total}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {isEn ? STATUS_LABELS_EN[order.status] : STATUS_LABELS_TH[order.status]}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


export default DashboardPage;
