import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { generateMarketingContent, SERVICES, AUDIENCES, TONES, MUSIC_OPTIONS, AESTHETICS } from './marketingGenerator';
import { generateImage } from './imageGenerator';
import { publishToFacebook, publishToInstagram } from './publisher';

// --- Types ---
interface ScheduledJob {
    jobId: string;
    description: string;
}

// Persisted state interface
interface ScheduleState {
    isActive: boolean;
    mode: 'standard' | 'test';
    lastRun: string | null;
}

// --- Constants ---
const STATE_FILE_PATH = path.join('/tmp', 'schedule-state.json');

// --- State Management ---
function loadState(): ScheduleState {
    if (!fs.existsSync(STATE_FILE_PATH)) {
        return { isActive: false, mode: 'standard', lastRun: null };
    }
    try {
        const data = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
        const state = JSON.parse(data);
        return {
            isActive: state.isActive || false,
            mode: state.mode || 'standard',
            lastRun: state.lastRun
        };
    } catch (e) {
        console.error("Failed to load schedule state:", e);
        return { isActive: false, mode: 'standard', lastRun: null };
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
    public mode: 'standard' | 'test' = 'standard';

    constructor() {
        // Load initial state
        const state = loadState();
        this.isActive = state.isActive;
        this.mode = state.mode;

        // If it was active before restart, we should probably auto-start? 
        // For now, let's require manual reactivation or check state on server start.
        if (this.isActive) {
            this.start(this.mode);
        }
    }

    // 1. Start the Daily Schedule
    public start(mode: 'standard' | 'test' = 'standard') {
        if (this.tasks.length > 0) {
            console.log("Scheduler already running. Restarting...");
            this.stop();
        }

        this.mode = mode;
        console.log(`Starting Marketing Scheduler in ${mode.toUpperCase()} Mode...`);

        if (mode === 'standard') {
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
        } else if (mode === 'test') {
            // Test Mode: Every 5 minutes
            // Cron format: "*/5 * * * *"
            console.log("Test Mode Activated: Running every 5 minutes.");
            const task = cron.schedule('*/5 * * * *', async () => {
                console.log(`[Scheduler] 🧪 Triggering TEST post [${new Date().toISOString()}]...`);
                await this.executeScheduledPost();
            });
            this.tasks.push(task);
        }

        this.isActive = true;
        saveState({ isActive: true, mode: this.mode, lastRun: loadState().lastRun });
    }

    // 2. Stop/Pause
    public stop() {
        console.log("Stopping Marketing Scheduler...");
        this.tasks.forEach(task => task.stop());
        this.tasks = [];
        this.isActive = false;
        saveState({ isActive: false, mode: this.mode, lastRun: loadState().lastRun });
    }

    // 3. The Core Logic: "Execute Post"
    private async executeScheduledPost() {
        if (!this.isActive) return;

        try {
            console.log(`[Scheduler] 🎲 [${new Date().toISOString()}] Rolling dice for random content...`);

            // Random Selection
            const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
            const audience = AUDIENCES[Math.floor(Math.random() * AUDIENCES.length)];
            const tone = TONES[Math.floor(Math.random() * TONES.length)];
            const music = MUSIC_OPTIONS[Math.floor(Math.random() * MUSIC_OPTIONS.length)];
            const aesthetic = AESTHETICS[Math.floor(Math.random() * AESTHETICS.length)];
            const featureRobin = Math.random() > 0.5; // 50% chance to feature Robin

            // A. Generate Text Content
            console.log(`[Scheduler] 🤖 Generating Text | Service: ${service} | Aesthetic: ${aesthetic}`);
            const content = await generateMarketingContent({
                service,
                audience,
                tone,
                aesthetic,
                featureRobin,
                music
            });
            console.log(`[Scheduler] ✅ Text Generated. Image Prompt preview: ${content.imagePrompt.slice(0, 30)}...`);

            // B. Generate Image
            console.log(`[Scheduler] 🎨 Generating Image...`);
            // We use 'square' as a safe default for both FB/IG in auto-mode
            const imageUrl = await generateImage({
                prompt: content.imagePrompt,
                aspectRatio: 'square',
                resolution: '1k'
            });
            console.log(`[Scheduler] ✅ Image Generated.`);

            // C. Publish to Facebook
            console.log(`[Scheduler] 🚀 Publishing to Facebook...`);
            const fbPostId = await publishToFacebook(content.facebook, imageUrl);
            console.log(`[Scheduler] ✅ Facebook Post Success: ${fbPostId}`);

            // D. Publish to Instagram
            console.log(`[Scheduler] 📸 Publishing to Instagram...`);
            // IG requires a caption. We use 'instagram' field from content.
            const igPostId = await publishToInstagram(content.instagram, imageUrl);
            console.log(`[Scheduler] ✅ Instagram Post Success: ${igPostId}`);

            // TODO: DRIVE ARCHIVE (Phase 2C - Missing Credentials)
            // await uploadToDrive(content, imageUrl);

            const state = loadState();
            saveState({ ...state, lastRun: new Date().toISOString() });

        } catch (error) {
            console.error("[Scheduler] ❌ Execution Failed:", error);
        }
    }
}

// Singleton Instance
export const scheduler = new MarketingScheduler();
