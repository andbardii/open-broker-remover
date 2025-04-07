import React from 'react';
import { DataRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface RequestCardProps {
  request: DataRequest;
  onUpdateRequest: (updatedRequest: DataRequest) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onUpdateRequest }) => {
  const { t } = useLanguage();

  const getStatusColor = (status: DataRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'sent':
        return 'bg-blue-500';
      case 'responded':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleStatusUpdate = (newStatus: DataRequest['status']) => {
    onUpdateRequest({
      ...request,
      status: newStatus,
      dateUpdated: new Date().toISOString()
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {request.brokerName}
        </CardTitle>
        <Badge className={getStatusColor(request.status)}>
          {t(request.status)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="text-sm">
            <span className="font-medium">{t('email')}: </span>
            {request.userEmail}
          </div>
          <div className="text-sm">
            <span className="font-medium">{t('submitted')}: </span>
            {formatDistanceToNow(new Date(request.dateCreated), { addSuffix: true })}
          </div>
          {request.dateUpdated && (
            <div className="text-sm">
              <span className="font-medium">{t('last_updated')}: </span>
              {formatDistanceToNow(new Date(request.dateUpdated), { addSuffix: true })}
            </div>
          )}
          {request.responseContent && (
            <div className="text-sm">
              <span className="font-medium">{t('response')}: </span>
              {request.responseContent}
            </div>
          )}
          <div className="flex gap-2 mt-2">
            {request.status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('sent')}
              >
                {t('mark_as_sent')}
              </Button>
            )}
            {request.status === 'sent' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('responded')}
              >
                {t('mark_as_responded')}
              </Button>
            )}
            {request.status === 'responded' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate('completed')}
              >
                {t('mark_as_completed')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestCard; 