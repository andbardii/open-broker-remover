import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Shield, Code, FileCode } from "lucide-react";
import EmailSetup from '@/components/EmailSetup';
import SecuritySetup from '@/components/SecuritySetup';
import { EmailConfig } from '@/lib/types';
import { emailService } from '@/lib/email';
import { useLanguage } from '@/contexts/LanguageContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface SettingsProps {
  onTabChange: (tab: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("email");
  const [dockerConfig, setDockerConfig] = useState<string>('');
  const [appConfig, setAppConfig] = useState<string>('');
  const { t } = useLanguage();

  // Fetch Docker configuration on component mount or tab switch
  React.useEffect(() => {
    if (activeTab === 'developer') {
      fetchDockerConfig();
      fetchAppConfig();
    }
  }, [activeTab]);

  const fetchDockerConfig = async () => {
    try {
      // In a real implementation, this would fetch the actual Dockerfile
      setDockerConfig(`FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]`);
    } catch (error) {
      console.error('Error loading Docker configuration:', error);
    }
  };

  const fetchAppConfig = async () => {
    try {
      // In a real implementation, this would fetch the actual app configuration
      setAppConfig(`{
  "apiUrl": "http://localhost:3001",
  "maxRequestsPerDay": 50,
  "enableAutomation": true,
  "loggingLevel": "info",
  "dataExportPath": "./exports",
  "cacheExpiration": 86400,
  "defaultLanguage": "en",
  "securityOptions": {
    "encryptionAlgorithm": "AES-256-GCM",
    "allowRemoteConnections": false
  }
}`);
    } catch (error) {
      console.error('Error loading app configuration:', error);
    }
  };

  const handleEmailSetup = async (config: EmailConfig) => {
    // The existing email setup handler logic remains in the component
    await emailService.configure(config);
  };

  const handleSecuritySetup = () => {
    // The security setup logic remains in the component
  };

  const handleSaveDockerConfig = async () => {
    try {
      // In a real implementation, this would save the Dockerfile
      toast({
        title: "Docker configuration saved",
        description: "The Docker configuration has been updated successfully."
      });
    } catch (error) {
      console.error('Error saving Docker configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save Docker configuration.",
        variant: "destructive"
      });
    }
  };

  const handleSaveAppConfig = async () => {
    try {
      // In a real implementation, this would save the app configuration
      toast({
        title: "Application configuration saved",
        description: "The application configuration has been updated successfully."
      });
    } catch (error) {
      console.error('Error saving app configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save application configuration.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t('settings')}</h2>
        <p className="text-muted-foreground">
          {t('settings-description')}
        </p>
      </div>

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
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium mb-1">Docker Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        Edit the Dockerfile used to containerize this application
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSaveDockerConfig}
                    >
                      <FileCode className="h-4 w-4 mr-2" />
                      Save Dockerfile
                    </Button>
                  </div>
                  <Textarea 
                    value={dockerConfig}
                    onChange={(e) => setDockerConfig(e.target.value)}
                    className="font-mono text-sm h-64"
                    placeholder="Loading Docker configuration..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium mb-1">Application Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        Edit the application settings in JSON format
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSaveAppConfig}
                    >
                      <FileCode className="h-4 w-4 mr-2" />
                      Save Config
                    </Button>
                  </div>
                  <Textarea 
                    value={appConfig}
                    onChange={(e) => setAppConfig(e.target.value)}
                    className="font-mono text-sm h-64"
                    placeholder="Loading application configuration..."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default Settings; 