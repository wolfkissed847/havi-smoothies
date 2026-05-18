"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { menuItems, MenuItem, MenuCategory } from '../../data/mockData';
import { OrderOptionsModal } from '../../components/customer/OrderOptionsModal';
import { getMenuItems } from '../../lib/db';

type Category = 'all' | MenuCategory;

const categories: { key: Category; labelKey: string; emoji: string }[] = [
  { key: 'all', labelKey: 'all', emoji: '🍹' },
  { key: 'fruit', labelKey: 'fruit', emoji: '🍊' },
  { key: 'vegetable', labelKey: 'vegetable', emoji: '🥕' },
];

function MenuItemCard({ item, onOrder }: { item: MenuItem; onOrder: (item: MenuItem) => void }) {
  const { isEn } = useLanguage();
  const { items } = useCart();
  const cartQty = items.filter(i => i.menuItem.id === item.id).reduce((s, i) => s + i.quantity, 0);

  return (
    <div className={`group bg-white dark:bg-[#060f1e] rounded-2xl border transition-all overflow-hidden hover:shadow-md hover:-translate-y-0.5 ${
      !item.isAvailable ? 'opacity-60' : 'border-[#E8F5FF] dark:border-[#0a2540] hover:border-[#84E4F7] dark:hover:border-[#00BDFE]/40'
    }`}>
      {/* Emoji Image Area */}
      <div
        className="relative flex items-center justify-center h-36 overflow-hidden cursor-pointer"
        style={{ background: item.bgColor }}
        onClick={() => item.isAvailable && onOrder(item)}
      >
        <span
          className="select-none group-hover:scale-110 transition-transform duration-300"
          style={{ fontSize: '72px', lineHeight: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.10))' }}
        >
          {item.emoji}
        </span>
        <div className="absolute top-2 left-2 flex gap-1">
          {item.isNew && (
            <span className="px-2 py-0.5 rounded-full bg-[#00BDFE] text-white text-xs font-medium">ใหม่</span>
          )}
          {item.isFeatured && !item.isNew && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-white text-xs font-medium">⭐ ขายดี</span>
          )}
          {!item.isAvailable && (
            <span className="px-2 py-0.5 rounded-full bg-gray-500 text-white text-xs">หมด</span>
          )}
        </div>
        {cartQty > 0 && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#00BDFE] text-white flex items-center justify-center" style={{ fontSize: '11px', fontWeight: 600 }}>
            {cartQty}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-gray-800 dark:text-white text-sm">{isEn ? item.nameEn : item.name}</p>
        <p className="text-gray-400 mt-0.5 line-clamp-2" style={{ fontSize: '11px' }}>
          {isEn ? item.descriptionEn : item.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[#00BDFE] font-semibold text-sm">฿{item.price}</span>
          {item.isAvailable ? (
            <button
              onClick={() => onOrder(item)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#00BDFE] text-white hover:bg-[#00CBFE] transition-all active:scale-95"
            >
              สั่งเลย
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs">หมด</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function MenuPageContent() {
  const { t, isEn } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCat = (searchParams.get('cat') as Category) || 'all';
  const [activeCategory, setActiveCategory] = useState<Category>(initialCat);
  const [search, setSearch] = useState('');
  const [orderingItem, setOrderingItem] = useState<MenuItem | null>(null);
  
  const [dbMenuItems, setDbMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load menu items from Supabase
  useEffect(() => {
    async function loadMenu() {
      try {
        const items = await getMenuItems();
        if (items && items.length > 0) {
          setDbMenuItems(items);
        } else {
          setDbMenuItems(menuItems);
        }
      } catch (err) {
        console.error('Failed to load menu items:', err);
        setDbMenuItems(menuItems);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const currentMenuItems = dbMenuItems.length > 0 ? dbMenuItems : menuItems;

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    if (cat === 'all') {
      router.push('/menu');
    } else {
      router.push(`/menu?cat=${cat}`);
    }
  };

  const filtered = useMemo(() => {
    return currentMenuItems.filter(item => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const searchLower = search.toLowerCase();
      const matchSearch = search === '' ||
        item.name.includes(search) ||
        item.nameEn.toLowerCase().includes(searchLower) ||
        item.description.includes(search);
      return matchCat && matchSearch;
    });
  }, [currentMenuItems, activeCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-800 dark:text-white mb-1">{t('menuTitle')}</h1>
        <p className="text-gray-400 text-sm">{isEn ? `${currentMenuItems.length} items available` : `${currentMenuItems.length} รายการ`}</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('search')}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D8F2FF] dark:border-[#0a2540] bg-white dark:bg-[#060f1e] text-gray-800 dark:text-white outline-none focus:border-[#00BDFE] transition-colors text-sm"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              activeCategory === cat.key
                ? 'bg-[#00BDFE] text-white shadow-sm'
                : 'bg-white dark:bg-[#060f1e] text-gray-500 dark:text-gray-400 border border-[#E8F5FF] dark:border-[#0a2540] hover:border-[#84E4F7] dark:hover:border-[#00BDFE]/40'
            }`}
          >
            <span style={{ fontSize: '18px' }}>{cat.emoji}</span>
            <span>{t(cat.labelKey as any)}</span>
          </button>
        ))}
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-gray-400 mb-4">
          {isEn ? `${filtered.length} results for "${search}"` : `ค้นพบ ${filtered.length} รายการ สำหรับ "${search}"`}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 dark:text-gray-400">{t('noItems')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(item => (
            <MenuItemCard key={item.id} item={item} onOrder={setOrderingItem} />
          ))}
        </div>
      )}

      {/* Order Options Modal */}
      {orderingItem && (
        <OrderOptionsModal item={orderingItem} onClose={() => setOrderingItem(null)} />
      )}
    </div>
  );
}

export function MenuPage() {
  return (
    <React.Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 text-center text-gray-500 dark:text-gray-400">
        <div className="text-5xl mb-4 animate-bounce inline-block">🍹</div>
        <p className="text-sm font-medium">กำลังเตรียมเมนูแสนอร่อย...</p>
      </div>
    }>
      <MenuPageContent />
    </React.Suspense>
  );
}

export default MenuPage;
