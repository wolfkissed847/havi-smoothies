"use client";
import React, { createContext, useContext, useState } from 'react';
import { translations, Language, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'th',
  toggleLanguage: () => {},
  t: (key) => key,
  isEn: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('havi-smoothies-lang') as Language) || 'th';
    }
    return 'th';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'th' ? 'en' : 'th';
      localStorage.setItem('havi-smoothies-lang', next);
      return next;
    });
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.th[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isEn: language === 'en' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

