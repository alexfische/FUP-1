import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { translations } from '../translations';

type Language = 'de' | 'en' | 'cs';
type Translations = typeof translations.de;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// FIX: Updated `LanguageProvider` to be explicitly typed as a `React.FC` (Functional Component). This resolves a TypeScript error in `index.tsx` where the `children` prop was not being correctly inferred for the provider component.
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && translations[storedLang]) {
      return storedLang;
    }
    const browserLang = navigator.language.split('-')[0] as Language;
    return translations[browserLang] ? browserLang : 'de';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: keyof Translations): string => {
    // Fallback logic: current language -> german -> key itself
    return translations[language]?.[key] || translations['de']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
