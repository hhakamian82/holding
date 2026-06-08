import { supabase } from './supabase';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'AI_ACTION';

export interface LogEntry {
    level: LogLevel;
    source: string;
    message: string;
    metadata?: Record<string, unknown> | null;
    tags?: string[];
}

export interface SystemLog extends LogEntry {
    id: string;
    timestamp: string;
}

export const cortex = {
    /**
     * Log an event to the central nervous system (Cortex)
     */
    log: async (entry: LogEntry) => {
        try {
            await supabase.from('system_logs').insert([{
                level: entry.level,
                source: entry.source,
                message: entry.message,
                metadata: entry.metadata,
                tags: entry.tags,
                timestamp: new Date().toISOString()
            }]);
        } catch (e) {
            console.error('⚠️ Cortex Memory Error:', e);
        }
    },

    /**
     * Retrieve the stream of consciousness (recent logs)
     */
    getRecentLogs: async (limit = 20) => {
        try {
            const { data, error } = await supabase
                .from('system_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('⚠️ Cortex Retrieval Error:', e);
            return [];
        }
    }
};
