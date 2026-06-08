'use server';

import { supabase } from '@/lib/supabase';
import { cortex, LogLevel } from '@/lib/cortex';
import { revalidatePath } from 'next/cache';

/**
 * Updates the CRM status and notes of a lead.
 */
export async function updateLeadStatus(leadId: string, status: string, notes: string) {
    try {
        const { data, error } = await supabase
            .from('leads')
            .update({ status, notes, updated_at: new Date().toISOString() })
            .eq('id', leadId)
            .select();

        if (error) throw error;

        // Log this action to Cortex
        await cortex.log({
            level: 'INFO',
            source: 'holdin-hub',
            message: `Lead status updated to [${status.toUpperCase()}] for ID: ${leadId.substring(0, 8)}`,
            metadata: { lead_id: leadId, status, notes },
            tags: ['crm', 'lead-update']
        });

        revalidatePath('/[locale]/hub', 'page');
        return { success: true, data };
    } catch (e: any) {
        console.error('Error in updateLeadStatus:', e);
        return { success: false, error: e.message || 'Failed to update lead status' };
    }
}

/**
 * Verifies a pending tree planting pledge.
 */
export async function verifyTreeLog(logId: string) {
    try {
        // 1. Fetch details to write a rich cortex log
        const { data: treeLog, error: fetchError } = await supabase
            .from('trees_log')
            .select('amount, benefactor_name')
            .eq('id', logId)
            .single();

        if (fetchError) throw fetchError;

        // 2. Update status to verified
        const { data, error } = await supabase
            .from('trees_log')
            .update({ verification_status: 'verified', planted_at: new Date().toISOString() })
            .eq('id', logId)
            .select();

        if (error) throw error;

        // 3. Log to Cortex
        await cortex.log({
            level: 'SUCCESS',
            source: 'holdin-hub',
            message: `Verified and planted ${treeLog.amount} palm trees for benefactor: ${treeLog.benefactor_name || 'Anonymous'}`,
            metadata: { tree_log_id: logId, amount: treeLog.amount, benefactor: treeLog.benefactor_name },
            tags: ['nakhlestan', 'tree-verification']
        });

        revalidatePath('/[locale]/hub', 'page');
        return { success: true, data };
    } catch (e: any) {
        console.error('Error in verifyTreeLog:', e);
        return { success: false, error: e.message || 'Failed to verify tree planting' };
    }
}

/**
 * Registers a new project/venture in the ecosystem.
 */
export async function addNewProject(name: string, slug: string, description: string, status: string, websiteUrl?: string) {
    try {
        const { data, error } = await supabase
            .from('projects')
            .insert([
                {
                    name,
                    slug,
                    description,
                    status,
                    website_url: websiteUrl || null
                }
            ])
            .select();

        if (error) throw error;

        // Log this action to Cortex
        await cortex.log({
            level: 'AI_ACTION',
            source: 'holdin-hub',
            message: `New venture registered: ${name} (${slug}) with status: ${status}`,
            metadata: { name, slug, status, website_url: websiteUrl },
            tags: ['venture-control', 'project-registry']
        });

        revalidatePath('/[locale]/hub', 'page');
        return { success: true, data };
    } catch (e: any) {
        console.error('Error in addNewProject:', e);
        return { success: false, error: e.message || 'Failed to register project' };
    }
}

/**
 * Updates an existing project's metadata or status.
 */
export async function updateProject(projectId: string, name: string, description: string, status: string, websiteUrl?: string) {
    try {
        const { data, error } = await supabase
            .from('projects')
            .update({
                name,
                description,
                status,
                website_url: websiteUrl || null
            })
            .eq('id', projectId)
            .select();

        if (error) throw error;

        // Log this action to Cortex
        await cortex.log({
            level: 'INFO',
            source: 'holdin-hub',
            message: `Venture updated: ${name} is now ${status}`,
            metadata: { project_id: projectId, name, status },
            tags: ['venture-control', 'project-update']
        });

        revalidatePath('/[locale]/hub', 'page');
        return { success: true, data };
    } catch (e: any) {
        console.error('Error in updateProject:', e);
        return { success: false, error: e.message || 'Failed to update project' };
    }
}

/**
 * Transmits a custom system log signal to Cortex Memory (system_logs).
 */
export async function logCustomCortexEvent(level: LogLevel, message: string, source: string, tags?: string[]) {
    try {
        await cortex.log({
            level,
            source: source || 'Operator Console',
            message,
            tags: tags || ['operator-signal']
        });

        revalidatePath('/[locale]/hub', 'page');
        return { success: true };
    } catch (e: any) {
        console.error('Error in logCustomCortexEvent:', e);
        return { success: false, error: e.message || 'Failed to transmit signal' };
    }
}
