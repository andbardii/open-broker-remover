import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { config } from './config';
import { logger } from './logger';

// Improved filename sanitization with strict validation
function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }
  
  // Only allow alphanumeric, hyphen, underscore, and dot
  const sanitized = filename
    .replace(/[^a-zA-Z0-9\-._]/g, '')
    .replace(/^\.+/, '')
    .replace(/\.+$/, '')
    .substring(0, 255);
    
  if (!sanitized) {
    throw new Error('Invalid filename after sanitization');
  }
  
  return sanitized;
}

class BackupService {
  private backupDir: string;
  private dbPath: string;
  private readonly MAX_BACKUP_SIZE = 1024 * 1024 * 100; // 100MB limit

  constructor() {
    this.backupDir = path.resolve(config.storage.backupDir);
    this.dbPath = path.resolve(path.join(config.storage.dataDir, 'open-broker-remover.db'));
    this.ensureBackupDir();
  }

  private ensureBackupDir(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true, mode: 0o750 });
    }
  }

  private getBackupFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return sanitizeFilename(`backup-${timestamp}.db`);
  }

  private async executeSqliteCommand(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const sqlite = spawn('sqlite3', args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stderr = '';
      
      sqlite.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      sqlite.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`SQLite command failed: ${stderr}`));
        } else {
          resolve();
        }
      });

      sqlite.on('error', (err) => {
        reject(err);
      });
    });
  }

  private async cleanOldBackups(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      const now = Date.now();
      const retentionPeriod = config.database.backup.retentionDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (!file.endsWith('.db')) continue;
        
        const filePath = path.join(this.backupDir, file);
        // Ensure the file is within the backup directory
        if (path.dirname(filePath) !== this.backupDir) {
          logger.warn('Attempted directory traversal', { file });
          continue;
        }

        const stats = await fs.promises.stat(filePath);
        
        // Skip files that are too large
        if (stats.size > this.MAX_BACKUP_SIZE) {
          logger.warn('Backup file exceeds size limit', { file, size: stats.size });
          continue;
        }

        const age = now - stats.mtime.getTime();
        if (age > retentionPeriod) {
          await fs.promises.unlink(filePath);
          logger.info('Deleted old backup file', { file });
        }
      }
    } catch (error) {
      logger.error('Error cleaning old backups', { error });
    }
  }

  public async createBackup(): Promise<void> {
    try {
      if (!fs.existsSync(this.dbPath)) {
        logger.warn('Database file not found, skipping backup');
        return;
      }

      const backupFileName = this.getBackupFileName();
      const backupPath = path.join(this.backupDir, backupFileName);
      
      // Ensure the backup path is within the backup directory
      if (path.dirname(backupPath) !== this.backupDir) {
        throw new Error('Invalid backup path');
      }

      // Use sqlite3 with array arguments to prevent command injection
      await this.executeSqliteCommand([
        this.dbPath,
        `.backup '${backupPath}'`
      ]);
      
      logger.info('Database backup created successfully', { 
        source: this.dbPath,
        destination: backupPath 
      });

      await this.cleanOldBackups();
    } catch (error) {
      logger.error('Error creating database backup', { error });
      throw error;
    }
  }

  public async restoreBackup(backupFile: string): Promise<void> {
    try {
      const sanitizedFile = sanitizeFilename(backupFile);
      const sourcePath = path.join(this.backupDir, sanitizedFile);
      
      // Ensure the source path is within the backup directory
      if (path.dirname(sourcePath) !== this.backupDir) {
        throw new Error('Invalid backup file path');
      }

      // Verify backup file exists and is a .db file
      if (!fs.existsSync(sourcePath) || !sourcePath.endsWith('.db')) {
        throw new Error('Backup file not found or invalid');
      }

      // Check file size
      const stats = await fs.promises.stat(sourcePath);
      if (stats.size > this.MAX_BACKUP_SIZE) {
        throw new Error('Backup file exceeds size limit');
      }

      // Create a temporary backup of current database
      const tempBackup = `${this.dbPath}.temp`;
      if (fs.existsSync(this.dbPath)) {
        await fs.promises.copyFile(this.dbPath, tempBackup);
      }

      try {
        // Restore from backup with array arguments
        await this.executeSqliteCommand([
          this.dbPath,
          `.restore '${sourcePath}'`
        ]);
        
        // Remove temporary backup
        if (fs.existsSync(tempBackup)) {
          await fs.promises.unlink(tempBackup);
        }

        logger.info('Database restored successfully', { 
          source: sourcePath,
          destination: this.dbPath 
        });
      } catch (error) {
        // If restore fails, try to recover from temp backup
        if (fs.existsSync(tempBackup)) {
          await fs.promises.copyFile(tempBackup, this.dbPath);
          await fs.promises.unlink(tempBackup);
          logger.info('Restored original database after failed backup restore');
        }
        throw error;
      }
    } catch (error) {
      logger.error('Error restoring database backup', { error });
      throw error;
    }
  }

  public async listBackups(): Promise<Array<{ file: string, size: number, date: Date }>> {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      const backups = await Promise.all(
        files
          .filter(file => file.endsWith('.db'))
          .map(async file => {
            const filePath = path.join(this.backupDir, file);
            // Ensure the file is within the backup directory
            if (path.dirname(filePath) !== this.backupDir) {
              return null;
            }

            const stats = await fs.promises.stat(filePath);
            
            // Skip files that are too large
            if (stats.size > this.MAX_BACKUP_SIZE) {
              logger.warn('Backup file exceeds size limit', { file, size: stats.size });
              return null;
            }

            return {
              file,
              size: stats.size,
              date: stats.mtime
            };
          })
      );

      return backups
        .filter((backup): backup is NonNullable<typeof backup> => backup !== null)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      logger.error('Error listing backups', { error });
      throw error;
    }
  }
}

export const backupService = new BackupService(); 