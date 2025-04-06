import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { dbService } from './database';

// Create Express server
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the React app in production
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

app.post('/api/brokers', (req, res) => {
  try {
    const broker = dbService.addDataBroker(req.body);
    res.status(201).json(broker);
  } catch (error) {
    console.error('Error adding broker:', error);
    res.status(500).json({ error: 'Failed to add data broker' });
  }
});

app.delete('/api/brokers/:id', (req, res) => {
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
app.get('/api/requests', (req, res) => {
  try {
    const requests = dbService.getRequests();
    res.json(requests);
  } catch (error) {
    console.error('Error getting requests:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

app.get('/api/requests/:id', (req, res) => {
  try {
    const request = dbService.getRequestById(req.params.id);
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

app.post('/api/requests', (req, res) => {
  try {
    const request = dbService.createRequest(req.body);
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

app.put('/api/requests/:id', (req, res) => {
  try {
    const request = dbService.updateRequest(req.params.id, req.body);
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

app.delete('/api/requests/:id', (req, res) => {
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

// Catch all other routes and return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 