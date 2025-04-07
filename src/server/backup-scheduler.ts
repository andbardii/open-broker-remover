import { backupService } from './backup';
import { config } from './config';
import { logger } from './logger';

class BackupScheduler {
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    if (config.database.backup.enabled) {
      this.startScheduler();
    }
  }

  private startScheduler(): void {
    if (this.timer) {
      return;
    }

    const intervalMs = config.database.backup.intervalSeconds * 1000;
    
    // Run first backup after 1 minute to allow system to initialize
    setTimeout(() => {
      this.runBackup();
      
      // Then start regular interval
      this.timer = setInterval(() => {
        this.runBackup();
      }, intervalMs);
    }, 60 * 1000);

    logger.info('Database backup scheduler started', {
      intervalSeconds: config.database.backup.intervalSeconds,
      retentionDays: config.database.backup.retentionDays
    });
  }

  private async runBackup(): Promise<void> {
    try {
      await backupService.createBackup();
    } catch (error) {
      logger.error('Scheduled backup failed', { error });
    }
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Database backup scheduler stopped');
    }
  }
}

export const backupScheduler = new BackupScheduler(); 