import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGS_FILE = path.join(__dirname, '../data/logs.json');
const MAX_LOGS = 1000;

// Create a logger object to be used throughout the app
export const logger = {
  error: (message, ...args) => {
    addLog(message + (args.length ? ': ' + args.join(' ') : ''), 'error');
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    addLog(message + (args.length ? ': ' + args.join(' ') : ''), 'warning');
    console.warn(`[WARN] ${message}`, ...args);
  },
  info: (message, ...args) => {
    addLog(message + (args.length ? ': ' + args.join(' ') : ''), 'info');
    console.log(`[INFO] ${message}`, ...args);
  },
  debug: (message, ...args) => {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

export async function addLog(message, level = 'info') {
  try {
    // Create a new log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      level
    };
    
    // Read existing logs
    let logs = [];
    try {
      const data = await fs.readFile(LOGS_FILE, 'utf8');
      logs = JSON.parse(data);
    } catch (err) {
      // If file doesn't exist or is invalid, start with an empty array
      console.warn('Could not read logs file, starting with empty logs', err);
    }
    
    // Add new log and keep only the last MAX_LOGS entries
    logs.push(logEntry);
    if (logs.length > MAX_LOGS) {
      logs = logs.slice(-MAX_LOGS);
    }
    
    // Write updated logs back to file
    await fs.writeFile(LOGS_FILE, JSON.stringify(logs));
    
    return logEntry;
  } catch (err) {
    console.error('Error adding log:', err);
    return null;
  }
} 