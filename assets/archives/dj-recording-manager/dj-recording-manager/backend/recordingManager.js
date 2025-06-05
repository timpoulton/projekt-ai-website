// ... existing imports ...

async function handleScheduledRecording(schedule) {
  try {
    console.log(`Starting scheduled recording for: ${schedule.name}`);
    await obsHandler.startRecording();
    
    // Convert minutes to milliseconds for setTimeout
    const durationMs = schedule.duration * 60 * 1000;
    
    // Stop recording after the specified duration
    setTimeout(async () => {
      try {
        console.log(`Stopping scheduled recording for: ${schedule.name}`);
        await obsHandler.stopRecording();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }, durationMs);
    
  } catch (error) {
    console.error('Error handling scheduled recording:', error);
  }
}

// ... rest of the code ...
