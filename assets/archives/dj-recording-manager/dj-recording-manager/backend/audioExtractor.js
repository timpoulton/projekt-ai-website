import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export class AudioExtractor {
  constructor() {
    this.verifyFfmpeg();
  }

  async verifyFfmpeg() {
    try {
      const ffmpeg = spawn('ffmpeg', ['-version']);
      await new Promise((resolve, reject) => {
        ffmpeg.on('close', (code) => {
          if (code !== 0) reject(new Error('FFmpeg check failed'));
          resolve();
        });
      });
    } catch (error) {
      throw new Error('FFmpeg is not installed or not accessible');
    }
  }

  async extractAudio(videoPath) {
    try {
      await fs.access(videoPath);
      
      const videoDir = path.dirname(videoPath);
      const videoName = path.basename(videoPath, '.mp4');
      const wavPath = path.join(videoDir, `${videoName}.wav`);

      console.log(`Starting audio extraction to: ${wavPath}`);

      await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-i', videoPath,
          '-vn',
          '-acodec', 'pcm_s16le',
          '-ar', '44100',
          '-ac', '2',
          '-y',
          wavPath
        ]);

        ffmpeg.stderr.on('data', (data) => {
          console.log(`FFmpeg Progress: ${data}`);
        });

        ffmpeg.on('close', (code) => {
          if (code === 0) {
            console.log('Audio extraction completed successfully');
            resolve(wavPath);
          } else {
            reject(new Error(`FFmpeg process exited with code ${code}`));
          }
        });

        ffmpeg.on('error', (err) => {
          reject(new Error(`FFmpeg process error: ${err.message}`));
        });
      });

      return wavPath;
    } catch (error) {
      console.error(`Audio extraction failed: ${error.message}`);
      throw error;
    }
  }
}
