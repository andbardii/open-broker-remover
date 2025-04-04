
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  ListPlus, 
  Clock, 
  Mail, 
  Shield, 
  Menu, 
  X,
  Database,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange 
}) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();
  
  const handleTabChange = (value: string) => {
    onTabChange(value);
    setSidebarOpen(false);
  };

  const handleShowHelp = () => {
    localStorage.removeItem('tutorial_completed');
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-10 px-4 flex items-center justify-between">
        <div className="flex items-center">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          )}
          <h1 className="text-xl font-bold">AutoPrivacy</h1>
        </div>
        <div className="flex items-center">
          <LanguageSwitcher />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleShowHelp}
                className="ml-2"
              >
                <HelpCircle size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('show-tutorial')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
      
      <div className="pt-16 flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-white border-r fixed h-full w-64 z-20 transition-transform duration-300",
            isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
          )}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">{t('navigation')}</h2>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X size={18} />
                </Button>
              )}
            </div>
            <nav className="space-y-1">
              <Button 
                variant={activeTab === "dashboard" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("dashboard")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {t('dashboard')}
              </Button>
              <Button 
                variant={activeTab === "new-request" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("new-request")}
              >
                <ListPlus className="mr-2 h-4 w-4" />
                {t('new-request')}
              </Button>
              <Button 
                variant={activeTab === "requests" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("requests")}
              >
                <Clock className="mr-2 h-4 w-4" />
                {t('request-tracking')}
              </Button>
              <Button 
                variant={activeTab === "data-brokers" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("data-brokers")}
              >
                <Database className="mr-2 h-4 w-4" />
                {t('data-brokers')}
              </Button>
              <Separator className="my-4" />
              <Button 
                variant={activeTab === "email-settings" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("email-settings")}
              >
                <Mail className="mr-2 h-4 w-4" />
                {t('email-settings')}
              </Button>
              <Button 
                variant={activeTab === "security" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("security")}
              >
                <Shield className="mr-2 h-4 w-4" />
                {t('security')}
              </Button>
            </nav>
          </div>
        </aside>
        
        {/* Main content */}
        <main className={cn(
          "flex-1 p-6 transition-all duration-300",
          isMobile ? "ml-0" : "ml-64"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
