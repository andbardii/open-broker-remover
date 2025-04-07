import React, { useState, useEffect } from 'react';
import { DataBroker } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { db } from '@/lib/database';

const BrokerListPage: React.FC = () => {
  const { t } = useLanguage();
  const [brokers, setBrokers] = useState<DataBroker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadBrokers = async () => {
      try {
        const allBrokers = await db.getDataBrokers();
        setBrokers(allBrokers);
      } catch (error) {
        console.error('Error loading brokers:', error);
      }
    };

    loadBrokers();
  }, []);

  const filteredBrokers = brokers.filter(broker =>
    broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>{t('data_brokers')}</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder={t('search_brokers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
          {filteredBrokers.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {searchTerm ? t('no_brokers_found') : t('no_brokers')}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBrokers.map((broker) => (
                <Card key={broker.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{broker.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {t(broker.category)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {t(broker.difficulty)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="text-sm">
                        <span className="font-medium">{t('opt_out_method')}: </span>
                        {t(broker.optOutMethod)}
                      </div>
                      {broker.dataTypes && (
                        <div className="text-sm">
                          <span className="font-medium">{t('data_types')}: </span>
                          {broker.dataTypes.map(type => t(type)).join(', ')}
                        </div>
                      )}
                      {broker.responseTime && (
                        <div className="text-sm">
                          <span className="font-medium">{t('response_time')}: </span>
                          {broker.responseTime}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(broker.optOutUrl, '_blank')}
                        >
                          {t('visit_opt_out')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BrokerListPage; 