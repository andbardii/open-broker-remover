
// Browser-compatible configuration management
const CONFIG_STORAGE_KEY = 'app_config_encrypted';

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

// Get or create encryption key
async function getOrCreateKey(): Promise<CryptoKey> {
  const storedKeyHex = localStorage.getItem('config_encryption_key');
  
  if (storedKeyHex) {
    const keyData = hexToBuffer(storedKeyHex);
    return window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  // Generate a new key if none exists
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Export and store the key
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  localStorage.setItem('config_encryption_key', bufferToHex(exportedKey));
  
  return key;
}

// Encrypt data using Web Crypto API
async function encrypt(text: string): Promise<string> {
  const key = await getOrCreateKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedText
  );
  
  return bufferToHex(iv) + ':' + bufferToHex(encryptedBuffer);
}

// Decrypt data using Web Crypto API
async function decrypt(encryptedData: string): Promise<string> {
  const [ivHex, dataHex] = encryptedData.split(':');
  const iv = hexToBuffer(ivHex);
  const data = hexToBuffer(dataHex);
  const key = await getOrCreateKey();
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return new TextDecoder().decode(decryptedBuffer);
}

export async function saveConfig(config: Record<string, string>): Promise<void> {
  const data = JSON.stringify(config);
  const encrypted = await encrypt(data);
  localStorage.setItem(CONFIG_STORAGE_KEY, encrypted);
}

export async function loadConfig(): Promise<Record<string, string> | null> {
  const encrypted = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!encrypted) {
    return null;
  }
  
  try {
    const decrypted = await decrypt(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to decrypt configuration:', error);
    return null;
  }
}

export async function updateConfig(updates: Record<string, string>): Promise<void> {
  const config = await loadConfig() || {};
  const updatedConfig = { ...config, ...updates };
  await saveConfig(updatedConfig);
}
