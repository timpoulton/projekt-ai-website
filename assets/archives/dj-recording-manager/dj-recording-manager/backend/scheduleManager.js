import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { obsHandler } from "./obs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ScheduleManager {
    constructor() {
        this.schedules = [];
        this.schedulesFile = path.join(__dirname, "schedules.json");
        this.activeRecordings = new Map();
        this.checkInterval = null;
        this.obsHandler = obsHandler;
    }

    async init() {
        try {
            // Connect to OBS first
            await this.obsHandler.connect();
            console.log('[Schedule Manager] Connected to OBS');

            // Then load schedules
            await this.loadSchedules();
            console.log('[Schedule Manager] Schedules loaded');

            // Start checking schedules
            this.startScheduleChecker();
            console.log('[Schedule Manager] Schedule checker started');
        } catch (error) {
            console.error('[Schedule Manager] Initialization error:', error);
            throw error;
        }
    }

    async loadSchedules() {
        try {
            const data = await fs.readFile(this.schedulesFile, 'utf8');
            this.schedules = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.schedules = [];
                await this.saveSchedules();
            } else {
                throw error;
            }
        }
    }

    async saveSchedules() {
        await fs.writeFile(this.schedulesFile, JSON.stringify(this.schedules, null, 2));
    }

    startScheduleChecker() {
        // Check every minute
        this.checkInterval = setInterval(() => {
            this.checkSchedules();
        }, 60000);

        // Initial check
        this.checkSchedules();
    }

    async checkSchedules() {
        const now = new Date();

        for (const schedule of this.schedules) {
            if (schedule.status === 'scheduled') {
                this.checkSchedule(schedule);
            }
        }
    }

    checkSchedule(schedule) {
        const now = new Date();
        const scheduleTime = new Date(`${schedule.date}T${schedule.startTime}`);
        const endTime = new Date(scheduleTime.getTime() + schedule.duration * 60000);

        if (now >= scheduleTime && now < endTime && schedule.status === 'scheduled') {
            this.startRecording(schedule);
        } else if (now >= endTime && schedule.status === 'recording') {
            this.stopRecording(schedule);
        }
    }

    async startRecording(schedule) {
        try {
            console.log(`[Schedule Manager] Starting recording for: ${schedule.name}`);
            
            // Set the DJ name before starting the recording
            try {
                await this.obsHandler.setDJName(schedule.name);
                console.log(`[Schedule Manager] Updated DJ name to: ${schedule.name}`);
            } catch (error) {
                console.error(`[Schedule Manager] Failed to update DJ name: ${error.message}`);
            }

            await this.obsHandler.startRecording();

            // Update schedule status
            schedule.status = 'recording';
            await this.saveSchedules();

            // Schedule the stop
            const duration = schedule.duration * 60 * 1000; // Convert to milliseconds
            setTimeout(() => this.stopRecording(schedule), duration);

            console.log(`[Schedule Manager] Recording started for: ${schedule.name}`);
        } catch (error) {
            console.error(`[Schedule Manager] Failed to start recording for: ${schedule.name}`, error);
        }
    }

    async stopRecording(schedule) {
        try {
            console.log(`[Schedule Manager] Stopping recording for: ${schedule.name}`);
            await this.obsHandler.stopRecording();

            // Update schedule status
            schedule.status = 'completed';
            await this.saveSchedules();

            console.log(`[Schedule Manager] Recording stopped for: ${schedule.name}`);
        } catch (error) {
            console.error(`[Schedule Manager] Failed to stop recording for: ${schedule.name}`, error);
        }
    }

    async addSchedule(schedule) {
        const newSchedule = {
            ...schedule,
            id: Date.now().toString(),
            status: 'scheduled',
            created: new Date().toISOString()
        };

        this.schedules.push(newSchedule);
        await this.saveSchedules();

        // Check if this schedule should start soon
        this.checkSchedule(newSchedule);

        return newSchedule;
    }

    async removeSchedule(id) {
        this.schedules = this.schedules.filter(schedule => schedule.id !== id);
        await this.saveSchedules();
    }

    getSchedules() {
        return this.schedules;
    }
}
