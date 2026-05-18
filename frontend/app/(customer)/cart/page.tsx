"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, MapPin, MessageSquare, ShoppingCart, ArrowLeft, Map } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useOrderHistory } from '../../contexts/OrderHistoryContext';
import { MapPickerModal } from '../../components/customer/MapPickerModal';

const TYPE_LABEL: Record<string, { th: string; en: string }> = {
  cold:    { th: 'เย็น 🧊', en: 'Cold 🧊' },
  blended: { th: 'ปั่น 🌀', en: 'Blended 🌀' },
};
const SWEET_LABEL: Record<string, { th: string; en: string }> = {
  less:   { th: 'หวานน้อย', en: 'Less Sweet' },
  normal: { th: 'หวานปกติ', en: 'Normal' },
  more:   { th: 'หวานมาก', en: 'More Sweet' },
  extra:  { th: 'หวานจัด', en: 'Extra Sweet' },
};
const CUP_LABEL: Record<string, { th: string; en: string }> = {
  ready:    { th: 'แก้วพร้อมดื่ม', en: 'Ready to Drink' },
  separate: { th: 'แยกน้ำแข็ง', en: 'Ice on Side' },
};

export function CartPage() {
  const { isEn } = useLanguage();
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const { addOrder } = useOrderHistory();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const deliveryFee = 0;
  const grandTotal = total + deliveryFee;

  const handleOrder = async () => {
    if (!address.trim()) {
      alert(isEn ? 'Please enter your delivery address' : 'กรุณาระบุที่อยู่จัดส่ง');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    addOrder(items, address, notes);
    clearCart();
    router.push('/order-confirmation');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-[#D8F2FF] dark:bg-[#00BDFE]/10 flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-10 h-10 text-[#00BDFE]" />
        </div>
        <h2 className="text-gray-800 dark:text-white mb-2">{isEn ? 'Cart is Empty' : 'ตะกร้าว่างเปล่า'}</h2>
        <p className="text-gray-400 text-sm mb-6">{isEn ? 'Add your favorite drinks' : 'เพิ่มเมนูที่ชื่นชอบของคุณ'}</p>
        <Link href="/menu"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00BDFE] text-white text-sm hover:bg-[#00CBFE] transition-colors"
        >
          {isEn ? 'Go to Menu' : 'ไปที่เมนู'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/menu" className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-[#D8F2FF] dark:hover:bg-[#0a2540] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-gray-800 dark:text-white">{isEn ? 'Shopping Cart' : 'ตะกร้าสินค้า'}</h1>
        <span className="ml-auto text-sm text-gray-400">
          {items.reduce((s, i) => s + i.quantity, 0)} {isEn ? 'cup(s)' : 'แก้ว'}
        </span>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Left: Items + Form */}
        <div className="md:col-span-3 space-y-4">

          {/* Items */}
          <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E8F5FF] dark:border-[#0a2540]">
              <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                {isEn ? 'Selected Items' : 'รายการที่เลือก'}
              </p>
            </div>
            <div className="divide-y divide-[#F0FBFF] dark:divide-[#0a2540]">
              {items.map(({ cartId, menuItem, quantity, options }, index) => (
                <div key={cartId || `item-${menuItem.id}-${index}`} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    {/* Emoji */}
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ background: menuItem.bgColor }}
                    >
                      <span style={{ fontSize: '28px', lineHeight: 1 }}>{menuItem.emoji}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                        {isEn ? menuItem.nameEn : menuItem.name}
                      </p>
                      {/* Options chips */}
                      {options && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="px-1.5 py-0.5 rounded-md bg-[#E8F5FF] dark:bg-[#00BDFE]/15 text-[#00BDFE]" style={{ fontSize: '10px' }}>
                            {isEn ? TYPE_LABEL[options.type]?.en : TYPE_LABEL[options.type]?.th}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" style={{ fontSize: '10px' }}>
                            {isEn ? SWEET_LABEL[options.sweetness]?.en : SWEET_LABEL[options.sweetness]?.th}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                            {isEn ? CUP_LABEL[options.cup]?.en : CUP_LABEL[options.cup]?.th}
                          </span>
                        </div>
                      )}
                      {options?.notes ? (
                        <p className="text-gray-400 mt-1" style={{ fontSize: '11px' }}>
                          📝 {options.notes}
                        </p>
                      ) : null}
                      <p className="text-[#00BDFE] text-sm mt-1">฿{menuItem.price} × {quantity} = ฿{menuItem.price * quantity}</p>
                    </div>

                    {/* Qty controls + remove */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        onClick={() => removeItem(cartId)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(cartId, quantity - 1)}
                          className="w-6 h-6 rounded-lg border border-[#D8F2FF] dark:border-[#0a2540] flex items-center justify-center text-gray-500 hover:border-[#00BDFE] hover:text-[#00BDFE] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-medium text-gray-800 dark:text-white">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartId, quantity + 1)}
                          className="w-6 h-6 rounded-lg border border-[#D8F2FF] dark:border-[#0a2540] flex items-center justify-center text-gray-500 hover:border-[#00BDFE] hover:text-[#00BDFE] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00BDFE]" />
                <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">{isEn ? 'Delivery Address' : 'ที่อยู่จัดส่ง'}</p>
              </div>
              <button
                onClick={() => setShowMapPicker(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F5FF] dark:bg-[#00BDFE]/15 text-[#00BDFE] text-xs font-medium hover:bg-[#D8F2FF] dark:hover:bg-[#00BDFE]/25 transition-colors"
              >
                <Map className="w-3.5 h-3.5" />
                {isEn ? 'Pin on Map' : 'ปักหมุดแผนที่'}
              </button>
            </div>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder={isEn ? 'Enter or pin your delivery address' : 'กรอกหรือปักหมุดที่อยู่จัดส่ง'}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors resize-none"
            />
            {address && (
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#00BDFE]" />
                {isEn ? 'Location confirmed' : 'ระบุที่อยู่แล้ว'}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#00BDFE]" />
              <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">{isEn ? 'Order Notes' : 'หมายเหตุคำสั่งซื้อ'}</p>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={isEn ? 'Additional notes for your order...' : 'หมายเหตุเพิ่มเติมสำหรับออเดอร์...'}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Right: Summary */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] p-4 sticky top-20">
            <p className="font-medium text-gray-700 dark:text-gray-200 text-sm mb-4">
              {isEn ? 'Order Summary' : 'สรุปคำสั่งซื้อ'}
            </p>

            <div className="space-y-2 mb-4">
              {items.map(({ cartId, menuItem, quantity, options }, index) => (
                <div key={cartId || `summary-${menuItem.id}-${index}`} className="flex justify-between text-sm">
                  <div className="flex-1 mr-2 min-w-0">
                    <span className="text-gray-600 dark:text-gray-300 truncate block">
                      {isEn ? menuItem.nameEn : menuItem.name} ×{quantity}
                    </span>
                    {options && (
                      <span className="text-gray-400" style={{ fontSize: '10px' }}>
                        {isEn ? TYPE_LABEL[options.type]?.en : TYPE_LABEL[options.type]?.th} · {isEn ? SWEET_LABEL[options.sweetness]?.en : SWEET_LABEL[options.sweetness]?.th}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 flex-shrink-0">฿{menuItem.price * quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8F5FF] dark:border-[#0a2540] pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{isEn ? 'Subtotal' : 'ราคารวม'}</span>
                <span className="text-gray-700 dark:text-gray-300">฿{total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{isEn ? 'Delivery Fee' : 'ค่าจัดส่ง'}</span>
                <span className="text-green-500 font-medium">{isEn ? 'Free' : 'ฟรี'}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-[#E8F5FF] dark:border-[#0a2540]">
                <span className="text-gray-800 dark:text-white text-sm">{isEn ? 'Total' : 'ยอดรวม'}</span>
                <span className="text-[#00BDFE]">฿{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handleOrder}
              disabled={loading}
              className="w-full mt-5 py-3 rounded-xl bg-[#00BDFE] text-white font-medium text-sm hover:bg-[#00CBFE] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {isEn ? 'Placing order...' : 'กำลังส่งคำสั่งซื้อ...'}
                </>
              ) : (
                isEn ? 'Place Order' : 'ยืนยันคำสั่งซื้อ'
              )}
            </button>

            <Link href="/menu"
              className="block text-center text-sm text-[#00BDFE] mt-3 hover:underline"
            >
              {isEn ? 'Continue Shopping' : 'เพิ่มเมนูอื่น'}
            </Link>
          </div>
        </div>
      </div>
      {showMapPicker && (
        <MapPickerModal
          isEn={isEn}
          onClose={() => setShowMapPicker(false)}
          onConfirm={(addr) => {
            setAddress(addr);
            setShowMapPicker(false);
          }}
          initialAddress={address}
        />
      )}
    </div>
  );
}

export default CartPage;
