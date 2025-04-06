import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/contexts/translations';
import { useToast } from "@/components/ui/use-toast";

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: t('english'), flag: '🇬🇧' },
    { code: 'it', name: t('italian'), flag: '🇮🇹' },
    { code: 'fr', name: t('french'), flag: '🇫🇷' },
    { code: 'de', name: t('german'), flag: '🇩🇪' },
    { code: 'es', name: t('spanish'), flag: '🇪🇸' },
    { code: 'pt', name: t('portuguese'), flag: '🇵🇹' },
  ];

  const handleLanguageChange = useCallback((langCode: Language) => {
    if (langCode === language) {
      return; // Don't do anything if the language is already set
    }
    
    try {
      setLanguage(langCode);
      toast({
        title: t('language-changed'),
        description: t('language-changed-description'),
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to change language:', error);
      toast({
        title: t('language-change-error'),
        description: t('language-change-error-description'),
        variant: 'destructive',
      });
    }
  }, [language, setLanguage, t, toast]);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label={t('switch-language')}
              className="relative"
            >
              <Globe size={20} />
              <span className="absolute -top-1 -right-1 text-xs">{language.toUpperCase()}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('switch-language')}</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-2 ${language === lang.code ? "bg-gray-100 font-medium" : ""}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
