import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { googleDriveService } from './googleDriveService.js';
import { googleSheetsService } from './googleSheetsService.js';
import { logger } from './logger.js';

const execAsync = promisify(exec);

class LocalDriveSync {
  constructor() {
    this.drivePath = "G:\\My Drive\\ARCHIVE\\ARTIST ASSETS";
    this.sheetPath = "G:\\My Drive\\Master Recordings Tracker.gsheet";
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Try to extract spreadsheet ID from the .gsheet file
      await googleSheetsService.getSpreadsheetIdFromGsheet(this.sheetPath);
      this.initialized = true;
    } catch (error) {
      console.error(`[Drive Sync] Error initializing sheet: ${error.message}`);
      // Continue even if sheet initialization fails
    }
  }

  // Extract artist name from recording name (e.g., "TEST 8-26-02-25_10-28" → "TEST 8")
  getArtistName(recordingName) {
    // Find the position of the first dash which marks the start of the date
    const dashIndex = recordingName.indexOf('-');
    if (dashIndex > 0) {
      // Extract everything before the dash
      return recordingName.substring(0, dashIndex).trim().toUpperCase();
    }
    // If no dash found, use the whole name
    return recordingName.toUpperCase();
  }

  // Extract date from recording name (e.g., "TEST 8-26-02-25_10-28" → "2025-02-26")
  getRecordingDate(recordingName) {
    // Try to find date in format DD-MM-YY
    const dateMatch = recordingName.match(/(\d{2})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [_, day, month, year] = dateMatch;
      return `20${year}-${month}-${day}`;
    }
    return new Date().toISOString().split('T')[0]; // Today's date as fallback
  }

  // Check if folder already exists
  async folderExists(folderPath) {
    try {
      await fs.access(folderPath);
      return true;
    } catch {
      return false;
    }
  }

  async syncFolder(sourceFolderPath, recordingName) {
    try {
      await this.initialize();
      console.log(`[Drive Sync] Starting sync for: ${recordingName}`);
      
      // Extract artist name and format to uppercase
      const artistName = this.getArtistName(recordingName);
      console.log(`[Drive Sync] Artist name extracted: ${artistName}`);
      
      // Extract the recording date for the spreadsheet
      const recordingDate = this.getRecordingDate(recordingName);
      
      // Check if artist folder already exists
      const artistFolderPath = path.join(this.drivePath, artistName);
      const artistFolderExists = await this.folderExists(artistFolderPath);
      
      if (artistFolderExists) {
        console.log(`[Drive Sync] Using existing artist folder: ${artistFolderPath}`);
      } else {
        // Create artist folder
        try {
          await fs.mkdir(artistFolderPath, { recursive: true });
          console.log(`[Drive Sync] Created new artist folder: ${artistFolderPath}`);
        } catch (err) {
          if (err.code !== 'EEXIST') throw err;
        }
      }
      
      // Create recording subfolder within artist folder
      const recordingFolderPath = path.join(artistFolderPath, recordingName);
      try {
        await fs.mkdir(recordingFolderPath, { recursive: true });
        console.log(`[Drive Sync] Created recording folder: ${recordingFolderPath}`);
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
      }
      
      // Get files to copy
      const files = await fs.readdir(sourceFolderPath);
      console.log(`[Drive Sync] Found ${files.length} files to copy`);
      
      let audioFile = '';
      let videoFile = '';
      let trackListFile = '';
      
      // Copy each file
      for (const file of files) {
        const sourceFile = path.join(sourceFolderPath, file);
        const destFile = path.join(recordingFolderPath, file);
        
        // Track file types for the spreadsheet
        const lowerFile = file.toLowerCase();
        if (lowerFile.endsWith('.wav')) audioFile = file;
        if (lowerFile.endsWith('.mp4')) videoFile = file;
        if (lowerFile.endsWith('.txt')) trackListFile = file;
        
        // Check if file is accessible before copying
        try {
          await fs.access(sourceFile);
          
          // Use robocopy for reliable copying
          const command = `robocopy "${sourceFolderPath}" "${recordingFolderPath}" "${file}" /Z`;
          console.log(`[Drive Sync] Running: ${command}`);
          
          try {
            await execAsync(command);
            console.log(`[Drive Sync] Copied: ${file}`);
          } catch (robocopyError) {
            // Robocopy returns non-zero exit codes even on success
            // Exit codes 0-7 indicate success with varying levels of file operations
            if (robocopyError.code > 7) {
              console.error(`[Drive Sync] Robocopy error (${robocopyError.code}): ${robocopyError.message}`);
              throw robocopyError;
            } else {
              console.log(`[Drive Sync] Robocopy completed with code ${robocopyError.code} (success)`);
            }
          }
        } catch (accessError) {
          console.error(`[Drive Sync] Cannot access file: ${sourceFile}`, accessError.message);
        }
      }
      
      console.log(`[Drive Sync] Sync complete for: ${recordingName}`);
      
      // Get tracks from tracklist file if it exists
      let trackList = '';
      if (trackListFile) {
        try {
          const trackListPath = path.join(recordingFolderPath, trackListFile);
          const trackListContent = await fs.readFile(trackListPath, 'utf8');
          trackList = trackListContent.trim();
        } catch (err) {
          console.error(`[Drive Sync] Error reading tracklist: ${err.message}`);
        }
      }
      
      // Try to get Drive links
      let folderLink = '';
      let audioLink = '';
      let videoLink = '';
      
      try {
        // Get folder in Google Drive
        const folderInfo = await googleDriveService.getFolderByPath(`ARCHIVE/ARTIST ASSETS/${artistName}/${recordingName}`);
        
        if (folderInfo && folderInfo.id) {
          // Generate folder link
          folderLink = `https://drive.google.com/drive/folders/${folderInfo.id}`;
          
          // Get files in folder
          const files = await googleDriveService.getFilesInFolder(folderInfo.id);
          
          // Process each file to get links
          for (const file of files) {
            const fileName = file.name.toLowerCase();
            if (fileName.endsWith('.wav') || fileName.endsWith('.mp3')) {
              audioLink = `https://drive.google.com/file/d/${file.id}/view`;
            } else if (fileName.endsWith('.mp4') || fileName.endsWith('.mov')) {
              videoLink = `https://drive.google.com/file/d/${file.id}/view`;
            } else if (fileName === 'tracklist.txt') {
              trackList = await googleDriveService.readTextFile(file.id);
            }
          }
          
          logger.success(`Generated Google Drive links for ${recordingName}`);
        }
      } catch (driveError) {
        logger.warning(`Could not get Google Drive links: ${driveError.message}`);
        // Will continue with relative paths as fallback
      }
      
      // If we couldn't get Drive links, use the existing path variables
      if (!folderLink) {
        // These variables should already exist in your code
        audioLink = audioFile ? `${recordingName}/${audioFile}` : '';
        videoLink = videoFile ? `${recordingName}/${videoFile}` : '';
        folderLink = `${artistName}/${recordingName}`;
      }
      
      // Update Google Sheet with the best links we have
      await googleSheetsService.appendRow({
        recordingDate,
        timestamp: new Date().toISOString(),
        artistName,
        audioLink,
        videoLink,
        trackList,
        folderLink
      });
      
      logger.success(`Updated spreadsheet for recording: ${recordingName}`);
      
      return recordingFolderPath;
    } catch (error) {
      logger.error(`Drive sync error: ${error.message}`);
      throw error;
    }
  }
}

export const localDriveSync = new LocalDriveSync(); 