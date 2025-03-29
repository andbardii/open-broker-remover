
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { securityService } from '@/lib/security';
import { AlertCircle, Lock, ShieldCheck } from 'lucide-react';

interface SecuritySetupProps {
  onSetupComplete: () => void;
}

const SecuritySetup: React.FC<SecuritySetupProps> = ({ onSetupComplete }) => {
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [keyGenerated, setKeyGenerated] = useState(securityService.hasKey());
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  
  const handleGenerateKey = () => {
    try {
      const key = securityService.generateKey();
      setKeyGenerated(true);
      setGeneratedKey(key);
      
      toast({
        title: "Security key generated",
        description: "Make sure to save this key in a secure location. You'll need it to decrypt your data.",
      });
    } catch (error) {
      console.error('Error generating key:', error);
      toast({
        title: "Error",
        description: "Failed to generate security key.",
        variant: "destructive",
      });
    }
  };
  
  const handleEnableEncryption = (enabled: boolean) => {
    setEncryptionEnabled(enabled);
    
    if (enabled && !keyGenerated) {
      handleGenerateKey();
    }
    
    toast({
      title: enabled ? "Encryption enabled" : "Encryption disabled",
      description: enabled 
        ? "Your data will now be encrypted before storing." 
        : "Data will be stored without encryption.",
    });
  };
  
  const handleSaveConfiguration = () => {
    onSetupComplete();
    
    toast({
      title: "Security configuration saved",
      description: "Your security settings have been applied.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Data Encryption</CardTitle>
          <CardDescription>
            Configure encryption settings for sensitive data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="encryption" className="flex flex-col space-y-1">
                <span className="text-base">Enable Encryption</span>
                <span className="text-sm font-normal text-muted-foreground">Encrypt all sensitive data before storing</span>
              </Label>
              <Switch
                id="encryption"
                checked={encryptionEnabled}
                onCheckedChange={handleEnableEncryption}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <h4 className="text-sm font-medium">Encryption Key</h4>
                </div>
                {!keyGenerated && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerateKey}
                    disabled={!encryptionEnabled}
                  >
                    Generate Key
                  </Button>
                )}
              </div>
              
              {keyGenerated && generatedKey && (
                <div className="relative">
                  <div className="bg-muted p-3 rounded-md text-xs font-mono break-all">
                    {generatedKey}
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Save this key
                    </div>
                  </div>
                </div>
              )}
              
              {keyGenerated && !generatedKey && (
                <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Encryption key already generated and active
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveConfiguration} className="w-full">
            Save Security Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SecuritySetup;
