import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from './config';
import { logger } from './logger';

const execAsync = promisify(exec);

class BackupService {
  private backupDir: string;
  private dbPath: string;

  constructor() {
    this.backupDir = config.storage.backupDir;
    this.dbPath = path.join(config.storage.dataDir, 'open-broker-remover.db');
    this.ensureBackupDir();
  }

  private ensureBackupDir(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private getBackupFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `backup-${timestamp}.db`;
  }

  private async cleanOldBackups(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      const now = Date.now();
      const retentionPeriod = config.database.backup.retentionDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.promises.stat(filePath);
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
      // Check if database exists
      if (!fs.existsSync(this.dbPath)) {
        logger.warn('Database file not found, skipping backup');
        return;
      }

      const backupFile = path.join(this.backupDir, this.getBackupFileName());
      
      // Use sqlite3 .backup command for atomic backup
      await execAsync(`sqlite3 "${this.dbPath}" ".backup '${backupFile}'"`);
      
      logger.info('Database backup created successfully', { 
        source: this.dbPath,
        destination: backupFile 
      });

      // Clean old backups
      await this.cleanOldBackups();
    } catch (error) {
      logger.error('Error creating database backup', { error });
      throw error;
    }
  }

  public async restoreBackup(backupFile: string): Promise<void> {
    try {
      const sourcePath = path.join(this.backupDir, backupFile);
      
      // Verify backup file exists
      if (!fs.existsSync(sourcePath)) {
        throw new Error('Backup file not found');
      }

      // Create a temporary backup of current database
      const tempBackup = `${this.dbPath}.temp`;
      if (fs.existsSync(this.dbPath)) {
        await fs.promises.copyFile(this.dbPath, tempBackup);
      }

      try {
        // Restore from backup
        await execAsync(`sqlite3 "${this.dbPath}" ".restore '${sourcePath}'"`);
        
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
            const stats = await fs.promises.stat(filePath);
            return {
              file,
              size: stats.size,
              date: stats.mtime
            };
          })
      );

      return backups.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      logger.error('Error listing backups', { error });
      throw error;
    }
  }
}

export const backupService = new BackupService(); 