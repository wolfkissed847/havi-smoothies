"use client";
import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, ShoppingBag, ReceiptText, Download } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAllOrders } from '../../lib/db';
import { CustomerOrder } from '../../lib/types';

type Period = 'today' | 'week' | 'month';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#0d1f35] border border-[#D8F2FF] dark:border-[#1e3a5f] rounded-xl px-3 py-2 shadow-lg">
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="text-[#00BDFE] font-semibold text-sm">
          {payload[0].name === 'orders' ? `${payload[0].value} orders` : `฿${payload[0].value.toLocaleString()}`}
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

  const periodOptions: { key: Period; labelTh: string; labelEn: string }[] = [
    { key: 'today', labelTh: 'วันนี้', labelEn: 'Today' },
    { key: 'week', labelTh: 'สัปดาห์นี้', labelEn: 'This Week' },
    { key: 'month', labelTh: 'เดือนนี้', labelEn: 'This Month' },
  ];

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (e) {
        console.error("Failed to load orders for reports:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const chartData: any[] = [];
  const pieData: any[] = [];
  
  const multiplier = period === 'today' ? 1 : period === 'week' ? 7 : 30;
  // Calculate basic stats for this exact period based on real orders
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const now = new Date();
  
  const filteredOrders = validOrders.filter(o => {
    const diffTime = Math.abs(now.getTime() - o.createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (period === 'today') return diffDays <= 1;
    if (period === 'week') return diffDays <= 7;
    return diffDays <= 30;
  });

  const totalRevenue = filteredOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = filteredOrders.length;
  const avgPerOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-gray-800 dark:text-white">{t('reportsTitle')}</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] overflow-hidden">
            {periodOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  period === opt.key
                    ? 'bg-[#00BDFE] text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-[#F0FBFF] dark:hover:bg-[#0a2540]'
                }`}
              >
                {isEn ? opt.labelEn : opt.labelTh}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] text-gray-500 dark:text-gray-400 text-sm hover:bg-[#F0FBFF] dark:hover:bg-[#0a2540] transition-colors">
            <Download className="w-4 h-4" />
            {isEn ? 'Export' : 'ส่งออก'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.bg}`}>
              {card.icon}
            </div>
            <p className="text-gray-400 text-xs mb-1">{card.label}</p>
            <p className="text-gray-800 dark:text-white font-semibold" style={{ fontSize: '1.3rem' }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Daily Sales Bar Chart */}
        <div className="md:col-span-2 bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5">
          <h3 className="text-gray-700 dark:text-gray-200 mb-4">{t('dailySales')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5FF" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `฿${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F0FBFF', opacity: 0.5 }} />
              <Bar dataKey="sales" fill="#00BDFE" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5">
          <h3 className="text-gray-700 dark:text-gray-200 mb-4">{t('salesByCategory')}</h3>
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
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }}>{d.name}</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '11px' }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Line Chart */}
      <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-5">
        <h3 className="text-gray-700 dark:text-gray-200 mb-4">{isEn ? 'Daily Order Volume' : 'ปริมาณออเดอร์รายวัน'}</h3>
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
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8F5FF] dark:border-[#0a2540]">
          <h3 className="text-gray-700 dark:text-gray-200">{isEn ? 'All Orders' : 'ออเดอร์ทั้งหมด'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0FBFF] dark:border-[#0a2540]">
                {['#', t('orderTime'), t('customerName'), t('items'), t('price'), t('status')].map((h, i) => (
                  <th key={`rpt-th-${i}`} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0FBFF] dark:divide-[#0a2540]">
              {filteredOrders.slice(0, 8).map((order) => (
                <tr key={order.id} className="hover:bg-[#F8FBFF] dark:hover:bg-[#0a1828] transition-colors">
                  <td className="px-5 py-3 text-xs text-gray-400 font-mono">{order.id.slice(0, 8)}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {order.createdAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-800 dark:text-white">
                    {(order as any).customerName || 'ลูกค้า'}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[150px]">
                    <span className="truncate block">
                      {order.items.map(i => `${isEn ? i.nameEn : i.name}×${i.quantity}`).join(', ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-[#00BDFE]">฿{order.total}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      { pending: 'bg-yellow-100 text-yellow-700', preparing: 'bg-blue-100 text-[#00BDFE]', ready: 'bg-green-100 text-green-700', delivered: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-100 text-red-600' }[order.status] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {isEn
                        ? { pending: 'Pending', preparing: 'Preparing', ready: 'Ready', delivered: 'Delivered', cancelled: 'Cancelled' }[order.status] || order.status
                        : { pending: 'รอ', preparing: 'เตรียม', ready: 'พร้อม', delivered: 'จัดส่ง', cancelled: 'ยกเลิก' }[order.status] || order.status
                      }
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
