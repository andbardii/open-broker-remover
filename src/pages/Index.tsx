import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/components/Dashboard';
import Privacy from '@/pages/Privacy';
import Requests from '@/pages/Requests';
import EmailSetup from '@/components/EmailSetup';
import SecuritySetup from '@/components/SecuritySetup';
import DataBrokerManager from '@/components/DataBrokerManager';
import WelcomeTutorial from '@/components/WelcomeTutorial';
import Settings from '@/pages/Settings';
import About from '@/pages/About';
import { db } from '@/lib/database';
import { emailService } from '@/lib/email';
import { DataRequest, EmailConfig } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const { t } = useLanguage();
  
  useEffect(() => {
    // Check if it's the first visit
    const tutorialCompleted = localStorage.getItem('tutorial_completed');
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }

    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const data = await db.getRequests();
        setRequests(data || []);
      } catch (error) {
        console.error('Error loading requests:', error);
        toast({
          title: "Error",
          description: "Failed to load requests data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRequests();
  }, []);
  
  const handleTabChange = (tab: string) => {
    setIsContentLoading(true);
    setActiveTab(tab);
    // Simulate a brief loading state when changing tabs
    setTimeout(() => {
      setIsContentLoading(false);
    }, 300);
  };
  
  // Improved handleCreateRequest with proper error handling and validation
  const handleCreateRequest = async (data: {
    brokerName: string;
    brokerUrl: string;
    userEmail: string;
    additionalInfo?: string;
  }) => {
    setIsContentLoading(true);
    
    if (!data.brokerName || !data.userEmail) {
      toast({
        title: "Validation Error",
        description: "Broker name and email are required",
        variant: "destructive",
      });
      setIsContentLoading(false);
      return;
    }
    
    try {
      // Create the request in the database
      const newRequest = await db.createRequest({
        brokerName: data.brokerName,
        status: 'pending',
        userEmail: data.userEmail,
        // Store optional metadata as JSON
        metadata: JSON.stringify({
          brokerUrl: data.brokerUrl,
          additionalInfo: data.additionalInfo || '',
          dateCreated: new Date().toISOString(),
        }),
      });
      
      // Update the local state with the new request
      setRequests(prevRequests => [...prevRequests, newRequest]);
      
      // Navigate to the requests tab to show the new request
      handleTabChange("requests");
      
      toast({
        title: "Request created",
        description: `New request for ${data.brokerName} has been created`,
      });
      
      // Return the created request for any additional processing
      return newRequest;
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsContentLoading(false);
    }
  };
  
  // Improved handleUpdateRequest with proper validation and status tracking
  const handleUpdateRequest = async (id: string, updates: Partial<DataRequest>) => {
    setIsContentLoading(true);
    
    // Validate the request ID
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid request ID",
        variant: "destructive",
      });
      setIsContentLoading(false);
      return null;
    }
    
    try {
      // Find the existing request to get its current state
      const existingRequest = requests.find(req => req.id === id);
      if (!existingRequest) {
        throw new Error("Request not found");
      }
      
      // Apply updates and add metadata about the change
      const metadata = {
        ...JSON.parse(existingRequest.metadata || '{}'),
        lastUpdated: new Date().toISOString(),
        previousStatus: existingRequest.status,
      };
      
      const updatedRequest = await db.updateRequest(id, {
        ...updates,
        metadata: JSON.stringify(metadata),
      });
      
      if (updatedRequest) {
        // Update the local state
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === id ? updatedRequest : req
          )
        );
        
        toast({
          title: "Request updated",
          description: `Request has been updated to ${updates.status}`,
        });
        
        return updatedRequest;
      } else {
        throw new Error("Failed to update request");
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsContentLoading(false);
    }
  };
  
  const handleEmailSetup = async (config: EmailConfig) => {
    try {
      await emailService.saveConfig(config);
      toast({
        title: "Success",
        description: "Email configuration saved successfully",
      });
    } catch (error) {
      console.error('Error setting up email:', error);
      toast({
        title: "Error",
        description: "Failed to save email configuration",
        variant: "destructive",
      });
    }
  };
  
  const handleSecuritySetup = () => {
    handleTabChange("dashboard");
  };
  
  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('tutorial_completed', 'true');
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading application data...</p>
          </div>
        </div>
      );
    }
    
    if (isContentLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }
    
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Monitor your data removal requests and overall progress
              </p>
            </div>
            <Dashboard requests={requests} onTabChange={setActiveTab} />
          </>
        );
        
      case "privacy":
        return <Privacy onTabChange={handleTabChange} />;
        
      case "requests":
        return <Requests onTabChange={handleTabChange} />;
        
      case "data-brokers":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">{t('data-brokers')}</h2>
              <p className="text-muted-foreground">
                View, add, and delete data brokers in the system
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Data Brokers</CardTitle>
                <CardDescription>
                  Manage the database of data brokers for opt-out requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataBrokerManager />
              </CardContent>
            </Card>
          </>
        );
        
      case "settings":
        return <Settings onTabChange={handleTabChange} />;
        
      case "about":
        return <About onTabChange={handleTabChange} />;
        
      default:
        return null;
    }
  };

  return (
    <>
      {showTutorial && <WelcomeTutorial onClose={handleCloseTutorial} />}
      <AppLayout activeTab={activeTab} onTabChange={handleTabChange}>
        {renderContent()}
      </AppLayout>
    </>
  );
};

export default Index;
