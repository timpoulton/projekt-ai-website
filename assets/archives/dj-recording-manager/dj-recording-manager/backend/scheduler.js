import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { executeCommand } from './utils/command.js';
import { addLog } from './services/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEDULES_FILE = path.join(__dirname, 'data/schedules.json');
const STATUS_FILE = path.join(__dirname, 'data/status.json');

let scheduledJobs = {};

export async function setupScheduler() {
  console.log("Scheduler initialized");
  // Basic implementation
  try {
    // Just log that we started
    console.log("Scheduler setup completed");
    return true;
  } catch (err) {
    console.error('Error setting up scheduler:', err);
    return false;
  }
}

function scheduleRecording(schedule) {
  const { id, date, hour, minute, durationMinutes, name } = schedule;
  
  // Parse the schedule time
  const scheduleTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
  
  // Skip if the schedule is in the past
  if (scheduleTime < new Date()) {
    console.log(`Skipping past schedule: ${name || 'Unnamed'} (${date} ${hour}:${minute})`);
    return;
  }
  
  // Create a cron pattern for the exact time
  const cronMinute = minute;
  const cronHour = hour;
  const cronDay = scheduleTime.getDate();
  const cronMonth = scheduleTime.getMonth() + 1; // Months are 0-based in JS
  
  const cronPattern = `${cronMinute} ${cronHour} ${cronDay} ${cronMonth} *`;
  
  // Schedule the start recording job
  const startJob = cron.schedule(cronPattern, async () => {
    try {
      console.log(`Starting scheduled recording: ${name || 'Unnamed'}`);
      await addLog(`Starting scheduled recording: ${name || 'Unnamed'}`);
      
      // Check if already recording
      const statusData = await fs.readFile(STATUS_FILE, 'utf8');
      const status = JSON.parse(statusData);
      
      if (status.status === 'recording') {
        await addLog('Already recording, skipping scheduled start', 'warning');
        return;
      }
      
      // Start recording
      await executeCommand('start-recording');
      await fs.writeFile(STATUS_FILE, JSON.stringify({ status: 'recording' }));
      
      // Schedule stop job after durationMinutes
      setTimeout(async () => {
        try {
          console.log(`Stopping scheduled recording: ${name || 'Unnamed'}`);
          await addLog(`Stopping scheduled recording: ${name || 'Unnamed'}`);
          
          // Stop recording
          await executeCommand('stop-recording');
          await fs.writeFile(STATUS_FILE, JSON.stringify({ status: 'idle' }));
        } catch (err) {
          console.error('Error stopping scheduled recording:', err);
          await addLog(`Error stopping scheduled recording: ${err.message}`, 'error');
        }
      }, durationMinutes * 60 * 1000);
    } catch (err) {
      console.error('Error starting scheduled recording:', err);
      await addLog(`Error starting scheduled recording: ${err.message}`, 'error');
    }
  }, {
    scheduled: true,
    timezone: 'UTC' // You may want to adjust this for your local timezone
  });
  
  // Store the job for later management
  scheduledJobs[id] = startJob;
} 