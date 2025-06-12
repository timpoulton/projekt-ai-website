import { google } from 'googleapis';
import { logger } from './logger.js';

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.initialized = false;
    
    // The spreadsheet ID from your Google Sheet URL
    this.spreadsheetId = '1QmC-BWumpFtV0AwlUVR635vqzA0Gm9-mE-x-zpf-clc';
    
    // Using the service account file found in your system
    this.keyFilePath = 'C:\\Users\\User\\Desktop\\DO NOT DELETE\\obs-telegram-bot\\practical-ring-430021-k2-22c7413c5d66.json';
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Using key file authentication
      const auth = new google.auth.GoogleAuth({
        keyFile: this.keyFilePath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.initialized = true;
      logger.info('Google Sheets service initialized successfully');
      console.log('[Google Sheets] Service initialized successfully');
    } catch (error) {
      logger.error('Google Sheets initialization error', error.message);
      console.error('[Google Sheets] Initialization error:', error.message);
      throw error;
    }
  }

  async appendRow(recordingData) {
    try {
      await this.initialize();

      // Create values array in the order of columns
      const values = [
        [
          recordingData.recordingDate,
          recordingData.timestamp,
          recordingData.artistName,
          recordingData.audioLink || '',
          recordingData.videoLink || '',
          recordingData.trackList || '',
          recordingData.folderLink || ''
        ]
      ];

      // Append values to the sheet
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:G',  // Assumes headers are in row 1, data starts row 2
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values },
      });

      logger.success('Data appended to Google Sheet');
      console.log('[Google Sheets] Data appended successfully');
      return response.data;
    } catch (error) {
      logger.error('Error appending data to Google Sheet', error.message);
      console.error('[Google Sheets] Error appending data:', error.message);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();