import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const inputFile = "C:\\Users\\User\\Downloads\\SUB BAR 2025 V8 Stereo 44100 320 (Uncompressed audio).mp4";
const outputFile = path.join(path.dirname(inputFile), path.basename(inputFile, '.mp4') + '.wav');

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error('Input file does not exist:', inputFile);
  process.exit(1);
}

// Check if output file already exists
if (fs.existsSync(outputFile)) {
  console.warn('Output file already exists. It will be overwritten.');
}

// FFmpeg arguments
const ffmpegArgs = [
  '-i', inputFile,
  '-vn',                // Disable video
  '-acodec', 'pcm_s16le', // Use PCM 16-bit codec
  '-ar', '44100',         // Set sample rate to 44100 Hz
  '-ac', '2',            // Set to stereo (2 channels)
  '-y',                  // Overwrite output file if it exists
  outputFile
];

console.log('Starting conversion...');
console.log('Input:', inputFile);
console.log('Output:', outputFile);

const ffmpeg = spawn('ffmpeg', ffmpegArgs);

// Handle progress information
ffmpeg.stderr.on('data', (data) => {
  process.stdout.write('.');
});

// Handle completion
ffmpeg.on('close', (code) => {
  if (code === 0) {
    console.log('\nConversion completed successfully!');
    
    // Get file sizes
    const inputSize = fs.statSync(inputFile).size;
    const outputSize = fs.statSync(outputFile).size;
    
    console.log('\nFile sizes:');
    console.log('Input:', (inputSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('Output:', (outputSize / 1024 / 1024).toFixed(2), 'MB');
  } else {
    console.error('\nConversion failed with code:', code);
  }
});

// Handle errors
ffmpeg.on('error', (err) => {
  console.error('Failed to start FFmpeg:', err);
}); 