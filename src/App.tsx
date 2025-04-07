import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./contexts/LanguageContext";
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Privacy from '@/pages/Privacy';
import Requests from '@/pages/Requests';
import DataBrokerFinder from '@/components/DataBrokerFinder';
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
      case 'privacy':
        return <Privacy onTabChange={setActiveTab} />;
      case 'requests':
        return <Requests onTabChange={setActiveTab} />;
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
