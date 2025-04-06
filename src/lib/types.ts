
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

// New type for data brokers
export interface DataBroker {
  id: string;
  name: string;
  optOutUrl: string;
}

// New types for automation
export interface AutomationConfig {
  headless: boolean;
  timeout: number;
  userAgent?: string;
}

export interface FormField {
  selector: string;
  value: string;
  type: 'text' | 'email' | 'checkbox' | 'radio' | 'select' | 'button';
}

export interface AutomationResult {
  success: boolean;
  message: string;
  screenshot?: string; // Base64 encoded screenshot
  timestamp: string;
}
