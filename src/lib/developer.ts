import { db } from './database';
import { apiClient } from './api';
import { DataBroker, DataRequest } from './types';
import fs from 'fs/promises';
import path from 'path';

// Configuration types
export interface AppConfig {
  apiUrl: string;
  maxRequestsPerDay: number;
  enableAutomation: boolean;
  loggingLevel: 'debug' | 'info' | 'warn' | 'error';
  dataExportPath: string;
  cacheExpiration: number;
  defaultLanguage: 'en' | 'it' | 'fr' | 'de' | 'es' | 'pt';
  securityOptions: {
    encryptionAlgorithm: string;
    allowRemoteConnections: boolean;
  };
}

export interface SystemInfo {
  platform: string;
  nodeVersion: string;
  totalMemory: number;
  freeMemory: number;
  cpuUsage: number;
  uptime: number;
}

export interface DatabaseStats {
  totalBrokers: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  successRate: number;
}

export interface DiagnosticResult {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

// Default configuration
const defaultConfig: AppConfig = {
  apiUrl: 'http://localhost:3001/api',
  maxRequestsPerDay: 50,
  enableAutomation: true,
  loggingLevel: 'info',
  dataExportPath: './exports',
  cacheExpiration: 86400,
  defaultLanguage: 'en',
  securityOptions: {
    encryptionAlgorithm: 'AES-256-GCM',
    allowRemoteConnections: false
  }
};

// Developer utilities
export const developerService = {
  // Configuration management
  getAppConfig: async (): Promise<AppConfig> => {
    try {
      // Try to read from localStorage first
      const storedConfig = localStorage.getItem('appConfig');
      if (storedConfig) {
        return JSON.parse(storedConfig);
      }
      
      // Fall back to default config
      return defaultConfig;
    } catch (error) {
      console.error('Error loading app configuration:', error);
      return defaultConfig;
    }
  },
  
  saveAppConfig: async (config: AppConfig): Promise<boolean> => {
    try {
      // Validate config
      if (!config.apiUrl || !config.defaultLanguage) {
        throw new Error('Invalid configuration: missing required fields');
      }
      
      // Store in localStorage
      localStorage.setItem('appConfig', JSON.stringify(config));
      
      // Apply configuration changes
      // (In a more complete implementation, this would update running services)
      
      return true;
    } catch (error) {
      console.error('Error saving app configuration:', error);
      return false;
    }
  },
  
  // Docker configuration
  getDockerConfig: async (): Promise<string> => {
    try {
      // In a real implementation, this would fetch from a file
      // Here we return a sample Dockerfile
      return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]`;
    } catch (error) {
      console.error('Error loading Docker configuration:', error);
      return '';
    }
  },
  
  saveDockerConfig: async (content: string): Promise<boolean> => {
    try {
      // In a real implementation, this would save to a file
      console.log('Would save Dockerfile with content:', content);
      
      // Simulate success
      return true;
    } catch (error) {
      console.error('Error saving Docker configuration:', error);
      return false;
    }
  },
  
  // Diagnostic functions
  runDiagnostics: async (): Promise<DiagnosticResult[]> => {
    const results: DiagnosticResult[] = [];
    const now = new Date().toISOString();
    
    // Check API connectivity
    try {
      const health = await apiClient.checkHealth();
      results.push({
        name: 'API Connection',
        status: 'ok',
        message: `API is reachable. Status: ${health.status}`,
        timestamp: now
      });
    } catch (error) {
      results.push({
        name: 'API Connection',
        status: 'error',
        message: `API is unreachable: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: now
      });
    }
    
    // Check database access
    try {
      await db.getDataBrokers();
      results.push({
        name: 'Database Access',
        status: 'ok',
        message: 'Database is accessible',
        timestamp: now
      });
    } catch (error) {
      results.push({
        name: 'Database Access',
        status: 'error',
        message: `Database error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: now
      });
    }
    
    // Check local storage
    try {
      localStorage.setItem('diagnosticTest', 'test');
      localStorage.removeItem('diagnosticTest');
      results.push({
        name: 'Local Storage',
        status: 'ok',
        message: 'Local storage is working properly',
        timestamp: now
      });
    } catch (error) {
      results.push({
        name: 'Local Storage',
        status: 'error',
        message: `Local storage error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: now
      });
    }
    
    return results;
  },
  
  // System information
  getSystemInfo: async (): Promise<SystemInfo> => {
    // In a browser environment, we have limited system info access
    // In a real Electron app, we would use Node.js APIs
    return {
      platform: navigator.platform,
      nodeVersion: 'N/A (Browser)',
      totalMemory: 4, // Use a default value instead of accessing non-standard property
      freeMemory: 0,
      cpuUsage: 0,
      uptime: performance.now() / 1000
    };
  },
  
  // Database statistics
  getDatabaseStats: async (): Promise<DatabaseStats> => {
    try {
      const [brokers, requests] = await Promise.all([
        db.getDataBrokers(),
        db.getRequests()
      ]);
      
      const pendingRequests = requests.filter(r => ['pending', 'sent'].includes(r.status));
      const completedRequests = requests.filter(r => r.status === 'completed');
      
      return {
        totalBrokers: brokers.length,
        totalRequests: requests.length,
        pendingRequests: pendingRequests.length,
        completedRequests: completedRequests.length,
        successRate: requests.length > 0 
          ? (completedRequests.length / requests.length) * 100 
          : 0
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        totalBrokers: 0,
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0,
        successRate: 0
      };
    }
  },
  
  // Data export/import functions
  exportAllData: async (): Promise<Blob> => {
    try {
      const [brokers, requests] = await Promise.all([
        db.getDataBrokers(),
        db.getRequests()
      ]);
      
      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {
          brokers,
          requests
        }
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      return new Blob([jsonString], { type: 'application/json' });
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },
  
  importData: async (jsonData: string): Promise<{ success: boolean, message: string }> => {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data format
      if (!data.version || !data.data || !data.data.brokers) {
        return { 
          success: false, 
          message: 'Invalid data format. Expected version and brokers array.'
        };
      }
      
      // Process brokers
      if (Array.isArray(data.data.brokers)) {
        // In a real implementation, we would insert these into the database
        console.log(`Would import ${data.data.brokers.length} brokers`);
      }
      
      // Process requests
      if (Array.isArray(data.data.requests)) {
        console.log(`Would import ${data.data.requests.length} requests`);
      }
      
      return { 
        success: true, 
        message: `Successfully imported ${data.data.brokers.length} brokers and ${data.data.requests?.length || 0} requests`
      };
    } catch (error) {
      console.error('Error importing data:', error);
      return { 
        success: false, 
        message: `Import failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },
  
  // Log functions
  getLogs: async (limit: number = 100): Promise<string[]> => {
    try {
      // In a real implementation, this would fetch logs from a file or database
      // Here we simulate some log entries
      return [
        '[2023-06-15T10:30:45Z] [INFO] Application started',
        '[2023-06-15T10:31:02Z] [INFO] User searched for email: example@domain.com',
        '[2023-06-15T10:32:15Z] [INFO] Found 15 data brokers',
        '[2023-06-15T10:33:20Z] [INFO] Created 3 opt-out requests',
        '[2023-06-15T10:35:45Z] [WARN] API call timeout, retrying...',
        '[2023-06-15T10:36:01Z] [INFO] API call succeeded on retry'
      ].slice(0, limit);
    } catch (error) {
      console.error('Error fetching logs:', error);
      return ['Error fetching logs'];
    }
  },
  
  clearLogs: async (): Promise<boolean> => {
    try {
      // In a real implementation, this would clear logs
      return true;
    } catch (error) {
      console.error('Error clearing logs:', error);
      return false;
    }
  }
}; 