
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * This is a utility function to help with translation issues in DataBrokerFinder.tsx
 * It should be used to ensure we're calling the t() function correctly with a single argument
 */
export const formatTranslationWithVariables = (key: string, variables: Record<string, any>) => {
  const { t } = useLanguage();
  // Pass a single argument that contains both the key and the variable values
  return t({ key, variables });
};
