import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./contexts/LanguageContext";
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import RequestsPage from '@/pages/RequestsPage';
import DataBrokerFinder from '@/components/DataBrokerFinder';
import NewRequestForm from '@/components/NewRequestForm';
import BrokerListPage from '@/pages/BrokerListPage';
import Settings from '@/pages/Settings';
import { DataRequest } from '@/lib/types';
import { db } from '@/lib/database';
import WelcomeTutorial from '@/components/WelcomeTutorial';
import About from '@/pages/About';

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTutorial, setShowTutorial] = useState(false);
  const [requests, setRequests] = useState<DataRequest[]>([]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard requests={requests} onTabChange={setActiveTab} />;
      case 'find-brokers':
        return <DataBrokerFinder />;
      case 'new-request':
        return <NewRequestForm onRequestCreated={handleRequestCreated} />;
      case 'track-requests':
        return <RequestsPage requests={requests} onUpdateRequest={handleUpdateRequest} />;
      case 'data-brokers':
        return <BrokerListPage />;
      case 'settings':
        return <Settings onTabChange={setActiveTab} />;
      case 'about':
        return <About onTabChange={setActiveTab} />;
      default:
        return <Dashboard requests={requests} onTabChange={setActiveTab} />;
    }
  };

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
