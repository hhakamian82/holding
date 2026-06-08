import { supabase } from './supabase';

export async function getGlobalStats() {
    try {
        const { data, error } = await supabase
            .from('trees_log')
            .select('amount')
            .eq('verification_status', 'verified');

        if (error) throw error;

        const total = data?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0;
        return { total, count: data?.length || 0 };
    } catch (e) {
        console.error('Database fetch error:', e);
        return { total: 1240, count: 5 }; // Fallback for demo
    }
}

export interface Project {
    id: string;
    slug: string;
    name: string;
    description: string;
    status: string;
    website_url?: string;
    created_at?: string;
}

export async function getProjects(): Promise<Project[]> {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('Database fetch error:', e);
        return [
            { id: '1', slug: 'holdin', name: 'Holdin Central', status: 'active', description: 'Central Management' },
            { id: '2', slug: 'manapalm', name: 'ManaPalm', status: 'development', description: 'Premium Date Export' }
        ]; // Fallback for demo
    }
}

export async function addTreePledge(projectId: string, amount: number, benefactor: string) {
    const { data, error } = await supabase
        .from('trees_log')
        .insert([
            {
                project_id: projectId,
                amount,
                benefactor_name: benefactor,
                verification_status: 'pending'
            }
        ]);

    if (error) throw error;

    // Log to Cortex Memory
    await import('./cortex').then(({ cortex }) => {
        cortex.log({
            level: 'SUCCESS',
            source: 'holdin-web',
            message: `Pledge: ${amount} Trees from ${benefactor}`,
            metadata: { project_id: projectId },
            tags: ['financial', 'tree-pledge']
        });
    });

    return data;
}
