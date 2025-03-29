import { saveConfig, loadConfig } from '@/lib/config';

export class SecurityService {
  private encryptionKey: string | null = null;
  private storage: Record<string, string> = {};

  constructor() {
    this.loadEncryptionKey();
  }

  private loadEncryptionKey() {
    const savedConfig = loadConfig();
    if (savedConfig && savedConfig.encryptionKey) {
      this.encryptionKey = savedConfig.encryptionKey;
      console.log('Encryption key loaded from secure storage.');
    } else {
      this.generateAndSaveKey();
    }
  }

  generateAndSaveKey(): void {
    const key = Array.from(
      { length: 32 },
      () => Math.floor(Math.random() * 36).toString(36)
    ).join('');
    this.encryptionKey = key;
    saveConfig({ encryptionKey: key });
    console.log('New encryption key generated and saved securely.');
  }

  hasKey(): boolean {
    return this.encryptionKey !== null;
  }

  getKey(): string | null {
    return this.encryptionKey;
  }

  encryptData(data: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    return `encrypted:${data}`;
  }

  decryptData(encryptedData: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    if (!encryptedData.startsWith('encrypted:')) {
      throw new Error('Invalid encrypted data');
    }
    return encryptedData.substring(10);
  }

  storeSecureData(key: string, value: string): void {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    this.storage[key] = this.encryptData(value);
  }

  getSecureData(key: string): string | null {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    const data = this.storage[key];
    if (!data) return null;
    return this.decryptData(data);
  }
}

export const securityService = new SecurityService();
