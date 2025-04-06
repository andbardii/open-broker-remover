
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { automationService } from '@/lib/automation';
import { emailService } from '@/lib/email';
import { db } from '@/lib/database';
import { DataBroker, AutomationResult } from '@/lib/types';
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  brokerName: z.string().min(2, {
    message: "Broker name must be at least 2 characters.",
  }),
  brokerUrl: z.string().url({
    message: "Please enter a valid URL.",
  }),
  additionalInfo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewRequestFormProps {
  onRequestCreated: (data: any) => void;
}

const NewRequestForm: React.FC<NewRequestFormProps> = ({ onRequestCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataBrokers, setDataBrokers] = useState<DataBroker[]>([]);
  const [isLoadingBrokers, setIsLoadingBrokers] = useState(true);
  const [automationResult, setAutomationResult] = useState<AutomationResult | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isEmailConfigured, setIsEmailConfigured] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brokerName: '',
      brokerUrl: '',
      additionalInfo: '',
    },
  });

  useEffect(() => {
    const loadDataBrokers = async () => {
      try {
        const brokers = await db.getDataBrokers();
        setDataBrokers(brokers);
      } catch (error) {
        console.error('Error loading data brokers:', error);
        toast({
          title: "Error",
          description: "Failed to load data brokers list.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBrokers(false);
      }
    };
    
    const loadEmailConfig = () => {
      const config = emailService.getConfig();
      if (config && config.username) {
        setUserEmail(config.username);
        setIsEmailConfigured(true);
      } else {
        setIsEmailConfigured(false);
      }
    };
    
    loadDataBrokers();
    loadEmailConfig();
  }, []);

  const handleBrokerChange = (brokerId: string) => {
    const selectedBroker = dataBrokers.find(broker => broker.id === brokerId);
    if (selectedBroker) {
      form.setValue('brokerName', selectedBroker.name);
      form.setValue('brokerUrl', selectedBroker.optOutUrl);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!isEmailConfigured || !userEmail) {
      toast({
        title: "Email not configured",
        description: "Please configure your email in Email Settings before creating a request.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setAutomationResult(null);
    
    try {
      // Use the enhanced automation service to send the request
      const result = await automationService.sendRequest(data.brokerUrl, {
        email: userEmail,
        additionalInfo: data.additionalInfo || '',
      });
      
      setAutomationResult(result);
      
      if (result.success) {
        // Create a new request in the database with the result
        await db.createRequest({
          brokerName: data.brokerName,
          status: 'sent',
          userEmail: userEmail,
          metadata: JSON.stringify({
            timestamp: result.timestamp,
            screenshot: result.screenshot,
          }),
        });
        
        toast({
          title: "Request sent successfully",
          description: `Request to ${data.brokerName} has been sent.`,
        });
        
        onRequestCreated({
          ...data,
          userEmail,
        });
        form.reset();
      } else {
        toast({
          title: "Automation failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      {!isEmailConfigured && (
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to configure your email in Email Settings before creating requests.
          </AlertDescription>
        </Alert>
      )}
      
      {isEmailConfigured && userEmail && (
        <div className="mb-6 px-4 py-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            Requests will be sent using your configured email: <span className="font-medium">{userEmail}</span>
          </p>
        </div>
      )}
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="brokerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Broker</FormLabel>
              <Select
                disabled={isLoadingBrokers || isSubmitting}
                onValueChange={(value) => {
                  handleBrokerChange(value);
                  return field.onChange(dataBrokers.find(broker => broker.id === value)?.name || '');
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a data broker" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dataBrokers.map((broker) => (
                    <SelectItem key={broker.id} value={broker.id}>
                      {broker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="brokerUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opt-Out URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/opt-out" 
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                The URL where the opt-out form is located
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information to include with your request..."
                  className="resize-none"
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || !isEmailConfigured}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending request...
            </>
          ) : (
            "Send Request"
          )}
        </Button>
      </form>
      
      {automationResult && automationResult.screenshot && (
        <div className="mt-6 p-4 border rounded-md">
          <h3 className="text-lg font-medium mb-2">Automation Result</h3>
          <p className={`mb-2 ${automationResult.success ? 'text-green-600' : 'text-red-600'}`}>
            {automationResult.message}
          </p>
          <div className="mt-4">
            <p className="mb-2 text-sm text-gray-500">Screenshot captured:</p>
            <img 
              src={automationResult.screenshot} 
              alt="Form submission screenshot" 
              className="border rounded-md w-full"
            />
          </div>
        </div>
      )}
    </Form>
  );
};

export default NewRequestForm;
