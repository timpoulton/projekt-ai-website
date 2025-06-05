import { join } from 'path';
import { mkdir, rename } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { localDriveSync } from './Services/localDriveSync.js';
const execAsync = promisify(exec);

export class FileManager {
    constructor() {
        this.archivePath = 'C:/ARCHIVE API FILES';
    }

    async handleRecordingComplete(outputPath) {
        try {
            console.log('[File Manager] Starting to process:', outputPath);
            
            const fileName = outputPath.split('\\').pop().split('/').pop();
            const folderName = fileName.replace('.mp4', '');
            const archiveFolderPath = join(this.archivePath, folderName);
            
            console.log('[File Manager] Creating folder:', archiveFolderPath);
            await mkdir(archiveFolderPath, { recursive: true });
            console.log('[File Manager] Folder created successfully');
            
            const archiveFilePath = join(archiveFolderPath, fileName);
            console.log('[File Manager] Moving file to:', archiveFilePath);
            await rename(outputPath, archiveFilePath);
            console.log('[File Manager] File moved successfully');
            
            // Extract audio
            const wavPath = await this.extractAudio(archiveFilePath, archiveFolderPath);
            
            // Run track recognition on the WAV file
            await this.identifyTracks(wavPath);
            
            // Sync to Google Drive
            try {
                console.log('[File Manager] Starting Google Drive sync');
                await localDriveSync.syncFolder(archiveFolderPath, folderName);
                console.log('[File Manager] Google Drive sync complete');
            } catch (syncError) {
                console.error('[File Manager] Google Drive sync failed:', syncError.message);
                // Continue even if sync fails
            }
            
            return {
                success: true,
                folderPath: archiveFolderPath,
                fileName: fileName
            };
        } catch (error) {
            console.error('[File Manager] Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async extractAudio(videoPath, outputFolder) {
        try {
            const baseName = videoPath.split('\\').pop().split('/').pop().replace('.mp4', '');
            const wavPath = join(outputFolder, `${baseName}.wav`);
            
            // Extract WAV file
            console.log('[Audio Extractor] Creating WAV file:', wavPath);
            await execAsync(`ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le "${wavPath}"`);
            console.log('[Audio Extractor] WAV file created successfully');
            return wavPath;
        } catch (error) {
            console.error('[Audio Extractor] Error:', error.message);
            throw error;
        }
    }
    
    async identifyTracks(wavPath) {
        try {
            // Run the Python track_watcher script on this specific file
            console.log('[Track Identifier] Starting track identification for:', wavPath);
            
            // Use the full path to your Python script
            const trackWatcherPath = 'C:\\Users\\User\\dj-recording-manager\\backend\\Services\\track_watcher\\track_watcher.py';
            
            // Run Python script with the WAV file as an argument
            // You may need to adjust this command based on your Python environment
            const command = `python "${trackWatcherPath}" "${wavPath}"`;
            
            console.log('[Track Identifier] Running command:', command);
            
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr) {
                console.error('[Track Identifier] Error in Python script:', stderr);
            }
            
            console.log('[Track Identifier] Track identification complete');
            console.log('[Track Identifier] Python output:', stdout);
            
            return true;
        } catch (error) {
            console.error('[Track Identifier] Failed to identify tracks:', error);
            return false;
        }
    }
}

export const fileManager = new FileManager();
