import { EmailConfig } from './types';
import { saveConfig, loadConfig, updateConfig } from '@/lib/config';

export class EmailService {
  private config: EmailConfig | null = null;

  constructor() {
    this.loadConfiguration();
  }

  private loadConfiguration() {
    const savedConfig = loadConfig();
    if (savedConfig) {
      // Convertiamo i valori da stringa ai tipi originali
      this.config = {
        username: savedConfig.username,
        password: savedConfig.password,
        server: savedConfig.server,
        port: parseInt(savedConfig.port, 10),
        ssl: savedConfig.ssl === 'true',
      } as EmailConfig;
      console.log('Loaded email configuration from encrypted file.');
    }
  }

  configure(config: EmailConfig): void {
    this.config = config;
    // Convertiamo i valori in stringa per il salvataggio
    const configToSave = {
      username: config.username,
      password: config.password,
      server: config.server,
      port: config.port.toString(),
      ssl: config.ssl.toString(),
    };
    saveConfig(configToSave);
    console.log('Email service configured and saved securely.');
  }

  updateEmailConfig(updates: Partial<EmailConfig>): void {
    if (!this.config) {
      console.warn('No existing configuration to update.');
      return;
    }
    // Aggiorniamo solo i campi forniti
    const updatedConfig = { ...this.config, ...updates };
    this.config = updatedConfig;
    const configToSave = {
      username: updatedConfig.username,
      password: updatedConfig.password,
      server: updatedConfig.server,
      port: updatedConfig.port.toString(),
      ssl: updatedConfig.ssl.toString(),
    };
    updateConfig(configToSave);
    console.log('Email configuration updated successfully.');
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  getConfig(): EmailConfig | null {
    return this.config;
  }

  async fetchEmails(): Promise<Array<{ id: string; subject: string; sender: string; content: string; date: string }>> {
    if (!this.config) {
      throw new Error('Email service not configured');
    }

    return [
      {
        id: '1',
        subject: 'Re: Data Removal Request',
        sender: 'privacy@datacorp.com',
        content: 'We have received your request to remove your data.',
        date: new Date().toISOString(),
      },
    ];
  }
}

export const emailService = new EmailService();