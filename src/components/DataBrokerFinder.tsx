
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink } from "lucide-react";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { db } from '@/lib/database';
import { DataBroker } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const DataBrokerFinder: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [foundBrokers, setFoundBrokers] = useState<DataBroker[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { t } = useLanguage();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSearching(true);
    
    try {
      // Get all brokers first
      const allBrokers = await db.getDataBrokers();
      
      // Use a deterministic method to filter brokers based on email
      // Hashing the email to create a deterministic pattern
      const emailHash = hashCode(data.email);
      
      // Filter brokers based on email characters and hash
      // This ensures same email always returns same brokers
      const relevantBrokers = allBrokers.filter(broker => {
        // Simple deterministic algorithm: 
        // Check if any part of broker name matches part of email domain
        const emailDomain = data.email.split('@')[1] || '';
        const domainParts = emailDomain.split('.');
        
        // Include broker if broker name contains part of email or if hash % position is 0
        const index = allBrokers.indexOf(broker);
        return domainParts.some(part => 
            broker.name.toLowerCase().includes(part) || 
            broker.optOutUrl.toLowerCase().includes(part) ||
            (Math.abs(emailHash + index) % 3 === 0) // Deterministic pattern
        );
      });
      
      setFoundBrokers(relevantBrokers);
      setHasSearched(true);
      
      toast({
        title: t('search-completed'),
        description: t('brokers-found', { count: relevantBrokers.length.toString() }),
      });
    } catch (error) {
      console.error('Error searching for data brokers:', error);
      toast({
        title: "Error",
        description: t('search-error'),
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Simple string hash function for deterministic results
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };

  const handleCreateRequestAll = async () => {
    if (foundBrokers.length === 0) return;
    
    try {
      const email = form.getValues().email;
      
      // Create opt-out requests for all found brokers
      const creationPromises = foundBrokers.map(broker => 
        db.createRequest({
          brokerName: broker.name,
          status: 'pending',
          userEmail: email,
        })
      );
      
      await Promise.all(creationPromises);
      
      toast({
        title: t('requests-created'),
        description: t('created-requests', { count: foundBrokers.length.toString() }),
      });
      
      // Clear the found brokers after creating requests
      setFoundBrokers([]);
      setHasSearched(false);
      form.reset();
    } catch (error) {
      console.error('Error creating requests:', error);
      toast({
        title: "Error",
        description: t('error-creating-requests'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('find-data-brokers')}</CardTitle>
          <CardDescription>
            {t('search-description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('your-email')}</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input placeholder="your@email.com" {...field} />
                        <Button type="submit" disabled={isSearching}>
                          {isSearching ? t('searching') : t('search')}
                          <Search className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {t('email-search-description')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>{t('search-results')}</CardTitle>
            <CardDescription>
              {foundBrokers.length > 0 
                ? t('found-brokers', { count: foundBrokers.length.toString() })
                : t('no-brokers-found')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {foundBrokers.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">{t('data-broker')}</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">{t('opt-out-link')}</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {foundBrokers.map((broker) => (
                        <tr key={broker.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">{broker.name}</td>
                          <td className="p-4 align-middle">
                            <a 
                              href={broker.optOutUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:underline"
                            >
                              {t('opt-out')} <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                {t('no-brokers-found')}
              </p>
            )}
          </CardContent>
          {foundBrokers.length > 0 && (
            <CardFooter>
              <Button onClick={handleCreateRequestAll} className="w-full">
                {t('create-requests-all')}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

export default DataBrokerFinder;
