import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { securityService } from '@/lib/security';
import { db } from '@/lib/database';
import { AlertCircle } from 'lucide-react';

interface SecuritySetupProps {
  onSetupComplete: () => void;
}

const SecuritySetup: React.FC<SecuritySetupProps> = ({ onSetupComplete }) => {
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [keyGenerated, setKeyGenerated] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        const keyExists = securityService.hasKey();
        setKeyGenerated(keyExists);

        if (keyExists) {
          const key = await securityService.getKey();
          setGeneratedKey(key ? JSON.stringify(key) : '');
        }

        const config = await db.getRequests();
        setEncryptionEnabled(config.length > 0);
      } catch (error) {
        console.error('Error initializing security settings:', error);
      }
    };
    initializeSecurity();
  }, []);

  const handleGenerateKey = async () => {
    try {
      await securityService.generateAndSaveKey();
      const key = await securityService.getKey();
      setKeyGenerated(true);
      setGeneratedKey(key ? JSON.stringify(key) : '');

      await db.createRequest({
        brokerName: 'Security Key',
        status: 'completed',
        userEmail: 'local',
      });

      toast({
        title: 'Security key generated',
        description: 'Save this key securely. It is required to decrypt your data.',
      });
    } catch (error) {
      console.error('Error generating key:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate security key. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEnableEncryption = async (enabled: boolean) => {
    try {
      setEncryptionEnabled(enabled);
      if (enabled && !keyGenerated) {
        await handleGenerateKey();
      }
      toast({
        title: enabled ? 'Encryption Enabled' : 'Encryption Disabled',
        description: enabled ? 'Your data will now be encrypted.' : 'Data will be stored without encryption.',
      });
    } catch (error) {
      console.error('Error enabling encryption:', error);
      toast({
        title: 'Error',
        description: 'Failed to update encryption settings.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveConfiguration = () => {
    try {
      onSetupComplete();
      toast({
        title: 'Configuration Saved',
        description: 'Security settings have been successfully applied.',
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configuration.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle>Data Encryption</CardTitle>
          <CardDescription>Configure encryption settings for sensitive data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between space-x-2'>
              <Label htmlFor='encryption'>Enable Encryption</Label>
              <Switch 
                id='encryption' 
                checked={encryptionEnabled} 
                onCheckedChange={handleEnableEncryption} 
              />
            </div>
            {keyGenerated && generatedKey && (
              <div className='relative mt-4'>
                <div className='bg-gray-100 p-3 rounded-md text-xs font-mono break-all'>
                  {generatedKey}
                </div>
                <div className='absolute -top-2 -right-2'>
                  <div className='bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center'>
                    <AlertCircle className='h-3 w-3 mr-1' />
                    Save this key securely
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveConfiguration} className='w-full'>
            Save Security Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SecuritySetup;
