import { z } from 'zod';
import path from 'path';

// Environment variable validation schema
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  
  // Data storage
  DATA_DIR: z.string().default(path.join(process.cwd(), 'data')),
  LOG_DIR: z.string().default(path.join(process.cwd(), 'logs')),
  BACKUP_DIR: z.string().default(path.join(process.cwd(), 'backups')),
  
  // Security
  ENCRYPTION_KEY_FILE: z.string().default('.encryption_key'),
  MAX_REQUEST_SIZE: z.string().default('100kb'), // Accept string value like "100kb" for express json limit
  RATE_LIMIT_WINDOW: z.string().transform(Number).pipe(z.number().min(1000)).default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().min(1)).default('100'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'text']).default('json'),
  LOG_ROTATION_SIZE: z.string().default('10M'),
  LOG_RETENTION_DAYS: z.string().transform(Number).pipe(z.number().min(1)).default('30'),
  
  // Database
  DB_BACKUP_ENABLED: z.string().transform(val => val === 'true').default('true'),
  DB_BACKUP_INTERVAL: z.string().transform(Number).pipe(z.number().min(3600)).default('86400'), // 24 hours
  DB_BACKUP_RETENTION: z.string().transform(Number).pipe(z.number().min(1)).default('7'), // 7 days
});

// Process environment variables
const env = envSchema.parse(process.env);

// Export typed config object
export const config = {
  server: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  storage: {
    dataDir: env.DATA_DIR,
    logDir: env.LOG_DIR,
    backupDir: env.BACKUP_DIR,
  },
  security: {
    encryptionKeyFile: path.join(env.DATA_DIR, env.ENCRYPTION_KEY_FILE),
    maxRequestSize: env.MAX_REQUEST_SIZE,
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW,
      max: env.RATE_LIMIT_MAX,
    },
  },
  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
    rotation: {
      size: env.LOG_ROTATION_SIZE,
      retentionDays: env.LOG_RETENTION_DAYS,
    },
  },
  database: {
    backup: {
      enabled: env.DB_BACKUP_ENABLED,
      intervalSeconds: env.DB_BACKUP_INTERVAL,
      retentionDays: env.DB_BACKUP_RETENTION,
    },
  },
} as const;

// Type for the config object
export type Config = typeof config; 