import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, Shield, AlertCircle, Clock } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { db } from '@/lib/database';
import { DataBroker, SearchHistory } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslationWithVariables } from '@/lib/translation-fix';

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
  const [searchProgress, setSearchProgress] = useState(0);
  const [previousSearches, setPreviousSearches] = useState<SearchHistory[]>([]);
  const [searchingSteps, setSearchingSteps] = useState<string[]>([]);
  const { t } = useLanguage();
  const { formatWithVariables } = useTranslationWithVariables();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  // Load previous searches on component mount
  useEffect(() => {
    const loadPreviousSearches = async () => {
      try {
        // This would connect to a real history storage in a full implementation
        const searches = localStorage.getItem('search_history');
        if (searches) {
          setPreviousSearches(JSON.parse(searches));
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    };
    
    loadPreviousSearches();
  }, []);

  // Save search to history
  const saveSearchToHistory = (email: string, brokersCount: number) => {
    const newSearch: SearchHistory = {
      email,
      timestamp: new Date().toISOString(),
      foundBrokers: brokersCount,
      requestsMade: 0,
    };
    
    const updatedSearches = [newSearch, ...previousSearches.slice(0, 4)];
    setPreviousSearches(updatedSearches);
    
    try {
      localStorage.setItem('search_history', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  // Simulate the step-by-step discovery process like commercial services
  const simulateSearchSteps = async (email: string) => {
    const steps = [
      t('scanning-public-databases'),
      t('checking-people-search-sites'),
      t('analyzing-marketing-databases'),
      t('searching-data-aggregators'),
      t('checking-social-media-traces'),
      t('finalizing-results')
    ];
    
    setSearchingSteps([steps[0]]);
    
    for (let i = 1; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
      setSearchingSteps(prev => [...prev, steps[i]]);
      setSearchProgress(Math.round((i + 1) * (100 / steps.length)));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSearching(true);
    setSearchProgress(0);
    setSearchingSteps([]);
    setFoundBrokers([]);
    
    try {
      // Start the simulated search steps
      simulateSearchSteps(data.email);
      
      // Get brokers from the database using the enhanced algorithm
      const relevantBrokers = await db.findDataBrokersForEmail(data.email);
      
      // Short delay to allow the progress animation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFoundBrokers(relevantBrokers);
      setHasSearched(true);
      
      // Save this search to history
      saveSearchToHistory(data.email, relevantBrokers.length);
      
      toast({
        title: t('search-completed'),
        description: formatWithVariables('brokers-found', { count: relevantBrokers.length })
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
      setSearchProgress(100);
    }
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
          metadata: JSON.stringify({
            optOutUrl: broker.optOutUrl,
            category: broker.category,
            optOutMethod: broker.optOutMethod,
            difficulty: broker.difficulty,
            responseTime: broker.responseTime,
            isPremium: broker.isPremium
          }),
        })
      );
      
      await Promise.all(creationPromises);
      
      // Update the search history to reflect the requests made
      const updatedSearches = previousSearches.map((search, index) => 
        index === 0 ? { ...search, requestsMade: foundBrokers.length } : search
      );
      setPreviousSearches(updatedSearches);
      localStorage.setItem('search_history', JSON.stringify(updatedSearches));
      
      toast({
        title: t('requests-created'),
        description: formatWithVariables('created-requests', { count: foundBrokers.length })
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

  // Helper to render difficulty badges
  const renderDifficultyBadge = (difficulty: string) => {
    switch(difficulty) {
      case 'easy':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Easy</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case 'hard':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Hard</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
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
          
          {previousSearches.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-2">{t('recent-searches')}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {previousSearches.slice(0, 3).map((search, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{search.email}</span>
                    <span>{search.foundBrokers} {t('brokers-found-label')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isSearching && (
        <Card>
          <CardHeader>
            <CardTitle>{t('searching')}</CardTitle>
            <CardDescription>
              {t('searching-description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={searchProgress} className="w-full h-2" />
              
              <div className="space-y-2">
                {searchingSteps.map((step, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-4 h-4 mr-2 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasSearched && !isSearching && (
        <Card>
          <CardHeader>
            <CardTitle>{t('search-results')}</CardTitle>
            <CardDescription>
              {foundBrokers.length > 0 
                ? formatWithVariables('found-brokers', { count: foundBrokers.length })
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
                        <th className="h-12 px-4 text-left align-middle font-medium">{t('category')}</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">{t('difficulty')}</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {foundBrokers.map((broker) => (
                        <tr key={broker.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            <div>
                              <div className="font-medium">{broker.name}</div>
                              {broker.isPremium && (
                                <div className="text-xs text-amber-600 mt-1 flex items-center">
                                  <Shield className="h-3 w-3 mr-1" />
                                  {t('premium-broker')}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge variant="secondary" className="capitalize">
                              {broker.category.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              {renderDifficultyBadge(broker.difficulty)}
                              
                              {broker.responseTime && (
                                <div className="ml-2 text-xs text-muted-foreground flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {broker.responseTime}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex space-x-2">
                              <a 
                                href={broker.optOutUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs flex items-center text-blue-600 hover:underline"
                              >
                                {t('opt-out')} <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </div>
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
