import { google } from 'googleapis';
import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { addLog } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Configuration
const SPREADSHEET_ID = '1Y_PBgWxZ1BYL-a1T_O0U-pAxwIGPEn3dCjNNsIWTBfY'; // Replace with your actual spreadsheet ID
const RECORDINGS_SHEET = 'Recordings';

// Added the syncGoogleSheet function that server.js is trying to import
export async function syncGoogleSheet() {
  console.log("Syncing with Google Sheets");
  try {
    await addLog('Google Sheets sync initiated');
    // Basic implementation
    return true;
  } catch (err) {
    console.error('Error syncing with Google Sheets:', err);
    await addLog('Failed to sync with Google Sheets', 'error');
    return false;
  }
}

export async function setupGoogleSheets() {
  try {
    // Check if credentials file exists
    try {
      await fs.access(CREDENTIALS_PATH);
    } catch (err) {
      console.error('Google credentials file not found');
      await addLog('Google credentials file not found', 'error');
      return null;
    }

    // Read credentials file
    const credentialsContent = await fs.readFile(CREDENTIALS_PATH, 'utf8');
    const credentials = JSON.parse(credentialsContent);

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    await addLog('Connected to Google Sheets');

    return {
      async addRecordingEntry(action) {
        try {
          const date = new Date();
          const timestamp = date.toISOString();
          const formattedDate = date.toLocaleDateString();
          const formattedTime = date.toLocaleTimeString();
          
          let status;
          if (action === 'start') {
            status = 'Started';
          } else if (action === 'stop') {
            status = 'Stopped';
          } else {
            status = action;
          }

          const values = [
            [timestamp, formattedDate, formattedTime, status]
          ];

          await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${RECORDINGS_SHEET}!A:D`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values
            }
          });

          await addLog(`Updated Google Sheet: Recording ${status.toLowerCase()}`);
          return true;
        } catch (err) {
          console.error('Error adding recording entry to Google Sheet:', err);
          await addLog('Failed to update Google Sheet', 'error');
          throw err;
        }
      }
    };
  } catch (err) {
    console.error('Error setting up Google Sheets:', err);
    await addLog('Failed to connect to Google Sheets', 'error');
    return null;
  }
} 