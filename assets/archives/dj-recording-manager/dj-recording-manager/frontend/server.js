import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import OBSHandler from './obsHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Initialize OBS Handler
const obs = new OBSHandler();
await obs.connect();

// Middleware
app.use(cors());
app.use(express.json());

// Schedule file path
const SCHEDULES_FILE = join(__dirname, "schedules.json");

// Ensure schedules file exists
async function ensureSchedulesFile() {
    try {
        await fs.access(SCHEDULES_FILE);
    } catch {
        await fs.writeFile(SCHEDULES_FILE, "[]");
    }
}

// Initialize schedules file
await ensureSchedulesFile();

// Schedule checker
let scheduleChecker = null;

async function checkSchedules() {
    try {
        const data = await fs.readFile(SCHEDULES_FILE, "utf8");
        const schedules = JSON.parse(data);
        const now = new Date();

        for (const schedule of schedules) {
            const scheduleTime = new Date(`${schedule.date}T${schedule.startTime}`);
            const endTime = new Date(scheduleTime.getTime() + schedule.duration * 60000);

            if (schedule.status === "scheduled" && now >= scheduleTime && now < endTime) {
                // Start recording
                console.log(`Starting scheduled recording for: ${schedule.name}`);
                await obs.startRecording(schedule.name);
                
                // Update schedule status
                schedule.status = "recording";
                await fs.writeFile(SCHEDULES_FILE, JSON.stringify(schedules, null, 2));
            } 
            else if (schedule.status === "recording" && now >= endTime) {
                // Stop recording
                console.log(`Stopping scheduled recording for: ${schedule.name}`);
                await obs.stopRecording();
                
                // Update schedule status
                schedule.status = "completed";
                await fs.writeFile(SCHEDULES_FILE, JSON.stringify(schedules, null, 2));
            }
        }
    } catch (error) {
        console.error("Error checking schedules:", error);
    }
}

// Start schedule checker
scheduleChecker = setInterval(checkSchedules, 30000); // Check every 30 seconds

// API Routes
app.get("/api/schedules", async (req, res) => {
    try {
        const data = await fs.readFile(SCHEDULES_FILE, "utf8");
        res.json(JSON.parse(data));
    } catch (error) {
        console.error("Error getting schedules:", error);
        res.status(500).json({ error: error.message || "Failed to get schedules" });
    }
});

app.post("/api/schedules", async (req, res) => {
    try {
        console.log("Received schedule data:", req.body);
        const { name, date, startTime, duration } = req.body;
        
        if (!name || !date || !startTime || !duration) {
            throw new Error("Missing required fields");
        }

        const data = await fs.readFile(SCHEDULES_FILE, "utf8");
        const schedules = JSON.parse(data);
        
        const newSchedule = {
            id: Date.now().toString(),
            name,
            date,
            startTime,
            duration: parseInt(duration),
            status: "scheduled",
            created: new Date().toISOString()
        };

        schedules.push(newSchedule);
        await fs.writeFile(SCHEDULES_FILE, JSON.stringify(schedules, null, 2));
        
        console.log("Created new schedule:", newSchedule);
        res.json(newSchedule);
    } catch (error) {
        console.error("Error creating schedule:", error);
        res.status(500).json({ 
            error: error.message || "Failed to create schedule",
            details: error.stack
        });
    }
});

app.delete("/api/schedules/:id", async (req, res) => {
    try {
        const data = await fs.readFile(SCHEDULES_FILE, "utf8");
        let schedules = JSON.parse(data);
        schedules = schedules.filter(schedule => schedule.id !== req.params.id);
        await fs.writeFile(SCHEDULES_FILE, JSON.stringify(schedules, null, 2));
        res.json({ message: "Schedule deleted" });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        res.status(500).json({ error: error.message || "Failed to delete schedule" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
