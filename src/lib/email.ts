
import { EmailConfig } from './types';

// Mock implementation of the email service
// In a real implementation, this would use a proper email library

export class EmailService {
  private config: EmailConfig | null = null;

  configure(config: EmailConfig): void {
    this.config = config;
    console.log('Email service configured:', config);
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  getConfig(): EmailConfig | null {
    return this.config;
  }

  // Mock method to fetch emails
  async fetchEmails(): Promise<Array<{ id: string; subject: string; sender: string; content: string; date: string }>> {
    if (!this.config) {
      throw new Error("Email service not configured");
    }
    
    // In a real implementation, this would connect to the email server and fetch emails
    return [
      {
        id: '1',
        subject: 'Re: Data Removal Request',
        sender: 'privacy@datacorp.com',
        content: 'We have received your request to remove your data. We will process it within 30 days.',
        date: new Date().toISOString()
      },
      {
        id: '2',
        subject: 'Re: Privacy Request #123456',
        sender: 'support@infotrack.com',
        content: 'Your privacy request has been processed. Your data has been removed from our systems.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}

export const emailService = new EmailService();
