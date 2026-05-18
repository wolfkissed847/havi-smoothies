import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { MenuItem, ItemOptions, DrinkType, SweetnessLevel, CupType } from '../../lib/types';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface OrderOptionsModalProps {
  item: MenuItem;
  onClose: () => void;
}

const DEFAULT_OPTIONS: ItemOptions = {
  type: 'cold',
  sweetness: 'normal',
  cup: 'ready',
  notes: '',
};

export function OrderOptionsModal({ item, onClose }: OrderOptionsModalProps) {
  const { addItem } = useCart();
  const { isEn } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState<ItemOptions>({ ...DEFAULT_OPTIONS });
  const [added, setAdded] = useState(false);

  const drinkTypes: { key: DrinkType; labelTh: string; labelEn: string; icon: string }[] = [
    { key: 'cold', labelTh: 'แบบเย็น', labelEn: 'Cold', icon: '🧊' },
    { key: 'blended', labelTh: 'แบบปั่น', labelEn: 'Blended', icon: '🌀' },
  ];

  const sweetnessLevels: { key: SweetnessLevel; labelTh: string; labelEn: string; pct: string }[] = [
    { key: 'less', labelTh: 'หวานน้อย', labelEn: 'Less Sweet', pct: '25%' },
    { key: 'normal', labelTh: 'หวานปกติ', labelEn: 'Normal', pct: '50%' },
    { key: 'more', labelTh: 'หวานมาก', labelEn: 'More Sweet', pct: '75%' },
    { key: 'extra', labelTh: 'หวานจัด', labelEn: 'Extra Sweet', pct: '100%' },
  ];

  const cupTypes: { key: CupType; labelTh: string; labelEn: string; icon: string; descTh: string; descEn: string }[] = [
    { key: 'ready', labelTh: 'แก้วพร้อมดื่ม', labelEn: 'Ready to Drink', icon: '🥤', descTh: 'ใส่น้ำแข็งมาให้เลย', descEn: 'Ice included in cup' },
    { key: 'separate', labelTh: 'แยกน้ำแข็ง', labelEn: 'Ice on Side', icon: '🍹', descTh: 'น้ำแข็งแยกถุง', descEn: 'Ice in separate bag' },
  ];

  const handleConfirm = () => {
    addItem(item, quantity, options);
    setAdded(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-[#060f1e] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-[#D8F2FF]/60 dark:border-[#0a2540] max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-[#E8F5FF] dark:border-[#0a2540] flex-shrink-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: item.bgColor }}
          >
            <span style={{ fontSize: '36px', lineHeight: 1 }}>{item.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-800 dark:text-white font-semibold truncate">
              {isEn ? item.nameEn : item.name}
            </h3>
            <p className="text-[#00BDFE] font-semibold text-sm mt-0.5">฿{item.price} / แก้ว</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-[#E8F5FF] dark:hover:bg-[#0a2540] transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* ① แบบเครื่องดื่ม */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2.5">
              {isEn ? '① Type' : '① แบบเครื่องดื่ม'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {drinkTypes.map(dt => (
                <button
                  key={dt.key}
                  onClick={() => setOptions(o => ({ ...o, type: dt.key }))}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all ${
                    options.type === dt.key
                      ? 'border-[#00BDFE] bg-[#D8F2FF] dark:bg-[#00BDFE]/15 text-[#00BDFE]'
                      : 'border-[#E8F5FF] dark:border-[#0a2540] bg-white dark:bg-[#030d1a] text-gray-600 dark:text-gray-300 hover:border-[#84E4F7]'
                  }`}
                >
                  <span style={{ fontSize: '22px' }}>{dt.icon}</span>
                  <span className="text-sm font-medium">{isEn ? dt.labelEn : dt.labelTh}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ② จำนวน */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2.5">
              {isEn ? '② Quantity' : '② จำนวน'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl border-2 border-[#D8F2FF] dark:border-[#0a2540] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-[#00BDFE] hover:text-[#00BDFE] transition-colors active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-semibold text-gray-800 dark:text-white">{quantity}</span>
                <p className="text-xs text-gray-400 mt-0.5">{isEn ? 'cup(s)' : 'แก้ว'}</p>
              </div>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-xl border-2 border-[#D8F2FF] dark:border-[#0a2540] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-[#00BDFE] hover:text-[#00BDFE] transition-colors active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ③ ระดับความหวาน */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2.5">
              {isEn ? '③ Sweetness' : '③ ระดับความหวาน'}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {sweetnessLevels.map(sl => (
                <button
                  key={sl.key}
                  onClick={() => setOptions(o => ({ ...o, sweetness: sl.key }))}
                  className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 transition-all ${
                    options.sweetness === sl.key
                      ? 'border-[#00BDFE] bg-[#D8F2FF] dark:bg-[#00BDFE]/15 text-[#00BDFE]'
                      : 'border-[#E8F5FF] dark:border-[#0a2540] bg-white dark:bg-[#030d1a] text-gray-500 dark:text-gray-400 hover:border-[#84E4F7]'
                  }`}
                >
                  {/* Sweetness bar */}
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${options.sweetness === sl.key ? 'bg-[#00BDFE]' : 'bg-gray-300 dark:bg-gray-600'}`}
                      style={{ width: sl.pct }}
                    />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: options.sweetness === sl.key ? 600 : 400, lineHeight: 1.3, textAlign: 'center' }}>
                    {isEn ? sl.labelEn : sl.labelTh}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ④ ประเภทแก้ว */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2.5">
              {isEn ? '④ Cup Type' : '④ ประเภทแก้ว'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {cupTypes.map(ct => (
                <button
                  key={ct.key}
                  onClick={() => setOptions(o => ({ ...o, cup: ct.key }))}
                  className={`flex flex-col items-start gap-1 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                    options.cup === ct.key
                      ? 'border-[#00BDFE] bg-[#D8F2FF] dark:bg-[#00BDFE]/15'
                      : 'border-[#E8F5FF] dark:border-[#0a2540] bg-white dark:bg-[#030d1a] hover:border-[#84E4F7]'
                  }`}
                >
                  <span style={{ fontSize: '22px' }}>{ct.icon}</span>
                  <p className={`text-sm font-medium leading-tight ${options.cup === ct.key ? 'text-[#00BDFE]' : 'text-gray-700 dark:text-gray-200'}`}>
                    {isEn ? ct.labelEn : ct.labelTh}
                  </p>
                  <p className="text-gray-400" style={{ fontSize: '11px' }}>
                    {isEn ? ct.descEn : ct.descTh}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ⑤ หมายเหตุ */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2.5">
              {isEn ? '⑤ Notes (optional)' : '⑤ หมายเหตุ (ถ้ามี)'}
            </p>
            <textarea
              value={options.notes}
              onChange={e => setOptions(o => ({ ...o, notes: e.target.value }))}
              placeholder={isEn ? 'e.g. extra ice, less water...' : 'เช่น น้ำแข็งพิเศษ, น้ำน้อย...'}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E8F5FF] dark:border-[#0a2540] bg-white dark:bg-[#060f1e] flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isEn ? 'Total' : 'รวม'} {quantity} {isEn ? 'cup(s)' : 'แก้ว'}
            </span>
            <span className="text-[#00BDFE] font-semibold">฿{item.price * quantity}</span>
          </div>
          <button
            onClick={handleConfirm}
            disabled={added}
            className={`w-full py-3 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-[#00BDFE] text-white hover:bg-[#00CBFE] active:scale-[0.98]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {added
              ? (isEn ? 'Added! ✓' : 'เพิ่มแล้ว! ✓')
              : (isEn ? 'Add to Cart' : 'เพิ่มลงตะกร้า')}
          </button>
        </div>
      </div>
    </div>
  );
}
