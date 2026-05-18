"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Printer, ChevronDown, ChevronUp,
  CheckCircle2, Clock4, Loader2, XCircle, Filter,
  MapPin, MessageSquare, ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { OrderStatus } from '../../lib/types';
import { getAllOrders, updateOrderStatus } from '../../lib/db';

// Admin Order shape (flattened from CustomerOrder for this page)
interface AdminOrder {
  id: string;
  customerName: string;
  items: { name: string; nameEn: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  time: string;
  address: string;
  notes: string;
  createdAt: Date;
}

const DELIVERY_FEE = 0;

// emoji mapping by item name keyword
const ITEM_EMOJI: Record<string, string> = {
  'สตรอว์เบอร์รี่': '🍓', Strawberry: '🍓',
  'มะม่วง': '🥭', Mango: '🥭',
  'เลมอน': '🍋', Lemon: '🍋',
  'กีวี': '🥝', Kiwi: '🥝',
  'แตงโม': '🍉', Watermelon: '🍉',
  'ส้ม': '🍊', Orange: '🍊',
  'องุ่น': '🍇', Grape: '🍇',
  'สับปะรด': '🍍', Pineapple: '🍍',
  'บลูเบอร์รี่': '🫐', Blueberry: '🫐',
  'มะพร้าว': '🥥', Coconut: '🥥',
  'แครอท': '🥕', Carrot: '🥕',
  'แตงกวา': '🥒', Cucumber: '🥒',
  'ผักโขม': '🥬', Spinach: '🥬',
  'บีทรูท': '🫚', Beet: '🫚',
  'ขึ้นฉ่าย': '🌿', Celery: '🌿',
  'บร็อคโคลี่': '🥦', Broccoli: '🥦',
  'พีช': '🍑', Peach: '🍑',
  'มะละกอ': '🍈', Papaya: '🍈',
};

function getItemEmoji(name: string): string {
  for (const key of Object.keys(ITEM_EMOJI)) {
    if (name.includes(key)) return ITEM_EMOJI[key];
  }
  return '🥤';
}

const STATUS_NEXT: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'delivered',
  ready: 'delivered',
  delivered: null,
  cancelled: null,
};

interface StatusConfig {
  labelTh: string;
  labelEn: string;
  icon: React.ReactNode;
  pill: string;
  card: string;
  cardText: string;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    labelTh: 'รอดำเนินการ', labelEn: 'Pending',
    icon: <Clock4 className="w-3.5 h-3.5" />,
    pill: 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    card: 'bg-[#FFFBE8] dark:bg-amber-900/10',
    cardText: 'text-amber-600 dark:text-amber-400',
  },
  preparing: {
    labelTh: 'กำลังทำ', labelEn: 'Preparing',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    pill: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    card: 'bg-[#EFF8FF] dark:bg-blue-900/10',
    cardText: 'text-blue-600 dark:text-blue-400',
  },
  ready: {
    labelTh: 'พร้อมส่ง', labelEn: 'Ready',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    pill: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    card: 'bg-[#F0FFF4] dark:bg-green-900/10',
    cardText: 'text-green-700 dark:text-green-400',
  },
  delivered: {
    labelTh: 'สำเร็จ', labelEn: 'Done',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    pill: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    card: 'bg-[#F0FFF4] dark:bg-green-900/10',
    cardText: 'text-green-700 dark:text-green-400',
  },
  cancelled: {
    labelTh: 'ยกเลิก', labelEn: 'Cancelled',
    icon: <XCircle className="w-3.5 h-3.5" />,
    pill: 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    card: 'bg-red-50 dark:bg-red-900/10',
    cardText: 'text-red-600 dark:text-red-400',
  },
};

const NEXT_LABEL: Record<string, { th: string; en: string }> = {
  pending: { th: 'เริ่มทำ', en: 'Start Making' },
  preparing: { th: 'สำเร็จแล้ว', en: 'Mark Done' },
  ready: { th: 'จัดส่งแล้ว', en: 'Delivered' },
};

type TabKey = OrderStatus | 'all';
interface Tab { key: TabKey; labelTh: string; labelEn: string }

const TABS: Tab[] = [
  { key: 'all', labelTh: 'ทั้งหมด', labelEn: 'All' },
  { key: 'pending', labelTh: 'รอดำเนินการ', labelEn: 'Pending' },
  { key: 'preparing', labelTh: 'กำลังทำ', labelEn: 'Preparing' },
  { key: 'delivered', labelTh: 'สำเร็จ', labelEn: 'Done' },
  { key: 'cancelled', labelTh: 'ยกเลิก', labelEn: 'Cancelled' },
];

const STAT_CARDS = [
  { key: 'all', labelTh: 'ออเดอร์ทั้งหมด', labelEn: 'Total Orders', bg: 'bg-[#F0FDF4] dark:bg-[#0a2540]', border: 'border-green-100 dark:border-[#0a2540]', textColor: 'text-[#1a3c2e] dark:text-green-300' },
  { key: 'pending', labelTh: 'รอดำเนินการ', labelEn: 'Pending', bg: 'bg-[#FFFBE8] dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-900/30', textColor: 'text-amber-600 dark:text-amber-400' },
  { key: 'preparing', labelTh: 'กำลังทำ', labelEn: 'Preparing', bg: 'bg-[#EFF8FF] dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400' },
  { key: 'delivered', labelTh: 'สำเร็จวันนี้', labelEn: "Today's Done", bg: 'bg-[#F0FFF4] dark:bg-green-900/10', border: 'border-green-200 dark:border-green-900/30', textColor: 'text-green-700 dark:text-green-400' },
] as const;

export function OrdersPage() {
  const { isEn } = useLanguage();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const dbOrders = await getAllOrders();
      const mapped: AdminOrder[] = dbOrders.map(o => ({
        id: o.id,
        customerName: (o as any).customerName || 'ลูกค้า',
        items: o.items.map(i => ({ name: i.name, nameEn: i.nameEn, quantity: i.quantity, price: i.price })),
        total: o.total,
        status: o.status,
        time: o.createdAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }),
        address: o.address,
        notes: o.notes,
        createdAt: o.createdAt,
      }));
      setOrders(mapped);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
      const d = new Date();
      setLastRefresh(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleRefresh = () => { loadOrders(); };

  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    await updateOrderStatus(id, newStatus);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleCancelOrder = async (id: string) => {
    await updateOrderStatus(id, 'cancelled', 'Admin cancelled');
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    setExpandedId(null);
  };


  const filtered = orders.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.customerName.includes(search) ||
      o.id.toLowerCase().includes(q) ||
      o.items.some(i => i.name.includes(search) || i.nameEn.toLowerCase().includes(q));
    return matchTab && matchSearch;
  });

  // counts
  const countAll = orders.length;
  const counts: Partial<Record<TabKey, number>> = { all: countAll };
  (['pending', 'preparing', 'ready', 'delivered', 'cancelled'] as OrderStatus[]).forEach(s => {
    counts[s] = orders.filter(o => o.status === s).length;
  });

  const statCounts: Record<string, number> = {
    all: countAll,
    pending: counts['pending'] ?? 0,
    preparing: counts['preparing'] ?? 0,
    delivered: counts['delivered'] ?? 0,
  };

  const DATE_TH = '29 เม.ย. 2569';
  const DATE_EN = '29 Apr 2026';

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-gray-800 dark:text-white">{isEn ? 'Order Management' : 'จัดการออเดอร์'}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {isEn ? `Last updated: ${lastRefresh}` : `อัพเดทล่าสุด: ${lastRefresh}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isEn ? 'Search orders, customer...' : 'ค้นหาออเดอร์ ชื่อลูกค้า...'}
              className="pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#0a2540] bg-white dark:bg-[#060f1e] text-gray-700 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors w-52"
            />
          </div>
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#0a2540] text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-[#0a2540] transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            {isEn ? 'Refresh' : 'รีเฟรช'}
          </button>
          {/* Print */}
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1a3c2e] text-white text-sm font-medium hover:bg-[#244d3b] transition-colors whitespace-nowrap">
            <Printer className="w-4 h-4" />
            {isEn ? 'Print Report' : 'พิมพ์รายงาน'}
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map(card => (
          <div
            key={card.key}
            className={`${card.bg} border ${card.border} rounded-2xl px-5 py-5 cursor-pointer transition-all hover:shadow-sm`}
            onClick={() => setActiveTab(card.key as TabKey)}
          >
            <p className="text-gray-400 text-xs mb-2">{isEn ? card.labelEn : card.labelTh}</p>
            <p className={`${card.textColor} font-semibold`} style={{ fontSize: '2rem', lineHeight: 1 }}>
              {statCounts[card.key]}
            </p>
          </div>
        ))}
      </div>

      {/* ── Status Tabs ── */}
      <div className="flex items-center gap-0 border-b border-gray-100 dark:border-[#0a2540]">
        <div className="flex flex-1 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => {
            const count = counts[tab.key] ?? 0;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${
                  active
                    ? 'border-[#1a3c2e] text-[#1a3c2e] dark:border-white dark:text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {isEn ? tab.labelEn : tab.labelTh}
                <span className={`px-1.5 py-0.5 rounded-md text-xs min-w-[20px] text-center ${
                  active
                    ? 'bg-[#1a3c2e] text-white dark:bg-white dark:text-[#1a3c2e]'
                    : 'bg-gray-100 dark:bg-[#0a2540] text-gray-500 dark:text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {/* Result count */}
        <div className="flex-shrink-0 flex items-center gap-1 text-gray-400 text-sm px-3 pb-1">
          <Filter className="w-3.5 h-3.5" />
          <span>{filtered.length} {isEn ? 'items' : 'รายการ'}</span>
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00BDFE] mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{isEn ? 'Loading orders...' : 'กำลังโหลดออเดอร์...'}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-400">{isEn ? 'No orders found' : 'ไม่พบออเดอร์'}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-gray-100 dark:border-[#0a2540] overflow-hidden">
          {/* Table Head */}
          <div className="hidden md:grid grid-cols-[110px_140px_1fr_90px_80px_130px_44px] px-5 py-3 border-b border-gray-100 dark:border-[#0a2540]">
            {['รหัส', 'เวลา / วันที่', 'ลูกค้า + รายการ', 'รวม', 'ค่าส่ง', 'สถานะ', ''].map((h, i) => (
              <div key={i} className="text-xs text-gray-400 font-medium">{h}</div>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50 dark:divide-[#0a2540]">
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status];
              const isExpanded = expandedId === order.id;
              const nextStatus = STATUS_NEXT[order.status];
              const nextLabel = NEXT_LABEL[order.status];

              return (
                <div key={order.id}>
                  {/* Main Row */}
                  <div
                    className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[110px_140px_1fr_90px_80px_130px_44px] items-center px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#0a1828] transition-colors cursor-pointer gap-3 md:gap-0"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    {/* Order ID */}
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 md:pr-3">
                      {order.id}
                    </div>

                    {/* Time / Date — hidden on mobile */}
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{order.time}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{isEn ? DATE_EN : DATE_TH}</p>
                    </div>

                    {/* Customer + Items */}
                    <div className="flex-1 min-w-0 md:px-3">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{order.customerName}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="text-xs text-gray-400 flex items-center gap-0.5">
                            <span>{getItemEmoji(item.name)}</span>
                            <span>{isEn ? item.nameEn : item.name} ×{item.quantity}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="hidden md:block text-sm font-semibold text-gray-800 dark:text-white">
                      {order.total}฿
                    </div>

                    {/* Delivery */}
                    <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
                      {DELIVERY_FEE}฿
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0 md:flex md:items-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${cfg.pill}`}>
                        {cfg.icon}
                        {isEn ? cfg.labelEn : cfg.labelTh}
                      </span>
                    </div>

                    {/* Expand chevron */}
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-[#0a2540] bg-gray-50/60 dark:bg-[#030d1a] px-5 py-4 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">

                        {/* Items list */}
                        <div>
                          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">{isEn ? 'Order Items' : 'รายการสินค้า'}</p>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                  <span className="text-base">{getItemEmoji(item.name)}</span>
                                  {isEn ? item.nameEn : item.name}
                                  <span className="text-gray-400">×{item.quantity}</span>
                                </span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                  {item.price * item.quantity}฿
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-[#0a2540]">
                              <span className="text-xs text-gray-400">{isEn ? 'Delivery' : 'ค่าจัดส่ง'}</span>
                              <span className="text-xs text-gray-500">{DELIVERY_FEE}฿</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{isEn ? 'Total' : 'รวมทั้งหมด'}</span>
                              <span className="text-sm font-semibold text-[#00BDFE]">{order.total + DELIVERY_FEE}฿</span>
                            </div>
                          </div>
                        </div>

                        {/* Address + Notes */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">{isEn ? 'Delivery Address' : 'ที่อยู่จัดส่ง'}</p>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-600 dark:text-gray-300">{order.address}</p>
                            </div>
                          </div>
                          {order.notes && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">{isEn ? 'Note' : 'หมายเหตุ'}</p>
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">{order.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {(nextStatus || (order.status !== 'cancelled' && order.status !== 'delivered')) && (
                        <div className="flex gap-2 pt-2">
                          {nextStatus && nextLabel && (
                            <button
                              onClick={e => { e.stopPropagation(); handleUpdateStatus(order.id, nextStatus); setExpandedId(null); }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a3c2e] text-white text-sm font-medium hover:bg-[#244d3b] transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                              {isEn ? nextLabel.en : nextLabel.th}
                            </button>
                          )}
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button
                              onClick={e => { e.stopPropagation(); handleCancelOrder(order.id); }}
                              className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              {isEn ? 'Cancel Order' : 'ยกเลิกออเดอร์'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


export default OrdersPage;
