// Chiave di configurazione per il localStorage
const CONFIG_STORAGE_KEY = 'app_config_encrypted';

// Generazione sicura della chiave crittografica
function generateKey(): Uint8Array {
  const key = new Uint8Array(32);
  window.crypto.getRandomValues(key);
  return key;
}

// Converti ArrayBuffer in stringa esadecimale
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Converti stringa esadecimale in Uint8Array
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Recupera o genera una chiave crittografica AES-GCM
async function getOrCreateKey(): Promise<CryptoKey> {
  const storedKeyHex = localStorage.getItem('config_encryption_key');
  
  if (storedKeyHex) {
    try {
      const keyData = hexToBuffer(storedKeyHex);
      return await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Errore durante l\'importazione della chiave:', error);
    }
  }
  
  // Genera una nuova chiave
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Esporta e salva la chiave
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  localStorage.setItem('config_encryption_key', bufferToHex(exportedKey));
  console.log('Nuova chiave di configurazione generata e salvata.');
  
  return key;
}

// Crittografa il testo con AES-GCM
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

    // Concatena IV e dati crittografati
    return `${bufferToHex(iv)}:${bufferToHex(encryptedBuffer)}`;
  } catch (error) {
    console.error('Errore durante la crittografia:', error);
    throw new Error('Encryption failed');
  }
}

// Decrittografa il testo con AES-GCM
async function decrypt(encryptedData: string): Promise<string> {
  try {
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
  } catch (error) {
    console.error('Errore durante la decrittazione:', error);
    throw new Error('Decryption failed');
  }
}

// Salva la configurazione crittografata nel localStorage
export async function saveConfig(config: Record<string, string>): Promise<void> {
  try {
    const data = JSON.stringify(config);
    const encrypted = await encrypt(data);
    localStorage.setItem(CONFIG_STORAGE_KEY, encrypted);
    console.log('Configurazione salvata in modo sicuro.');
  } catch (error) {
    console.error('Errore durante il salvataggio della configurazione:', error);
  }
}

// Carica la configurazione crittografata dal localStorage
export async function loadConfig(): Promise<Record<string, string> | null> {
  const encrypted = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!encrypted) {
    return null;
  }

  try {
    const decrypted = await decrypt(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Errore durante il caricamento della configurazione:', error);
    return null;
  }
}

// Aggiorna una configurazione esistente
export async function updateConfig(updates: Record<string, string>): Promise<void> {
  try {
    const config = (await loadConfig()) || {};
    const updatedConfig = { ...config, ...updates };
    await saveConfig(updatedConfig);
    console.log('Configurazione aggiornata con successo.');
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della configurazione:', error);
  }
}
