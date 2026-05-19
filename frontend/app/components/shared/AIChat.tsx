import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, X, Send, ShoppingCart, Plus, Minus, Check,
  ChevronUp, ChevronDown, Trash2, Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { MenuItem, DrinkType, SweetnessLevel, ItemOptions } from '../../lib/types';
import { getMenuItems } from '../../lib/db';

const aiResponses: Record<string, { th: string; en: string }> = {
  greeting: { th: 'สวัสดีค่ะ! ยินดีให้บริการ มีอะไรให้ช่วยไหมคะ? 😊', en: 'Hello! Happy to help. What can I do for you? 😊' },
  menu: { th: 'เรามีน้ำผลไม้สดและน้ำผักหลากหลายค่ะ ทั้งแบบเย็นและแบบปั่น ลองดูเมนูทั้งหมดได้เลยค่ะ 🍹', en: 'We have a variety of fresh fruit and vegetable juices, both cold and blended. Check our full menu! 🍹' },
  price: { th: 'ราคาของเราเริ่มต้นที่ 35 บาท สูงสุด 50 บาท ประหยัดดีมากค่ะ! 💰', en: 'Our prices start from 35 THB up to 50 THB. Very affordable! 💰' },
  delivery: { th: 'เราจัดส่งฟรีสำหรับออเดอร์แรกของวัน ระยะเวลาจัดส่งประมาณ 20-30 นาทีค่ะ 🛵', en: 'Free delivery on your first order of the day! Estimated delivery time is 20-30 minutes. 🛵' },
  recommend: { th: 'เมนูแนะนำของวันนี้คือ ส้ม 🍊 และสตรอว์เบอร์รี่ 🍓 อร่อยมากค่ะ!', en: "Today's recommendations are Orange 🍊 and Strawberry 🍓. So delicious!" },
  hours: { th: 'ร้านเปิดทุกวัน 08:00 - 20:00 น. ค่ะ ☀️', en: "We're open every day from 8:00 AM to 8:00 PM ☀️" },
  default: { th: 'ขอบคุณสำหรับคำถามค่ะ! หากต้องการข้อมูลเพิ่มเติม สามารถถามได้เลยนะคะ หรือดูเมนูทั้งหมดได้ที่หน้าเมนูค่ะ 🍹', en: 'Thanks for your question! Feel free to ask anything else or browse our full menu. 🍹' },
};

/* ─── Types ─────────────────────────────────────────── */
interface Message {
  id: string;
  text: string;
  isBot: boolean;
  time: string;
  foundItems?: MenuItem[];
}

interface StagedItem {
  stageId: string;
  menuItem: MenuItem;
  drinkType: DrinkType;
  sweetness: SweetnessLevel;
  quantity: number;
}

interface ActiveOrder {
  menuItem: MenuItem;
  drinkType: DrinkType;
  sweetness: SweetnessLevel;
  quantity: number;
}

/* ─── Constants ─────────────────────────────────────── */
const SWEETNESS_OPTIONS: { key: SweetnessLevel; labelTh: string; labelEn: string; pct: string }[] = [
  { key: 'less',   labelTh: 'น้อย',  labelEn: 'Less',   pct: '25%'  },
  { key: 'normal', labelTh: 'ปกติ',  labelEn: 'Normal', pct: '50%'  },
  { key: 'more',   labelTh: 'มาก',   labelEn: 'More',   pct: '75%'  },
  { key: 'extra',  labelTh: 'พิเศษ', labelEn: 'Extra',  pct: '100%' },
];

const ORDER_KW_TH = ['สั่ง', 'ขอ', 'อยากได้', 'อยากกิน', 'อยากดื่ม', 'เอา', 'ต้องการ'];
const ORDER_KW_EN = ['order', 'want', 'get', 'buy', 'have', 'give me', "i'd like"];

function getNow() {
  return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

function findMenuItems(msg: string, availableItems: MenuItem[]): MenuItem[] {
  const lower = msg.toLowerCase();
  return availableItems.filter(
    item =>
      item.isAvailable &&
      (lower.includes(item.name.toLowerCase()) || lower.includes(item.nameEn.toLowerCase())),
  );
}

function isOrderIntent(msg: string): boolean {
  const lower = msg.toLowerCase();
  return [...ORDER_KW_TH, ...ORDER_KW_EN].some(kw => lower.includes(kw));
}

/* ─── Component ─────────────────────────────────────── */
export function AIChat() {
  const { language } = useLanguage();
  const { addItem, count } = useCart();
  const isTh = language === 'th';

  const [availableMenuItems, setAvailableMenuItems] = useState<MenuItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: isTh ? 'สวัสดีค่ะ! ยินดีให้บริการ มีอะไรให้ช่วยไหมคะ? 😊' : 'Hello! Happy to help. What can I do for you? 😊',
      isBot: true,
      time: getNow(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);
  const [cartExpanded, setCartExpanded] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const items = await getMenuItems();
        setAvailableMenuItems(items || []);
      } catch (err) {}
    }
    fetchMenu();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    }
  }, [messages, isOpen, activeOrder]);

  useEffect(() => {
    if (isOpen && !activeOrder) inputRef.current?.focus();
  }, [isOpen, activeOrder]);

  /* ─── NLP ─── */
  const getResponse = (msg: string): { text: string; foundItems?: MenuItem[] } => {
    const lower = msg.toLowerCase();
    const found = findMenuItems(msg, availableMenuItems);

    if (found.length > 0 && isOrderIntent(msg)) {
      return {
        text: isTh
          ? `เจอแล้ว! เลือกรายการที่ต้องการสั่งได้เลยค่ะ 🛒`
          : `Found it! Tap an item below to add it to your order 🛒`,
        foundItems: found,
      };
    }
    if (found.length > 0) {
      const names = found.map(i => `${i.emoji} ${isTh ? i.name : i.nameEn}`).join(', ');
      return {
        text: isTh
          ? `เราพบ ${names} ในเมนูค่ะ อยากสั่งเลยไหมคะ? 😊`
          : `We found ${names} in our menu. Would you like to order? 😊`,
        foundItems: found,
      };
    }
    if (lower.includes('เมนู') || lower.includes('menu') || lower.includes('มีอะไร') || lower.includes('what'))
      return { text: isTh ? 'เรามีน้ำผลไม้สดและน้ำผักหลากหลายค่ะ ทั้งแบบเย็นและแบบปั่น ลองดูเมนูทั้งหมดได้เลยค่ะ 🍹' : 'We have a variety of fresh fruit and vegetable juices, both cold and blended. Check our full menu! 🍹' };
    if (lower.includes('ราคา') || lower.includes('price') || lower.includes('cost') || lower.includes('บาท'))
      return { text: isTh ? 'ราคาของเราเริ่มต้นที่ 35 บาท สูงสุด 50 บาท ประหยัดดีมากค่ะ! 💰' : 'Our prices start from 35 THB up to 50 THB. Very affordable! 💰' };
    if (lower.includes('ส่ง') || lower.includes('จัดส่ง') || lower.includes('deliver'))
      return { text: isTh ? 'เราจัดส่งฟรีสำหรับออเดอร์แรกของวัน ระยะเวลาจัดส่งประมาณ 20-30 นาทีค่ะ 🛵' : 'Free delivery on your first order of the day! Estimated delivery time is 20-30 minutes. 🛵' };
    if (lower.includes('แนะนำ') || lower.includes('recommend') || lower.includes('อร่อย') || lower.includes('best'))
      return { text: isTh ? aiResponses.recommend.th : aiResponses.recommend.en };
    if (lower.includes('เปิด') || lower.includes('ปิด') || lower.includes('open') || lower.includes('hour'))
      return { text: isTh ? aiResponses.hours.th : aiResponses.hours.en };
    if (lower.includes('สวัสดี') || lower.includes('hello') || lower.includes('hi'))
      return { text: isTh ? aiResponses.greeting.th : aiResponses.greeting.en };
    return { text: isTh ? aiResponses.default.th : aiResponses.default.en };
  };

  const pushBotMessage = (text: string, foundItems?: MenuItem[]) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), text, isBot: true, time: getNow(), foundItems },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), text: input, isBot: false, time: getNow() };
    setMessages(prev => [...prev, userMsg]);
    
    const captured = input;
    setInput('');
    setIsTyping(true);

    const foundItems = findMenuItems(captured, availableMenuItems);

    if (foundItems.length > 0) {
      // 1. Interactive Menu Chip Flow (Immediate response)
      setTimeout(() => {
        const res = getResponse(captured);
        pushBotMessage(res.text, res.foundItems);
        setIsTyping(false);
      }, 600);
    } else {
      // 2. RAG + Gemini AI Chat Flow
      try {
        const chatHistory = [...messages, userMsg];
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: chatHistory }),
        });
        const data = await res.json();
        if (data.text) {
          pushBotMessage(data.text);
        } else {
          pushBotMessage(isTh ? 'ขออภัยค่ะ ระบบแชทขัดข้องชั่วคราว 😥' : 'Sorry, the chat system is temporarily down 😥');
        }
      } catch (err) {
        console.error('Failed to get response from Gemini:', err);
        pushBotMessage(isTh ? 'ขออภัยค่ะ ระบบแชทขัดข้องชั่วคราว 😥' : 'Sorry, the chat system is temporarily down 😥');
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSelectItem = (item: MenuItem) => {
    setActiveOrder({ menuItem: item, drinkType: 'cold', sweetness: 'normal', quantity: 1 });
  };

  /* Add to staging cart */
  const handleStageItem = () => {
    if (!activeOrder) return;
    const stageId = `${activeOrder.menuItem.id}-${Date.now()}`;
    setStagedItems(prev => [...prev, { stageId, ...activeOrder }]);
    setCartExpanded(true);
    const itemName = isTh ? activeOrder.menuItem.name : activeOrder.menuItem.nameEn;
    pushBotMessage(
      isTh
        ? `✅ เพิ่ม ${activeOrder.menuItem.emoji} ${itemName} × ${activeOrder.quantity} ลงรายการแล้ว!\nอยากสั่งเพิ่มอีกไหมคะ? หรือกด "ยืนยันสั่งทั้งหมด" ได้เลย 🛒`
        : `✅ Added ${activeOrder.menuItem.emoji} ${itemName} × ${activeOrder.quantity} to your list!\nWant to add more? Or tap "Confirm Order" when ready 🛒`,
    );
    setActiveOrder(null);
  };

  /* Confirm all staged items → CartContext */
  const handleConfirmAll = () => {
    if (stagedItems.length === 0) return;
    setConfirming(true);
    setTimeout(() => {
      stagedItems.forEach(si => {
        const opts: ItemOptions = { type: si.drinkType, sweetness: si.sweetness, cup: 'ready', notes: '' };
        addItem(si.menuItem, si.quantity, opts);
      });
      const total = stagedItems.reduce((s, si) => s + si.menuItem.price * si.quantity, 0);
      const count2 = stagedItems.reduce((s, si) => s + si.quantity, 0);
      setStagedItems([]);
      setConfirming(false);
      pushBotMessage(
        isTh
          ? `🎉 ยืนยันออเดอร์แล้วค่ะ! ${count2} รายการ · รวม ฿${total}\nกดที่ตะกร้าเพื่อดูและชำระเงินได้เลยค่ะ 🛵`
          : `🎉 Order confirmed! ${count2} item(s) · Total ฿${total}\nHead to cart to complete your purchase 🛵`,
      );
    }, 600);
  };

  const removeStaged = (stageId: string) =>
    setStagedItems(prev => prev.filter(s => s.stageId !== stageId));

  const updateStagedQty = (stageId: string, delta: number) =>
    setStagedItems(prev =>
      prev.map(s =>
        s.stageId === stageId ? { ...s, quantity: Math.max(1, s.quantity + delta) } : s,
      ),
    );

  const stagedTotal = stagedItems.reduce((s, si) => s + si.menuItem.price * si.quantity, 0);

  return (
    <div className="fixed z-50 bottom-24 right-4 md:bottom-6 md:right-6 flex flex-col items-end">
      {/* ── Chat Popup ── */}
      {isOpen && (
        <div className="mb-3 w-[340px] sm:w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-[#D8F2FF] dark:border-[#1e3a5f] bg-white dark:bg-[#0b1a2e] flex flex-col"
          style={{ height: '580px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#00BDFE] to-[#0094d4] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold" style={{ fontSize: '14px' }}>Havi AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  <p className="text-white/80" style={{ fontSize: '11px' }}>{isTh ? 'ออนไลน์' : 'Online'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <a href="/cart"
                  className="flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors rounded-full px-2.5 py-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-bold">{count}</span>
                </a>
              )}
              <button onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#F4FAFE] dark:bg-[#071222]">
            {messages.map(msg => (
              <div key={msg.id}>
                <div className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} items-end gap-2`}>
                  {msg.isBot && (
                    <div className="w-7 h-7 rounded-full bg-[#00BDFE] flex items-center justify-center flex-shrink-0 mb-0.5">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className="max-w-[78%]">
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.isBot
                        ? 'bg-white dark:bg-[#142035] text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm border border-[#E4F5FF] dark:border-[#1e3a5f]'
                        : 'bg-[#00BDFE] text-white rounded-br-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <p className={`text-gray-400 mt-1 ${msg.isBot ? 'ml-1' : 'text-right mr-1'}`} style={{ fontSize: '10px' }}>
                      {msg.time}
                    </p>
                  </div>
                </div>

                {/* Menu item chips */}
                {msg.isBot && msg.foundItems && msg.foundItems.length > 0 && !activeOrder && (
                  <div className="mt-2 ml-9 flex flex-wrap gap-2">
                    {msg.foundItems.map(item => (
                      <button key={item.id} onClick={() => handleSelectItem(item)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-[#D8F2FF] dark:border-[#1e3a5f] bg-white dark:bg-[#142035] hover:border-[#00BDFE] hover:shadow-md transition-all text-left">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: item.bgColor }}>
                          {item.emoji}
                        </span>
                        <div>
                          <p className="text-gray-800 dark:text-gray-100 font-semibold" style={{ fontSize: '12px' }}>
                            {isTh ? item.name : item.nameEn}
                          </p>
                          <p className="text-[#00BDFE]" style={{ fontSize: '11px' }}>฿{item.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00BDFE] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white dark:bg-[#142035] border border-[#E4F5FF] dark:border-[#1e3a5f] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-[#00BDFE] animate-bounce"
                        style={{ animationDelay: `${i * 0.18}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Order Widget (single item config) ── */}
          {activeOrder && (
            <div className="flex-shrink-0 border-t-2 border-[#E4F5FF] dark:border-[#1e3a5f] bg-white dark:bg-[#0b1a2e]">
              {/* Item header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: activeOrder.menuItem.bgColor }}>
                    {activeOrder.menuItem.emoji}
                  </span>
                  <div>
                    <p className="text-gray-800 dark:text-gray-100 font-semibold" style={{ fontSize: '13px' }}>
                      {isTh ? activeOrder.menuItem.name : activeOrder.menuItem.nameEn}
                    </p>
                    <p className="text-[#00BDFE]" style={{ fontSize: '11px' }}>฿{activeOrder.menuItem.price} / {isTh ? 'แก้ว' : 'cup'}</p>
                  </div>
                </div>
                <button onClick={() => setActiveOrder(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#1a3a5c] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#2a4a70] transition-colors">
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>

              <div className="px-4 space-y-2.5 pb-3">
                {/* Drink type */}
                <div className="flex gap-2">
                  {(['cold', 'blended'] as DrinkType[]).map(type => (
                    <button key={type}
                      onClick={() => setActiveOrder(prev => prev ? { ...prev, drinkType: type } : prev)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                        activeOrder.drinkType === type
                          ? 'bg-[#00BDFE] border-[#00BDFE] text-white'
                          : 'border-[#D8F2FF] dark:border-[#1e3a5f] text-gray-600 dark:text-gray-300 hover:border-[#00BDFE]'
                      }`}>
                      {type === 'cold' ? `🧊 ${isTh ? 'เย็น' : 'Cold'}` : `🌀 ${isTh ? 'ปั่น' : 'Blended'}`}
                    </button>
                  ))}
                </div>

                {/* Sweetness */}
                <div className="flex gap-1.5">
                  {SWEETNESS_OPTIONS.map(opt => (
                    <button key={opt.key}
                      onClick={() => setActiveOrder(prev => prev ? { ...prev, sweetness: opt.key } : prev)}
                      className={`flex-1 py-1.5 rounded-xl border-2 transition-all flex flex-col items-center ${
                        activeOrder.sweetness === opt.key
                          ? 'bg-[#00BDFE] border-[#00BDFE] text-white'
                          : 'border-[#D8F2FF] dark:border-[#1e3a5f] text-gray-600 dark:text-gray-300 hover:border-[#00BDFE]'
                      }`}>
                      <span style={{ fontSize: '11px' }} className="font-semibold">{isTh ? opt.labelTh : opt.labelEn}</span>
                      <span style={{ fontSize: '9px' }} className="opacity-60">{opt.pct}</span>
                    </button>
                  ))}
                </div>

                {/* Qty + Add to list */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#F4FAFE] dark:bg-[#071222] rounded-xl px-2 py-1.5 border-2 border-[#D8F2FF] dark:border-[#1e3a5f]">
                    <button onClick={() => setActiveOrder(prev => prev ? { ...prev, quantity: Math.max(1, prev.quantity - 1) } : prev)}
                      className="w-6 h-6 rounded-lg bg-white dark:bg-[#142035] border border-[#D8F2FF] dark:border-[#1e3a5f] flex items-center justify-center hover:border-[#00BDFE] transition-colors">
                      <Minus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="text-gray-800 dark:text-gray-100 font-bold w-5 text-center" style={{ fontSize: '13px' }}>
                      {activeOrder.quantity}
                    </span>
                    <button onClick={() => setActiveOrder(prev => prev ? { ...prev, quantity: prev.quantity + 1 } : prev)}
                      className="w-6 h-6 rounded-lg bg-white dark:bg-[#142035] border border-[#D8F2FF] dark:border-[#1e3a5f] flex items-center justify-center hover:border-[#00BDFE] transition-colors">
                      <Plus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                  <button onClick={handleStageItem}
                    className="flex-1 py-2 rounded-xl bg-[#00BDFE] hover:bg-[#00a8e6] active:scale-95 text-white font-semibold flex items-center justify-center gap-1.5 transition-all"
                    style={{ fontSize: '13px' }}>
                    <Plus className="w-3.5 h-3.5" />
                    {isTh ? 'เพิ่มในรายการ' : 'Add to List'} · ฿{activeOrder.menuItem.price * activeOrder.quantity}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Staged Cart Panel ── */}
          {stagedItems.length > 0 && !activeOrder && (
            <div className="flex-shrink-0 border-t-2 border-[#00BDFE]/30 dark:border-[#00BDFE]/20 bg-[#F0FBFF] dark:bg-[#071827]">
              {/* Cart header / toggle */}
              <button
                onClick={() => setCartExpanded(p => !p)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#E4F7FF] dark:hover:bg-[#0a2035] transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#00BDFE] flex items-center justify-center">
                    <span className="text-white font-bold" style={{ fontSize: '10px' }}>
                      {stagedItems.reduce((s, si) => s + si.quantity, 0)}
                    </span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-200 font-semibold" style={{ fontSize: '12px' }}>
                    {isTh ? 'รายการที่เลือก' : 'Your Order List'}
                  </span>
                  <span className="text-[#00BDFE] font-bold" style={{ fontSize: '12px' }}>฿{stagedTotal}</span>
                </div>
                {cartExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
              </button>

              {/* Items list */}
              {cartExpanded && (
                <div className="px-3 pb-2 space-y-1.5 max-h-32 overflow-y-auto">
                  {stagedItems.map(si => {
                    const sw = SWEETNESS_OPTIONS.find(o => o.key === si.sweetness);
                    return (
                      <div key={si.stageId}
                        className="flex items-center gap-2 bg-white dark:bg-[#0d1f35] rounded-xl px-2.5 py-2 border border-[#D8F2FF] dark:border-[#1e3a5f]">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: si.menuItem.bgColor }}>
                          {si.menuItem.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 dark:text-gray-100 font-semibold truncate" style={{ fontSize: '11px' }}>
                            {isTh ? si.menuItem.name : si.menuItem.nameEn}
                          </p>
                          <p className="text-gray-400" style={{ fontSize: '10px' }}>
                            {si.drinkType === 'cold' ? '🧊' : '🌀'} · {isTh ? sw?.labelTh : sw?.labelEn}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => updateStagedQty(si.stageId, -1)}
                            className="w-5 h-5 rounded-md bg-gray-100 dark:bg-[#1a3a5c] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#2a4a70] transition-colors">
                            <Minus className="w-2.5 h-2.5 text-gray-600 dark:text-gray-300" />
                          </button>
                          <span className="w-5 text-center text-gray-800 dark:text-gray-100 font-bold" style={{ fontSize: '11px' }}>
                            {si.quantity}
                          </span>
                          <button onClick={() => updateStagedQty(si.stageId, 1)}
                            className="w-5 h-5 rounded-md bg-gray-100 dark:bg-[#1a3a5c] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#2a4a70] transition-colors">
                            <Plus className="w-2.5 h-2.5 text-gray-600 dark:text-gray-300" />
                          </button>
                          <span className="text-[#00BDFE] font-semibold ml-1" style={{ fontSize: '11px' }}>
                            ฿{si.menuItem.price * si.quantity}
                          </span>
                          <button onClick={() => removeStaged(si.stageId)}
                            className="w-5 h-5 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors ml-0.5">
                            <Trash2 className="w-2.5 h-2.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Confirm button */}
              <div className="px-3 pb-3 pt-1.5">
                <button onClick={handleConfirmAll} disabled={confirming}
                  className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    confirming
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-[#00BDFE] to-[#0094d4] hover:from-[#00a8e6] hover:to-[#0080bb] text-white active:scale-95 shadow-md shadow-[#00BDFE]/30'
                  }`}
                  style={{ fontSize: '13px' }}>
                  {confirming ? (
                    <><Check className="w-4 h-4" />{isTh ? 'กำลังยืนยัน...' : 'Confirming...'}</>
                  ) : (
                    <><ShoppingCart className="w-4 h-4" />{isTh ? 'ยืนยันสั่งทั้งหมด' : 'Confirm All Orders'} · ฿{stagedTotal}</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Input ── */}
          {!activeOrder && (
            <div className="px-3 py-2.5 border-t border-[#E4F5FF] dark:border-[#1e3a5f] bg-white dark:bg-[#0b1a2e] flex-shrink-0">
              <div className="flex gap-2">
                <input ref={inputRef} type="text" value={input}
                  onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder={isTh ? '"สั่งมะม่วง", "อยากได้ส้ม"...' : '"order mango", "want orange"...'}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#D8F2FF] dark:border-[#1e3a5f] bg-[#F4FAFE] dark:bg-[#071222] text-gray-800 dark:text-gray-100 text-sm outline-none focus:border-[#00BDFE] transition-colors placeholder-gray-400" />
                <button onClick={handleSend} disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-[#00BDFE] flex items-center justify-center disabled:opacity-30 hover:bg-[#00a8e6] transition-colors flex-shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Floating Button ── */}
      <button onClick={() => setIsOpen(p => !p)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00BDFE] to-[#0094d4] shadow-lg shadow-[#00BDFE]/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative">
        <Bot className="w-6 h-6 text-white" />
        {/* Online dot */}
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
        {/* Cart count badge */}
        {count > 0 && (
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-400 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white font-bold" style={{ fontSize: '9px' }}>{count > 9 ? '9+' : count}</span>
          </span>
        )}
        {/* Staged items badge */}
        {stagedItems.length > 0 && count === 0 && (
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00BDFE] rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white font-bold" style={{ fontSize: '9px' }}>{stagedItems.length}</span>
          </span>
        )}
      </button>
    </div>
  );
}
