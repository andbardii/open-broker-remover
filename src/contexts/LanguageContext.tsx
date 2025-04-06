import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from './translations';
import { developerService } from '@/lib/developer';

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

// Language storage key
const LANGUAGE_STORAGE_KEY = 'open_broker_remover_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to get the language from localStorage, default to 'en'
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      // First check localStorage
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (Object.keys(translations).includes(savedLanguage as Language)) {
        return savedLanguage as Language;
      }
      
      // If not in localStorage, return default language
      return 'en';
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return 'en';
    }
  });

  // Load default language from app config on mount
  useEffect(() => {
    const loadDefaultLanguage = async () => {
      try {
        // Only attempt to load from config if no language is set in localStorage
        if (!localStorage.getItem(LANGUAGE_STORAGE_KEY)) {
          const appConfig = await developerService.getAppConfig();
          if (appConfig.defaultLanguage && Object.keys(translations).includes(appConfig.defaultLanguage)) {
            setLanguage(appConfig.defaultLanguage);
          }
        }
      } catch (error) {
        console.error('Error loading default language from app config:', error);
      }
    };

    loadDefaultLanguage();
  }, []);

  // Function to set language with validation and storage
  const setLanguage = (newLanguage: Language) => {
    if (Object.keys(translations).includes(newLanguage)) {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
        setLanguageState(newLanguage);
        console.log(`Language changed to: ${newLanguage}`);
      } catch (error) {
        console.error('Error saving language to localStorage:', error);
      }
    } else {
      console.error(`Invalid language: ${newLanguage}`);
    }
  };

  // Translate function with parameter support
  const t = (key: string, params?: string[]): string => {
    try {
      // Get translation or fallback to key if not found
      let translation = translations[language]?.[key] || key;
      
      // Replace parameters if provided
      if (params && params.length > 0) {
        params.forEach((param, index) => {
          translation = translation.replace(`{${index}}`, param);
        });
      }
      
      return translation;
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return key; // Fallback to the key itself
    }
  };

  // Update document language when language changes
  useEffect(() => {
    // Update document language for accessibility
    document.documentElement.lang = language;
    document.title = t('app-title') || 'Open Broker Remover';
  }, [language]);

  // Context value
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);
