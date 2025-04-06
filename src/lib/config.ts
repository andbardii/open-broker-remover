
// Browser-compatible configuration management
const CONFIG_STORAGE_KEY = 'app_config_encrypted';
const KEY_STORAGE_NAME = 'app_encryption_key';

// Simple encryption/decryption for browser
function generateKey(): Uint8Array {
  const key = new Uint8Array(32);
  window.crypto.getRandomValues(key);
  return key;
}

// Convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to Uint8Array
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Get or create encryption key (using a consistent storage key name)
async function getOrCreateKey(): Promise<CryptoKey> {
  const storedKeyHex = localStorage.getItem(KEY_STORAGE_NAME);
  
  if (storedKeyHex) {
    try {
      const keyData = hexToBuffer(storedKeyHex);
      return window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to import stored key, generating new key:', error);
      // Fall through to generate new key
    }
  }
  
  // Generate a new key if none exists or import failed
  console.log('Generating new encryption key');
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  try {
    // Export and store the key
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    localStorage.setItem(KEY_STORAGE_NAME, bufferToHex(exportedKey));
    console.log('New encryption key stored successfully');
  } catch (error) {
    console.error('Failed to store encryption key:', error);
  }
  
  return key;
}

// Encrypt data using Web Crypto API
async function encrypt(text: string): Promise<string> {
  const key = await getOrCreateKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);
  
  try {
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedText
    );
    
    return bufferToHex(iv) + ':' + bufferToHex(encryptedBuffer);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Decrypt data using Web Crypto API
async function decrypt(encryptedData: string): Promise<string> {
  const [ivHex, dataHex] = encryptedData.split(':');
  
  if (!ivHex || !dataHex) {
    throw new Error('Invalid encrypted data format');
  }
  
  try {
    const iv = hexToBuffer(ivHex);
    const data = hexToBuffer(dataHex);
    const key = await getOrCreateKey();
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

export async function saveConfig(config: Record<string, string>): Promise<void> {
  try {
    const data = JSON.stringify(config);
    const encrypted = await encrypt(data);
    localStorage.setItem(CONFIG_STORAGE_KEY, encrypted);
    console.log('Configuration saved and encrypted');
  } catch (error) {
    console.error('Failed to save configuration:', error);
    throw error;
  }
}

export async function loadConfig(): Promise<Record<string, string> | null> {
  const encrypted = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!encrypted) {
    console.log('No saved configuration found');
    return null;
  }
  
  try {
    const decrypted = await decrypt(encrypted);
    const config = JSON.parse(decrypted);
    console.log('Configuration loaded and decrypted');
    return config;
  } catch (error) {
    console.error('Failed to decrypt configuration:', error);
    return null;
  }
}

export async function updateConfig(updates: Record<string, string>): Promise<void> {
  try {
    const config = await loadConfig() || {};
    const updatedConfig = { ...config, ...updates };
    await saveConfig(updatedConfig);
    console.log('Configuration updated successfully');
  } catch (error) {
    console.error('Failed to update configuration:', error);
    throw error;
  }
}

export async function clearConfig(): Promise<void> {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    console.log('Configuration cleared');
  } catch (error) {
    console.error('Failed to clear configuration:', error);
    throw error;
  }
}

// Export the key storage name for reference
export const KEY_STORAGE_NAME_EXPORT = KEY_STORAGE_NAME;
