import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { dbService } from './database';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { encryptionService } from './encryption';
import { backupRouter } from './routes/backup';
import { config } from './config';

// Create Express server
const app = express();
const PORT = process.env.PORT || 3001;

// Security middlewares
// Apply helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.gpteng.co", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://lovable.dev"],
      connectSrc: ["'self'", "https://cdn.gpteng.co", "http://localhost:3001"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  // Disable strict MIME checking to allow modules to load correctly
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

// Apply rate limiting to all requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(generalLimiter);

// More strict rate limiting for authentication/sensitive operations
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests for sensitive operations, please try again later.' }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '100kb' })); // Limit payload size
app.use(morgan('dev'));

// Configure MIME types
express.static.mime.define({
  'application/javascript': ['js'],
  'text/css': ['css']
});

// Direct asset handlers for assets folder
app.get('/assets/*.js', (req, res, next) => {
  const assetPath = path.join(__dirname, 'client', req.path);
  res.type('application/javascript');
  res.sendFile(assetPath, err => {
    if (err) {
      console.error(`Error serving JS asset: ${req.path}`, err);
      console.error(`Tried path: ${assetPath}`);
      next();
    }
  });
});

app.get('/assets/*.css', (req, res, next) => {
  const assetPath = path.join(__dirname, 'client', req.path);
  res.type('text/css');
  res.sendFile(assetPath, err => {
    if (err) {
      console.error(`Error serving CSS asset: ${req.path}`, err);
      console.error(`Tried path: ${assetPath}`);
      next();
    }
  });
});

// Static file serving
app.use(express.static(path.join(__dirname, 'client')));

// API Routes
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await dbService.getDataBrokers().length > 0 ? 'ok' : 'warning';
    const encryptionStatus = await dbService.getEncryptionStatus();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: dbStatus,
          message: dbStatus === 'ok' ? 'Connected' : 'Connected but no data'
        },
        encryption: {
          status: encryptionStatus.enabled ? 'ok' : 'disabled',
          initialized: encryptionStatus.initialized
        },
        backup: {
          status: config.database.backup.enabled ? 'ok' : 'disabled',
          interval: `${config.database.backup.intervalSeconds}s`,
          retention: `${config.database.backup.retentionDays} days`,
          directory: config.storage.backupDir
        }
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    res.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Data Brokers API
app.get('/api/brokers', (req, res) => {
  try {
    const brokers = dbService.getDataBrokers();
    res.json(brokers);
  } catch (error) {
    console.error('Error getting brokers:', error);
    res.status(500).json({ error: 'Failed to get data brokers' });
  }
});

// Apply strict rate limiting to sensitive operations
app.post('/api/brokers', strictLimiter, (req, res) => {
  try {
    const broker = dbService.addDataBroker(req.body);
    res.status(201).json(broker);
  } catch (error) {
    console.error('Error adding broker:', error);
    res.status(500).json({ error: 'Failed to add data broker' });
  }
});

app.delete('/api/brokers/:id', strictLimiter, (req, res) => {
  try {
    const success = dbService.deleteDataBroker(req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Data broker not found' });
    }
  } catch (error) {
    console.error('Error deleting broker:', error);
    res.status(500).json({ error: 'Failed to delete data broker' });
  }
});

app.post('/api/brokers/search', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const brokers = dbService.findDataBrokersForEmail(email);
    res.json(brokers);
  } catch (error) {
    console.error('Error searching brokers:', error);
    res.status(500).json({ error: 'Failed to search data brokers' });
  }
});

// Requests API
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await dbService.getRequests();
    res.json(requests);
  } catch (error) {
    console.error('Error getting requests:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

app.get('/api/requests/:id', async (req, res) => {
  try {
    const request = await dbService.getRequestById(req.params.id);
    if (request) {
      res.json(request);
    } else {
      res.status(404).json({ error: 'Request not found' });
    }
  } catch (error) {
    console.error('Error getting request:', error);
    res.status(500).json({ error: 'Failed to get request' });
  }
});

app.post('/api/requests', strictLimiter, async (req, res) => {
  try {
    const request = await dbService.createRequest(req.body);
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

app.put('/api/requests/:id', strictLimiter, async (req, res) => {
  try {
    const request = await dbService.updateRequest(req.params.id, req.body);
    if (request) {
      res.json(request);
    } else {
      res.status(404).json({ error: 'Request not found' });
    }
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

app.delete('/api/requests/:id', strictLimiter, (req, res) => {
  try {
    const success = dbService.deleteRequest(req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Request not found' });
    }
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// Add Encryption API Routes
app.get('/api/encryption/status', (req, res) => {
  try {
    const status = dbService.getEncryptionStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting encryption status:', error);
    res.status(500).json({ error: 'Failed to get encryption status' });
  }
});

app.post('/api/encryption/enable', strictLimiter, async (req, res) => {
  try {
    const { enable } = req.body;
    if (typeof enable !== 'boolean') {
      return res.status(400).json({ error: 'Enable parameter must be a boolean' });
    }
    
    const success = await dbService.enableEncryption(enable);
    if (success) {
      res.json({ success: true, enabled: enable });
    } else {
      res.status(500).json({ error: 'Failed to change encryption status' });
    }
  } catch (error) {
    console.error('Error updating encryption status:', error);
    res.status(500).json({ error: 'Failed to update encryption status' });
  }
});

app.get('/api/encryption/export-key', strictLimiter, async (req, res) => {
  try {
    const key = await dbService.exportEncryptionKey();
    if (key) {
      res.json({ key });
    } else {
      res.status(404).json({ error: 'No encryption key found' });
    }
  } catch (error) {
    console.error('Error exporting encryption key:', error);
    res.status(500).json({ error: 'Failed to export encryption key' });
  }
});

app.post('/api/encryption/import-key', strictLimiter, async (req, res) => {
  try {
    const { key } = req.body;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'Valid key is required' });
    }
    
    const success = await dbService.importEncryptionKey(key);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to import encryption key' });
    }
  } catch (error) {
    console.error('Error importing encryption key:', error);
    res.status(500).json({ error: 'Failed to import encryption key' });
  }
});

// Apply strict rate limiting to sensitive operations
app.use('/api/backups', strictLimiter, backupRouter);

// Add this immediately before the last route
app.use('/backup', backupRouter);

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  // Don't serve the index for API routes or asset requests that fail
  if (req.url.startsWith('/api/') || req.url.startsWith('/assets/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // For all other routes, serve the index.html for client-side routing
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 