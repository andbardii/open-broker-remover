
import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage, Language } from '@/contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: t('english') },
    { code: 'it', name: t('italian') },
  ];

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe size={20} />
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
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? "bg-gray-100" : ""}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
