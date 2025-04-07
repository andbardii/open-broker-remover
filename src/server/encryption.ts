import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Define paths
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const KEY_FILE_PATH = path.join(DATA_DIR, '.encryption_key');
const KEY_FILE_TEST_PATH = path.join(DATA_DIR, '.key_test');

// Promisify fs functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

/**
 * Encryption Service
 * Handles generating, storing and using encryption keys
 */
class EncryptionService {
  private encryptionKey: Buffer | null = null;
  private initialized = false;
  private algorithm = 'aes-256-gcm';

  /**
   * Initialize the encryption service
   * Will attempt to load an existing key or generate a new one if needed
   */
  async initialize(): Promise<void> {
    try {
      // Check if key file already exists
      try {
        await access(KEY_FILE_PATH, fs.constants.R_OK);
        // Load existing key
        await this.loadExistingKey();
      } catch (err) {
        // Key file doesn't exist, generate a new one
        await this.generateNewKey();
      }

      this.initialized = true;
      console.log('Encryption service initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize encryption service:', error);
      throw new Error('Encryption service initialization failed');
    }
  }

  /**
   * Load an existing encryption key from storage
   */
  private async loadExistingKey(): Promise<void> {
    try {
      const keyData = await readFile(KEY_FILE_PATH);
      this.encryptionKey = keyData;
      
      // Verify the key works by reading test file if it exists
      try {
        await access(KEY_FILE_TEST_PATH, fs.constants.R_OK);
        const testData = await readFile(KEY_FILE_TEST_PATH);
        
        try {
          // Try to decrypt the test file to validate the key
          const [iv, authTag, encryptedData] = testData.toString().split(':');
          const decipher = crypto.createDecipheriv(
            this.algorithm,
            this.encryptionKey,
            Buffer.from(iv, 'hex')
          ) as crypto.DecipherGCM;
          
          decipher.setAuthTag(Buffer.from(authTag, 'hex'));
          const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedData, 'hex')),
            decipher.final()
          ]);
          
          const testString = decrypted.toString();
          if (testString !== 'Encryption test successful') {
            throw new Error('Key validation failed - test decryption failed');
          }
        } catch (error) {
          console.error('Invalid encryption key detected:', error);
          console.log('Generating new key due to validation failure');
          await this.generateNewKey();
        }
      } catch (err) {
        // No test file exists yet, create one
        await this.createKeyTestFile();
      }
      
      console.log('Encryption key loaded successfully');
    } catch (error) {
      console.error('Failed to load encryption key:', error);
      throw error;
    }
  }

  /**
   * Generate a new encryption key and save it
   */
  private async generateNewKey(): Promise<void> {
    try {
      // Generate a secure random 256-bit key
      this.encryptionKey = crypto.randomBytes(32);
      
      // Create data directory if it doesn't exist
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      
      // Save the key with tight permissions
      await writeFile(KEY_FILE_PATH, this.encryptionKey, { mode: 0o600 });
      
      // Create a test file to validate the key in the future
      await this.createKeyTestFile();
      
      console.log('New encryption key generated and saved successfully');
    } catch (error) {
      console.error('Failed to generate or save encryption key:', error);
      throw error;
    }
  }

  /**
   * Create a test file to validate the encryption key
   */
  private async createKeyTestFile(): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('Cannot create test file: No encryption key available');
    }

    try {
      const testData = 'Encryption test successful';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        this.algorithm, 
        this.encryptionKey, 
        iv
      ) as crypto.CipherGCM;
      
      const encrypted = Buffer.concat([
        cipher.update(testData, 'utf8'),
        cipher.final()
      ]);
      
      const authTag = cipher.getAuthTag();
      
      // Store as iv:authTag:encryptedData
      const encodedData = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
      
      await writeFile(KEY_FILE_TEST_PATH, encodedData, { mode: 0o600 });
    } catch (error) {
      console.error('Failed to create key test file:', error);
      throw error;
    }
  }

  /**
   * Ensure the service is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }
  }

  /**
   * Encrypt data
   */
  async encrypt(data: string | object): Promise<string> {
    await this.ensureInitialized();
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(
      this.algorithm, 
      this.encryptionKey!, 
      iv
    ) as crypto.CipherGCM;
    
    const encrypted = Buffer.concat([
      cipher.update(dataString, 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Decrypt data
   */
  async decrypt(encryptedData: string): Promise<string> {
    await this.ensureInitialized();
    
    const [iv, authTag, data] = encryptedData.split(':');
    
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey!,
      Buffer.from(iv, 'hex')
    ) as crypto.DecipherGCM;
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data, 'hex')),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  }

  /**
   * Check if data is encrypted
   */
  isEncrypted(data: string): boolean {
    // Check if the data matches our format
    return /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/.test(data);
  }

  /**
   * Check if encryption key exists
   */
  async keyExists(): Promise<boolean> {
    try {
      await access(KEY_FILE_PATH, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reset the encryption service state
   */
  async reset(): Promise<void> {
    this.encryptionKey = null;
    this.initialized = false;
    
    // Delete key files if they exist
    try {
      if (await this.keyExists()) {
        await fs.promises.unlink(KEY_FILE_PATH);
      }
      if (fs.existsSync(KEY_FILE_TEST_PATH)) {
        await fs.promises.unlink(KEY_FILE_TEST_PATH);
      }
    } catch (error) {
      console.error('Error deleting encryption files:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const encryptionService = new EncryptionService(); 