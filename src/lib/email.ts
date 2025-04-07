interface EmailConfig {
  username: string;
  password?: string;
  server?: string;
  port?: number;
  isActive?: boolean;
}

class EmailService {
  private config: EmailConfig | null = null;
  private readonly STORAGE_KEY = 'emailConfig';

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    if (typeof window !== 'undefined') {
      const savedConfig = sessionStorage.getItem(this.STORAGE_KEY);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          // Only store non-sensitive information in memory
          this.config = {
            username: parsed.username,
            server: parsed.server,
            port: parsed.port,
            isActive: parsed.isActive
          };
        } catch (e) {
          console.error('Failed to parse email config:', e);
          this.config = null;
        }
      }
    }
  }

  saveConfig(config: EmailConfig): void {
    // Store sensitive information in session storage (cleared on browser close)
    if (typeof window !== 'undefined') {
      const sensitiveConfig = {
        ...config,
        password: config.password ? btoa(config.password) : undefined // Basic obfuscation
      };
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sensitiveConfig));
    }
    
    // Only store non-sensitive information in memory
    this.config = {
      username: config.username,
      server: config.server,
      port: config.port,
      isActive: config.isActive
    };
  }

  getConfig(): Omit<EmailConfig, 'password'> | null {
    return this.config;
  }

  clearConfig(): void {
    this.config = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.STORAGE_KEY);
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
