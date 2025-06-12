import { exec } from 'child_process';
import { addLog } from '../services/logger.js';

const COMMANDS = {
  'start-recording': 'echo "Starting recording"', // Replace with actual command
  'stop-recording': 'echo "Stopping recording"' // Replace with actual command
};

export function executeCommand(commandName) {
  return new Promise((resolve, reject) => {
    const command = COMMANDS[commandName];
    
    if (!command) {
      reject(new Error(`Unknown command: ${commandName}`));
      return;
    }
    
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command ${commandName}:`, error);
        await addLog(`Command failed: ${commandName} - ${error.message}`, 'error');
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`Command ${commandName} stderr:`, stderr);
        await addLog(`Command warning: ${commandName} - ${stderr}`, 'warning');
      }
      
      console.log(`Command ${commandName} stdout:`, stdout);
      resolve(stdout);
    });
  });
} 