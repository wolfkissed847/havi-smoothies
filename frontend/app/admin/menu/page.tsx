"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../../lib/db';
import { MenuItem, MenuCategory } from '../../lib/types';

type Category = MenuCategory;
type BadgeType = 'none' | 'featured' | 'new' | 'recommended';

const CATEGORIES: { key: Category; labelTh: string; labelEn: string }[] = [
  { key: 'fruit', labelTh: 'ผลไม้', labelEn: 'Fruit' },
  { key: 'vegetable', labelTh: 'ผัก', labelEn: 'Vegetable' },
];

const CAT_COLORS: Record<string, string> = {
  fruit: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  vegetable: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
};
const CAT_LABELS_TH: Record<string, string> = { fruit: 'ผลไม้', vegetable: 'ผัก' };
const CAT_LABELS_EN: Record<string, string> = { fruit: 'Fruit', vegetable: 'Vegetable' };

const BADGE_OPTIONS: { key: BadgeType; labelTh: string; labelEn: string }[] = [
  { key: 'none', labelTh: '— ไม่มี —', labelEn: '— None —' },
  { key: 'featured', labelTh: 'ขายดี', labelEn: 'Best Seller' },
  { key: 'new', labelTh: 'ใหม่', labelEn: 'New' },
  { key: 'recommended', labelTh: 'แนะนำ', labelEn: 'Recommended' },
];

const EMOJI_LIST = [
  '🍓','🥭','🍋','🥝','🥕','🍉','🍇','🥦','🍊','🫐',
  '🍑','🍍','🥥','🍈','🌿','🥒','🥬','🍅','🌽','🥑',
  '🫑','🧅','🧄','🍒','🫐',
];

// Mock sold counts per item id
const SOLD_MOCK: Record<number, number> = {
  1: 142, 2: 98, 3: 76, 4: 54, 5: 67, 6: 113,
  7: 39, 8: 55, 9: 28, 10: 87, 11: 44, 12: 31,
  13: 43, 14: 29, 15: 18, 16: 22, 17: 15, 18: 12,
};

function getBadge(item: MenuItem): BadgeType {
  if (item.isNew) return 'new';
  if (item.isFeatured) return 'featured';
  return 'none';
}

interface FormData {
  name: string;
  nameEn: string;
  category: Category;
  price: number;
  description: string;
  descriptionEn: string;
  isAvailable: boolean;
  emoji: string;
  badge: BadgeType;
}

const DEFAULT_FORM: FormData = {
  name: '',
  nameEn: '',
  category: 'fruit',
  price: 45,
  description: '',
  descriptionEn: '',
  isAvailable: true,
  emoji: '🍓',
  badge: 'none',
};

// Custom Badge Dropdown
function BadgeDropdown({ value, onChange, isEn }: {
  value: BadgeType;
  onChange: (v: BadgeType) => void;
  isEn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const current = BADGE_OPTIONS.find(b => b.key === value)!;
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#0a2540] bg-gray-50 dark:bg-[#030d1a] text-gray-700 dark:text-gray-200 text-sm"
      >
        <span>{isEn ? current.labelEn : current.labelTh}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#060f1e] border border-gray-200 dark:border-[#0a2540] rounded-xl shadow-lg z-20 overflow-hidden">
          {BADGE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === opt.key
                  ? 'bg-[#E8F5FF] dark:bg-[#00BDFE]/15 text-[#00BDFE]'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0a1828]'
              }`}
            >
              {isEn ? opt.labelEn : opt.labelTh}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MenuManagementPage() {
  const { isEn } = useLanguage();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [soldCounts, setSoldCounts] = useState<Record<string | number, number>>(SOLD_MOCK);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<number | string | null>(null);

  // Fetch menu items from Supabase on mount
  useEffect(() => {
    async function loadMenu() {
      try {
        const dbItems = await getMenuItems();
        if (dbItems && dbItems.length > 0) {
          setItems(dbItems);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Failed to load menu items:', err);
        setItems([]);
      }
    }
    loadMenu();
  }, []);

  const filtered = items.filter(item => {
    const matchCat = catFilter === 'all' || item.category === catFilter;
    const matchSearch = search === '' ||
      item.name.includes(search) ||
      item.nameEn.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const availableCount = items.filter(i => i.isAvailable).length;
  const unavailableCount = items.filter(i => !i.isAvailable).length;
  const totalSold = Object.values(soldCounts).reduce((a, b) => a + b, 0);

  const catTabItems = [
    { key: 'all' as const, labelTh: 'ทั้งหมด', labelEn: 'All', count: items.length },
    { key: 'fruit' as const, labelTh: 'ผลไม้', labelEn: 'Fruit', count: items.filter(i => i.category === 'fruit').length },
    { key: 'vegetable' as const, labelTh: 'ผัก', labelEn: 'Vegetable', count: items.filter(i => i.category === 'vegetable').length },
  ];

  const openAdd = () => {
    setEditingItem(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      nameEn: item.nameEn,
      category: item.category,
      price: item.price,
      description: item.description,
      descriptionEn: item.descriptionEn,
      isAvailable: item.isAvailable,
      emoji: item.emoji,
      badge: getBadge(item),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const isNew = form.badge === 'new';
    const isFeatured = form.badge === 'featured' || form.badge === 'recommended';
    
    if (editingItem) {
      // 1. Update in Supabase
      const updated = await updateMenuItem(editingItem.id, {
        name: form.name,
        nameEn: form.nameEn,
        category: form.category,
        price: form.price,
        description: form.description,
        descriptionEn: form.descriptionEn,
        isAvailable: form.isAvailable,
        emoji: form.emoji,
        isNew,
        isFeatured,
      });

      // 2. Update state locally
      if (updated) {
        setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i));
      } else {
        setItems(prev => prev.map(i => i.id === editingItem.id
          ? { ...i, ...form, isNew, isFeatured }
          : i
        ));
      }
    } else {
      // 1. Create in Supabase
      const created = await createMenuItem({
        name: form.name,
        nameEn: form.nameEn,
        category: form.category,
        price: form.price,
        description: form.description,
        descriptionEn: form.descriptionEn,
        isAvailable: form.isAvailable,
        emoji: form.emoji,
        isNew,
        isFeatured,
        image: '',
        bgColor: form.category === 'fruit' ? '#FFF8E1' : '#F0FFF4',
      });

      // 2. Update state locally
      if (created) {
        setItems(prev => [...prev, created]);
        setSoldCounts(prev => ({ ...prev, [created.id]: 0 }));
      } else {
        const newId = Math.random().toString();
        const newItem: MenuItem = {
          id: newId as any,
          ...form,
          isNew,
          isFeatured,
          image: '',
          bgColor: form.category === 'fruit' ? '#FFF8E1' : '#F0FFF4',
        };
        setItems(prev => [...prev, newItem]);
        setSoldCounts(prev => ({ ...prev, [newId]: 0 }));
      }
    }
    setShowModal(false);
  };

  const handleDelete = async (id: number | string) => {
    // 1. Delete from Supabase
    await deleteMenuItem(id);
    
    // 2. Update state locally
    setItems(prev => prev.filter(i => i.id !== id));
    setDeleteConfirm(null);
  };

  const toggleAvailability = async (id: number | string) => {
    const itemToToggle = items.find(i => i.id === id);
    if (!itemToToggle) return;

    // Toggle local state immediately for snappy UX response
    setItems(prev => prev.map(i => i.id === id ? { ...i, isAvailable: !i.isAvailable } : i));

    // Update in Supabase
    await updateMenuItem(id, { isAvailable: !itemToToggle.isAvailable });
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#0a2540] bg-gray-50 dark:bg-[#030d1a] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] focus:bg-white dark:focus:bg-[#060f1e] transition-colors";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-gray-800 dark:text-white">{isEn ? 'Menu Management' : 'จัดการเมนู'}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {items.length} {isEn ? 'items' : 'รายการ'} · {availableCount} {isEn ? 'available' : 'เปิดขาย'} / {unavailableCount} {isEn ? 'closed' : 'ปิดชั่วคราว'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isEn ? 'Search menu...' : 'ค้นหาเมนู...'}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#0a2540] bg-white dark:bg-[#060f1e] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors w-48"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a3c2e] text-white text-sm font-medium hover:bg-[#244d3b] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {isEn ? '+ Add Menu' : '+ เพิ่มเมนูใหม่'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-gray-100 dark:border-[#0a2540] px-5 py-4">
          <p className="text-gray-400 text-xs mb-1">{isEn ? 'Total Menu' : 'เมนูทั้งหมด'}</p>
          <p className="text-gray-800 dark:text-white font-semibold" style={{ fontSize: '1.5rem' }}>{items.length}</p>
        </div>
        <div className="bg-[#F0FFF6] dark:bg-[#0a2540] rounded-2xl border border-green-100 dark:border-[#0a2540] px-5 py-4">
          <p className="text-gray-400 text-xs mb-1">{isEn ? 'Available' : 'เปิดขาย'}</p>
          <p className="text-green-600 dark:text-green-400 font-semibold" style={{ fontSize: '1.5rem' }}>{availableCount}</p>
        </div>
        <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-gray-100 dark:border-[#0a2540] px-5 py-4">
          <p className="text-gray-400 text-xs mb-1">{isEn ? 'Closed' : 'ปิดชั่วคราว'}</p>
          <p className="text-gray-500 dark:text-gray-300 font-semibold" style={{ fontSize: '1.5rem' }}>{unavailableCount}</p>
        </div>
        <div className="bg-[#E8F5FF] dark:bg-[#00BDFE]/10 rounded-2xl border border-[#D8F2FF] dark:border-[#00BDFE]/20 px-5 py-4">
          <p className="text-gray-400 text-xs mb-1">{isEn ? 'Total Sold' : 'ยอดขายรวม'}</p>
          <p className="text-[#00BDFE] font-semibold" style={{ fontSize: '1.5rem' }}>{totalSold.toLocaleString()} {isEn ? 'cups' : 'แก้ว'}</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-gray-100 dark:border-[#0a2540]">
        {catTabItems.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCatFilter(cat.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              catFilter === cat.key
                ? 'border-[#1a3c2e] text-[#1a3c2e] dark:text-white dark:border-white'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            {isEn ? cat.labelEn : cat.labelTh}
            <span className={`px-1.5 py-0.5 rounded-md text-xs ${
              catFilter === cat.key ? 'bg-[#1a3c2e] text-white dark:bg-white dark:text-[#1a3c2e]' : 'bg-gray-100 dark:bg-[#0a2540] text-gray-500 dark:text-gray-400'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400">{isEn ? 'No items found' : 'ไม่พบรายการ'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(item => {
            const badge = getBadge(item);
            const sold = soldCounts[item.id] ?? 0;
            return (
              <div key={item.id} className="bg-white dark:bg-[#060f1e] rounded-2xl border border-gray-100 dark:border-[#0a2540] overflow-hidden">
                {/* Emoji Area */}
                <div
                  className="relative flex items-center justify-center h-44"
                  style={{ background: item.bgColor || '#F8FBFF' }}
                >
                  <span style={{ fontSize: '72px', lineHeight: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}>
                    {item.emoji}
                  </span>
                  {/* Badge */}
                  {badge !== 'none' && (
                    <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      badge === 'new' ? 'bg-[#00BDFE] text-white' : 'bg-[#e6f4ea] text-green-700 border border-green-200'
                    }`}>
                      {badge === 'new' ? (isEn ? 'New' : 'ใหม่')
                        : badge === 'featured' ? (isEn ? 'Best Seller' : 'ขายดี')
                        : (isEn ? 'Recommended' : 'แนะนำ')}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">{isEn ? item.nameEn : item.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{isEn ? item.name : item.nameEn}</p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-1">{isEn ? item.descriptionEn : item.description}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[#00BDFE] font-semibold text-sm">{item.price}฿</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CAT_COLORS[item.category]}`}>
                      {isEn ? CAT_LABELS_EN[item.category] : CAT_LABELS_TH[item.category]}
                    </span>
                    <span className="ml-auto text-gray-400 text-xs">{sold.toLocaleString()} {isEn ? 'cups' : 'แก้ว'}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-[#0a2540]">
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                        item.isAvailable
                          ? 'bg-[#e6f4ea] text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-[#0a2540] text-gray-400'
                      }`}
                    >
                      {item.isAvailable
                        ? <><Eye className="w-3.5 h-3.5" /> {isEn ? 'Available' : 'เปิดขาย'}</>
                        : <><EyeOff className="w-3.5 h-3.5" /> {isEn ? 'Closed' : 'ปิดอยู่'}</>
                      }
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#00BDFE] hover:bg-[#E8F5FF] dark:hover:bg-[#00BDFE]/15 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Card (dashed) */}
          <button
            onClick={openAdd}
            className="min-h-[280px] rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#0a2540] flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-[#00BDFE] hover:text-[#00BDFE] transition-colors group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:bg-[#E8F5FF] dark:group-hover:bg-[#00BDFE]/10 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">{isEn ? 'Add New Menu' : 'เพิ่มเมนูใหม่'}</p>
          </button>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#060f1e] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 dark:border-[#0a2540] max-h-[92vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
              <h3 className="text-gray-800 dark:text-white">{editingItem ? (isEn ? 'Edit Menu' : 'แก้ไขเมนู') : (isEn ? 'Add New Menu' : 'เพิ่มเมนูใหม่')}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0a2540]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-5">
              {/* Emoji Picker */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{isEn ? 'Emoji Icon' : 'ไอคอน Emoji'}</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_LIST.map((em, i) => (
                    <button
                      key={`emoji-${i}`}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, emoji: em }))}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        form.emoji === em
                          ? 'border-2 border-[#1a3c2e] bg-[#e6f4ea] dark:bg-[#1a3c2e]/30'
                          : 'border border-gray-100 dark:border-[#0a2540] bg-gray-50 dark:bg-[#030d1a] hover:border-gray-300 dark:hover:border-[#1e3a5f]'
                      }`}
                    >
                      <span style={{ fontSize: '24px' }}>{em}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name TH */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {isEn ? 'Menu Name (Thai)' : 'ชื่อเมนู (ภาษาไทย)'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={isEn ? 'e.g. สตรอว์เบอร์รี่' : 'เช่น สตรอว์เบอร์รี่'}
                  className={inputCls}
                />
              </div>

              {/* Name EN */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {isEn ? 'Menu Name (English)' : 'ชื่อเมนู (ภาษาอังกฤษ)'}
                </label>
                <input
                  type="text"
                  value={form.nameEn}
                  onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                  placeholder="e.g. Strawberry"
                  className={inputCls}
                />
              </div>

              {/* Category + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">{isEn ? 'Category' : 'หมวดหมู่'}</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                    className={inputCls}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.key} value={c.key}>{isEn ? c.labelEn : c.labelTh}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {isEn ? 'Price (฿)' : 'ราคา (฿)'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    placeholder="45"
                    min={1}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">{isEn ? 'Ingredients' : 'ส่วนประกอบ'}</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value, descriptionEn: e.target.value }))}
                  placeholder={isEn ? 'e.g. Strawberry, Honey, Ice' : 'เช่น สตรอว์เบอร์รี่ น้ำผึ้ง น้ำแข็ง'}
                  className={inputCls}
                />
              </div>

              {/* Badge + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Badge</label>
                  <BadgeDropdown value={form.badge} onChange={v => setForm(f => ({ ...f, badge: v }))} isEn={isEn} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">{isEn ? 'Status' : 'สถานะเมนู'}</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      form.isAvailable
                        ? 'bg-[#e6f4ea] text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-[#0a2540] text-gray-400'
                    }`}
                  >
                    {form.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {form.isAvailable ? (isEn ? 'Available' : 'เปิดขาย') : (isEn ? 'Closed' : 'ปิดชั่วคราว')}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-[#0a2540] flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-[#0a2540] text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#0a2540] transition-colors"
              >
                {isEn ? 'Cancel' : 'ยกเลิก'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.name || !form.price}
                className="flex-1 py-3 rounded-xl bg-[#1a3c2e] text-white text-sm font-medium hover:bg-[#244d3b] transition-colors disabled:opacity-50"
              >
                {editingItem ? (isEn ? 'Save Changes' : 'บันทึก') : (isEn ? 'Add Menu' : 'เพิ่มเมนู')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-[#060f1e] rounded-2xl border border-gray-100 dark:border-[#0a2540] p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-gray-800 dark:text-white text-center mb-2">{isEn ? 'Confirm Delete' : 'ยืนยันการลบ'}</h3>
            <p className="text-gray-400 text-sm text-center mb-6">{isEn ? 'This action cannot be undone.' : 'การกระทำนี้ไม่สามารถย้อนกลับได้'}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-[#0a2540] text-gray-600 dark:text-gray-300 text-sm"
              >
                {isEn ? 'Cancel' : 'ยกเลิก'}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                {isEn ? 'Delete' : 'ลบเมนู'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default MenuManagementPage;
