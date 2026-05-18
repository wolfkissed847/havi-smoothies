"use client";
import React, { useState } from 'react';
import { Store, Phone, Clock, CreditCard, Bell, Save, CheckCircle, Globe, Moon, Sun, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="bg-white dark:bg-[#060f1e] rounded-2xl border border-[#E8F5FF] dark:border-[#0a2540] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8F5FF] dark:border-[#0a2540]">
        <div className="w-8 h-8 rounded-xl bg-[#D8F2FF] dark:bg-[#00BDFE]/15 flex items-center justify-center text-[#00BDFE]">
          {icon}
        </div>
        <h3 className="text-gray-700 dark:text-gray-200">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-3 gap-3 items-start">
      <label className="text-sm text-gray-500 dark:text-gray-400 pt-2">{label}</label>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#00BDFE]' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const { t, language, toggleLanguage, isEn } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const [storeInfo, setStoreInfo] = useState({
    name: 'Havi-Smoothies',
    nameTh: 'ฮาวี่ สมูทตี้',
    address: '123 ถ.สุขุมวิท แขวงคลองเตย กรุงเทพฯ 10110',
    phone: '02-123-4567',
    openTime: '08:00',
    closeTime: '20:00',
  });

  const [payment, setPayment] = useState({
    lineOA: '@havi-smoothies',
    promptpay: '0812345678',
  });

  const [notifications, setNotifications] = useState({
    orderNotif: true,
    emailNotif: false,
    soundAlert: true,
  });

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-gray-800 dark:text-white">{t('settingsTitle')}</h1>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-[#00BDFE] text-white hover:bg-[#00CBFE]'
          }`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? (isEn ? 'Saved!' : 'บันทึกแล้ว!') : t('saveSettings')}
        </button>
      </div>

      {/* Store Info */}
      <Section icon={<Store className="w-4 h-4" />} title={t('storeInfo')}>
        <div className="space-y-4">
          <Field label={`${t('storeName')} (EN)`}>
            <Input
              value={storeInfo.name}
              onChange={v => setStoreInfo({ ...storeInfo, name: v })}
              placeholder="Havi-Smoothies"
            />
          </Field>
          <Field label={`${t('storeName')} (TH)`}>
            <Input
              value={storeInfo.nameTh}
              onChange={v => setStoreInfo({ ...storeInfo, nameTh: v })}
              placeholder="ชื่อร้านภาษาไทย"
            />
          </Field>
          <Field label={t('storeAddress')}>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={storeInfo.address}
                onChange={e => setStoreInfo({ ...storeInfo, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors"
              />
            </div>
          </Field>
          <Field label={t('storePhone')}>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={storeInfo.phone}
                onChange={e => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors"
              />
            </div>
          </Field>
          <Field label={t('openingHours')}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={storeInfo.openTime}
                  onChange={e => setStoreInfo({ ...storeInfo, openTime: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors"
                />
              </div>
              <span className="text-gray-400">—</span>
              <div className="relative flex-1">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={storeInfo.closeTime}
                  onChange={e => setStoreInfo({ ...storeInfo, closeTime: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] bg-[#F8FBFF] dark:bg-[#030d1a] text-gray-800 dark:text-white text-sm outline-none focus:border-[#00BDFE] transition-colors"
                />
              </div>
            </div>
          </Field>
        </div>
      </Section>

      {/* Payment */}
      <Section icon={<CreditCard className="w-4 h-4" />} title={t('paymentSettings')}>
        <div className="space-y-4">
          <Field label={t('lineOA')}>
            <Input value={payment.lineOA} onChange={v => setPayment({ ...payment, lineOA: v })} placeholder="@yourstore" />
          </Field>
          <Field label={t('promptpay')}>
            <Input value={payment.promptpay} onChange={v => setPayment({ ...payment, promptpay: v })} placeholder="เบอร์โทร หรือ เลขบัตร" />
          </Field>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={<Bell className="w-4 h-4" />} title={t('notificationSettings')}>
        <div className="divide-y divide-[#F0FBFF] dark:divide-[#0a2540]">
          <Toggle checked={notifications.orderNotif} onChange={v => setNotifications({ ...notifications, orderNotif: v })} label={t('orderNotif')} />
          <Toggle checked={notifications.emailNotif} onChange={v => setNotifications({ ...notifications, emailNotif: v })} label={t('emailNotif')} />
          <Toggle checked={notifications.soundAlert} onChange={v => setNotifications({ ...notifications, soundAlert: v })} label={isEn ? 'Sound Alerts' : 'เสียงแจ้งเตือน'} />
        </div>
      </Section>

      {/* Appearance */}
      <Section icon={<Moon className="w-4 h-4" />} title={isEn ? 'Appearance' : 'การแสดงผล'}>
        <div className="divide-y divide-[#F0FBFF] dark:divide-[#0a2540]">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {isDark ? <Moon className="w-4 h-4 text-gray-400" /> : <Sun className="w-4 h-4 text-gray-400" />}
              <span className="text-sm text-gray-700 dark:text-gray-300">{isDark ? t('darkMode') : t('lightMode')}</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-[#00BDFE]' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('language')}</span>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1 rounded-xl border border-[#D8F2FF] dark:border-[#0a2540] text-sm text-[#00BDFE] hover:bg-[#D8F2FF] dark:hover:bg-[#00BDFE]/15 transition-colors"
            >
              <span className="font-medium">{language.toUpperCase()}</span>
              <span className="text-gray-400">→</span>
              <span>{language === 'th' ? 'EN' : 'TH'}</span>
            </button>
          </div>
        </div>
      </Section>

      {/* Save Button Bottom */}
      <div className="flex justify-end pb-6">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-green-100 text-green-600'
              : 'bg-[#00BDFE] text-white hover:bg-[#00CBFE]'
          }`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? (isEn ? 'Saved!' : 'บันทึกแล้ว!') : t('saveSettings')}
        </button>
      </div>
    </div>
  );
}


export default SettingsPage;
