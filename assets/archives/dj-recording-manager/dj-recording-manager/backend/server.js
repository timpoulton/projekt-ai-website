import express from 'express';
import cors from 'cors';
import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import { executeCommand } from './utils/command.js';
import { setupScheduler } from './scheduler.js';
import { setupGoogleSheets } from './services/googleSheets.js';
import { addLog, logger } from './services/logger.js';
import { processNewRecordings } from './services/recordingProcessor.js';
import { syncGoogleSheet } from './services/googleSheets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.68.14:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Data paths
const DATA_DIR = path.join(__dirname, 'data');
const SCHEDULES_FILE = path.join(DATA_DIR, 'schedules.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const STATUS_FILE = path.join(DATA_DIR, 'status.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize files if they don't exist
    try {
      await fs.access(SCHEDULES_FILE);
    } catch {
      await fs.writeFile(SCHEDULES_FILE, JSON.stringify([]));
    }
    
    try {
      await fs.access(LOGS_FILE);
    } catch {
      await fs.writeFile(LOGS_FILE, JSON.stringify([]));
    }
    
    try {
      await fs.access(STATUS_FILE);
    } catch {
      await fs.writeFile(STATUS_FILE, JSON.stringify({ status: 'idle' }));
    }
  } catch (err) {
    console.error('Error initializing data directory:', err);
  }
}

// Initialize Google Sheets
let sheetsService;
setupGoogleSheets().then(service => {
  sheetsService = service;
  console.log('Google Sheets service initialized');
}).catch(err => {
  console.error('Failed to initialize Google Sheets:', err);
});

// Routes
app.get('/api/status', async (req, res) => {
  try {
    const data = await fs.readFile(STATUS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading status:', err);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

app.post('/api/recording/:action', async (req, res) => {
  const { action } = req.params;
  
  if (action !== 'start' && action !== 'stop') {
    return res.status(400).json({ error: 'Invalid action' });
  }
  
  try {
    if (action === 'start') {
      // Start recording
      await executeCommand('start-recording');
      await fs.writeFile(STATUS_FILE, JSON.stringify({ status: 'recording' }));
      await addLog('Recording started');
      
      if (sheetsService) {
        try {
          await sheetsService.addRecordingEntry('start');
        } catch (err) {
          console.error('Error updating Google Sheet:', err);
          await addLog('Failed to update Google Sheet', 'error');
        }
      }
    } else {
      // Stop recording
      await executeCommand('stop-recording');
      await fs.writeFile(STATUS_FILE, JSON.stringify({ status: 'idle' }));
      await addLog('Recording stopped');
      
      if (sheetsService) {
        try {
          await sheetsService.addRecordingEntry('stop');
        } catch (err) {
          console.error('Error updating Google Sheet:', err);
          await addLog('Failed to update Google Sheet', 'error');
        }
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(`Error ${action} recording:`, err);
    res.status(500).json({ error: `Failed to ${action} recording` });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const data = await fs.readFile(LOGS_FILE, 'utf8');
    const logs = JSON.parse(data);
    res.json(logs.slice(-limit).reverse());
  } catch (err) {
    console.error('Error reading logs:', err);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

app.get('/api/schedules', async (req, res) => {
  try {
    const data = await fs.readFile(SCHEDULES_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading schedules:', err);
    res.status(500).json({ error: 'Failed to get schedules' });
  }
});

app.post('/api/schedules', async (req, res) => {
  try {
    const { name, date, hour, minute, durationMinutes } = req.body;
    
    if (!date || hour === undefined || minute === undefined || !durationMinutes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const data = await fs.readFile(SCHEDULES_FILE, 'utf8');
    const schedules = JSON.parse(data);
    
    const newSchedule = {
      id: Date.now().toString(),
      name,
      date,
      hour,
      minute,
      durationMinutes
    };
    
    schedules.push(newSchedule);
    await fs.writeFile(SCHEDULES_FILE, JSON.stringify(schedules));
    await addLog(`New recording scheduled: ${name || 'Unnamed'} on ${date} at ${hour}:${minute}`);
    
    // Update scheduler
    setupScheduler();
    
    res.status(201).json(newSchedule);
  } catch (err) {
    console.error('Error creating schedule:', err);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(SCHEDULES_FILE, 'utf8');
    let schedules = JSON.parse(data);
    
    const scheduleToDelete = schedules.find(s => s.id === id);
    if (!scheduleToDelete) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    schedules = schedules.filter(s => s.id !== id);
    await fs.writeFile(SCHEDULES_FILE, JSON.stringify(schedules));
    await addLog(`Schedule deleted: ${scheduleToDelete.name || 'Unnamed'}`);
    
    // Update scheduler
    setupScheduler();
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// Add new endpoints
app.post('/api/recordings/process', async (req, res) => {
  try {
    const result = await processNewRecordings();
    res.json(result);
  } catch (err) {
    logger.error('Failed to process recordings:', err);
    await addLog('Failed to process recordings: ' + err.message, 'error');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sheets/sync', async (req, res) => {
  try {
    const result = await syncGoogleSheet();
    res.json(result);
  } catch (err) {
    logger.error('Failed to sync Google Sheet:', err);
    await addLog('Failed to sync Google Sheet: ' + err.message, 'error');
    res.status(500).json({ error: err.message });
  }
});

// Initialize and start server
async function startServer() {
  await ensureDataDir();
  setupScheduler();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
