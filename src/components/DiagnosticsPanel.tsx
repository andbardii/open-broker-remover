import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { DiagnosticResult, SystemInfo, DatabaseStats, developerService } from '@/lib/developer';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertTriangle, CheckCircle, Terminal, Database, Server, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const DiagnosticsPanel: React.FC = () => {
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    // Load system info and database stats on component mount
    loadSystemInfo();
    loadDatabaseStats();
    loadLogs();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const info = await developerService.getSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error('Error loading system info:', error);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const stats = await developerService.getDatabaseStats();
      setDatabaseStats(stats);
    } catch (error) {
      console.error('Error loading database stats:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const logEntries = await developerService.getLogs(20); // Get last 20 log entries
      setLogs(logEntries);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const results = await developerService.runDiagnostics();
      setDiagnosticResults(results);
      
      // Refresh other data as well
      await Promise.all([
        loadSystemInfo(),
        loadDatabaseStats(),
        loadLogs()
      ]);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const clearLogs = async () => {
    try {
      await developerService.clearLogs();
      setLogs([]);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  // Helper to render diagnostic status icon
  const renderStatusIcon = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t('system-diagnostics')}</h3>
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunningDiagnostics}
          variant="outline"
        >
          <Terminal className="mr-2 h-4 w-4" />
          {t('run-diagnostics')}
        </Button>
      </div>

      {/* Diagnostic Results */}
      {diagnosticResults.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('diagnostic-results')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {diagnosticResults.map((result, index) => (
                <Alert key={index} variant={result.status === 'ok' ? 'default' : 'destructive'}>
                  <div className="flex items-center">
                    {renderStatusIcon(result.status)}
                    <AlertTitle className="ml-2">{result.name}</AlertTitle>
                  </div>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('system-info')}</CardTitle>
        </CardHeader>
        <CardContent>
          {systemInfo ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Platform</p>
                <p className="text-sm text-muted-foreground">{systemInfo.platform}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Node Version</p>
                <p className="text-sm text-muted-foreground">{systemInfo.nodeVersion}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Memory</p>
                <p className="text-sm text-muted-foreground">{systemInfo.totalMemory} GB</p>
              </div>
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-sm text-muted-foreground">
                  {Math.floor(systemInfo.uptime / 3600)} hours, {Math.floor((systemInfo.uptime % 3600) / 60)} minutes
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading system information...</p>
          )}
        </CardContent>
      </Card>

      {/* Database Statistics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('database-stats')}</CardTitle>
        </CardHeader>
        <CardContent>
          {databaseStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">{t('total-brokers')}</p>
                  <p className="text-2xl font-bold">{databaseStats.totalBrokers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('total-requests')}</p>
                  <p className="text-2xl font-bold">{databaseStats.totalRequests}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('pending-requests')}</p>
                  <p className="text-2xl font-bold">{databaseStats.pendingRequests}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('completed-requests')}</p>
                  <p className="text-2xl font-bold">{databaseStats.completedRequests}</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">{t('success-rate')}</p>
                  <p className="text-sm font-medium">{databaseStats.successRate.toFixed(1)}%</p>
                </div>
                <Progress value={databaseStats.successRate} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading database statistics...</p>
          )}
        </CardContent>
      </Card>

      {/* Application Logs */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('logs')}</CardTitle>
            <CardDescription>
              Most recent application logs
            </CardDescription>
          </div>
          <Button 
            onClick={clearLogs} 
            variant="outline" 
            size="sm"
          >
            {t('clear-logs')}
          </Button>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="relative max-h-64 overflow-auto">
              <Table>
                <TableBody>
                  {logs.map((log, index) => {
                    const isError = log.includes('[ERROR]');
                    const isWarning = log.includes('[WARN]');
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">
                          <pre className={`${isError ? 'text-red-500' : isWarning ? 'text-amber-500' : ''}`}>
                            {log}
                          </pre>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No logs available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosticsPanel; 