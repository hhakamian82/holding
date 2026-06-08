
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function saveSessionState() {
    console.log("💾 Antigravity: Saving current session state to Cortex Memory...");

    // Log the current progress and next steps
    const { error } = await supabase.from('system_logs').insert([{
        level: 'SUCCESS',
        source: 'Antigravity',
        message: 'Session Checkpoint Saved',
        metadata: {
            completed_tasks: [
                "Team formation & Role assignment (7 Agents)",
                "Full Database Connectivity Check (Supabase Free Tier)",
                "New Transparency & R&D Funding Narrative Implemented",
                "HomePage Redesign: Added TransparencySection",
                "Fixed Next.js 15 'params' async issue"
            ],
            next_steps: [
                "Verdant: Develop Pricing Strategy (Trees per Service)",
                "Bloom: Create Marketing Content & SEO Strategy",
                "Canopy: Polish UI details & Add localized text for new section"
            ],
            current_state: "Stable, Dev Server Running"
        },
        tags: ['checkpoint', 'session-end', 'progress']
    }]);

    if (error) {
        console.error("❌ Failed to save checkpoint:", error.message);
    } else {
        console.log("✅ Checkpoint Saved Successfully.");
        console.log("   Ready to resume from this exact state next time.");
    }
}

saveSessionState();
