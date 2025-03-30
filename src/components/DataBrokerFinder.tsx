
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
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSearching(true);
    
    try {
      const brokers = await db.findDataBrokersForEmail(data.email);
      setFoundBrokers(brokers);
      setHasSearched(true);
      
      toast({
        title: "Search completed",
        description: `Found ${brokers.length} data brokers that may have your information.`,
      });
    } catch (error) {
      console.error('Error searching for data brokers:', error);
      toast({
        title: "Error",
        description: "Failed to search for data brokers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
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
        })
      );
      
      await Promise.all(creationPromises);
      
      toast({
        title: "Requests created",
        description: `Created ${foundBrokers.length} opt-out requests.`,
      });
      
      // Clear the found brokers after creating requests
      setFoundBrokers([]);
      setHasSearched(false);
      form.reset();
    } catch (error) {
      console.error('Error creating requests:', error);
      toast({
        title: "Error",
        description: "Failed to create opt-out requests. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Data Brokers</CardTitle>
          <CardDescription>
            Search for data brokers that may have your email information
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
                    <FormLabel>Your Email</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input placeholder="your@email.com" {...field} />
                        <Button type="submit" disabled={isSearching}>
                          {isSearching ? "Searching..." : "Search"}
                          <Search className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      We'll search for data brokers that may have your email information
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
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {foundBrokers.length > 0 
                ? `We found ${foundBrokers.length} data brokers that may have your information.`
                : "No data brokers were found with your information."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {foundBrokers.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Data Broker</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Opt-Out Link</th>
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
                              Opt-Out <ExternalLink className="ml-1 h-3 w-3" />
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
                No data brokers were found with your information.
              </p>
            )}
          </CardContent>
          {foundBrokers.length > 0 && (
            <CardFooter>
              <Button onClick={handleCreateRequestAll} className="w-full">
                Create Opt-Out Requests for All
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

export default DataBrokerFinder;
