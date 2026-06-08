
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { SystemLog } from './src/lib/cortex';

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

async function main() {
    try {
        console.log("Searching Cortex for team definitions...");

        // Search for logs containing 'team', 'role', or 'agent'
        const { data, error } = await supabase
            .from('system_logs')
            .select('*')
            .or('message.ilike.%team%,message.ilike.%role%,message.ilike.%agent%')
            .order('timestamp', { ascending: false })
            .limit(20);

        if (error) throw error;

        if (data && data.length > 0) {
            console.log("--- Found Related Logs ---");
            (data as SystemLog[]).forEach((log: SystemLog) => {
                console.log(`[${log.timestamp}] ${log.source}: ${log.message}`);
                if (log.metadata) console.log(`   Metadata: ${JSON.stringify(log.metadata)}`);
            });
        } else {
            console.log("No specific team logs found.");

            // Fallback: Just get the very last few logs to see context
            const { data: recent } = await supabase
                .from('system_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(5);
            if (recent && recent.length > 0) {
                console.log("--- Recent Logs ---");
                (recent as SystemLog[]).forEach((log: SystemLog) => console.log(`[${log.timestamp}] ${log.message}`));
            }
        }
    } catch (error) {
        console.error("Error querying Cortex:", error);
    }
}

main();
