import React, { useEffect } from 'react';
import App from './App.tsx';
import { toast } from '@/components/ui/use-toast';
import { securityService } from '@/lib/security';
import { AlertTriangle } from 'lucide-react';

async function initializeApp() {
  try {
    const keyExists = await securityService.hasKey();

    if (keyExists) {
      toast({
        title: 'Encryption Active',
        description: 'Your data is protected with encryption.',
        variant: 'default',
      });
      console.log('Encryption key loaded successfully.');
    } else {
      toast({
        title: 'Encryption Not Configured',
        description: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            Your data is currently not encrypted.
          </div>
        ),
        variant: 'default',
      });
      console.warn('No encryption key found.');
    }
  } catch (error) {
    toast({
      title: 'Encryption Error',
      description: 'Failed to verify encryption settings.',
      variant: 'destructive',
    });
    console.error('Error during initialization:', error);
  }
}

const AppInitializer: React.FC = () => {
  useEffect(() => {
    initializeApp();
  }, []);

  return <App />;
};

export default AppInitializer;
