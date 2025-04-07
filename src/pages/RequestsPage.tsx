import React from 'react';
import { DataRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import RequestCard from '@/components/RequestCard';
import { useLanguage } from '@/contexts/LanguageContext';

interface RequestsPageProps {
  requests: DataRequest[];
  onUpdateRequest: (updatedRequest: DataRequest) => void;
}

const RequestsPage: React.FC<RequestsPageProps> = ({ requests, onUpdateRequest }) => {
  const { t } = useLanguage();

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>{t('track_requests')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
          {requests.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('no_requests')}
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onUpdateRequest={onUpdateRequest}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RequestsPage; 