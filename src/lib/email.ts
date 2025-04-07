interface EmailConfig {
  username: string;
  password?: string;
  server?: string;
  port?: number;
  isActive?: boolean;
}

class EmailService {
  private config: EmailConfig | null = null;

  constructor() {
    // Try to load config from localStorage if available
    this.loadConfig();
  }

  private loadConfig(): void {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('emailConfig');
      if (savedConfig) {
        try {
          this.config = JSON.parse(savedConfig);
        } catch (e) {
          console.error('Failed to parse email config:', e);
          this.config = null;
        }
      }
    }
  }

  saveConfig(config: EmailConfig): void {
    this.config = config;
    if (typeof window !== 'undefined') {
      localStorage.setItem('emailConfig', JSON.stringify(config));
    }
  }

  getConfig(): EmailConfig | null {
    return this.config;
  }

  clearConfig(): void {
    this.config = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('emailConfig');
    }
  }

  isConfigured(): boolean {
    return !!this.config && !!this.config.username;
  }

  // In a real app, these methods would connect to an actual email service
  startMonitoring(): boolean {
    if (!this.isConfigured()) return false;
    
    if (this.config) {
      this.config.isActive = true;
      this.saveConfig(this.config);
    }
    
    return true;
  }

  stopMonitoring(): void {
    if (this.config) {
      this.config.isActive = false;
      this.saveConfig(this.config);
    }
  }

  isMonitoring(): boolean {
    return !!this.config?.isActive;
  }
}

export const emailService = new EmailService();
