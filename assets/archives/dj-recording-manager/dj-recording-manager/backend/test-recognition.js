const ShazamHandler = require("./shazamHandler");
require("dotenv").config();

async function testRecognition() {
   try {
       const shazamHandler = new ShazamHandler();
       const testFile = "C:\\ARCHIVE API FILES\\test_audio.wav";
       
       console.log("Starting track recognition test...");
       console.log("Using file:", testFile);
       
       if (!require("fs").existsSync(testFile)) {
           throw new Error(`Test file not found: ${testFile}`);
       }
       
       const results = await shazamHandler.processNewRecording(testFile);
       
       console.log("Analysis results:");
       console.log("Found " + results.trackCount + " tracks");
       console.log(JSON.stringify(results, null, 2));
   } catch (error) {
       console.error("Test failed:", error);
   }
}

testRecognition();