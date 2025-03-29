import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'config.enc');
const KEY_FILE = path.join(process.cwd(), 'key.enc');

function generateKey(): Buffer {
  return crypto.randomBytes(32);
}

function saveKey(key: Buffer) {
  fs.writeFileSync(KEY_FILE, key);
}

function loadKey(): Buffer {
  if (fs.existsSync(KEY_FILE)) {
    return fs.readFileSync(KEY_FILE);
  }
  const key = generateKey();
  saveKey(key);
  return key;
}

const algorithm = 'aes-256-cbc';
const key = loadKey();

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function saveConfig(config: Record<string, string>) {
  const data = JSON.stringify(config);
  const encrypted = encrypt(data);
  fs.writeFileSync(CONFIG_FILE, encrypted);
}

export function loadConfig(): Record<string, string> | null {
  if (!fs.existsSync(CONFIG_FILE)) {
    return null;
  }
  const encrypted = fs.readFileSync(CONFIG_FILE, 'utf8');
  const decrypted = decrypt(encrypted);
  return JSON.parse(decrypted);
}

export function updateConfig(updates: Record<string, string>) {
  const config = loadConfig() || {};
  const updatedConfig = { ...config, ...updates };
  saveConfig(updatedConfig);
}
