import { saveConfig, loadConfig } from '@/lib/config';

export class SecurityService {
  private encryptionKey: CryptoKey | null = null;

  constructor() {
    this.loadEncryptionKey();
  }

  // Carica la chiave crittografica al momento dell'istanziazione
  private async loadEncryptionKey() {
    try {
      const savedConfig = await loadConfig();
      if (savedConfig && savedConfig.encryptionKey) {
        // Converte la chiave da stringa a oggetto JsonWebKey
        const parsedKey = JSON.parse(savedConfig.encryptionKey) as JsonWebKey;
        this.encryptionKey = await this.importKey(parsedKey);
        console.log('Encryption key loaded from secure storage.');
      } else {
        await this.generateAndSaveKey();
      }
    } catch (error) {
      console.error('Failed to load encryption key:', error);
    }
  }
  
  // Genera e salva una nuova chiave crittografica sicura
  async generateAndSaveKey(): Promise<void> {
    try {
      this.encryptionKey = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );
      // Esporta la chiave e la converte in una stringa JSON
      const exportedKey = await this.exportKey(this.encryptionKey);
      await saveConfig({ encryptionKey: JSON.stringify(exportedKey) });
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


  // Importa una chiave da formato JWK
  private async importKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }
}

export const securityService = new SecurityService();
