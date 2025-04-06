import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Shield } from "lucide-react";
import EmailSetup from '@/components/EmailSetup';
import SecuritySetup from '@/components/SecuritySetup';
import { EmailConfig } from '@/lib/types';
import { emailService } from '@/lib/email';
import { useLanguage } from '@/contexts/LanguageContext';

interface SettingsProps {
  onTabChange: (tab: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("email");
  const { t } = useLanguage();

  const handleEmailSetup = async (config: EmailConfig) => {
    // The existing email setup handler logic remains in the component
    await emailService.configure(config);
  };

  const handleSecuritySetup = () => {
    // The security setup logic remains in the component
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                {t('email-settings')}
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                {t('security-settings')}
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
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default Settings; 