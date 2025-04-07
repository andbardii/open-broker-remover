import React from 'react';
import { DataRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import RequestCard from '@/components/RequestCard';

interface DashboardProps {
  requests: DataRequest[];
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ requests, onTabChange }) => {
  const { t } = useLanguage();

  const recentRequests = requests.slice(0, 5);
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Stats Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {t('total_requests')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{requests.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {t('pending_requests')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingRequests}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {t('completed_requests')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedRequests}</div>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('recent_requests')}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTabChange('track-requests')}
          >
            {t('view_all')}
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {recentRequests.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                {t('no_requests')}
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onUpdateRequest={() => {}}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>{t('quick_actions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={() => onTabChange('find-brokers')}>
              {t('find_brokers')}
            </Button>
            <Button onClick={() => onTabChange('new-request')}>
              {t('new_request')}
            </Button>
            <Button
              variant="outline"
              onClick={() => onTabChange('data-brokers')}
            >
              {t('view_brokers')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 