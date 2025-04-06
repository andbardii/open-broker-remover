import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Custom hook for formatting translations with variables
 */
export const useTranslationWithVariables = () => {
  const { t } = useLanguage();
  
  const formatWithVariables = (key: string, variables: Record<string, string | number>) => {
    // Convert variables to string array for t function
    const params = Object.values(variables).map(v => String(v));
    return t(key, params);
  };

  return { formatWithVariables };
};
