import { google } from 'googleapis';
import { logger } from './logger.js';

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.initialized = false;
    this.keyFilePath = 'C:\\Users\\User\\Desktop\\DO NOT DELETE\\obs-telegram-bot\\practical-ring-430021-k2-22c7413c5d66.json';
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: this.keyFilePath,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.initialized = true;
      logger.info('Google Drive service initialized successfully');
    } catch (error) {
      logger.error(`Google Drive initialization error: ${error.message}`);
      throw error;
    }
  }

  async getFolderByPath(folderPath) {
    try {
      await this.initialize();
      
      // Split the path into components
      const pathComponents = folderPath.split('/');
      let parentId = 'root'; // Start at Drive root
      let currentFolder = null;
      
      // Navigate through the path components
      for (const folderName of pathComponents) {
        if (!folderName) continue; // Skip empty components
        
        // Search for the folder in the current parent
        const response = await this.drive.files.list({
          q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          fields: 'files(id, name)',
          spaces: 'drive'
        });
        
        // If folder exists, use it as the new parent
        if (response.data.files.length > 0) {
          currentFolder = response.data.files[0];
          parentId = currentFolder.id;
        } else {
          logger.warning(`Folder not found: ${folderName} in path ${folderPath}`);
          return null;
        }
      }
      
      return currentFolder;
    } catch (error) {
      logger.error(`Error finding folder by path: ${error.message}`);
      return null;
    }
  }

  async getFilesInFolder(folderId) {
    try {
      await this.initialize();
      
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType)',
        spaces: 'drive'
      });
      
      return response.data.files;
    } catch (error) {
      logger.error(`Error listing files in folder: ${error.message}`);
      return [];
    }
  }
  
  async readTextFile(fileId) {
    try {
      await this.initialize();
      
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Error reading text file: ${error.message}`);
      return '';
    }
  }
  
  async createShareableLink(fileId, type = 'anyone') {
    try {
      await this.initialize();
      
      // Check if the file already has permissions
      const permissionResponse = await this.drive.permissions.list({
        fileId: fileId
      });
      
      // If not already shared with the specified type, create permission
      const hasPermission = permissionResponse.data.permissions.some(
        p => p.type === type && p.role === 'reader'
      );
      
      if (!hasPermission) {
        await this.drive.permissions.create({
          fileId: fileId,
          requestBody: {
            type: type,
            role: 'reader'
          }
        });
      }
      
      // Get the web view link
      const fileResponse = await this.drive.files.get({
        fileId: fileId,
        fields: 'webViewLink'
      });
      
      return fileResponse.data.webViewLink;
    } catch (error) {
      logger.error(`Error creating shareable link: ${error.message}`);
      return `https://drive.google.com/file/d/${fileId}/view`;
    }
  }
}

export const googleDriveService = new GoogleDriveService(); 