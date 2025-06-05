import dotenv from "dotenv";
import { ShazamHandler } from "./shazamHandler.js";
import path from "path";
import fs from "fs";

dotenv.config();

async function testShazam() {
    const handler = new ShazamHandler();
    const audioFile = "C:/ARCHIVE API FILES/MAZZACLES-08-12-24_01-03/MAZZACLES-08-12-24_01-03.wav";
    
    console.log("[TEST] Analyzing file:", audioFile);

    if (!fs.existsSync(audioFile)) {
        console.error("[TEST] File not found:", audioFile);
        return;
    }

    const stats = fs.statSync(audioFile);
    console.log("[TEST] File size:", (stats.size / 1024 / 1024).toFixed(2), "MB");

    // Test first 5 minutes with 10-second intervals
    const testDuration = 5 * 60; // 5 minutes in seconds
    const interval = 10; // seconds between each analysis
    
    console.log(`[TEST] Analyzing first ${testDuration} seconds of the mix...`);
    
    for (let time = 0; time < testDuration; time += interval) {
        console.log(`\n[TEST] Analyzing at ${Math.floor(time/60)}:${(time%60).toString().padStart(2, "0")}`);
        await handler.analyzeAudio(audioFile, time);
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log("\n[ACR] Analysis complete.");
    const results = handler.getResults();
    console.log("[ACR] Found tracks:", JSON.stringify(results, null, 2));
}

console.log("[TEST] Starting analysis...");
testShazam().catch(error => {
    console.error("[TEST] Fatal error:", error);
});
