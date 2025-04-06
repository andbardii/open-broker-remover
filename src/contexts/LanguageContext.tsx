import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from './translations';

// Define the context type
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: string[]) => string;
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to get the language from localStorage, default to 'en'
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('app_language');
    return (savedLanguage as Language) || 'en';
  });

  // Translate function with parameter support
  const t = (key: string, params?: string[]): string => {
    let translation = translations[language][key] || key;
    
    // Replace parameters if provided
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        translation = translation.replace(`{${index}}`, param);
      });
    }
    
    return translation;
  };

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('app_language', language);
    
    // Optional: Update document language for accessibility
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);
