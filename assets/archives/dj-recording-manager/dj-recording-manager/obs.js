const OBSWebSocket = require('obs-websocket-js').default;

class OBSHandler {
    constructor() {
        this.obs = new OBSWebSocket();
        this.isConnected = false;
        this.isRecording = false;
    }

    async connect() {
        try {
            console.log('[OBS Debug] Attempting to connect to OBS...');
            await this.obs.connect('ws://192.168.68.14:4444');
            
            // Get current recording directory
            const { recordDirectory } = await this.obs.call('GetRecordDirectory');
            console.log('[OBS Debug] Current Recording Directory:', recordDirectory);
            
            // Get recording status
            const recordingStatus = await this.obs.call('GetRecordStatus');
            this.isRecording = recordingStatus.outputActive;
            console.log('[OBS Debug] Recording Status:', recordingStatus);

            this.isConnected = true;
            return true;
        } catch (err) {
            console.error('[OBS Debug] Connection failed - Full error:', err);
            return false;
        }
    }

    async setRecordingPath(outputPath) {
        if (!this.isConnected) {
            throw new Error('OBS not connected');
        }

        try {
            console.log('[OBS Debug] Setting recording path to:', outputPath);
            await this.obs.call('SetRecordDirectory', {
                directory: outputPath
            });
            console.log('[OBS Debug] Recording path set successfully');
        } catch (err) {
            console.error('[OBS Debug] Failed to set recording path:', err);
            throw err;
        }
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

module.exports = new OBSHandler();