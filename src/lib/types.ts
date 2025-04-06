// Types for the application
export interface DataRequest {
  id: string;
  brokerName: string;
  status: 'pending' | 'sent' | 'responded' | 'completed';
  dateCreated: string;
  dateUpdated: string;
  userEmail: string;
  responseContent?: string;
  metadata?: string;
}

export interface EmailConfig {
  username: string;
  password: string;
  server: string;
  port: number;
  ssl: boolean;
}

export interface SecurityConfig {
  encryptionEnabled: boolean;
  keyGenerated: boolean;
}

// Enhanced DataBroker interface with additional information
export interface DataBroker {
  id: string;
  name: string;
  optOutUrl: string;
  category: BrokerCategory;
  optOutMethod: 'form' | 'email' | 'api' | 'manual';
  dataTypes: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  responseTime?: string;
  region?: string[];
  privacyLawReference?: string[];
  isPremium?: boolean;
  hasUserData?: boolean; // Indicates if this broker likely has the user's data
  matchScore?: number; // Score indicating how likely the broker has the user's data (0-100)
}

// Categories of data brokers
export type BrokerCategory = 
  'people-search' | 
  'credit-reporting' | 
  'marketing' | 
  'background-check' |
  'social-media' |
  'advertising' |
  'risk-management' |
  'insurance' |
  'financial' |
  'personal-data' |
  'other';

// New types for automation
export interface AutomationConfig {
  headless: boolean;
  timeout: number;
  userAgent?: string;
}

export interface FormField {
  selector: string;
  value: string;
  type: 'text' | 'email' | 'checkbox' | 'radio' | 'select' | 'button' | 'textarea' | 'password' | 'tel' | 'date' | 'number';
  label?: string;
  options?: string[];
}

export interface AutomationResult {
  success: boolean;
  message: string;
  screenshot?: string; // Base64 encoded screenshot
  timestamp: string;
}

// Search history for tracking preferences
export interface SearchHistory {
  email: string;
  timestamp: string;
  foundBrokers: number;
  requestsMade: number;
}

// Progress tracking
export interface RemovalProgress {
  steps: RemovalStep[];
  startedAt: string;
  lastUpdated: string;
  estimatedCompletionDate?: string;
  completedAt?: string;
  currentStep: number;
}

export interface RemovalStep {
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startTime?: string;
  completionTime?: string;
  notes?: string;
}
