
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListPlus, Clock, Mail, Shield, Database, X } from 'lucide-react';

const WelcomeTutorial = ({ onClose }: { onClose: () => void }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [localDialogOpen, setLocalDialogOpen] = useState(true);

  const steps = [
    {
      title: "Welcome to AutoPrivacy",
      description: "Let's get you started with managing your data privacy",
      content: (
        <div className="space-y-4">
          <p>AutoPrivacy helps you take control of your personal data by:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Sending data removal requests to data brokers</li>
            <li>Tracking the status of your removal requests</li>
            <li>Managing your email settings for automatic updates</li>
            <li>Finding data brokers who might have your information</li>
          </ul>
          <p>This guide will help you get familiar with the main features.</p>
        </div>
      )
    },
    {
      title: "Creating a Request",
      description: "How to submit a new data removal request",
      icon: <ListPlus className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>To create a new data removal request:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click on the <span className="font-semibold">New Request</span> tab in the sidebar</li>
            <li>Enter the data broker's name or select from the list</li>
            <li>Enter your email address that will be used for communication</li>
            <li>Click "Submit Request" to generate the removal request</li>
          </ol>
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 text-sm">
            Tip: Using a dedicated email for removal requests makes it easier to track responses.
          </div>
        </div>
      )
    },
    {
      title: "Tracking Requests",
      description: "Monitor the status of your removal requests",
      icon: <Clock className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>To track the status of your submitted requests:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click on the <span className="font-semibold">Request Tracking</span> tab in the sidebar</li>
            <li>View all your requests and their current status</li>
            <li>Update the status when you receive responses from data brokers</li>
            <li>Filter requests by status to focus on specific ones</li>
          </ol>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-blue-800 text-sm">
            Request statuses include: Pending, In Progress, Completed, and Denied
          </div>
        </div>
      )
    },
    {
      title: "Data Brokers",
      description: "Manage the database of data brokers",
      icon: <Database className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>The Data Brokers section allows you to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>View all data brokers in the system</li>
            <li>Add new data brokers with their contact information</li>
            <li>Delete brokers that are no longer relevant</li>
            <li>Find brokers that may have your information based on your email</li>
          </ul>
          <div className="bg-green-50 border border-green-200 p-3 rounded-md text-green-800 text-sm">
            Adding detailed broker information improves the effectiveness of your removal requests.
          </div>
        </div>
      )
    },
    {
      title: "Email & Security Settings",
      description: "Configure your email and security preferences",
      icon: <Shield className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p>To configure your settings:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Use the <span className="font-semibold">Email Settings</span> tab to set up email monitoring</li>
            <li>Configure the <span className="font-semibold">Security</span> tab to protect your sensitive data</li>
            <li>Enable encryption for additional data protection</li>
            <li>All data is stored locally for maximum privacy</li>
          </ul>
          <div className="bg-purple-50 border border-purple-200 p-3 rounded-md text-purple-800 text-sm">
            Your data never leaves your device - AutoPrivacy operates entirely locally.
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleClose = () => {
    setLocalDialogOpen(false);
    localStorage.setItem('tutorial_completed', 'true');
    onClose();
  };

  const currentStep = steps[activeStep];

  return (
    <Dialog open={localDialogOpen} onOpenChange={setLocalDialogOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{currentStep.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>{currentStep.description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStep.content}
        </div>

        <div className="relative mt-2 mb-3">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= activeStep ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => setActiveStep(index)}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext}>
            {activeStep < steps.length - 1 ? 'Next' : 'Get Started'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeTutorial;
