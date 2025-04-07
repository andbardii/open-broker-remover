import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MailOpen, AlertTriangle, Clock, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { emailService } from '@/lib/email';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EmailMonitorProps {
  onTabChange: (tab: string) => void;
}

interface EmailResponseMock {
  id: string;
  broker: string;
  subject: string;
  sender: string;
  date: string;
  status: 'new' | 'read' | 'pending';
  type: 'confirmation' | 'question' | 'rejection' | 'completion' | 'pending';
}

const EmailMonitor: React.FC<EmailMonitorProps> = ({ onTabChange }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [monitorActive, setMonitorActive] = useState(false);
  const [isEmailConfigured, setIsEmailConfigured] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emails, setEmails] = useState<EmailResponseMock[]>([]);

  useEffect(() => {
    // Check if email is configured
    const config = emailService.getConfig();
    if (config && config.username) {
      setUserEmail(config.username);
      setIsEmailConfigured(true);
      setMonitorActive(true);
    } else {
      setIsEmailConfigured(false);
    }

    // Simulate loading emails
    setTimeout(() => {
      setLoading(false);
      if (isEmailConfigured) {
        generateMockEmails();
      }
    }, 1500);
  }, [isEmailConfigured]);

  const generateMockEmails = () => {
    const mockEmails: EmailResponseMock[] = [
      {
        id: '1',
        broker: 'Acxiom',
        subject: 'Confirmation of Your Opt-Out Request',
        sender: 'privacy@acxiom.com',
        date: '2025-04-05',
        status: 'read',
        type: 'confirmation'
      },
      {
        id: '2',
        broker: 'Experian',
        subject: 'Additional Information Needed for Your Request',
        sender: 'privacy@experian.com',
        date: '2025-04-06',
        status: 'new',
        type: 'question'
      },
      {
        id: '3',
        broker: 'TransUnion',
        subject: 'Your Opt-Out Request Has Been Processed',
        sender: 'donotreply@transunion.com',
        date: '2025-04-04',
        status: 'read',
        type: 'completion'
      },
      {
        id: '4',
        broker: 'Equifax',
        subject: 'Information About Your Data Removal Request',
        sender: 'privacy@equifax.com',
        date: '2025-04-02',
        status: 'pending',
        type: 'pending'
      },
      {
        id: '5',
        broker: 'Whitepages',
        subject: 'Unable to Process Your Removal Request',
        sender: 'support@whitepages.com',
        date: '2025-04-01',
        status: 'read',
        type: 'rejection'
      }
    ];
    setEmails(mockEmails);
  };

  const handleEmailClick = (id: string) => {
    setEmails(emails.map(email => 
      email.id === id ? { ...email, status: 'read' as const } : email
    ));
  };

  const getEmailTypeColor = (type: string) => {
    switch(type) {
      case 'confirmation': return 'bg-blue-100 text-blue-800';
      case 'question': return 'bg-amber-100 text-amber-800';
      case 'rejection': return 'bg-red-100 text-red-800';
      case 'completion': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleMonitor = () => {
    if (isEmailConfigured) {
      setMonitorActive(!monitorActive);
    } else {
      // Prompt to configure email
      onTabChange('settings');
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t('email-monitor')}</h2>
        <p className="text-muted-foreground">
          {t('email-monitor-description')}
        </p>
      </div>

      {!isEmailConfigured ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('email-not-configured')}</AlertTitle>
          <AlertDescription>
            {t('email-monitor-config-needed')}
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal ml-1 underline"
              onClick={() => onTabChange('settings')}
            >
              {t('email-settings')}
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-blue-500" />
                {t('email-monitoring-status')}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Label htmlFor="monitor-toggle">{monitorActive ? t('active') : t('paused')}</Label>
                <Switch 
                  id="monitor-toggle" 
                  checked={monitorActive}
                  onCheckedChange={toggleMonitor}
                />
              </div>
            </div>
            <CardDescription>
              {monitorActive 
                ? t('email-monitor-active-desc', [userEmail || '']) 
                : t('email-monitor-paused-desc')}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="inbox">
            <MailOpen className="mr-2 h-4 w-4" />
            {t('inbox')}
            {emails.filter(e => e.status === 'new').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {emails.filter(e => e.status === 'new').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="mr-2 h-4 w-4" />
            {t('pending')}
          </TabsTrigger>
          <TabsTrigger value="all">
            <FileText className="mr-2 h-4 w-4" />
            {t('all-responses')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inbox" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('broker-responses')}</CardTitle>
              <CardDescription>
                {t('responses-description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : emails.filter(e => e.status === 'new').length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('broker')}</TableHead>
                      <TableHead>{t('subject')}</TableHead>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>{t('type')}</TableHead>
                      <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.filter(email => email.status === 'new').map(email => (
                      <TableRow key={email.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{email.broker}</TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell>{email.date}</TableCell>
                        <TableCell>
                          <Badge className={getEmailTypeColor(email.type)}>
                            {t(email.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleEmailClick(email.id)}>
                            {t('view')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <MailOpen className="mx-auto h-12 w-12 text-muted-foreground/80" />
                  <h3 className="mt-4 text-lg font-medium">{t('no-new-emails')}</h3>
                  <p className="text-muted-foreground mt-2">{t('no-new-emails-desc')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('pending-responses')}</CardTitle>
              <CardDescription>
                {t('pending-description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array(2).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : emails.filter(e => e.status === 'pending').length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('broker')}</TableHead>
                      <TableHead>{t('subject')}</TableHead>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.filter(email => email.status === 'pending').map(email => (
                      <TableRow key={email.id}>
                        <TableCell className="font-medium">{email.broker}</TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell>{email.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleEmailClick(email.id)}>
                            {t('view')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground/80" />
                  <h3 className="mt-4 text-lg font-medium">{t('no-pending-emails')}</h3>
                  <p className="text-muted-foreground mt-2">{t('no-pending-emails-desc')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('all-responses')}</CardTitle>
              <CardDescription>
                {t('all-responses-description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : emails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('broker')}</TableHead>
                      <TableHead>{t('subject')}</TableHead>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('type')}</TableHead>
                      <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.map(email => (
                      <TableRow key={email.id} className={email.status === 'new' ? 'bg-muted/30' : ''}>
                        <TableCell className="font-medium">{email.broker}</TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell>{email.date}</TableCell>
                        <TableCell>
                          <Badge variant={email.status === 'new' ? 'default' : 'outline'}>
                            {t(email.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEmailTypeColor(email.type)}>
                            {t(email.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleEmailClick(email.id)}>
                            {t('view')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/80" />
                  <h3 className="mt-4 text-lg font-medium">{t('no-responses')}</h3>
                  <p className="text-muted-foreground mt-2">{t('no-responses-desc')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default EmailMonitor; 