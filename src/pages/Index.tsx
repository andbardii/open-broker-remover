
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/components/Dashboard';
import RequestList from '@/components/RequestList';
import NewRequestForm from '@/components/NewRequestForm';
import EmailSetup from '@/components/EmailSetup';
import SecuritySetup from '@/components/SecuritySetup';
import DataBrokerManager from '@/components/DataBrokerManager';
import DataBrokerFinder from '@/components/DataBrokerFinder';
import WelcomeTutorial from '@/components/WelcomeTutorial';
import { db } from '@/lib/database';
import { emailService } from '@/lib/email';
import { DataRequest, EmailConfig } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
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
  
  //TODO Check for alternatives
  //TODO Mock method...
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateRequest = async (data: any) => {
    setIsContentLoading(true);
    try {
      const newRequest = await db.createRequest({
        brokerName: data.brokerName,
        status: 'pending',
        userEmail: data.userEmail,
      });
      
      setRequests(prevRequests => [...prevRequests, newRequest]);
      handleTabChange("requests");
      
      toast({
        title: "Request created",
        description: `New request for ${data.brokerName} has been created`,
      });
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to create request",
        variant: "destructive",
      });
    } finally {
      setIsContentLoading(false);
    }
  };
  
  //TODO Mock method...
  const handleUpdateRequest = async (id: string, updates: Partial<DataRequest>) => {
    setIsContentLoading(true);
    try {
      const updatedRequest = await db.updateRequest(id, updates);
      
      if (updatedRequest) {
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === id ? updatedRequest : req
          )
        );
        
        toast({
          title: "Request updated",
          description: `Request has been updated to ${updates.status}`,
        });
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    } finally {
      setIsContentLoading(false);
    }
  };
  
  const handleEmailSetup = async (config: EmailConfig) => {
    setIsContentLoading(true);
    try {
      await emailService.configure(config);
      handleTabChange("dashboard");
      
      toast({
        title: "Email configured",
        description: "Your email settings have been saved",
      });
    } catch (error) {
      console.error('Error setting up email:', error);
      toast({
        title: "Error",
        description: "Failed to save email configuration",
        variant: "destructive",
      });
    } finally {
      setIsContentLoading(false);
    }
  };
  
  const handleSecuritySetup = () => {
    handleTabChange("dashboard");
  };
  
  const handleCloseTutorial = () => {
    setShowTutorial(false);
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
        
      case "new-request":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">New Request</h2>
              <p className="text-muted-foreground">
                Create a new data removal request for a data broker
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Create Request</CardTitle>
                <CardDescription>
                  Fill out the form below to generate a new data removal request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewRequestForm onRequestCreated={handleCreateRequest} />
              </CardContent>
            </Card>
          </>
        );
      
      case "find-brokers":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">Find Data Brokers</h2>
              <p className="text-muted-foreground">
                Find data brokers that may have your personal information
              </p>
            </div>
            <DataBrokerFinder />
          </>
        );
        
      case "requests":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">Request Tracking</h2>
              <p className="text-muted-foreground">
                Track and manage your data removal requests
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>All Requests</CardTitle>
                <CardDescription>
                  View and manage the status of all your data removal requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RequestList 
                  requests={requests} 
                  onUpdateRequest={handleUpdateRequest} 
                />
              </CardContent>
            </Card>
          </>
        );
        
      case "data-brokers":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">Data Brokers Management</h2>
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
        
      case "email-settings":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">Email Settings</h2>
              <p className="text-muted-foreground">
                Configure email settings to monitor responses from data brokers
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Enter your email credentials to automatically process broker responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailSetup 
                  onSetupComplete={handleEmailSetup}
                  initialConfig={emailService.getConfig()}
                />
              </CardContent>
            </Card>
          </>
        );
        
      case "security":
        return (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight">Security Settings</h2>
              <p className="text-muted-foreground">
                Configure security and encryption for your sensitive data
              </p>
            </div>
            <SecuritySetup onSetupComplete={handleSecuritySetup} />
          </>
        );
        
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
