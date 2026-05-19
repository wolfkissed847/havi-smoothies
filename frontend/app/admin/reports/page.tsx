"use client";
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, ShoppingBag, ReceiptText, Download, GlassWater, Activity } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAllOrders, getMenuItems } from '../../lib/db';
import { CustomerOrder, MenuItem } from '../../lib/types';

type Period = 'today' | 'week' | 'month';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#0d1f35] border border-[#D8F2FF] dark:border-[#1e3a5f] rounded-xl px-3 py-2 shadow-lg">
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="text-[#00BDFE] font-semibold text-sm">
          {payload[0].name === 'orders' 
            ? `${payload[0].value} orders` 
            : `฿${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '11px', fontWeight: 600 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ReportsPage() {
  const { t, isEn } = useLanguage();
  const [period, setPeriod] = useState<Period>('week');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const periodOptions: { key: Period; labelTh: string; labelEn: string }[] = [
    { key: 'today', labelTh: 'วันนี้', labelEn: 'Today' },
    { key: 'week', labelTh: 'สัปดาห์นี้', labelEn: 'This Week' },
    { key: 'month', labelTh: 'เดือนนี้', labelEn: 'This Month' },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [ordersData, menuData] = await Promise.all([
          getAllOrders(),
          getMenuItems()
        ]);
        setOrders(ordersData);
        setMenuItems(menuData);
      } catch (e) {
        console.error("Failed to load data for reports:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter orders that are not cancelled
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const now = new Date();

  // Filter orders based on the selected period
  const filteredOrders = validOrders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (period === 'today') {
      return orderDate >= startOfToday;
    } else if (period === 'week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);
      return orderDate >= startOfWeek;
    } else { // month (last 30 days)
      const startOfMonth = new Date();
      startOfMonth.setDate(startOfMonth.getDate() - 30);
      startOfMonth.setHours(0, 0, 0, 0);
      return orderDate >= startOfMonth;
    }
  });

  // Calculate high-level stats
  const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = filteredOrders.length;
  const avgPerOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  
  // Total cups sold
  const totalCups = filteredOrders.reduce((acc, o) => {
    return acc + o.items.reduce((sum, item) => sum + item.quantity, 0);
  }, 0);

  // Generate dynamic chart data based on selected period
  let chartData: { name: string; sales: number; orders: number }[] = [];

  if (period === 'today') {
    // 2-hour slots: 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00
    const hours = [8, 10, 12, 14, 16, 18, 20, 22];
    chartData = hours.map(h => {
      const name = `${h.toString().padStart(2, '0')}:00`;
      let sales = 0;
      let orderCount = 0;
      filteredOrders.forEach(o => {
        const orderHour = o.createdAt.getHours();
        if (orderHour >= h && orderHour < h + 2) {
          sales += o.total;
          orderCount += 1;
        }
      });
      return { name, sales, orders: orderCount };
    });
  } else if (period === 'week') {
    // Last 7 days ending today
    const daysTh = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayLabel = isEn ? daysEn[d.getDay()] : daysTh[d.getDay()];
      
      let sales = 0;
      let orderCount = 0;
      filteredOrders.forEach(o => {
        const orderDate = new Date(o.createdAt);
        if (orderDate.toDateString() === d.toDateString()) {
          sales += o.total;
          orderCount += 1;
        }
      });
      return { name: dayLabel, sales, orders: orderCount };
    });
  } else {
    // Last 30 days grouped in 6 intervals of 5 days
    chartData = Array.from({ length: 6 }).map((_, i) => {
      const endDaysAgo = (5 - i) * 5;
      const startDaysAgo = endDaysAgo + 4;
      
      const startD = new Date();
      startD.setDate(startD.getDate() - startDaysAgo);
      const endD = new Date();
      endD.setDate(endD.getDate() - endDaysAgo);
      
      const formatOption: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      const name = `${startD.toLocaleDateString(isEn ? 'en-US' : 'th-TH', formatOption)} - ${endD.toLocaleDateString(isEn ? 'en-US' : 'th-TH', formatOption)}`;
      
      let sales = 0;
      let orderCount = 0;
      filteredOrders.forEach(o => {
        const orderDate = new Date(o.createdAt);
        const diffTime = now.getTime() - orderDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= endDaysAgo && diffDays <= startDaysAgo) {
          sales += o.total;
          orderCount += 1;
        }
      });
      return { name, sales, orders: orderCount };
    });
  }

  // Map menu item names to category for the category pie chart
  const categoryMap = new Map<string, 'fruit' | 'vegetable'>();
  menuItems.forEach(item => {
    categoryMap.set(item.name.toLowerCase().trim(), item.category);
    categoryMap.set(item.nameEn.toLowerCase().trim(), item.category);
  });

  let fruitSales = 0;
  let vegetableSales = 0;

  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const category = categoryMap.get(item.name.toLowerCase().trim()) || 
                       categoryMap.get(item.nameEn.toLowerCase().trim()) || 
                       (item.name.includes('ผัก') || item.nameEn.toLowerCase().includes('veggie') || item.nameEn.toLowerCase().includes('green') ? 'vegetable' : 'fruit');
      
      const itemTotal = item.price * item.quantity;
      if (category === 'fruit') {
        fruitSales += itemTotal;
      } else {
        vegetableSales += itemTotal;
      }
    });
  });

  const totalCatSales = fruitSales + vegetableSales;
  const fruitPercentage = totalCatSales > 0 ? Math.round((fruitSales / totalCatSales) * 100) : 0;
  const vegetablePercentage = totalCatSales > 0 ? 100 - fruitPercentage : 0;

  const pieData = [
    {
      name: isEn ? 'Fruit' : 'ผลไม้',
      value: fruitPercentage,
      color: '#f97316', // Orange
    },
    {
      name: isEn ? 'Vegetable' : 'ผัก',
      value: vegetablePercentage,
      color: '#22c55e', // Green
    },
  ];

  // CSV Export handler
  const handleExport = () => {
    if (filteredOrders.length === 0) return;

    const headers = [
      isEn ? 'Order ID' : 'รหัสออเดอร์',
      isEn ? 'Time' : 'เวลาสั่งซื้อ',
      isEn ? 'Customer Name' : 'ชื่อลูกค้า',
      isEn ? 'Items' : 'รายการสินค้า',
      isEn ? 'Total (฿)' : 'ยอดสุทธิ (฿)',
      isEn ? 'Status' : 'สถานะ'
    ];

    const rows = filteredOrders.map(order => [
      order.orderNumber || order.id,
      order.createdAt.toLocaleString(isEn ? 'en-US' : 'th-TH'),
      (order as any).customerName || (isEn ? 'Customer' : 'ลูกค้า'),
      order.items.map(i => `${i.name} x${i.quantity}`).join('; '),
      order.total,
      isEn 
        ? { pending: 'Pending', preparing: 'Preparing', ready: 'Ready', delivered: 'Delivered', cancelled: 'Cancelled' }[order.status] || order.status
        : { pending: 'รอ', preparing: 'เตรียม', ready: 'พร้อม', delivered: 'จัดส่ง', cancelled: 'ยกเลิก' }[order.status] || order.status
    ]);

    const csvContent = "\ufeff" + [
      headers.join(','), 
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `havi_smoothies_${period}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Nice Loading Skeletons
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 dark:bg-[#0a2540] rounded-xl w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-[#0a2540] rounded-xl w-64 animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-[#060f1e] border border-[#E8F5FF] dark:border-[#0a2540] rounded-2xl animate-pulse"></div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-[280px] bg-gray-200 dark:bg-[#060f1e] border border-[#E8F5FF] dark:border-[#0a2540] rounded-2xl animate-pulse"></div>
          <div className="h-[280px] bg-gray-200 dark:bg-[#060f1e] border border-[#E8F5FF] dark:border-[#0a2540] rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-gray-800 dark:text-white font-bold text-2xl">{t('reportsTitle')}</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] overflow-hidden">
            {periodOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  period === opt.key
                    ? 'bg-[#00BDFE] text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-[#F0FBFF] dark:hover:bg-[#0a2540] bg-white dark:bg-[#060f1e]'
                }`}
              >
                {isEn ? opt.labelEn : opt.labelTh}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExport}
            disabled={filteredOrders.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-white dark:bg-[#060f1e] text-gray-700 dark:text-gray-300 text-sm hover:bg-[#F0FBFF] dark:hover:bg-[#0a2540] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {isEn ? 'Export' : 'ส่งออก'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: <TrendingUp className="w-5 h-5 text-[#00BDFE]" />,
            bg: 'bg-[#D8F2FF] dark:bg-[#00BDFE]/15',
            label: t('totalRevenue'),
            value: `฿${totalRevenue.toLocaleString()}`,
          },
          {
            icon: <ShoppingBag className="w-5 h-5 text-purple-500" />,
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            label: t('totalOrders'),
            value: `${totalOrders.toLocaleString()}`,
          },
          {
            icon: <ReceiptText className="w-5 h-5 text-green-500" />,
            bg: 'bg-green-50 dark:bg-green-900/20',
            label: t('avgPerOrder'),
            value: `฿${avgPerOrder.toLocaleString()}`,
          },
          {
            icon: <GlassWater className="w-5 h-5 text-orange-500" />,
            bg: 'bg-orange-50 dark:bg-orange-950/20',
            label: isEn ? 'Cups Sold' : 'จำนวนที่ขาย (แก้ว)',
            value: `${totalCups.toLocaleString()}`,
          },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.bg}`}>
                {card.icon}
              </div>
              <p className="text-gray-400 text-xs mb-1">{card.label}</p>
            </div>
            <p className="text-gray-800 dark:text-white font-bold" style={{ fontSize: '1.4rem' }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Daily Sales Bar Chart */}
        <div className="md:col-span-2 bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5 shadow-sm">
          <h3 className="text-gray-700 dark:text-gray-200 mb-4 font-semibold">{t('dailySales')}</h3>
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-gray-400 text-sm">
              <Activity className="w-8 h-8 mb-2 stroke-1" />
              {isEn ? 'No sales data for this period' : 'ไม่มีข้อมูลยอดขายในช่วงเวลานี้'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F5FF" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `฿${v.toLocaleString()}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F0FBFF', opacity: 0.5 }} />
                <Bar dataKey="sales" fill="#00BDFE" radius={[6, 6, 0, 0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie */}
        <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5 shadow-sm">
          <h3 className="text-gray-700 dark:text-gray-200 mb-4 font-semibold">{t('salesByCategory')}</h3>
          {totalCatSales === 0 ? (
            <div className="flex flex-col items-center justify-center h-[180px] text-gray-400 text-sm">
              <GlassWater className="w-8 h-8 mb-2 stroke-1" />
              {isEn ? 'No category data' : 'ไม่มีข้อมูลประเภทสินค้า'}
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={`reports-category-cell-${entry.name}-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-gray-600 dark:text-gray-400 font-medium" style={{ fontSize: '12px' }}>{d.name}</span>
                    </div>
                    <span className="text-gray-800 dark:text-gray-200 font-semibold" style={{ fontSize: '12px' }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Orders Line Chart */}
      <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5 shadow-sm">
        <h3 className="text-gray-700 dark:text-gray-200 mb-4 font-semibold">{isEn ? 'Daily Order Volume' : 'ปริมาณออเดอร์รายวัน'}</h3>
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400 text-sm">
            <Activity className="w-8 h-8 mb-2 stroke-1" />
            {isEn ? 'No order volume data' : 'ไม่มีข้อมูลปริมาณออเดอร์ในช่วงเวลานี้'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5FF" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#84E4F7', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#00BDFE"
                strokeWidth={2}
                dot={{ r: 4, fill: '#00BDFE', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#00BDFE' }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-[#E8F5FF] dark:border-[#0a2540] flex justify-between items-center bg-[#FDFEFE] dark:bg-[#040b15]">
          <h3 className="text-gray-700 dark:text-gray-200 font-semibold">{isEn ? 'All Orders' : 'ออเดอร์ทั้งหมด'}</h3>
          <span className="text-xs text-gray-400 font-medium">
            {isEn ? `Showing ${Math.min(filteredOrders.length, 10)} of ${filteredOrders.length}` : `แสดง ${Math.min(filteredOrders.length, 10)} จากทั้งหมด ${filteredOrders.length}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0FBFF] dark:border-[#0a2540] bg-[#FAFCFE] dark:bg-[#050e1b]">
                {['#', t('orderTime'), t('customerName'), t('items'), t('price'), t('status')].map((h, i) => (
                  <th key={`rpt-th-${i}`} className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0FBFF] dark:divide-[#0a2540]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-gray-400">
                    {isEn ? 'No orders found' : 'ไม่พบรายการคำสั่งซื้อ'}
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-[#F8FBFF] dark:hover:bg-[#0a1828] transition-colors">
                    <td className="px-5 py-4.5 text-xs text-gray-400 font-mono font-semibold">{order.orderNumber || order.id.slice(0, 8)}</td>
                    <td className="px-5 py-4.5 text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {order.createdAt.toLocaleString(isEn ? 'en-US' : 'th-TH', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        hour12: false 
                      })}
                    </td>
                    <td className="px-5 py-4.5 text-sm text-gray-800 dark:text-white font-semibold">
                      {(order as any).customerName || (isEn ? 'Customer' : 'ลูกค้า')}
                    </td>
                    <td className="px-5 py-4.5 text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
                      <span className="truncate block font-medium">
                        {order.items.map(i => `${isEn ? i.nameEn : i.name} × ${i.quantity}`).join(', ')}
                      </span>
                    </td>
                    <td className="px-5 py-4.5 text-sm font-semibold text-[#00BDFE]">฿{order.total.toLocaleString()}</td>
                    <td className="px-5 py-4.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                        { 
                          pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400', 
                          preparing: 'bg-blue-100 text-[#00BDFE] dark:bg-[#00BDFE]/15 dark:text-[#00BDFE]', 
                          ready: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400', 
                          delivered: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300', 
                          cancelled: 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400' 
                        }[order.status] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {isEn
                          ? { pending: 'Pending', preparing: 'Preparing', ready: 'Ready', delivered: 'Delivered', cancelled: 'Cancelled' }[order.status] || order.status
                          : { pending: 'รอดำเนินการ', preparing: 'กำลังเตรียม', ready: 'พร้อมส่ง', delivered: 'จัดส่งแล้ว', cancelled: 'ยกเลิก' }[order.status] || order.status
                        }
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
