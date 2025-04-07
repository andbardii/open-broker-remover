import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { config } from './config';
import { logger } from './logger';
import crypto from 'crypto';

// Improved filename sanitization with strict validation and hash generation
function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }
  
  // Generate a hash of the original filename to ensure uniqueness and safety
  const hash = crypto.createHash('sha256').update(filename).digest('hex').substring(0, 8);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Create a safe filename with timestamp and hash
  const safeFilename = `backup-${timestamp}-${hash}.db`;
  
  // Validate the generated filename
  if (!/^[a-zA-Z0-9\-._]+$/.test(safeFilename)) {
    throw new Error('Invalid filename after sanitization');
  }
  
  return safeFilename;
}

// Validate path is within allowed directory
function validatePath(targetPath: string, allowedDir: string): boolean {
  const normalizedTarget = path.normalize(targetPath);
  const normalizedAllowed = path.normalize(allowedDir);
  const resolvedTarget = path.resolve(normalizedTarget);
  const resolvedAllowed = path.resolve(normalizedAllowed);
  
  return resolvedTarget.startsWith(resolvedAllowed);
}

class BackupService {
  private backupDir: string;
  private dbPath: string;
  private readonly MAX_BACKUP_SIZE = 1024 * 1024 * 100; // 100MB limit
  private readonly MAX_BACKUPS = 10; // Maximum number of backup files

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

  private async executeSqliteCommand(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      // Validate all arguments
      if (!Array.isArray(args) || args.some(arg => typeof arg !== 'string')) {
        reject(new Error('Invalid command arguments'));
        return;
      }

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

      // Set timeout for the command
      const timeout = setTimeout(() => {
        sqlite.kill();
        reject(new Error('Command execution timeout'));
      }, 30000); // 30 seconds timeout

      sqlite.on('exit', () => {
        clearTimeout(timeout);
      });
    });
  }

  private async cleanOldBackups(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.endsWith('.db'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .filter(file => {
          // Ensure the file is within the backup directory
          if (!validatePath(file.path, this.backupDir)) {
            logger.warn('Attempted directory traversal', { file: file.name });
            return false;
          }
          // Skip files that are too large
          if (file.stats.size > this.MAX_BACKUP_SIZE) {
            logger.warn('Backup file exceeds size limit', { file: file.name, size: file.stats.size });
            return false;
          }
          return true;
        })
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Keep only the most recent backups
      const filesToDelete = backupFiles.slice(this.MAX_BACKUPS);
      
      for (const file of filesToDelete) {
        try {
          await fs.promises.unlink(file.path);
          logger.info('Deleted old backup file', { file: file.name });
        } catch (error) {
          logger.error('Error deleting backup file', { file: file.name, error });
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

      const backupFileName = sanitizeFilename(`backup-${Date.now()}`);
      const backupPath = path.join(this.backupDir, backupFileName);
      
      // Validate the backup path
      if (!validatePath(backupPath, this.backupDir)) {
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
      
      // Validate the source path
      if (!validatePath(sourcePath, this.backupDir)) {
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
            
            // Validate the file path
            if (!validatePath(filePath, this.backupDir)) {
              logger.warn('Attempted directory traversal', { file });
              return null;
            }

            try {
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
            } catch (error) {
              logger.error('Error reading backup file stats', { file, error });
              return null;
            }
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