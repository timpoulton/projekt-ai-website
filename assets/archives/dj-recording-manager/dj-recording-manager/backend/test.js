import { readdir } from 'fs/promises';

const recordingPath = 'C:/ARCHIVE API';
const archivePath = 'C:/ARCHIVE API FILES';

async function testPaths() {
    console.log('Testing paths...');
    
    try {
        console.log('Checking recording path:', recordingPath);
        const files = await readdir(recordingPath);
        console.log('Files in recording path:', files);
    } catch (error) {
        console.error('Error with recording path:', error.message);
    }

    try {
        console.log('Checking archive path:', archivePath);
        const files = await readdir(archivePath);
        console.log('Files in archive path:', files);
    } catch (error) {
        console.error('Error with archive path:', error.message);
    }
}

testPaths();
