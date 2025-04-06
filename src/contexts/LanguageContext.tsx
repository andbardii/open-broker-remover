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
    'find-brokers': 'Find Brokers',
    'email-settings': 'Email Settings',
    'security': 'Security',
    'settings': 'Settings',
    // General UI
    'show-tutorial': 'Show tutorial',
    'switch-language': 'Switch language',
    'english': 'English',
    'italian': 'Italian',
    // Settings page
    'settings-description': 'Configure application settings and security options',
    'application-settings': 'Application Settings',
    'configure-app-settings': 'Configure your email and security settings',
    'email-configuration': 'Email Configuration',
    'email-configuration-description': 'Enter your email credentials to process broker responses',
    'security-settings': 'Security Settings',
    'security-encryption': 'Security & Encryption',
    'security-encryption-description': 'Configure encryption for your sensitive data',
    // Security
    'data-encryption': 'Data Encryption',
    'configure-encryption': 'Configure encryption settings for sensitive data',
    'enable-encryption': 'Enable Encryption',
    'save-key': 'Save this key',
    'security-config-saved': 'Security configuration saved',
    'settings-applied': 'Your security settings have been applied.',
    'save-security-config': 'Save Security Configuration',
    // Data Brokers
    'search-completed': 'Search completed',
    'brokers-found': 'Found {0} data brokers that may have your information.',
    'search-error': 'Failed to search for data brokers. Please try again.',
    'requests-created': 'Requests created',
    'created-requests': 'Created {0} opt-out requests.',
    'error-creating-requests': 'Failed to create opt-out requests. Please try again.',
    'find-data-brokers': 'Find Data Brokers',
    'search-description': 'Search for data brokers that may have your email information',
    'your-email': 'Your Email',
    'search': 'Search',
    'searching': 'Searching...',
    'email-search-description': 'We\'ll search for data brokers that may have your email information',
    'search-results': 'Search Results',
    'found-brokers': 'We found {0} data brokers that may have your information.',
    'no-brokers-found': 'No data brokers were found with your information.',
    'data-broker': 'Data Broker',
    'opt-out-link': 'Opt-Out Link',
    'opt-out': 'Opt-Out',
    'create-requests-all': 'Create Opt-Out Requests for All',
  },
  it: {
    // Navigation
    'navigation': 'Navigazione',
    'dashboard': 'Dashboard',
    'new-request': 'Nuova Richiesta',
    'request-tracking': 'Monitoraggio Richieste',
    'data-brokers': 'Broker di Dati',
    'find-brokers': 'Trova Broker',
    'email-settings': 'Impostazioni Email',
    'security': 'Sicurezza',
    'settings': 'Impostazioni',
    // General UI
    'show-tutorial': 'Mostra tutorial',
    'switch-language': 'Cambia lingua',
    'english': 'Inglese',
    'italian': 'Italiano',
    // Settings page
    'settings-description': 'Configura impostazioni dell\'applicazione e opzioni di sicurezza',
    'application-settings': 'Impostazioni Applicazione',
    'configure-app-settings': 'Configura le tue impostazioni email e di sicurezza',
    'email-configuration': 'Configurazione Email',
    'email-configuration-description': 'Inserisci le tue credenziali email per elaborare le risposte dei broker',
    'security-settings': 'Impostazioni di Sicurezza',
    'security-encryption': 'Sicurezza & Crittografia',
    'security-encryption-description': 'Configura la crittografia per i tuoi dati sensibili',
    // Security
    'data-encryption': 'Crittografia Dati',
    'configure-encryption': 'Configura impostazioni di crittografia per dati sensibili',
    'enable-encryption': 'Abilita Crittografia',
    'save-key': 'Salva questa chiave',
    'security-config-saved': 'Configurazione di sicurezza salvata',
    'settings-applied': 'Le tue impostazioni di sicurezza sono state applicate.',
    'save-security-config': 'Salva Configurazione di Sicurezza',
    // Data Brokers
    'search-completed': 'Ricerca completata',
    'brokers-found': 'Trovati {0} broker di dati che potrebbero avere le tue informazioni.',
    'search-error': 'Impossibile cercare broker di dati. Riprova.',
    'requests-created': 'Richieste create',
    'created-requests': 'Create {0} richieste di opt-out.',
    'error-creating-requests': 'Impossibile creare richieste di opt-out. Riprova.',
    'find-data-brokers': 'Trova Broker di Dati',
    'search-description': 'Cerca broker di dati che potrebbero avere le tue informazioni email',
    'your-email': 'La Tua Email',
    'search': 'Cerca',
    'searching': 'Ricerca in corso...',
    'email-search-description': 'Cercheremo broker di dati che potrebbero avere le tue informazioni email',
    'search-results': 'Risultati Ricerca',
    'found-brokers': 'Abbiamo trovato {0} broker di dati che potrebbero avere le tue informazioni.',
    'no-brokers-found': 'Nessun broker di dati è stato trovato con le tue informazioni.',
    'data-broker': 'Broker di Dati',
    'opt-out-link': 'Link Opt-Out',
    'opt-out': 'Opt-Out',
    'create-requests-all': 'Crea Richieste di Opt-Out per Tutti',
  }
};

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
