const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require("util");
const streamPipeline = promisify(require("stream").pipeline);

class ShazamHandler {
    constructor() {
        this.config = {
            host: process.env.ACRCLOUD_HOST,
            accessKey: process.env.ACRCLOUD_ACCESS_KEY,
            accessSecret: process.env.ACRCLOUD_ACCESS_SECRET,
            timeout: 10000,
            archivePath: process.env.ARCHIVE_PATH || "C:/ARCHIVE API FILES",
            confidenceThreshold: 80,
            maxChunkSize: 1024 * 1024 // 1MB chunks
        };
    }

    // ... [previous methods remain the same until _analyzeSegment]

    async _extractAudioChunk(filePath, startTime, duration = 10) {
        const tempDir = path.join(this.config.archivePath, "temp");
        await fs.promises.mkdir(tempDir, { recursive: true });
        
        const chunkPath = path.join(tempDir, `chunk_${Date.now()}.wav`);
        
        return new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .setStartTime(startTime)
                .setDuration(duration)
                .outputFormat("wav")
                .output(chunkPath)
                .on("end", () => resolve(chunkPath))
                .on("error", (err) => reject(err))
                .run();
        });
    }

    async _analyzeSegment(filePath, startTime) {
        try {
            // Extract a 10-second chunk of audio
            const chunkPath = await this._extractAudioChunk(filePath, startTime);
            
            try {
                // Read the chunk file
                const fileData = await fs.promises.readFile(chunkPath);
                
                // Send to ACRCloud
                const url = `http://${this.config.host}/v1/identify`;
                const headers = this._createHeaders("POST", "/v1/identify");
                const response = await axios.post(url, fileData, { headers });
                
                // Clean up the temporary chunk file
                await fs.promises.unlink(chunkPath);
                
                return response.data;
            } catch (error) {
                // Clean up on error
                await fs.promises.unlink(chunkPath).catch(() => {});
                throw error;
            }
        } catch (error) {
            console.error("Error analyzing segment:", error);
            throw new Error("Failed to analyze audio segment");
        }
    }

    async analyzeRecording(filePath, djName, recordingDate) {
        try {
            const tracks = [];
            const seenTracks = new Set();
            const segmentDuration = 30; // Reduced from 60 to 30 seconds
            const overlapDuration = 15; // Reduced from 30 to 15 seconds
            
            const fileDuration = await this._getAudioDuration(filePath);
            
            for (let position = 0; position < fileDuration; position += segmentDuration - overlapDuration) {
                console.log(`Analyzing position ${position}/${fileDuration} seconds`);
                
                const result = await this._analyzeSegment(filePath, position);
                
                if (result.metadata?.music) {
                    for (const track of result.metadata.music) {
                        if (track.score >= this.config.confidenceThreshold) {
                            const trackInfo = this._formatTrackInfo(track, position);
                            
                            if (!this._isDuplicate(trackInfo, tracks)) {
                                tracks.push(trackInfo);
                                seenTracks.add(trackInfo.title);
                            }
                        }
                    }
                }
            }
            
            const analysisResults = {
                djName,
                recordingDate,
                duration: fileDuration,
                trackCount: tracks.length,
                tracks
            };
            
            await this._saveAnalysis(analysisResults, djName, recordingDate);
            
            return analysisResults;
        } catch (error) {
            console.error("Error analyzing recording:", error);
            throw new Error("Failed to analyze recording");
        }
    }

    // ... [rest of the class remains the same]

}

module.exports = ShazamHandler;