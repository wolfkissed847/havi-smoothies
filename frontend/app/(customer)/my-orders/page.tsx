"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Star, MapPin, MessageSquare, ShoppingBag, LogIn, Truck,
  ClipboardList, AlertCircle, Loader2
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrderHistory } from '../../contexts/OrderHistoryContext';
import { CustomerOrder, OrderStatus } from '../../lib/types';
import { RatingModal } from '../../components/customer/RatingModal';

// ─── helpers ───────────────────────────────────────────────────────────────
function formatDate(date: Date, isEn: boolean): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  const timeStr = date.toLocaleTimeString(isEn ? 'en-US' : 'th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (dayDiff === 0) return `${isEn ? 'Today' : 'วันนี้'} ${timeStr}`;
  if (dayDiff === 1) return `${isEn ? 'Yesterday' : 'เมื่อวาน'} ${timeStr}`;
  return date.toLocaleDateString(isEn ? 'en-GB' : 'th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG: Record<OrderStatus, {
  labelTh: string; labelEn: string;
  icon: React.ReactNode; bg: string; text: string; border: string; step: number;
}> = {
  pending:   { labelTh: 'รอดำเนินการ',  labelEn: 'Pending',    icon: <Clock className="w-3.5 h-3.5" />,         bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-600 dark:text-amber-400',   border: 'border-amber-200 dark:border-amber-700', step: 0 },
  preparing: { labelTh: 'กำลังเตรียม',  labelEn: 'Preparing',  icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-[#00BDFE]',                        border: 'border-[#D8F2FF] dark:border-[#00BDFE]/30', step: 1 },
  ready:     { labelTh: 'พร้อมรับ',     labelEn: 'Ready',      icon: <Package className="w-3.5 h-3.5" />,       bg: 'bg-green-50 dark:bg-green-900/20',   text: 'text-green-600 dark:text-green-400',   border: 'border-green-200 dark:border-green-700', step: 2 },
  delivered: { labelTh: 'จัดส่งแล้ว',   labelEn: 'Delivered',  icon: <CheckCircle2 className="w-3.5 h-3.5" />,  bg: 'bg-gray-50 dark:bg-gray-800/40',     text: 'text-gray-500 dark:text-gray-400',     border: 'border-gray-200 dark:border-gray-700', step: 3 },
  cancelled: { labelTh: 'ยกเลิกแล้ว',  labelEn: 'Cancelled',  icon: <XCircle className="w-3.5 h-3.5" />,       bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-500 dark:text-red-400',       border: 'border-red-200 dark:border-red-800', step: -1 },
};

const PROGRESS_STEPS = [
  { labelTh: 'รับออเดอร์', labelEn: 'Received', icon: '📋' },
  { labelTh: 'กำลังเตรียม', labelEn: 'Preparing', icon: '🥤' },
  { labelTh: 'พร้อมส่ง', labelEn: 'Ready', icon: '📦' },
  { labelTh: 'จัดส่งแล้ว', labelEn: 'Delivered', icon: '✅' },
];

// ─── Star display ───────────────────────────────────────────────────────────
function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700 fill-gray-200 dark:fill-gray-700'}`}
        />
      ))}
    </div>
  );
}

// ─── Order Progress Bar ─────────────────────────────────────────────────────
function OrderProgress({ status, isEn }: { status: OrderStatus; isEn: boolean }) {
  const step = STATUS_CONFIG[status].step;
  if (step < 0) return null;
  return (
    <div className="flex items-center gap-1 mt-3">
      {PROGRESS_STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${
              i < step ? 'bg-[#00BDFE] text-white' :
              i === step ? 'bg-[#00BDFE] text-white ring-4 ring-[#D8F2FF] dark:ring-[#00BDFE]/20' :
              'bg-gray-100 dark:bg-[#0a2540] text-gray-400'
            }`}>
              {i < step ? '✓' : s.icon}
            </div>
            <span className={`hidden sm:block text-center leading-tight transition-colors ${
              i <= step ? 'text-[#00BDFE]' : 'text-gray-300 dark:text-gray-600'
            }`} style={{ fontSize: '9px', maxWidth: '42px' }}>
              {isEn ? s.labelEn : s.labelTh}
            </span>
          </div>
          {i < PROGRESS_STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-[#00BDFE]' : 'bg-gray-100 dark:bg-[#0a2540]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Order Card ─────────────────────────────────────────────────────────────
function OrderCard({ order, onConfirmReceipt, onRate, onCancel, isEn }: {
  order: CustomerOrder;
  onConfirmReceipt: (id: string) => void;
  onRate: (id: string) => void;
  onCancel: (id: string) => void;
  isEn: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const cfg = STATUS_CONFIG[order.status];
  const isActive = ['pending', 'preparing', 'ready'].includes(order.status);
  const showConfirm = order.status === 'ready' && !order.isReceived;
  const showRate = order.status === 'delivered' && !order.rating;
  const showCancelBtn = order.status === 'pending';
  const displayItems = expanded ? order.items : order.items.slice(0, 2);
  const hasMore = order.items.length > 2;

  const handleConfirm = async () => {
    setConfirming(true);
    await new Promise(r => setTimeout(r, 700));
    onConfirmReceipt(order.id);
    setConfirming(false);
  };

  const handleCancel = async () => {
    if (!window.confirm(isEn ? 'Cancel this order?' : 'ยืนยันการยกเลิกออเดอร์นี้?')) return;
    setCancelling(true);
    await new Promise(r => setTimeout(r, 500));
    onCancel(order.id);
    setCancelling(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`bg-white dark:bg-[#0d1f35] rounded-2xl border overflow-hidden shadow-sm transition-shadow hover:shadow-md ${
        showConfirm ? 'border-green-200 dark:border-green-700' :
        order.status === 'cancelled' ? 'border-red-100 dark:border-red-900/30' :
        'border-[#E8F5FF] dark:border-[#0a2540]'
      }`}
    >
      {/* Ready to pick up banner */}
      {showConfirm && (
        <div className="bg-green-500 px-4 py-2 flex items-center gap-2">
          <Package className="w-4 h-4 text-white flex-shrink-0" />
          <span className="text-white text-xs font-medium">
            {isEn ? '🎉 Your order is ready! Please confirm receipt.' : '🎉 ออเดอร์ของคุณพร้อมแล้ว! กรุณายืนยันรับสินค้า'}
          </span>
        </div>
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-800 dark:text-white">{order.orderNumber || order.id}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                {cfg.icon}
                {isEn ? cfg.labelEn : cfg.labelTh}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(order.createdAt, isEn)}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <p className="text-[#00BDFE] font-semibold">฿{order.total}</p>
            <p className="text-gray-400 text-xs">
              {order.items.reduce((s, i) => s + i.quantity, 0)} {isEn ? 'cup(s)' : 'แก้ว'}
            </p>
          </div>
        </div>

        {/* Progress bar (active orders only) */}
        {isActive && <OrderProgress status={order.status} isEn={isEn} />}

        {/* Items */}
        <div className="mt-3 space-y-2">
          {displayItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: item.bgColor }}
              >
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-200 truncate">
                  {isEn ? item.nameEn : item.name}
                  <span className="text-gray-400 ml-1">×{item.quantity}</span>
                </p>
                {item.options && (
                  <p className="text-gray-400" style={{ fontSize: '10px' }}>
                    {isEn
                      ? `${item.options.type === 'cold' ? 'Cold' : 'Blended'} · ${item.options.sweetness === 'less' ? 'Less sweet' : item.options.sweetness === 'more' ? 'More sweet' : item.options.sweetness === 'extra' ? 'Extra sweet' : 'Normal'}`
                      : `${item.options.type === 'cold' ? 'เย็น' : 'ปั่น'} · ${item.options.sweetness === 'less' ? 'หวานน้อย' : item.options.sweetness === 'more' ? 'หวานมาก' : item.options.sweetness === 'extra' ? 'หวานจัด' : 'หวานปกติ'}`
                    }
                    {item.options.notes ? ` · ${item.options.notes}` : ''}
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">฿{item.price * item.quantity}</span>
            </div>
          ))}
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-[#00BDFE] hover:underline ml-11"
            >
              {expanded
                ? (isEn ? 'Show less' : 'ย่อ')
                : (isEn ? `+${order.items.length - 2} more item(s)` : `+${order.items.length - 2} รายการ`)}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Address & Notes */}
        {(order.address || order.notes) && (
          <div className="mt-3 pt-3 border-t border-[#F0FBFF] dark:border-[#0a2540] space-y-1.5">
            {order.address && (
              <div className="flex items-start gap-1.5 text-xs text-gray-400">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#00BDFE]" />
                <span className="line-clamp-1">{order.address}</span>
              </div>
            )}
            {order.notes && (
              <div className="flex items-start gap-1.5 text-xs text-gray-400">
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{order.notes}</span>
              </div>
            )}
          </div>
        )}

        {/* Rating display (already rated) */}
        {order.rating && (
          <div className="mt-3 pt-3 border-t border-[#F0FBFF] dark:border-[#0a2540]">
            <div className="flex items-center gap-2 mb-1">
              <StarDisplay rating={order.rating} />
              <span className="text-xs text-amber-500 font-medium">
                {isEn ? 'Rated' : 'ให้คะแนนแล้ว'}
              </span>
            </div>
            {order.review && (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{order.review}"</p>
            )}
          </div>
        )}

        {/* Action buttons */}
        {(showConfirm || showRate || showCancelBtn) && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {showConfirm && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 min-w-[160px] py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-200 dark:shadow-green-900/30"
              >
                {confirming ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{isEn ? 'Confirming...' : 'กำลังยืนยัน...'}</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" />{isEn ? 'Confirm Receipt' : 'ยืนยันรับสินค้า'}</>
                )}
              </motion.button>
            )}
            {showRate && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRate(order.id)}
                className="flex-1 min-w-[140px] py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-amber-200 dark:shadow-amber-900/30"
              >
                <Star className="w-4 h-4 fill-white" />
                {isEn ? 'Rate Now' : 'ให้คะแนน'}
              </motion.button>
            )}
            {showCancelBtn && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1.5 transition-colors"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {isEn ? 'Cancel' : 'ยกเลิก'}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

export function MyOrdersPage() {
  const { t, isEn } = useLanguage();
  const { isLoggedIn, user } = useAuth();
  const { myOrders, confirmReceipt, submitReview, cancelOrder } = useOrderHistory();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);

  // Stats
  const totalSpent = myOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);
  const ratedOrders = myOrders.filter(o => o.rating);
  const avgRating = ratedOrders.length
    ? (ratedOrders.reduce((s, o) => s + (o.rating || 0), 0) / ratedOrders.length).toFixed(1)
    : null;
  const completedCount = myOrders.filter(o => o.status === 'delivered').length;

  // Filter tabs config
  const tabs: { key: FilterTab; labelTh: string; labelEn: string; count: number }[] = [
    { key: 'all',       labelTh: 'ทั้งหมด',         labelEn: 'All',       count: myOrders.length },
    { key: 'active',    labelTh: 'กำลังดำเนินการ',  labelEn: 'Active',    count: myOrders.filter(o => ['pending','preparing','ready'].includes(o.status)).length },
    { key: 'completed', labelTh: 'เสร็จสิ้น',        labelEn: 'Completed', count: myOrders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', labelTh: 'ยกเลิก',           labelEn: 'Cancelled', count: myOrders.filter(o => o.status === 'cancelled').length },
  ];

  const filtered = myOrders.filter(o => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['pending', 'preparing', 'ready'].includes(o.status);
    if (activeTab === 'completed') return o.status === 'delivered';
    if (activeTab === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-3xl bg-[#D8F2FF] dark:bg-[#00BDFE]/10 flex items-center justify-center mx-auto mb-5">
          <ClipboardList className="w-12 h-12 text-[#00BDFE]" />
        </div>
        <h2 className="text-gray-800 dark:text-white mb-2">{t('myOrders')}</h2>
        <p className="text-gray-400 text-sm mb-8">{t('loginToViewOrders')}</p>
        <Link href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00BDFE] text-white font-medium hover:bg-[#00CBFE] transition-colors"
        >
          <LogIn className="w-4 h-4" />
          {t('login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#00BDFE] flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-gray-800 dark:text-white">{t('myOrders')}</h1>
            <p className="text-gray-400 text-xs">{user?.name}</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          {
            icon: <ShoppingBag className="w-4 h-4" />,
            value: myOrders.length,
            labelTh: 'ออเดอร์ทั้งหมด',
            labelEn: 'Total Orders',
            color: 'from-[#00BDFE] to-[#5ADEFF]',
          },
          {
            icon: <Truck className="w-4 h-4" />,
            value: `฿${totalSpent.toLocaleString()}`,
            labelTh: t('totalSpent'),
            labelEn: t('totalSpent'),
            color: 'from-violet-400 to-purple-500',
          },
          {
            icon: <Star className="w-4 h-4 fill-white" />,
            value: avgRating ? `${avgRating} ★` : '—',
            labelTh: t('ratingLabel'),
            labelEn: t('ratingLabel'),
            color: 'from-amber-400 to-orange-400',
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl bg-gradient-to-br ${card.color} p-3 text-white`}
          >
            <div className="mb-1 opacity-80">{card.icon}</div>
            <p className="font-semibold text-sm leading-tight">{card.value}</p>
            <p className="opacity-80 leading-tight mt-0.5" style={{ fontSize: '10px' }}>
              {isEn ? card.labelEn : card.labelTh}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Alert: orders needing action */}
      {(() => {
        const readyCount = myOrders.filter(o => o.status === 'ready' && !o.isReceived).length;
        const rateCount = myOrders.filter(o => o.status === 'delivered' && !o.rating).length;
        if (readyCount > 0) return (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-300 text-xs">
              {isEn
                ? `${readyCount} order(s) ready for pickup! Please confirm receipt.`
                : `มี ${readyCount} ออเดอร์พร้อมรับแล้ว! กรุณายืนยันรับสินค้า`}
            </p>
          </motion.div>
        );
        if (rateCount > 0) return (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-center gap-2"
          >
            <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-amber-700 dark:text-amber-300 text-xs">
              {isEn
                ? `You have ${rateCount} order(s) waiting for your review!`
                : `มี ${rateCount} ออเดอร์รอคะแนนรีวิวจากคุณ!`}
            </p>
          </motion.div>
        );
        return null;
      })()}

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#00BDFE] text-white shadow-md shadow-[#00BDFE]/20'
                : 'bg-white dark:bg-[#0d1f35] text-gray-500 dark:text-gray-400 border border-[#E8F5FF] dark:border-[#0a2540] hover:border-[#00BDFE]/40'
            }`}
          >
            {isEn ? tab.labelEn : tab.labelTh}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs leading-none ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-[#E8F5FF] dark:bg-[#0a2540] text-gray-500 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-[#D8F2FF] dark:bg-[#00BDFE]/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-[#00BDFE]" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{t('noOrderHistory')}</p>
            <p className="text-gray-300 dark:text-gray-600 text-xs">{t('noOrderHistoryDesc')}</p>
            <Link href="/menu"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-[#00BDFE] text-white text-sm hover:bg-[#00CBFE] transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {isEn ? 'Order Now' : 'สั่งซื้อเลย'}
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onConfirmReceipt={confirmReceipt}
                onRate={setRatingOrderId}
                onCancel={cancelOrder}
                isEn={isEn}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      {ratingOrderId && (
        <RatingModal
          orderId={ratingOrderId}
          onClose={() => setRatingOrderId(null)}
          onSubmit={(rating, review) => {
            submitReview(ratingOrderId, rating, review);
            setRatingOrderId(null);
          }}
        />
      )}
    </div>
  );
}


export default MyOrdersPage;
