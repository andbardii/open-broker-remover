
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { emailService } from '@/lib/email';
import { EmailConfig } from '@/lib/types';

const formSchema = z.object({
  username: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  server: z.string().min(1, {
    message: "Server address is required.",
  }),
  port: z.coerce.number().positive({
    message: "Port must be a positive number.",
  }),
  ssl: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface EmailSetupProps {
  onSetupComplete: (config: EmailConfig) => void;
  initialConfig?: EmailConfig | null;
}

const EmailSetup: React.FC<EmailSetupProps> = ({ onSetupComplete, initialConfig }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialConfig || {
      username: '',
      password: '',
      server: 'imap.gmail.com',
      port: 993,
      ssl: true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Create a fully-defined EmailConfig object from the form data
      const emailConfig: EmailConfig = {
        username: data.username,
        password: data.password,
        server: data.server,
        port: data.port,
        ssl: data.ssl,
      };
      
      // Configure the email service
      emailService.configure(emailConfig);
      
      toast({
        title: "Email configured",
        description: "Your email settings have been saved and will be used to process responses.",
      });
      
      onSetupComplete(emailConfig);
    } catch (error) {
      console.error('Error configuring email:', error);
      toast({
        title: "Error",
        description: "Failed to configure email. Please check your settings and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormDescription>
                For Gmail, you'll need to use an app password
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name="server"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IMAP Server</FormLabel>
                <FormControl>
                  <Input placeholder="imap.gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="993" 
                    value={field.value !== undefined ? String(field.value) : ''} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="ssl"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Use SSL</FormLabel>
                <FormDescription>
                  Enable secure connection to your email server
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Save Email Configuration
        </Button>
      </form>
    </Form>
  );
};

export default EmailSetup;
