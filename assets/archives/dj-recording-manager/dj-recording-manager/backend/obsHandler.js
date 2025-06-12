import OBSWebSocket from 'obs-websocket-js';
import FileManager from './fileManager.js';
import 'dotenv/config';

class OBSHandler {
    constructor() {
        this.obs = new OBSWebSocket();
        this.isConnected = false;
        this.fileManager = new FileManager();
    }

    async connect() {
        // Attempt connection with multiple fallback addresses
        const obsAddresses = [
            process.env.OBS_IP || '127.0.0.1',  // First try IP from .env or localhost
            'localhost',                         // Then try localhost by name
            '127.0.0.1'                          // Then try explicit loopback
        ];
        
        const obsPort = process.env.OBS_PORT || '4444';
        
        for (const ip of obsAddresses) {
            try {
                console.log(`[OBS Debug] Attempting to connect to OBS at ${ip}:${obsPort}...`);
                const connection = await this.obs.connect(`ws://${ip}:${obsPort}`);
                console.log(`[OBS Debug] Successfully connected to OBS at ${ip}:${obsPort}`);
                
                this.obs.on("RecordStateChanged", (data) => {
                    console.log("[OBS Debug] Record state changed - Raw event:", data);
                });
    
                this.obs.on("RecordStopped", (data) => {
                    console.log("[OBS Debug] Record Stopped Event:", data);
                });
    
                this.isConnected = true;
                return true;
            } catch (err) {
                console.error(`[OBS Debug] Failed to connect to OBS at ${ip}:${obsPort}: ${err.message}`);
                // Continue to next address
            }
        }
        
        console.error("[OBS Debug] All connection attempts failed");
        return false;
    }

    async startRecording() {
        if (!this.isConnected) {
            throw new Error('OBS not connected');
        }
        try {
            if (this.isRecording) {
                throw new Error('Recording is already active');
            }
            
            await this.obs.call('StartRecord');
            this.isRecording = true;
            return { success: true };
        } catch (err) {
            console.error('[OBS Debug] Failed to start recording:', err);
            throw err;
        }
    }

    async stopRecording() {
        if (!this.isConnected) {
            throw new Error('OBS not connected');
        }
        try {
            if (!this.isRecording) {
                throw new Error('No active recording to stop');
            }

            await this.obs.call('StopRecord');
            this.isRecording = false;
            return { success: true };
        } catch (err) {
            console.error('[OBS Debug] Failed to stop recording:', err);
            throw err;
        }
    }
}

export default new OBSHandler();
