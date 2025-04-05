import { saveConfig, loadConfig } from '@/lib/config';

export class SecurityService {
  private encryptionKey: CryptoKey | null = null;

  constructor() {
    this.loadEncryptionKey();
  }

  private async loadEncryptionKey() {
    try {
      const savedConfig = await loadConfig();
      if (savedConfig && savedConfig.encryptionKey) {
        try {
          // Decodifica la chiave da stringa hex a Uint8Array
          const keyBuffer = hexToBuffer(savedConfig.encryptionKey);
  
          // Importa la chiave come CryptoKey
          const importedKey = await window.crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
          );
  
          this.encryptionKey = importedKey;
          console.log('Encryption key successfully loaded and imported.');
        } catch (parseError) {
          console.error('Invalid encryption key format:', parseError);
          await this.generateAndSaveKey();  // Rigenera la chiave se corrotta
        }
      } else {
        await this.generateAndSaveKey();  // Genera una nuova chiave se non esiste
      }
    } catch (error) {
      console.error('Failed to load encryption key:', error);
    }
  }
  
    
  // Genera e salva una nuova chiave crittografica sicura
  async generateAndSaveKey(): Promise<void> {
    try {
      // Genera una chiave AES-GCM a 256 bit (32 byte)
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
  
      // Esporta la chiave come ArrayBuffer
      const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  
      // Converti l'ArrayBuffer in una stringa hex
      const keyHex = bufferToHex(exportedKey);
      this.encryptionKey = key;
  
      // Salva la chiave nel config
      await saveConfig({ encryptionKey: keyHex });
      console.log('New encryption key generated and saved securely.');
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
    }
  }
    
  // Verifica se la chiave è presente
  hasKey(): boolean {
    return this.encryptionKey !== null;
  }

  // Restituisce la chiave crittografica (se disponibile)
  getKey(): CryptoKey | null {
    return this.encryptionKey;
  }

  // Crittografa i dati utilizzando AES-GCM
  async encryptData(data: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }

    const iv = crypto.getRandomValues(new Uint8Array(12)); // Genera IV casuale
    const encoded = new TextEncoder().encode(data);

    try {
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        this.encryptionKey,
        encoded
      );

      // Concatena IV e dati crittografati
      const buffer = new Uint8Array(iv.length + encrypted.byteLength);
      buffer.set(iv);
      buffer.set(new Uint8Array(encrypted), iv.length);
      return btoa(String.fromCharCode(...buffer));
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  // Decrittografa i dati utilizzando AES-GCM
  async decryptData(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }

    try {
      const buffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const iv = buffer.slice(0, 12); // Estrai IV
      const data = buffer.slice(12);  // Estrai dati crittografati

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        this.encryptionKey,
        data
      );
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  // Esporta la chiave in formato JWK per il salvataggio
  private async exportKey(key: CryptoKey): Promise<JsonWebKey> {
    return await crypto.subtle.exportKey('jwk', key);
  }

}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const securityService = new SecurityService();



