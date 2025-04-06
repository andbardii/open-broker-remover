import React from 'react';
import { Check, Shield, RotateCcw, BarChart3, Scale, FileText, User, Lock, Users, DollarSign, BarChart, Globe, RefreshCcw, MousePointer, BookOpen, HelpCircle, Zap, Smartphone, Handshake } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  implemented: boolean;
  isPremium?: boolean;
}

export const FeatureList: React.FC = () => {
  const features: Feature[] = [
    {
      title: "Automated Data Removal Requests",
      description: "Automatically send removal requests to data brokers and people search sites",
      icon: <Check className="h-5 w-5 text-green-500" />,
      implemented: true
    },
    {
      title: "Comprehensive Data Broker Coverage",
      description: "Support for a wide range of data brokers including marketing, recruitment, and risk mitigation brokers",
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      implemented: true
    },
    {
      title: "Continuous Monitoring and Re-requests",
      description: "Regularly monitor data brokers and resend removal requests to ensure data is deleted",
      icon: <RotateCcw className="h-5 w-5 text-indigo-500" />,
      implemented: true
    },
    {
      title: "User-Friendly Dashboard",
      description: "Clear and intuitive interface to track the progress of data removal requests",
      icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
      implemented: true
    },
    {
      title: "Compliance with Privacy Laws",
      description: "Operate in accordance with regulations like GDPR and CCPA for legal compliance",
      icon: <Scale className="h-5 w-5 text-gray-500" />,
      implemented: true
    },
    {
      title: "Detailed Progress Reports",
      description: "Regular updates and reports on the status of data removal efforts",
      icon: <FileText className="h-5 w-5 text-yellow-500" />,
      implemented: true
    },
    {
      title: "Support for Multiple Personal Data Points",
      description: "Handle various personal information such as names, addresses, phone numbers, and emails",
      icon: <User className="h-5 w-5 text-red-500" />,
      implemented: true
    },
    {
      title: "Secure Data Handling",
      description: "All user data is processed securely and confidentially",
      icon: <Lock className="h-5 w-5 text-green-500" />,
      implemented: true
    },
    {
      title: "Family Plan Options",
      description: "Subscription plans that cover multiple family members or friends",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      implemented: false,
      isPremium: true
    },
    {
      title: "Affordable Pricing",
      description: "Cost-effective subscription options with good value for the services offered",
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      implemented: true
    },
    {
      title: "Transparent Reporting",
      description: "Clear communication of which data brokers have been contacted and the outcomes",
      icon: <BarChart className="h-5 w-5 text-indigo-500" />,
      implemented: true
    },
    {
      title: "Legal Authority Delegation",
      description: "Grant the service power of attorney to act on your behalf for data removal",
      icon: <Scale className="h-5 w-5 text-gray-500" />,
      implemented: false,
      isPremium: true
    },
    {
      title: "Coverage of Public and Private Databases",
      description: "Remove data from both publicly accessible sites and private data broker databases",
      icon: <Globe className="h-5 w-5 text-purple-500" />,
      implemented: true
    },
    {
      title: "Regular Service Updates",
      description: "Continuously update the list of data brokers and adapt to new privacy challenges",
      icon: <RefreshCcw className="h-5 w-5 text-blue-500" />,
      implemented: true
    },
    {
      title: "Minimal User Effort Required",
      description: "As hands-off as possible, requiring little user intervention after setup",
      icon: <MousePointer className="h-5 w-5 text-yellow-500" />,
      implemented: true
    },
    {
      title: "Educational Resources",
      description: "Information on data privacy and steps you can take to protect yourself",
      icon: <BookOpen className="h-5 w-5 text-green-500" />,
      implemented: true
    },
    {
      title: "Customer Support Availability",
      description: "Accessible support channels for user inquiries and assistance",
      icon: <HelpCircle className="h-5 w-5 text-red-500" />,
      implemented: false
    },
    {
      title: "Scalability",
      description: "Handle a growing number of data brokers and increased user demand",
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      implemented: true
    },
    {
      title: "Cross-Platform Accessibility",
      description: "Access the service on various devices and operating systems",
      icon: <Smartphone className="h-5 w-5 text-purple-500" />,
      implemented: true
    },
    {
      title: "Privacy-Focused Partnerships",
      description: "Collaborations with reputable privacy and security organizations",
      icon: <Handshake className="h-5 w-5 text-blue-500" />,
      implemented: false,
      isPremium: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Features Overview</h2>
        <p className="text-muted-foreground mt-2">
          This application provides a comprehensive suite of privacy protection tools
        </p>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className={feature.implemented ? "" : "opacity-60"}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <div>
                  {feature.implemented ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">Implemented</Badge>
                  ) : (
                    <Badge variant="outline">Coming Soon</Badge>
                  )}
                  
                  {feature.isPremium && (
                    <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-200">Premium</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeatureList; 