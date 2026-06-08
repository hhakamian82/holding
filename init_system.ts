
import fs from 'fs';
import path from 'path';

// Load envs manually
const envPath = path.resolve('.', '.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            process.env[key] = value;
        }
    });
}

import { cortex } from './src/lib/cortex';

async function initSystem() {
    console.log("🚀 Initializing Agent System in Cortex Memory...");

    // Log Team Formation
    await cortex.log({
        level: 'AI_ACTION',
        source: 'Antigravity',
        message: 'Agent Team Assembled & Roles Assigned',
        metadata: {
            team: [
                'Verdant (Strategy)',
                'Canopy (Design)',
                'Root (Tech)',
                'Bloom (Marketing)',
                'Grove (Content)',
                'Sentinel (QA)'
            ],
            tier: 'Free/Hobby'
        },
        tags: ['system-init', 'team-building']
    });

    console.log("✅ Team roster logged to Database.");

    // Log Infra Status
    await cortex.log({
        level: 'SUCCESS',
        source: 'Root',
        message: 'Database Connection Verified (Supabase Free Tier)',
        tags: ['infrastructure', 'database']
    });

    console.log("✅ Infrastructure status logged.");
}

initSystem();
