import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { translations, TranslationKey } from './translations';
import { getStoredLanguage, setStoredLanguage } from './storage';

type Language = 'en' | 'es';

interface I18nContextValue {
  language: Language;
  locale: string;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = getStoredLanguage();
    return (stored === 'es' ? 'es' : 'en') as Language;
  });

  useEffect(() => {
    setStoredLanguage(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    // Get translation for current language, fallback to English
    let translation = translations[language][key] || translations.en[key] || key;

    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return translation;
  };

  // Generate locale string for Intl formatting
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  const value: I18nContextValue = {
    language,
    locale,
    setLanguage,
    t,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18nContext(): I18nContextValue {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
}
