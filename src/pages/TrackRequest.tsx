import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertTriangle, Clock, FileText, Search, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { requestService } from '@/lib/request';

interface TrackRequestProps {
  onTabChange: (tab: string) => void;
}

interface Request {
  id: string;
  broker: string;
  requestType: 'deletion' | 'access' | 'correction';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  submittedDate: string;
  completedDate?: string;
  progress: number;
  reference?: string;
}

const TrackRequest: React.FC<TrackRequestProps> = ({ onTabChange }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    // Simulate loading requests
    setTimeout(() => {
      setLoading(false);
      generateMockRequests();
    }, 1500);
  }, []);

  const generateMockRequests = () => {
    const mockRequests: Request[] = [
      {
        id: '1',
        broker: 'Acxiom',
        requestType: 'deletion',
        status: 'pending',
        submittedDate: '2025-04-01',
        progress: 0,
        reference: 'REF123456'
      },
      {
        id: '2',
        broker: 'Experian',
        requestType: 'access',
        status: 'processing',
        submittedDate: '2025-04-02',
        progress: 45,
        reference: 'EXP789012'
      },
      {
        id: '3',
        broker: 'TransUnion',
        requestType: 'deletion',
        status: 'completed',
        submittedDate: '2025-03-15',
        completedDate: '2025-04-05',
        progress: 100,
        reference: 'TU345678'
      },
      {
        id: '4',
        broker: 'Equifax',
        requestType: 'deletion',
        status: 'processing',
        submittedDate: '2025-04-03',
        progress: 75,
        reference: 'EQ901234'
      },
      {
        id: '5',
        broker: 'Whitepages',
        requestType: 'deletion',
        status: 'failed',
        submittedDate: '2025-03-20',
        completedDate: '2025-04-04',
        progress: 30,
        reference: 'WP567890'
      }
    ];
    setRequests(mockRequests);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 mr-1" />;
      case 'processing': return <RefreshCw className="h-4 w-4 mr-1" />;
      case 'completed': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'deletion': return 'bg-purple-100 text-purple-800';
      case 'access': return 'bg-blue-100 text-blue-800';
      case 'correction': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateRequest = () => {
    onTabChange('requests');
  };

  const filterRequests = (requestsList: Request[]) => {
    // Filter by search query
    if (searchQuery) {
      requestsList = requestsList.filter(req => 
        req.broker.toLowerCase().includes(searchQuery.toLowerCase()) || 
        req.reference?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab === 'active') {
      return requestsList.filter(req => ['pending', 'processing'].includes(req.status));
    } else if (activeTab === 'completed') {
      return requestsList.filter(req => req.status === 'completed');
    } else if (activeTab === 'failed') {
      return requestsList.filter(req => req.status === 'failed');
    }
    
    return requestsList;
  };

  const refreshRequests = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate updated data
      const updatedRequests = [...requests];
      // Update progress for processing requests
      updatedRequests.forEach(req => {
        if (req.status === 'processing') {
          req.progress = Math.min(100, req.progress + 10);
          if (req.progress === 100) {
            req.status = 'completed';
            req.completedDate = new Date().toISOString().split('T')[0];
          }
        }
      });
      setRequests(updatedRequests);
    }, 800);
  };

  const filteredRequests = filterRequests(requests);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t('track-requests')}</h2>
        <p className="text-muted-foreground">
          {t('track-requests-description')}
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center w-full max-w-sm space-x-2">
          <Input
            type="text"
            placeholder={t('search-requests')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
          <Button variant="ghost" size="icon" onClick={() => setSearchQuery('')}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={refreshRequests}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('refresh')}
          </Button>
          <Button size="sm" onClick={handleCreateRequest}>
            {t('new-request')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            <Clock className="mr-2 h-4 w-4" />
            {t('active-requests')}
            {requests.filter(r => ['pending', 'processing'].includes(r.status)).length > 0 && (
              <Badge variant="default" className="ml-2">
                {requests.filter(r => ['pending', 'processing'].includes(r.status)).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="mr-2 h-4 w-4" />
            {t('completed-requests')}
          </TabsTrigger>
          <TabsTrigger value="failed">
            <AlertTriangle className="mr-2 h-4 w-4" />
            {t('failed-requests')}
          </TabsTrigger>
          <TabsTrigger value="all">
            <FileText className="mr-2 h-4 w-4" />
            {t('all-requests')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0">
          <RequestTable 
            requests={filteredRequests} 
            loading={loading} 
            t={t} 
            getStatusColor={getStatusColor} 
            getStatusIcon={getStatusIcon}
            getRequestTypeColor={getRequestTypeColor}
          />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          <RequestTable 
            requests={filteredRequests} 
            loading={loading} 
            t={t} 
            getStatusColor={getStatusColor} 
            getStatusIcon={getStatusIcon}
            getRequestTypeColor={getRequestTypeColor}
          />
        </TabsContent>
        
        <TabsContent value="failed" className="mt-0">
          <RequestTable 
            requests={filteredRequests} 
            loading={loading} 
            t={t} 
            getStatusColor={getStatusColor} 
            getStatusIcon={getStatusIcon}
            getRequestTypeColor={getRequestTypeColor}
          />
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <RequestTable 
            requests={filteredRequests} 
            loading={loading} 
            t={t} 
            getStatusColor={getStatusColor} 
            getStatusIcon={getStatusIcon}
            getRequestTypeColor={getRequestTypeColor}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

interface RequestTableProps {
  requests: Request[];
  loading: boolean;
  t: (key: string, params?: string[]) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getRequestTypeColor: (type: string) => string;
}

const RequestTable: React.FC<RequestTableProps> = ({ 
  requests, 
  loading, 
  t, 
  getStatusColor, 
  getStatusIcon,
  getRequestTypeColor
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('data-requests')}</CardTitle>
        <CardDescription>
          {t('data-requests-description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('broker')}</TableHead>
                <TableHead>{t('request-type')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('submitted')}</TableHead>
                <TableHead>{t('completed')}</TableHead>
                <TableHead>{t('progress')}</TableHead>
                <TableHead>{t('reference')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(request => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.broker}</TableCell>
                  <TableCell>
                    <Badge className={getRequestTypeColor(request.requestType)}>
                      {t(request.requestType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      {t(request.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.submittedDate}</TableCell>
                  <TableCell>{request.completedDate || '-'}</TableCell>
                  <TableCell>
                    <div className="w-[100px]">
                      <Progress value={request.progress} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>{request.reference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/80" />
            <h3 className="mt-4 text-lg font-medium">{t('no-requests-found')}</h3>
            <p className="text-muted-foreground mt-2">{t('no-requests-found-desc')}</p>
          </div>
        )}
      </CardContent>
      {requests.length === 0 && !loading && (
        <CardFooter className="flex justify-center">
          <Button onClick={() => {}} variant="outline">
            {t('create-new-request')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TrackRequest; 