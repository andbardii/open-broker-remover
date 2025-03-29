
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
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  const handleTabChange = (value: string) => {
    onTabChange(value);
    setSidebarOpen(false);
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
              <h2 className="font-semibold text-lg">Navigation</h2>
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
                Dashboard
              </Button>
              <Button 
                variant={activeTab === "new-request" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("new-request")}
              >
                <ListPlus className="mr-2 h-4 w-4" />
                New Request
              </Button>
              <Button 
                variant={activeTab === "requests" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("requests")}
              >
                <Clock className="mr-2 h-4 w-4" />
                Request Tracking
              </Button>
              <Separator className="my-4" />
              <Button 
                variant={activeTab === "email-settings" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("email-settings")}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Settings
              </Button>
              <Button 
                variant={activeTab === "security" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => handleTabChange("security")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Security
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
