-- 🌴 Palm Grove Database Schema

-- 1. Projects Table: To manage all ventures (holdin, manapalm, webuilder, etc.)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL, -- e.g. 'manapalm'
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning', -- 'active', 'development', 'planning'
    website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Trees Log: To track every tree planting event
CREATE TABLE IF NOT EXISTS public.trees_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id),
    amount INTEGER NOT NULL DEFAULT 0,
    planted_at TIMESTAMPTZ DEFAULT now(),
    verification_status TEXT DEFAULT 'pending', -- 'verified', 'pending'
    benefactor_name TEXT, -- Diaspora or local client name
    location TEXT -- e.g. 'Bushehr'
);

-- 3. System Logs (Cortex Memory): Centralized logging for Chief Architect
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    level TEXT NOT NULL, -- 'INFO', 'WARN', 'ERROR', 'SUCCESS', 'AI_ACTION'
    source TEXT NOT NULL, -- 'holdin-web', etc.
    message TEXT NOT NULL,
    metadata JSONB,
    tags TEXT[]
);

-- 4. Global Stats View (Optional but helpful)
CREATE OR REPLACE VIEW public.global_stats AS
SELECT 
    COALESCE(SUM(amount), 0) as total_trees,
    COUNT(DISTINCT project_id) as total_active_projects
FROM public.trees_log
WHERE verification_status = 'verified';

-- Sample Data
INSERT INTO public.projects (slug, name, description, status) 
VALUES ('holdin', 'Holdin Central', 'The nerve center of the ecosystem', 'active')
ON CONFLICT (slug) DO NOTHING;
