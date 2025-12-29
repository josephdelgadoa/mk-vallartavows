import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { generateMarketingContent, SERVICES, AUDIENCES, TONES, MUSIC_OPTIONS } from './marketingGenerator';

// --- Types ---
interface ScheduledJob {
    jobId: string;
    description: string;
}

// Persisted state interface
interface ScheduleState {
    isActive: boolean;
    lastRun: string | null;
}

// --- Constants ---
const STATE_FILE_PATH = path.join(process.cwd(), 'schedule-state.json');

// --- State Management ---
function loadState(): ScheduleState {
    if (!fs.existsSync(STATE_FILE_PATH)) {
        return { isActive: false, lastRun: null };
    }
    try {
        const data = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Failed to load schedule state:", e);
        return { isActive: false, lastRun: null };
    }
}

function saveState(state: ScheduleState) {
    try {
        fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2));
    } catch (e) {
        console.error("Failed to save schedule state:", e);
    }
}

// --- Scheduler Class ---
class MarketingScheduler {
    private tasks: any[] = [];
    public isActive: boolean = false;

    constructor() {
        // Load initial state
        const state = loadState();
        this.isActive = state.isActive;

        // If it was active before restart, we should probably auto-start? 
        // For now, let's require manual reactivation or check state on server start.
        if (this.isActive) {
            this.start();
        }
    }

    // 1. Start the Daily Schedule
    public start() {
        if (this.tasks.length > 0) {
            console.log("Scheduler already running. Restarting...");
            this.stop();
        }

        console.log("Starting Marketing Scheduler (9 Daily Slots)...");

        // Define the 9 slots: 8am to 4pm
        // Cron format: "0 8 * * *" (At minute 0 past hour 8)
        const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];

        hours.forEach(hour => {
            const cronExpression = `0 ${hour} * * *`; // Every day at HH:00

            const task = cron.schedule(cronExpression, async () => {
                console.log(`[Scheduler] Triggering scheduled post for ${hour}:00...`);
                await this.executeScheduledPost();
            });

            this.tasks.push(task);
        });

        this.isActive = true;
        saveState({ isActive: true, lastRun: loadState().lastRun });
    }

    // 2. Stop/Pause
    public stop() {
        console.log("Stopping Marketing Scheduler...");
        this.tasks.forEach(task => task.stop());
        this.tasks = [];
        this.isActive = false;
        saveState({ isActive: false, lastRun: loadState().lastRun });
    }

    // 3. The Core Logic: "Execute Post"
    private async executeScheduledPost() {
        if (!this.isActive) return;

        try {
            console.log("[Scheduler] 🎲 rolling dice for random content...");

            // Random Selection
            const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
            const audience = AUDIENCES[Math.floor(Math.random() * AUDIENCES.length)];
            const tone = TONES[Math.floor(Math.random() * TONES.length)];
            const music = MUSIC_OPTIONS[Math.floor(Math.random() * MUSIC_OPTIONS.length)];
            const featureRobin = Math.random() > 0.7; // 30% chance to feature Robin

            console.log(`[Scheduler] 🤖 Generating Content | Service: ${service} | Music: ${music}`);

            const content = await generateMarketingContent({
                service,
                audience,
                tone,
                featureRobin,
                music
            });

            console.log(`[Scheduler] ✅ Generated Content [${new Date().toISOString()}]`);
            console.log(`[Scheduler] FB Preview: ${content.facebook.slice(0, 50)}...`);

            // TODO: PUBLISH (Phase 2B)
            // await publishToFacebook(content.facebook, imageUrl);
            // await publishToInstagram(content.instagram, imageUrl);

            // TODO: DRIVE ARCHIVE (Phase 2C - Missing Credentials)
            // await uploadToDrive(content);

            const state = loadState();
            saveState({ ...state, lastRun: new Date().toISOString() });

        } catch (error) {
            console.error("[Scheduler] ❌ Execution Failed:", error);
        }
    }
}

// Singleton Instance
export const scheduler = new MarketingScheduler();
