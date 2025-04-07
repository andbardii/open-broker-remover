import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PrivacyScanProps {
  onTabChange: (tab: string) => void;
}

const PrivacyScan: React.FC<PrivacyScanProps> = ({ onTabChange }) => {
  const { t } = useLanguage();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    completed: boolean;
    dataLeaks: number;
    exposedInfo: string[];
    brokerMatches: number;
    riskScore: number;
  } | null>(null);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    setResults(null);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setScanning(false);
          setProgress(100);
          // Mock scan results
          setResults({
            completed: true,
            dataLeaks: Math.floor(Math.random() * 6) + 1,
            exposedInfo: ['Email address', 'Phone number', 'Home address'],
            brokerMatches: Math.floor(Math.random() * 10) + 5,
            riskScore: Math.floor(Math.random() * 70) + 30
          });
          return 100;
        }
        return newProgress;
      });
    }, 600);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t('privacy-scan')}</h2>
        <p className="text-muted-foreground">
          {t('scan-description')}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-500" />
            {t('privacy-scan-tool')}
          </CardTitle>
          <CardDescription>
            {t('privacy-scan-description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scanning ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('scanning')}...</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{t('scan-in-progress-message')}</p>
            </div>
          ) : results ? (
            <div className="space-y-6">
              <Alert variant={results.riskScore > 50 ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('privacy-risk-score')}: {results.riskScore}/100</AlertTitle>
                <AlertDescription>
                  {results.riskScore > 70 
                    ? t('high-risk-description') 
                    : results.riskScore > 40 
                      ? t('medium-risk-description')
                      : t('low-risk-description')}
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                      {t('data-leaks')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{results.dataLeaks}</p>
                    <p className="text-sm text-muted-foreground">{t('detected-data-leaks')}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg flex items-center">
                      <Lock className="mr-2 h-4 w-4 text-red-500" />
                      {t('exposed-information')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {results.exposedInfo.map((info, i) => (
                        <li key={i}>{info}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      {t('data-broker-matches')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{results.brokerMatches}</p>
                    <p className="text-sm text-muted-foreground">{t('broker-matches-found')}</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-between gap-4">
                <Button onClick={() => onTabChange('find-brokers')} className="flex-1">
                  {t('find-data-brokers')}
                </Button>
                <Button onClick={startScan} variant="outline" className="flex-1">
                  {t('scan-again')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p>{t('privacy-scan-info')}</p>
              <Button onClick={startScan} className="w-full">
                {t('start-scan')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PrivacyScan; 