import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, PlusCircle } from 'lucide-react';
import NewRequest from './NewRequest';
import TrackRequest from './TrackRequest';
import { useLanguage } from '@/contexts/LanguageContext';

interface RequestsProps {
  onTabChange: (tab: string) => void;
}

const Requests: React.FC<RequestsProps> = ({ onTabChange }) => {
  const { t } = useLanguage();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t('requests')}</h2>
        <p className="text-muted-foreground">
          {t('requests-description')}
        </p>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('new-request')}
          </TabsTrigger>
          <TabsTrigger value="track">
            <FileText className="mr-2 h-4 w-4" />
            {t('track-requests')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-0">
          <NewRequest onTabChange={onTabChange} />
        </TabsContent>

        <TabsContent value="track" className="mt-0">
          <TrackRequest onTabChange={onTabChange} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Requests; 