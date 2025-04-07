import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Mail, Search } from 'lucide-react';
import PrivacyScan from './PrivacyScan';
import EmailMonitor from './EmailMonitor';
import FindBrokers from './FindBrokers';
import { useLanguage } from '@/contexts/LanguageContext';

interface PrivacyProps {
  onTabChange: (tab: string) => void;
}

const Privacy: React.FC<PrivacyProps> = ({ onTabChange }) => {
  const { t } = useLanguage();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t('privacy')}</h2>
        <p className="text-muted-foreground">
          {t('privacy-description')}
        </p>
      </div>

      <Tabs defaultValue="scan" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="scan">
            <Shield className="mr-2 h-4 w-4" />
            {t('privacy-scan')}
          </TabsTrigger>
          <TabsTrigger value="monitor">
            <Mail className="mr-2 h-4 w-4" />
            {t('email-monitor')}
          </TabsTrigger>
          <TabsTrigger value="find">
            <Search className="mr-2 h-4 w-4" />
            {t('find-brokers')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-0">
          <PrivacyScan onTabChange={onTabChange} />
        </TabsContent>

        <TabsContent value="monitor" className="mt-0">
          <EmailMonitor onTabChange={onTabChange} />
        </TabsContent>

        <TabsContent value="find" className="mt-0">
          <FindBrokers onTabChange={onTabChange} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Privacy; 