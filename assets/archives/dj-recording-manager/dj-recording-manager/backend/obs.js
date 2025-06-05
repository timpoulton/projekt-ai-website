import OBSWebSocket from 'obs-websocket-js';
import { fileManager } from './fileManager.js';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import 'dotenv/config';

class OBSHandler {
    constructor() {
        this.obs = new OBSWebSocket();
        this.isConnected = false;
        this.isRecording = false;
        this.recordingPath = 'C:/ARCHIVE API';
    }

    async connect() {
        if (this.isConnected) {
            console.log('[OBS] Already connected');
            return true;
        }
        
        // Attempt connection with multiple fallback addresses
        const obsAddresses = [
            process.env.OBS_IP || '127.0.0.1',  // First try IP from .env or localhost
            'localhost',                        // Then try localhost by name
            '127.0.0.1'                         // Then try explicit loopback
        ];
        
        const obsPort = process.env.OBS_PORT || '4444';
        const obsPassword = process.env.OBS_PASSWORD || '';
        
        for (const ip of obsAddresses) {
            try {
                console.log(`[OBS Debug] Attempting to connect to OBS at ${ip}:${obsPort}...`);
                await this.obs.connect(`ws://${ip}:${obsPort}`, obsPassword);
                
                this.obs.on('RecordStateChanged', (data) => {
                    console.log('[OBS Debug] Record State Changed:', data);
                });
    
                console.log(`[OBS Debug] Successfully connected to OBS WebSocket at ${ip}:${obsPort}`);
                this.isConnected = true;
                return true;
            } catch (error) {
                console.log(`[OBS Debug] Failed to connect to OBS at ${ip}:${obsPort}: ${error.message}`);
                // Continue to next address
            }
        }
        
        console.error('[OBS Debug] All connection attempts failed');
        this.isConnected = false;
        return false;
    }

    async setDJName(name) {
        if (!this.isConnected) {
            throw new Error('OBS not connected');
        }
        try {
            await this.obs.call('SetInputSettings', {
                inputName: 'dj_name',
                inputSettings: {
                    text: name
                }
            });
            console.log('[OBS Debug] DJ name updated to:', name);
        } catch (err) {
            console.error('[OBS Debug] Failed to update DJ name:', err.message);
            throw err;
        }
    }

    async startRecording() {
        if (!this.isConnected) {
            throw new Error('OBS not connected');
        }
        try {
            await this.obs.call('StartRecord');
            this.isRecording = true;
            console.log('[OBS Debug] Recording started');
        } catch (err) {
            console.error('[OBS Debug] Failed to start recording:', err.message);
            throw err;
        }
    }

    async stopRecording() {
        if (!this.isConnected) {
            throw new Error('OBS not connected');
        }
        try {
            await this.obs.call('StopRecord');
            this.isRecording = false;
            console.log('[OBS Debug] Recording stopped, processing file...');

            // Wait for file system
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Get all files and their stats
            const files = await readdir(this.recordingPath);
            const mp4Files = files.filter(f => f.endsWith('.mp4'));
            
            // Get file stats for each MP4
            const fileStats = await Promise.all(
                mp4Files.map(async (file) => {
                    const stats = await stat(join(this.recordingPath, file));
                    return { file, createdAt: stats.birthtimeMs };
                })
            );

            // Sort by creation time, newest first
            fileStats.sort((a, b) => b.createdAt - a.createdAt);

            if (fileStats.length > 0) {
                const latestFile = fileStats[0].file;
                const fullPath = join(this.recordingPath, latestFile);
                console.log('[OBS Debug] Processing most recent recording:', fullPath);
                await fileManager.handleRecordingComplete(fullPath);
            } else {
                console.error('[OBS Debug] No MP4 files found');
            }

        } catch (err) {
            console.error('[OBS Debug] Error in stopRecording:', err.message);
            throw err;
        }
    }
}

export const obsHandler = new OBSHandler();
