import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Shield, Code, FileCode, Save, AlertCircle } from "lucide-react";
import EmailSetup from '@/components/EmailSetup';
import SecuritySetup from '@/components/SecuritySetup';
import DiagnosticsPanel from '@/components/DiagnosticsPanel';
import DataManagementPanel from '@/components/DataManagementPanel';
import { EmailConfig } from '@/lib/types';
import { emailService } from '@/lib/email';
import { useLanguage } from '@/contexts/LanguageContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AppConfig, developerService } from '@/lib/developer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

interface SettingsProps {
  onTabChange?: (tab: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("email");
  const [dockerConfig, setDockerConfig] = useState<string>('');
  const [appConfig, setAppConfig] = useState<string>('');
  const [appConfigError, setAppConfigError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDockerConfig = useCallback(async () => {
    try {
      const config = await developerService.getDockerConfig();
      setDockerConfig(config);
    } catch (error) {
      console.error('Error loading Docker configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Docker configuration',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const fetchAppConfig = useCallback(async () => {
    try {
      const config = await developerService.getAppConfig();
      setAppConfig(JSON.stringify(config, null, 2));
      setAppConfigError(null);
    } catch (error) {
      console.error('Error loading app configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load application configuration',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Fetch configurations on component mount or tab switch
  useEffect(() => {
    if (activeTab === 'developer') {
      fetchDockerConfig();
      fetchAppConfig();
    }
  }, [activeTab, fetchDockerConfig, fetchAppConfig]);

  const handleEmailSetup = async (config: EmailConfig) => {
    // The existing email setup handler logic remains in the component
    await emailService.saveConfig(config);
  };

  const handleSecuritySetup = () => {
    // The security setup logic remains in the component
  };

  const handleSaveDockerConfig = async () => {
    try {
      const success = await developerService.saveDockerConfig(dockerConfig);
      
      if (success) {
        toast({
          title: t('config-saved'),
          description: t('config-saved-description'),
        });
      } else {
        throw new Error('Failed to save Docker configuration');
      }
    } catch (error) {
      console.error('Error saving Docker configuration:', error);
      toast({
        title: t('config-error'),
        description: t('config-error-description'),
        variant: 'destructive'
      });
    }
  };

  const handleSaveAppConfig = async () => {
    try {
      setAppConfigError(null);
      
      // Validate JSON
      let config: AppConfig;
      try {
        config = JSON.parse(appConfig);
      } catch (error) {
        setAppConfigError('Invalid JSON format');
        throw new Error('Invalid JSON format');
      }
      
      // Save configuration
      const success = await developerService.saveAppConfig(config);
      
      if (success) {
        toast({
          title: t('config-saved'),
          description: t('config-saved-description'),
        });
      } else {
        throw new Error('Failed to save application configuration');
      }
    } catch (error) {
      console.error('Error saving app configuration:', error);
      toast({
        title: t('config-error'),
        description: `${t('config-error-description')} ${error instanceof Error ? error.message : ''}`,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAllData = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch('/api/settings/delete-all-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete data');
      }

      toast({
        title: t('success'),
        description: t('data-deleted-successfully'),
        variant: 'default',
      });

      // Reload the app after successful deletion
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: t('error'),
        description: t('error-deleting-data'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">{t('settings')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('application-settings')}</CardTitle>
          <CardDescription>
            {t('configure-app-settings')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                {t('email-settings')}
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                {t('security-settings')}
              </TabsTrigger>
              <TabsTrigger value="developer" className="flex items-center">
                <Code className="mr-2 h-4 w-4" />
                {t('developer-zone')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{t('email-configuration')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('email-configuration-description')}
                  </p>
                </div>
                <EmailSetup 
                  onSetupComplete={handleEmailSetup}
                  initialConfig={emailService.getConfig()}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{t('security-encryption')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('security-encryption-description')}
                  </p>
                </div>
                <SecuritySetup onSetupComplete={handleSecuritySetup} />
              </div>
            </TabsContent>

            <TabsContent value="developer" className="mt-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">{t('developer-settings')}</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {t('developer-settings-description')}
                  </p>
                </div>
                
                <div className="grid gap-6 grid-cols-1">
                  {/* App Configuration */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium mb-1">{t('app-configuration')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('app-config-description')}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSaveAppConfig}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {t('save-config')}
                      </Button>
                    </div>
                    <Textarea 
                      value={appConfig}
                      onChange={(e) => setAppConfig(e.target.value)}
                      className="font-mono text-sm h-64"
                      placeholder="Loading application configuration..."
                    />
                    
                    {appConfigError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{appConfigError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Docker Configuration */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium mb-1">{t('docker-configuration')}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('docker-config-description')}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSaveDockerConfig}
                      >
                        <FileCode className="h-4 w-4 mr-2" />
                        {t('save-dockerfile')}
                      </Button>
                    </div>
                    <Textarea 
                      value={dockerConfig}
                      onChange={(e) => setDockerConfig(e.target.value)}
                      className="font-mono text-sm h-64"
                      placeholder="Loading Docker configuration..."
                    />
                  </div>

                  {/* Diagnostics Panel */}
                  <DiagnosticsPanel />
                  
                  {/* Data Management Panel */}
                  <DataManagementPanel />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Delete All Data Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('danger-zone')}</CardTitle>
          <CardDescription>{t('danger-zone-description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={isDeleting}
              >
                {isDeleting ? t('deleting') : t('delete-all-data')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('confirm-deletion')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('delete-all-data-warning')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('confirm-delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings; 