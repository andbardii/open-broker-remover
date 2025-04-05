
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available languages
export type Language = 'en' | 'it';

// Define the context type
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'navigation': 'Navigation',
    'dashboard': 'Dashboard',
    'new-request': 'New Request',
    'request-tracking': 'Request Tracking',
    'data-brokers': 'Data Brokers',
    'email-settings': 'Email Settings',
    'security': 'Security',
    // General UI
    'show-tutorial': 'Show tutorial',
    'switch-language': 'Switch language',
    'english': 'English',
    'italian': 'Italian',
  },
  it: {
    // Navigation
    'navigation': 'Navigazione',
    'dashboard': 'Dashboard',
    'new-request': 'Nuova Richiesta',
    'request-tracking': 'Monitoraggio Richieste',
    'data-brokers': 'Broker di Dati',
    'email-settings': 'Impostazioni Email',
    'security': 'Sicurezza',
    // General UI
    'show-tutorial': 'Mostra tutorial',
    'switch-language': 'Cambia lingua',
    'english': 'Inglese',
    'italian': 'Italiano',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to get the language from localStorage, default to 'en'
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('app_language');
    return (savedLanguage as Language) || 'en';
  });

  // Translate function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
//TODO Check alterntives
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);
