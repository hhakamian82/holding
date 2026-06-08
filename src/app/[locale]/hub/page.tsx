'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { logoutAction } from '@/app/actions/auth';
import {
    updateLeadStatus,
    verifyTreeLog,
    addNewProject,
    updateProject,
    logCustomCortexEvent
} from '@/app/actions/dashboard';
import {
    LayoutDashboard,
    Sprout,
    Activity,
    Server,
    Cpu,
    Globe,
    Terminal,
    Search,
    Plus,
    CheckCircle2,
    Clock,
    XCircle,
    UserCheck,
    Cpu as AiIcon,
    Layers,
    Send,
    Database,
    Loader2,
    ShieldAlert,
    LogOut,
    Eye,
    ChevronRight,
    Edit2
} from "lucide-react";

interface Project {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: string;
    website_url?: string;
    created_at?: string;
}

interface TreeLog {
    id: string;
    project_id: string;
    amount: number;
    planted_at: string;
    verification_status: string;
    benefactor_name?: string;
    location?: string;
}

interface Lead {
    id: string;
    name: string;
    company?: string;
    phone?: string;
    email?: string;
    service_interest?: string;
    message?: string;
    score?: number;
    status: string;
    notes?: string;
    created_at: string;
}

interface ChatbotLog {
    id: string;
    created_at: string;
    user_query: string;
    ai_response: string;
    provider: string;
    latency_ms: number;
    mode: string;
    success: boolean;
}

interface SystemLog {
    id: string;
    timestamp: string;
    level: string;
    source: string;
    message: string;
    metadata?: any;
    tags?: string[];
}

export default function HubPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('Dashboard');
    const tNav = useTranslations('Navigation');
    const router = useRouter();
    const isRtl = locale === 'fa';

    // Dashboard navigation states
    const [activeTab, setActiveTab] = useState<'overview' | 'crm' | 'trees' | 'chatbot' | 'ventures' | 'logs'>('overview');

    // Loading & Data states
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [treeLogs, setTreeLogs] = useState<TreeLog[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [chatbotLogs, setChatbotLogs] = useState<ChatbotLog[]>([]);
    const [logs, setLogs] = useState<SystemLog[]>([]);

    // Filter and search states
    const [logFilter, setLogFilter] = useState<string>('ALL');
    const [logSearch, setLogSearch] = useState<string>('');
    const [customLogMsg, setCustomLogMsg] = useState('');
    const [customLogLevel, setCustomLogLevel] = useState('INFO');

    // CRM Lead Status Modal/Edit State
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [leadStatus, setLeadStatus] = useState('new');
    const [leadNotes, setLeadNotes] = useState('');
    const [updatingLead, setUpdatingLead] = useState(false);

    // Venture Creation Modal State
    const [isVentureModalOpen, setIsVentureModalOpen] = useState(false);
    const [newProjName, setNewProjName] = useState('');
    const [newProjSlug, setNewProjSlug] = useState('');
    const [newProjDesc, setNewProjDesc] = useState('');
    const [newProjStatus, setNewProjStatus] = useState('development');
    const [newProjUrl, setNewProjUrl] = useState('');
    const [creatingVenture, setCreatingVenture] = useState(false);

    // AI Provider Circuit Breaker Simulated States
    const [providers, setProviders] = useState([
        { id: 'google-ai-studio', name: 'Google AI Studio (Gemini 2.0)', priority: 1, status: 'online' },
        { id: 'gapgpt-domestic', name: 'GapGPT (Domestic - Iran)', priority: 2, status: 'online' },
        { id: 'avalai-domestic', name: 'AvalAI (Domestic - Iran)', priority: 3, status: 'standby' },
        { id: 'metis-domestic', name: 'MetisAI (Domestic - Iran)', priority: 4, status: 'standby' }
    ]);

    // Simulated telemetry metrics
    const [cpuLoad, setCpuLoad] = useState(12);

    const refreshData = async () => {
        try {
            // Parallel fetch from Supabase
            const [
                { data: projs },
                { data: trees },
                { data: leadsData },
                { data: chatbotData },
                { data: logsData }
            ] = await Promise.all([
                supabase.from('projects').select('*').order('created_at', { ascending: false }),
                supabase.from('trees_log').select('*').order('planted_at', { ascending: false }),
                supabase.from('leads').select('*').order('created_at', { ascending: false }),
                supabase.from('chatbot_logs').select('*').order('created_at', { ascending: false }).limit(25),
                supabase.from('system_logs').select('*').order('timestamp', { ascending: false }).limit(40)
            ]);

            setProjects(projs || []);
            setTreeLogs(trees || []);
            setLeads(leadsData || []);
            setChatbotLogs(chatbotData || []);
            setLogs(logsData || []);
        } catch (err) {
            console.error('Error fetching dashboard telemetry:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();

        // Uptime stats refresh intervals
        const timer = setInterval(() => {
            setCpuLoad(prev => Math.min(100, Math.max(3, Math.floor(prev + (Math.random() * 8 - 4)))));
        }, 4000);

        // Auto refresh logs every 8 seconds
        const logsTimer = setInterval(async () => {
            const { data: logsData } = await supabase
                .from('system_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(40);
            if (logsData) setLogs(logsData);
        }, 8000);

        return () => {
            clearInterval(timer);
            clearInterval(logsTimer);
        };
    }, []);

    // Action handlers
    const handleLogout = async () => {
        await logoutAction();
    };

    const handleVerifyTree = async (logId: string) => {
        const result = await verifyTreeLog(logId);
        if (result.success) {
            refreshData();
        } else {
            alert('Failed to verify tree planting');
        }
    };

    const handleUpdateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead) return;

        setUpdatingLead(true);
        const result = await updateLeadStatus(selectedLead.id, leadStatus, leadNotes);
        setUpdatingLead(false);

        if (result.success) {
            setSelectedLead(null);
            refreshData();
        } else {
            alert('Failed to update lead');
        }
    };

    const handleAddVenture = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjName || !newProjSlug) return;

        setCreatingVenture(true);
        const result = await addNewProject(newProjName, newProjSlug, newProjDesc, newProjStatus, newProjUrl);
        setCreatingVenture(false);

        if (result.success) {
            setIsVentureModalOpen(false);
            setNewProjName('');
            setNewProjSlug('');
            setNewProjDesc('');
            setNewProjUrl('');
            refreshData();
        } else {
            alert('Failed to register venture: ' + (result.error || 'Unknown error'));
        }
    };

    const handleTransmitSignal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customLogMsg.trim()) return;

        const result = await logCustomCortexEvent(
            customLogLevel as any,
            customLogMsg,
            'Operator Console',
            ['manual-event']
        );

        if (result.success) {
            setCustomLogMsg('');
            refreshData();
        } else {
            alert('Failed to transmit signal');
        }
    };

    // Simulated circuit breaker toggle
    const handleToggleProvider = async (providerId: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'online' || currentStatus === 'standby' ? 'tripped' : 'online';
        
        setProviders(prev => prev.map(p => {
            if (p.id === providerId) {
                return { ...p, status: nextStatus };
            }
            return p;
        }));

        // Log this simulation to Cortex
        await logCustomCortexEvent(
            nextStatus === 'tripped' ? 'WARN' : 'SUCCESS',
            `Operator manual override: ${providerId} circuit breaker set to ${nextStatus === 'tripped' ? 'OPEN (TRIPPED)' : 'CLOSED (ONLINE)'}`,
            'Circuit Breaker Manager',
            ['circuit-breaker', 'simulation']
        );
        refreshData();
    };

    // Calculations
    const verifiedTreesCount = treeLogs
        .filter(l => l.verification_status === 'verified')
        .reduce((sum, l) => sum + l.amount, 0);

    const pendingTreesCount = treeLogs
        .filter(l => l.verification_status === 'pending')
        .reduce((sum, l) => sum + l.amount, 0);

    const totalTreesCount = verifiedTreesCount + pendingTreesCount;

    const activeVenturesCount = projects.filter(p => p.status === 'active').length;

    // Chatbot Latency Stats
    const totalChats = chatbotLogs.length;
    const avgLatency = totalChats > 0
        ? Math.round(chatbotLogs.reduce((sum, c) => sum + (c.latency_ms || 0), 0) / totalChats)
        : 640;
    const chatbotSuccessRate = totalChats > 0
        ? Math.round((chatbotLogs.filter(c => c.success).length / totalChats) * 100)
        : 98;

    // AI Agents static status
    const agents = [
        { name: 'Antigravity', role: 'Chief Architect & DevOps', status: 'online', workload: '5%', badge: 'System Architect' },
        { name: 'Verdant', role: 'Product Manager & Strategist', status: 'active', workload: '15%', badge: 'MBA Strategy' },
        { name: 'Canopy', role: 'UI/UX Lead Designer', status: 'processing', workload: '28%', badge: 'Visual System' },
        { name: 'Root', role: 'Lead Full-Stack Engineer', status: 'online', workload: '10%', badge: 'React & DB Node' },
        { name: 'Bloom', role: 'Growth & Marketing Catalyst', status: 'idle', workload: '0%', badge: 'Audience SEO' },
        { name: 'Grove', role: 'Content Writer & SEO Spec', status: 'offline', workload: '0%', badge: 'Localization' },
        { name: 'Sentinel', role: 'QA & Cyber Security Lead', status: 'waiting', workload: '2%', badge: 'Auditing' }
    ];

    // Log streaming filter logic
    const filteredLogs = logs.filter(log => {
        const matchesLevel = logFilter === 'ALL' || log.level === logFilter;
        const matchesSearch = logSearch === '' || 
            log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
            log.source.toLowerCase().includes(logSearch.toLowerCase());
        return matchesLevel && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-emerald-500 font-mono">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <span className="text-xs uppercase tracking-widest">CONNECTING TO COCKPIT TELEMETRY...</span>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${isRtl ? 'font-vazir' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Header console */}
            <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-950/40">
                        <LayoutDashboard className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300 flex items-center gap-2">
                            <span>{t('title')}</span>
                            <span className="text-[10px] font-mono border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-widest bg-emerald-950/20">
                                root
                            </span>
                        </h1>
                        <p className="text-[10px] text-slate-500">{t('subtitle')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Navigation Options */}
                    <div className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800/60 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>{t('stats.sync_status')}: {t('chatbot.status_active')}</span>
                    </div>

                    <Link
                        href="/"
                        className="text-xs text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
                    >
                        {isRtl ? 'سایت اصلی' : 'Main Gate'}
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-900/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{tNav('logout')}</span>
                    </button>
                </div>
            </header>

            {/* Sidebar & Cockpit panel layout */}
            <div className="flex-1 flex flex-col md:flex-row">
                
                {/* Dashboard Tabs Sidebar */}
                <nav className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-900 p-4 space-y-2 bg-slate-950">
                    {[
                        { id: 'overview', icon: Cpu, label: t('tabs.overview') },
                        { id: 'chatbot', icon: AiIcon, label: t('tabs.chatbot') },
                        { id: 'crm', icon: UserCheck, label: t('tabs.crm') },
                        { id: 'trees', icon: Sprout, label: t('tabs.trees') },
                        { id: 'ventures', icon: Server, label: t('tabs.ventures') },
                        { id: 'logs', icon: Terminal, label: t('tabs.logs') }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                    active
                                        ? 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}

                    <div className="pt-8 hidden md:block">
                        <div className="border border-slate-900 bg-black/40 rounded-2xl p-4 text-[10px] text-slate-500 space-y-2">
                            <div className="font-mono uppercase text-slate-600 font-bold border-b border-slate-900 pb-1.5">
                                Diagnostics
                            </div>
                            <div className="flex justify-between">
                                <span>CPU Load</span>
                                <span className="font-bold text-slate-300">{cpuLoad}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${cpuLoad}%` }}></div>
                            </div>
                            <div className="flex justify-between">
                                <span>DB Nodes</span>
                                <span className="font-bold text-slate-300">5 / 5 OK</span>
                            </div>
                            <div className="flex justify-between">
                                <span>App Version</span>
                                <span className="font-bold text-emerald-500">v1.1.2</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Dashboard Content Container */}
                <main className="flex-1 bg-black p-6 overflow-y-auto space-y-6">
                    
                    {/* tab 1: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-fade-in">
                            
                            {/* Ecosystem Welcome bar */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950 border border-slate-900 p-6 rounded-3xl">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
                                        {isRtl ? 'خوش آمدید، مدیر ارشد' : 'Welcome back, Chief Architect'}
                                    </h2>
                                    <p className="text-slate-400 text-xs mt-1">
                                        {isRtl ? 'وضعیت سلامت سیستمی و عملکردهای زیست محیطی اکوسیستم هوشک' : 'Real-time telemetry and social impact indices for Hoshak Ecosystem'}
                                    </p>
                                </div>
                                <div className="text-[10px] font-mono bg-emerald-950/20 text-emerald-400 border border-emerald-500/25 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                                    <span>SYSTEM_ONLINE_HEALTH_99</span>
                                </div>
                            </div>

                            {/* Global statistics grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                
                                <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl space-y-2 relative overflow-hidden">
                                    <div className="absolute top-4 right-4 p-2 bg-emerald-950/40 text-emerald-400 rounded-xl border border-emerald-500/20">
                                        <Sprout className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-slate-500 block uppercase font-bold">{t('stats.total_palms')}</span>
                                    <div className="text-3xl font-black text-slate-100">{totalTreesCount}</div>
                                    <div className="text-[10px] text-slate-400 flex justify-between pt-2 border-t border-slate-900/60 font-mono">
                                        <span>{t('stats.verified_palms')}: <strong className="text-emerald-400">{verifiedTreesCount}</strong></span>
                                        <span>{t('stats.pending_palms')}: <strong className="text-amber-500">{pendingTreesCount}</strong></span>
                                    </div>
                                </div>

                                <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl space-y-2 relative overflow-hidden">
                                    <div className="absolute top-4 right-4 p-2 bg-purple-950/40 text-purple-400 rounded-xl border border-purple-500/20">
                                        <Server className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-slate-500 block uppercase font-bold">{t('stats.active_ventures')}</span>
                                    <div className="text-3xl font-black text-slate-100">{activeVenturesCount}</div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-900/60 font-mono">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                        <span>Total: {projects.length} Registered</span>
                                    </div>
                                </div>

                                <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl space-y-2 relative overflow-hidden">
                                    <div className="absolute top-4 right-4 p-2 bg-blue-950/40 text-blue-400 rounded-xl border border-blue-500/20">
                                        <UserCheck className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-slate-500 block uppercase font-bold">{t('stats.total_leads')}</span>
                                    <div className="text-3xl font-black text-slate-100">{leads.length}</div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-900/60 font-mono">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        <span>New: {leads.filter(l => l.status === 'new').length} | Won: {leads.filter(l => l.status === 'won').length}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl space-y-2 relative overflow-hidden">
                                    <div className="absolute top-4 right-4 p-2 bg-amber-950/40 text-amber-400 rounded-xl border border-amber-500/20">
                                        <AiIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-slate-500 block uppercase font-bold">{t('stats.chatbot_volume')}</span>
                                    <div className="text-3xl font-black text-slate-100">{totalChats}</div>
                                    <div className="text-[10px] text-slate-400 flex justify-between pt-2 border-t border-slate-900/60 font-mono">
                                        <span>{t('stats.average_latency')}: <strong className="text-amber-400">{avgLatency}ms</strong></span>
                                        <span>{t('stats.success_rate')}: <strong className="text-emerald-400">{chatbotSuccessRate}%</strong></span>
                                    </div>
                                </div>

                            </div>

                            {/* Sub-grid for AI Team status and main telemetry */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* AI Agents Console status */}
                                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 lg:col-span-2 space-y-4">
                                    <h3 className="font-black text-slate-100 text-sm flex items-center gap-2 border-b border-slate-900 pb-3">
                                        <Cpu className="w-4 h-4 text-emerald-500" />
                                        <span>{isRtl ? 'وضعیت زنده ایجنت‌های هوشمند' : 'AI Agent Team Operations Telemetry'}</span>
                                    </h3>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="text-slate-500 border-b border-slate-900/60">
                                                    <th className="pb-3 font-semibold uppercase">{isRtl ? 'نام ایجنت' : 'Agent Name'}</th>
                                                    <th className="pb-3 font-semibold uppercase">{isRtl ? 'وظیفه و رول' : 'Role'}</th>
                                                    <th className="pb-3 font-semibold uppercase">{isRtl ? 'تخصص کلیدی' : 'Expertise'}</th>
                                                    <th className="pb-3 font-semibold uppercase">{isRtl ? 'لود فعلی' : 'Workload'}</th>
                                                    <th className="pb-3 font-semibold uppercase text-right">{isRtl ? 'وضعیت فعالیت' : 'Status'}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {agents.map((agent) => (
                                                    <tr key={agent.name} className="border-b border-slate-900/40 last:border-0 hover:bg-slate-900/20">
                                                        <td className="py-3 font-bold text-slate-200">{agent.name}</td>
                                                        <td className="py-3 text-slate-400">{agent.role}</td>
                                                        <td className="py-3 text-[10px] text-emerald-400 font-mono">{agent.badge}</td>
                                                        <td className="py-3 font-mono text-slate-400">{agent.workload}</td>
                                                        <td className="py-3 text-right">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                                agent.status === 'online' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30' :
                                                                agent.status === 'active' || agent.status === 'processing' ? 'bg-blue-950/30 text-blue-400 border-blue-900/30' :
                                                                agent.status === 'idle' || agent.status === 'waiting' ? 'bg-slate-900 text-slate-400 border-slate-800' :
                                                                'bg-red-950/30 text-red-400 border-red-900/30'
                                                            }`}>
                                                                <span className={`w-1 h-1 rounded-full ${
                                                                    agent.status === 'online' ? 'bg-emerald-400 animate-ping' :
                                                                    agent.status === 'active' || agent.status === 'processing' ? 'bg-blue-400' : 'bg-slate-500'
                                                                }`}></span>
                                                                {agent.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* System health monitor card */}
                                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4">
                                    <h3 className="font-black text-slate-100 text-sm flex items-center gap-2 border-b border-slate-900 pb-3">
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                        <span>{isRtl ? 'سلامت پلتفرم و اتصالات سرور' : 'Platform Health & Network'}</span>
                                    </h3>
                                    
                                    <div className="space-y-4 font-mono text-xs">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-slate-400">
                                                <span>DATABASE CONN</span>
                                                <span className="text-emerald-400 font-bold">100% SECURE</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-slate-400">
                                                <span>API GATEWAY LATENCY</span>
                                                <span className="text-slate-300">42ms</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: '92%' }}></div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-slate-400">
                                                <span>CORTEX ENGINE BUFFER</span>
                                                <span className="text-amber-500">22% / 100%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-500" style={{ width: '22%' }}></div>
                                            </div>
                                        </div>

                                        <div className="pt-4 space-y-2 border-t border-slate-900/60 text-[10px] text-slate-500">
                                            <div className="flex justify-between">
                                                <span>SSL CERTIFICATE</span>
                                                <span className="text-emerald-400">VALID (320d remaining)</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>PRIMARY CLUSTER</span>
                                                <span className="text-slate-300">COOLIFY VPS // TEHRAN</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>BACKUP SHADOW</span>
                                                <span className="text-slate-300">SUPABASE CLOUD // FRANKFURT</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* tab 2: CRM LEADS */}
                    {activeTab === 'crm' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center bg-slate-950 border border-slate-900 px-6 py-4 rounded-3xl">
                                <div>
                                    <h2 className="text-lg font-black text-slate-100">{t('crm.title')}</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">{isRtl ? 'لیدهای تجاری جذب‌شده از چت‌بات‌ها و وب‌سایت‌ساز آیناب' : 'B2B client leads captured via conversational AI and RAG agents'}</p>
                                </div>
                                <span className="font-mono text-xs text-blue-400 border border-blue-900/40 bg-blue-950/20 px-3 py-1.5 rounded-lg">
                                    {leads.length} LEADS FOUND
                                </span>
                            </div>

                            <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-900/40 text-slate-500 border-b border-slate-900">
                                                <th className="p-4 font-semibold uppercase">{t('crm.name')}</th>
                                                <th className="p-4 font-semibold uppercase">{t('crm.company')}</th>
                                                <th className="p-4 font-semibold uppercase">{t('crm.contact')}</th>
                                                <th className="p-4 font-semibold uppercase">{t('crm.interest')}</th>
                                                <th className="p-4 font-semibold uppercase">{t('crm.score')}</th>
                                                <th className="p-4 font-semibold uppercase">{t('crm.status')}</th>
                                                <th className="p-4 font-semibold uppercase text-right">{t('crm.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leads.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                                                        {t('crm.no_leads')}
                                                    </td>
                                                </tr>
                                            ) : (
                                                leads.map((lead) => {
                                                    // Score coloring
                                                    const score = lead.score || 0;
                                                    let scoreBadge = 'border-slate-800 text-slate-400 bg-slate-900';
                                                    if (score >= 80) scoreBadge = 'border-amber-500/30 text-amber-400 bg-amber-950/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]';
                                                    else if (score >= 50) scoreBadge = 'border-blue-500/30 text-blue-400 bg-blue-950/20';

                                                    // Status labels
                                                    const statusMap: Record<string, string> = {
                                                        new: t('crm.status_new'),
                                                        contacted: t('crm.status_contacted'),
                                                        qualified: t('crm.status_qualified'),
                                                        proposal: t('crm.status_proposal'),
                                                        won: t('crm.status_won'),
                                                        lost: t('crm.status_lost')
                                                    };

                                                    return (
                                                        <tr key={lead.id} className="border-b border-slate-900 hover:bg-slate-900/20 transition-colors">
                                                            <td className="p-4 font-bold text-slate-200">{lead.name}</td>
                                                            <td className="p-4 text-slate-400">{lead.company || '—'}</td>
                                                            <td className="p-4 font-mono text-slate-400">
                                                                <div>{lead.phone || '—'}</div>
                                                                <div className="text-[10px] text-slate-600">{lead.email || ''}</div>
                                                            </td>
                                                            <td className="p-4 text-slate-400">{lead.service_interest || '—'}</td>
                                                            <td className="p-4">
                                                                <span className={`inline-flex px-2 py-0.5 border rounded-md font-mono font-bold text-[10px] ${scoreBadge}`}>
                                                                    {score}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                                    lead.status === 'won' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' :
                                                                    lead.status === 'lost' ? 'bg-red-950/40 text-red-400 border-red-900/30' :
                                                                    lead.status === 'new' ? 'bg-blue-950/40 text-blue-400 border-blue-900/30 animate-pulse' :
                                                                    'bg-slate-900 text-slate-400 border-slate-800'
                                                                }`}>
                                                                    {statusMap[lead.status] || lead.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedLead(lead);
                                                                        setLeadStatus(lead.status);
                                                                        setLeadNotes(lead.notes || '');
                                                                    }}
                                                                    className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 hover:text-emerald-400 transition-all cursor-pointer"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Edit Lead Modal Form */}
                            {selectedLead && (
                                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                                    <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 relative">
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                                        
                                        <div className="space-y-1">
                                            <h3 className="font-black text-slate-100 text-base">{t('crm.edit_lead')}</h3>
                                            <p className="text-slate-500 text-[10px]">{selectedLead.name} {selectedLead.company ? `(${selectedLead.company})` : ''}</p>
                                        </div>

                                        <form onSubmit={handleUpdateLead} className="space-y-4 text-xs">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('crm.status')}</label>
                                                <select
                                                    value={leadStatus}
                                                    onChange={(e) => setLeadStatus(e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3 px-4 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                >
                                                    <option value="new">{t('crm.status_new')}</option>
                                                    <option value="contacted">{t('crm.status_contacted')}</option>
                                                    <option value="qualified">{t('crm.status_qualified')}</option>
                                                    <option value="proposal">{t('crm.status_proposal')}</option>
                                                    <option value="won">{t('crm.status_won')}</option>
                                                    <option value="lost">{t('crm.status_lost')}</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('crm.notes')}</label>
                                                <textarea
                                                    value={leadNotes}
                                                    onChange={(e) => setLeadNotes(e.target.value)}
                                                    rows={4}
                                                    placeholder="Enter internal CRM comments..."
                                                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3 px-4 focus:ring-1 focus:ring-emerald-500 outline-none resize-none font-mono"
                                                />
                                            </div>

                                            {selectedLead.message && (
                                                <div className="bg-black/40 border border-slate-900/60 p-4 rounded-xl space-y-1">
                                                    <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold font-mono">Original Inquiry Message:</span>
                                                    <p className="text-slate-400 font-mono text-[11px] leading-relaxed">{selectedLead.message}</p>
                                                </div>
                                            )}

                                            <div className="flex gap-3 pt-4 justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedLead(null)}
                                                    className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl font-bold cursor-pointer"
                                                >
                                                    {t('crm.cancel_btn')}
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={updatingLead}
                                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                                >
                                                    {updatingLead && <Loader2 className="w-4 h-4 animate-spin" />}
                                                    <span>{t('crm.save_btn')}</span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* tab 3: TREES LOG */}
                    {activeTab === 'trees' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center bg-slate-950 border border-slate-900 px-6 py-4 rounded-3xl">
                                <div>
                                    <h2 className="text-lg font-black text-slate-100">{t('trees.title')}</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">{isRtl ? 'ثبت و تایید کاشت نخلستان معنا در استان بوشهر و خوزستان' : 'Approve and monitor date palm planting commitments in Bushehr/Khuzestan'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-mono text-xs text-emerald-400 border border-emerald-900/40 bg-emerald-950/20 px-3 py-1.5 rounded-lg">
                                        {verifiedTreesCount} PLANTED
                                    </span>
                                    <span className="font-mono text-xs text-amber-400 border border-amber-900/40 bg-amber-950/20 px-3 py-1.5 rounded-lg">
                                        {pendingTreesCount} PENDING
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-900/40 text-slate-500 border-b border-slate-900">
                                                <th className="p-4 font-semibold uppercase">{t('trees.benefactor')}</th>
                                                <th className="p-4 font-semibold uppercase">{t('trees.amount')}</th>
                                                <th className="p-4 font-semibold uppercase">{t('trees.location')}</th>
                                                <th className="p-4 font-semibold uppercase">{t('trees.date')}</th>
                                                <th className="p-4 font-semibold uppercase">{t('trees.status')}</th>
                                                <th className="p-4 font-semibold uppercase text-right">{isRtl ? 'عملیات' : 'Actions'}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {treeLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                                                        {t('trees.no_logs')}
                                                    </td>
                                                </tr>
                                            ) : (
                                                treeLogs.map((log) => (
                                                    <tr key={log.id} className="border-b border-slate-900 hover:bg-slate-900/20 transition-colors">
                                                        <td className="p-4 font-bold text-slate-200">{log.benefactor_name || 'Anonymous'}</td>
                                                        <td className="p-4 font-mono font-bold text-emerald-400 text-sm">+{log.amount}</td>
                                                        <td className="p-4 text-slate-400">{log.location || 'Bushehr'}</td>
                                                        <td className="p-4 font-mono text-slate-400">
                                                            {new Date(log.planted_at).toLocaleDateString('fa-IR')}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                                log.verification_status === 'verified'
                                                                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                                                                    : 'bg-amber-950/40 text-amber-400 border-amber-900/30 animate-pulse'
                                                            }`}>
                                                                {log.verification_status === 'verified' ? t('trees.verified') : t('trees.pending')}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {log.verification_status === 'pending' ? (
                                                                <button
                                                                    onClick={() => handleVerifyTree(log.id)}
                                                                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold border border-emerald-600/20 flex items-center gap-1 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                                                >
                                                                    <Sprout className="w-3.5 h-3.5" />
                                                                    <span>{t('trees.verify_btn')}</span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-600 font-mono flex items-center justify-end gap-1 font-bold">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                                    <span>VERIFIED</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* tab 4: CHATBOT MONITORING */}
                    {activeTab === 'chatbot' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center bg-slate-950 border border-slate-900 px-6 py-4 rounded-3xl">
                                <div>
                                    <h2 className="text-lg font-black text-slate-100">{t('chatbot.title')}</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">{isRtl ? 'پایش زنده اتصالات هوش مصنوعی، دامنه‌ها و سرعت پاسخ‌دهی' : 'Monitor LLM Provider priority, latencies, and circuit breaker status'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-mono text-xs text-emerald-400 border border-emerald-900/30 bg-emerald-950/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                        Latency: {avgLatency}ms
                                    </span>
                                    <span className="font-mono text-xs text-blue-400 border border-blue-900/30 bg-blue-950/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                        Success Rate: {chatbotSuccessRate}%
                                    </span>
                                </div>
                            </div>

                            {/* Providers Status & Outage Simulator */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 lg:col-span-2 space-y-4">
                                    <h3 className="font-bold text-slate-200 text-xs border-b border-slate-900 pb-3">
                                        {t('chatbot.provider_status')}
                                    </h3>

                                    <div className="space-y-3">
                                        {providers.map((p) => (
                                            <div key={p.id} className="flex justify-between items-center p-3 rounded-2xl bg-black/40 border border-slate-900 font-mono text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500 font-bold">#{p.priority}</span>
                                                    <span className="text-slate-200 font-semibold">{p.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        p.status === 'online' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' :
                                                        p.status === 'standby' ? 'bg-blue-950/40 text-blue-400 border-blue-900/30' :
                                                        'bg-red-950/40 text-red-400 border-red-900/30 animate-pulse'
                                                    }`}>
                                                        {p.status === 'online' ? t('chatbot.status_active') :
                                                         p.status === 'standby' ? t('chatbot.status_standby') :
                                                         t('chatbot.status_tripped')}
                                                    </span>

                                                    <button
                                                        onClick={() => handleToggleProvider(p.id, p.status)}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                                            p.status === 'tripped'
                                                                ? 'bg-emerald-950 text-emerald-400 border-emerald-900 hover:bg-emerald-900 hover:text-white'
                                                                : 'bg-red-950 text-red-400 border-red-900 hover:bg-red-900 hover:text-white'
                                                        }`}
                                                    >
                                                        {p.status === 'tripped' ? t('chatbot.restore') : t('chatbot.simulate')}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-3 text-xs">
                                    <h3 className="font-bold text-slate-200 text-xs border-b border-slate-900 pb-3 flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-emerald-500" />
                                        <span>RAG Routing Topology</span>
                                    </h3>
                                    
                                    <div className="space-y-4 font-mono text-[10px] text-slate-400 leading-relaxed">
                                        <p>
                                            Each request goes through a priority-chain fallback circuit. If priority 1 fails or encounters a timeout, the Circuit Breaker trips and switches to domestic mirrors.
                                        </p>
                                        <div className="p-3 bg-black/40 border border-slate-900 rounded-xl space-y-1.5">
                                            <div className="flex justify-between">
                                                <span>Active Provider:</span>
                                                <span className="text-emerald-400 font-bold">
                                                    {providers.find(p => p.status === 'online')?.id || 'fallback-rules'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Switch latency:</span>
                                                <span className="text-slate-300">220ms</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Rules status:</span>
                                                <span className="text-emerald-400">LOADED</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Recent queries logs terminal */}
                            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4">
                                <h3 className="font-bold text-slate-200 text-xs border-b border-slate-900 pb-3 flex items-center gap-1.5">
                                    <Terminal className="w-4 h-4 text-blue-400" />
                                    <span>{t('chatbot.recent_queries')}</span>
                                </h3>

                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                    {chatbotLogs.length === 0 ? (
                                        <div className="text-slate-500 text-xs italic p-4 text-center">No queries logged yet.</div>
                                    ) : (
                                        chatbotLogs.map((chat) => (
                                            <div key={chat.id} className="p-3 rounded-2xl bg-black/40 border border-slate-900 flex flex-col md:flex-row justify-between gap-3 text-xs">
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[10px] text-slate-500">
                                                            {new Date(chat.created_at).toLocaleTimeString('fa-IR')}
                                                        </span>
                                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                                            chat.success ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                                                        }`}>
                                                            {chat.success ? 'SUCCESS' : 'ERROR'}
                                                        </span>
                                                        <span className="text-slate-500 font-mono text-[10px] bg-slate-900 px-2 rounded border border-slate-800">
                                                            {chat.provider}
                                                        </span>
                                                        <span className="text-slate-500 font-mono text-[10px]">
                                                            {chat.latency_ms}ms
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <strong className="text-slate-300 font-bold block">Q: {chat.user_query}</strong>
                                                        <span className="text-slate-400 block mt-1">A: {chat.ai_response}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* tab 5: VENTURES */}
                    {activeTab === 'ventures' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center bg-slate-950 border border-slate-900 px-6 py-4 rounded-3xl">
                                <div>
                                    <h2 className="text-lg font-black text-slate-100">{t('ventures.title')}</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">{isRtl ? 'پورتفوی پروژه‌های تحت هدایت هلدینگ هوشک' : 'Portfolio of projects under the Hoshak holding group'}</p>
                                </div>
                                <button
                                    onClick={() => setIsVentureModalOpen(true)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-950/30"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>{t('ventures.add_btn')}</span>
                                </button>
                            </div>

                            {/* Ventures Cards list */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((proj) => (
                                    <div key={proj.id} className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4 hover:border-slate-800 transition-all flex flex-col relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-emerald-700 opacity-0 group-hover:opacity-40 transition-opacity"></div>
                                        
                                        <div className="flex justify-between items-start">
                                            <span className="text-[9px] font-mono border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                {proj.status}
                                            </span>
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="font-black text-slate-100 text-base group-hover:text-emerald-400 transition-colors uppercase">
                                                {proj.name}
                                            </h3>
                                            <span className="text-[10px] text-slate-600 font-mono block">slug: {proj.slug}</span>
                                        </div>

                                        <p className="text-slate-400 text-xs min-h-[48px] leading-relaxed">
                                            {proj.description || 'No strategic description provided.'}
                                        </p>

                                        <div className="pt-4 border-t border-slate-900/60 flex items-center justify-between text-xs">
                                            {proj.website_url ? (
                                                <a
                                                    href={proj.website_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-emerald-500 hover:text-emerald-400 font-mono font-bold flex items-center gap-1"
                                                >
                                                    <span>Open Link</span>
                                                    <Globe className="w-3.5 h-3.5" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-600 italic">No URL linked</span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {projects.length === 0 && (
                                    <div className="col-span-full border-2 border-dashed border-slate-900 bg-slate-950/20 p-8 rounded-3xl text-center text-slate-500 italic">
                                        {t('ventures.no_projects')}
                                    </div>
                                )}
                            </div>

                            {/* Add Venture Modal */}
                            {isVentureModalOpen && (
                                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                                    <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 relative">
                                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                                        
                                        <div>
                                            <h3 className="font-black text-slate-100 text-base">{t('ventures.add_btn')}</h3>
                                            <p className="text-slate-500 text-[10px] mt-0.5">Register a new business venture into Hoshak Ecosystem DB.</p>
                                        </div>

                                        <form onSubmit={handleAddVenture} className="space-y-4 text-xs">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('ventures.name')}</label>
                                                    <input
                                                        type="text"
                                                        value={newProjName}
                                                        onChange={(e) => setNewProjName(e.target.value)}
                                                        placeholder="e.g. ManaPalm Portal"
                                                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3 px-4 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('ventures.slug')}</label>
                                                    <input
                                                        type="text"
                                                        value={newProjSlug}
                                                        onChange={(e) => setNewProjSlug(e.target.value)}
                                                        placeholder="e.g. manapalm"
                                                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3 px-4 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('ventures.desc')}</label>
                                                <textarea
                                                    value={newProjDesc}
                                                    onChange={(e) => setNewProjDesc(e.target.value)}
                                                    rows={3}
                                                    placeholder="Strategic purpose, social palm ties..."
                                                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3 px-4 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('ventures.status')}</label>
                                                    <select
                                                        value={newProjStatus}
                                                        onChange={(e) => setNewProjStatus(e.target.value)}
                                                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3 px-4 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    >
                                                        <option value="active">{t('ventures.status_active')}</option>
                                                        <option value="development">{t('ventures.status_development')}</option>
                                                        <option value="planning">{t('ventures.status_planning')}</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('ventures.url')}</label>
                                                    <input
                                                        type="url"
                                                        value={newProjUrl}
                                                        onChange={(e) => setNewProjUrl(e.target.value)}
                                                        placeholder="https://..."
                                                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3 px-4 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-4 justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsVentureModalOpen(false)}
                                                    className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl font-bold cursor-pointer"
                                                >
                                                    {t('crm.cancel_btn')}
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={creatingVenture}
                                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                                >
                                                    {creatingVenture && <Loader2 className="w-4 h-4 animate-spin" />}
                                                    <span>{t('ventures.save_btn')}</span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* tab 6: CORTEX TERMINAL STREAM */}
                    {activeTab === 'logs' && (
                        <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-140px)]">
                            
                            {/* Terminal Console toolbar */}
                            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-950 border border-slate-900 p-4 rounded-3xl shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                                        <Terminal className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-slate-100">{t('logs.title')}</h2>
                                        <p className="text-[10px] text-slate-500">{t('logs.subtitle')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={logSearch}
                                            onChange={(e) => setLogSearch(e.target.value)}
                                            placeholder="Grep messages..."
                                            className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 font-mono text-[10px] text-slate-200 outline-none w-40 focus:border-emerald-500/40"
                                        />
                                    </div>

                                    <select
                                        value={logFilter}
                                        onChange={(e) => setLogFilter(e.target.value)}
                                        className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 font-mono text-[10px] text-slate-300 outline-none cursor-pointer focus:border-emerald-500/40"
                                    >
                                        <option value="ALL">{t('logs.filter_all')}</option>
                                        <option value="INFO">INFO</option>
                                        <option value="SUCCESS">SUCCESS</option>
                                        <option value="WARN">WARN</option>
                                        <option value="ERROR">ERROR</option>
                                        <option value="AI_ACTION">AI_ACTION</option>
                                    </select>
                                </div>
                            </div>

                            {/* Core Unix Terminal Stream */}
                            <div className="flex-1 bg-black border border-slate-900 rounded-3xl p-4 font-mono text-xs flex flex-col overflow-hidden shadow-inner relative">
                                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3 text-[10px] text-slate-600 shrink-0">
                                    <span>root@hoshak-cortex:~# tail -f /var/log/cortex_memory.log</span>
                                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> STREAM ACTIVE</span>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar flex flex-col-reverse">
                                    <div className="space-y-2.5">
                                        {filteredLogs.length === 0 ? (
                                            <div className="text-slate-600 italic p-4 text-center">{t('logs.empty')}</div>
                                        ) : (
                                            filteredLogs.map((log) => {
                                                let lvlColor = 'bg-slate-900 text-slate-400 border-slate-800';
                                                if (log.level === 'SUCCESS') lvlColor = 'bg-emerald-950/60 text-emerald-400 border-emerald-900/30';
                                                else if (log.level === 'ERROR') lvlColor = 'bg-red-950/60 text-red-400 border-red-900/30';
                                                else if (log.level === 'WARN') lvlColor = 'bg-amber-950/60 text-amber-400 border-amber-900/30';
                                                else if (log.level === 'AI_ACTION') lvlColor = 'bg-purple-950/60 text-purple-400 border-purple-900/30';

                                                return (
                                                    <div key={log.id} className="flex gap-4 p-2 rounded-lg border border-slate-950 hover:bg-slate-950/40 hover:border-slate-900/40 transition-colors">
                                                        <span className="text-[10px] text-slate-600 shrink-0 pt-0.5 w-18">
                                                            {new Date(log.timestamp).toLocaleTimeString('fa-IR')}
                                                        </span>
                                                        <div className="space-y-1 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded ${lvlColor}`}>
                                                                    {log.level}
                                                                </span>
                                                                <span className="text-slate-500 text-[10px] font-semibold">[{log.source}]</span>
                                                            </div>
                                                            <p className="text-slate-300 text-[11px] leading-relaxed break-words">{log.message}</p>
                                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                                <pre className="text-[9px] text-slate-500 overflow-x-auto bg-slate-950/50 p-2 rounded-lg border border-slate-900/60 mt-1 max-w-full">
                                                                    {JSON.stringify(log.metadata, null, 2)}
                                                                </pre>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Manual log event transmitter input */}
                            <form onSubmit={handleTransmitSignal} className="flex items-center gap-3 bg-slate-950 border border-slate-900 p-3 rounded-3xl shrink-0">
                                <select
                                    value={customLogLevel}
                                    onChange={(e) => setCustomLogLevel(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 font-mono text-[10px] text-slate-300 outline-none cursor-pointer focus:border-emerald-500/40"
                                >
                                    <option value="INFO">INFO</option>
                                    <option value="SUCCESS">SUCCESS</option>
                                    <option value="WARN">WARN</option>
                                    <option value="ERROR">ERROR</option>
                                    <option value="AI_ACTION">AI_ACTION</option>
                                </select>

                                <input
                                    type="text"
                                    value={customLogMsg}
                                    onChange={(e) => setCustomLogMsg(e.target.value)}
                                    placeholder={t('logs.placeholder')}
                                    className="flex-grow bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 font-mono text-xs text-slate-200 outline-none focus:border-emerald-500/40"
                                    required
                                />

                                <button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-xs shrink-0 shadow-lg shadow-emerald-950/25"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{t('logs.transmit_btn')}</span>
                                </button>
                            </form>

                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}
