
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

async function checkDatabaseConnection() {
    try {
        console.log("🛠️  Agent Root: Initiating Database Connection Test...");
        console.log(`📡 Connecting to Supabase at: ${supabaseUrl.substring(0, 20)}...`);

        // Test 1: Simple list of tables (by querying a known table)
        const { error, count } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error("❌ Connection Failed:", error.message);
            console.error("   Details:", error.details || "Check your URL and Anon Key.");
        } else {
            console.log("✅ Connection Successful: 'projects' table is accessible.");
            console.log(`   Table Row Count: ${count}`);
        }

        // Test 2: Check Cortex logs access
        const { error: logError } = await supabase
            .from('system_logs')
            .select('id')
            .limit(1);

        if (logError) {
            console.error("⚠️ Cortex Memory Access Warning:", logError.message);
        } else {
            console.log("✅ Cortex Memory Access: Active");
        }

    } catch (err) {
        console.error("🔥 Critical Error:", err);
    }
}

checkDatabaseConnection();
