
// Types for the application
export interface DataRequest {
  id: string;
  brokerName: string;
  status: 'pending' | 'sent' | 'responded' | 'completed';
  dateCreated: string;
  dateUpdated: string;
  userEmail: string;
  responseContent?: string;
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
