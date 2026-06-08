
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

// We need to dynamic import or just re-implement the simple logic to avoid module resolution headaches with tsx in this specific setup if paths are tricky
// But let's try importing first.
// The issue is that src/lib/cortex.ts imports ./supabase
// If I import from ./src/lib/cortex.ts, it should resolve ./supabase relative to cortex.ts, which is correct.

import { cortex, SystemLog } from './src/lib/cortex';

async function main() {
    try {
        console.log("Connecting to Cortex...");
        const logs = await cortex.getRecentLogs(5);
        console.log("--- Cortex Memory Dump (Last 5 Logs) ---");
        if (logs && logs.length > 0) {
            (logs as SystemLog[]).forEach((log: SystemLog) => {
                console.log(`[${log.level}] ${log.timestamp}: ${log.message}`);
                if (log.metadata) console.log(`   Metadata: ${JSON.stringify(log.metadata)}`);
            });
        } else {
            console.log("No logs found in Cortex memory.");
        }
    } catch (error) {
        console.error("Failed to access Cortex memory:", error);
    }
}

main();
