import express from 'express';
import { backupService } from '../backup';
import { logger } from '../logger';

const router = express.Router();

// List all backups
router.get('/', async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json(backups);
  } catch (error) {
    logger.error('Error listing backups', { error });
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Create a new backup
router.post('/', async (req, res) => {
  try {
    await backupService.createBackup();
    res.json({ message: 'Backup created successfully' });
  } catch (error) {
    logger.error('Error creating backup', { error });
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Restore from a backup
router.post('/restore/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    await backupService.restoreBackup(filename);
    res.json({ message: 'Backup restored successfully' });
  } catch (error) {
    logger.error('Error restoring backup', { error });
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

export const backupRouter = router; 