
import { saveConfig, loadConfig, KEY_STORAGE_NAME_EXPORT } from '@/lib/config';

export class SecurityService {
  private encryptionKey: string | null = null;
  private storage: Record<string, string> = {};
  private ready: boolean = false;
  private loading: Promise<void> | null = null;

  constructor() {
    this.loading = this.loadEncryptionKey();
  }

  private async loadEncryptionKey() {
    try {
      const savedConfig = await loadConfig();
      if (savedConfig && savedConfig.encryptionKey) {
        this.encryptionKey = savedConfig.encryptionKey;
        console.log('Encryption key loaded from secure storage.');
        this.ready = true;
      } else {
        // Try to load from localStorage directly as fallback
        const localKey = localStorage.getItem(KEY_STORAGE_NAME_EXPORT);
        if (localKey) {
          // Save it in our secure format too
          await this.generateAndSaveKey(localKey);
        } else {
          // No key found anywhere
          console.log('No encryption key found. Will generate when needed.');
          this.ready = false;
        }
      }
    } catch (error) {
      console.error('Failed to load encryption key:', error);
      this.ready = false;
    }
  }

  async ensureReady(): Promise<void> {
    if (this.loading) {
      await this.loading;
      this.loading = null;
    }
    
    if (!this.ready) {
      await this.generateAndSaveKey();
    }
  }

  async generateAndSaveKey(existingKey?: string): Promise<void> {
    // If called with existing key, use that
    const key = existingKey || Array.from(
      { length: 32 },
      () => Math.floor(Math.random() * 36).toString(36)
    ).join('');
    
    this.encryptionKey = key;
    await saveConfig({ encryptionKey: key });
    console.log('Encryption key saved securely.');
    this.ready = true;
  }

  hasKey(): boolean {
    return this.encryptionKey !== null;
  }

  getKey(): string | null {
    return this.encryptionKey;
  }

  async encryptData(data: string): Promise<string> {
    await this.ensureReady();
    
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    
    // Simple XOR encryption as an example
    // In a real app, use a proper encryption library
    const encryptedChars = Array.from(data).map((char, i) => {
      const keyChar = this.encryptionKey![i % this.encryptionKey!.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
    });
    
    return `encrypted:${btoa(encryptedChars.join(''))}`;
  }

  async decryptData(encryptedData: string): Promise<string> {
    await this.ensureReady();
    
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    
    if (!encryptedData.startsWith('encrypted:')) {
      throw new Error('Invalid encrypted data');
    }
    
    const encodedData = encryptedData.substring(10);
    const data = atob(encodedData);
    
    // Reverse the XOR encryption
    const decryptedChars = Array.from(data).map((char, i) => {
      const keyChar = this.encryptionKey![i % this.encryptionKey!.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
    });
    
    return decryptedChars.join('');
  }

  async storeSecureData(key: string, value: string): Promise<void> {
    const encryptedValue = await this.encryptData(value);
    this.storage[key] = encryptedValue;
    
    // Also store in localStorage for persistence
    localStorage.setItem(`secure_${key}`, encryptedValue);
  }

  async getSecureData(key: string): Promise<string | null> {
    // Try memory cache first
    let data = this.storage[key];
    
    // If not in memory, try localStorage
    if (!data) {
      data = localStorage.getItem(`secure_${key}`);
      if (!data) return null;
      
      // Add to memory cache
      this.storage[key] = data;
    }
    
    try {
      return await this.decryptData(data);
    } catch (error) {
      console.error(`Error decrypting data for key ${key}:`, error);
      return null;
    }
  }
  
  clearAllSecureData(): void {
    this.storage = {};
    
    // Remove all secure_ prefixed items from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const securityService = new SecurityService();
