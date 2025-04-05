import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from '@/contexts/LanguageContext';
import { securityService } from '@/lib/security';
import { toast } from '@/components/ui/use-toast';
import { Lock, Unlock } from 'lucide-react';

const EncryptionStatus: React.FC = () => {
  const [encryptionEnabled, setEncryptionEnabled] = useState<boolean>(false);

  useEffect(() => {
    const checkEncryptionStatus = async () => {
      try {
        const hasKey = await securityService.hasKey();
        setEncryptionEnabled(hasKey);
      } catch (error) {
        console.error("Error checking encryption status:", error);
      }
    };
    checkEncryptionStatus();
  }, []);

  const toggleEncryption = async () => {
    try {
      if (!encryptionEnabled) {
        await securityService.generateAndSaveKey();
        setEncryptionEnabled(true);
        toast({
          title: "Encryption Enabled",
          description: "Data encryption is now active.",
        });
      } else {
        setEncryptionEnabled(false);
        toast({
          title: "Encryption Disabled",
          description: "Data encryption has been deactivated.",
        });
      }
    } catch (error) {
      console.error("Error toggling encryption:", error);
      toast({
        title: "Error",
        description: "Failed to toggle encryption settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggleEncryption}>
          {encryptionEnabled ? <Lock size={20} /> : <Unlock size={20} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{encryptionEnabled ? "Disable Encryption" : "Enable Encryption"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default EncryptionStatus;
