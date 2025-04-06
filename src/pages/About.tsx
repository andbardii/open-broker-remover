import React from 'react';
import FeatureList from '@/components/FeatureList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Lock } from 'lucide-react';

interface AboutProps {
  onTabChange: (tab: string) => void;
}

const About: React.FC<AboutProps> = ({ onTabChange }) => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">About Open Broker Remover</h2>
        <p className="text-muted-foreground">
          A free and open-source solution for managing your personal data on data broker sites
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Open Broker Remover is dedicated to empowering individuals to reclaim their privacy 
              in an increasingly data-driven world. In an age where personal information is 
              constantly collected, bought, and sold, we believe everyone deserves the tools to 
              control their own data.
            </p>
            <p className="text-muted-foreground mt-4">
              Unlike commercial services that charge monthly fees for data removal, Open Broker Remover 
              is completely free and open-source. We believe privacy is a right, not a premium service.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <CardTitle>Privacy-First</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                All data stays on your device. We never collect, store, or share your personal information.
                Our code is open-source and can be audited by anyone.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <CardTitle>Community-Driven</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Developed by privacy advocates and maintained by a community of contributors who
                believe in digital rights and data autonomy.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-purple-500" />
                <CardTitle>Transparent</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Everything we do is transparent. From our code to our data broker database,
                you can see exactly how your data removal requests are handled.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      <FeatureList />
    </>
  );
};

export default About; 