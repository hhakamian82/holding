'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState, use } from 'react';
import { getProjects, getGlobalStats, Project } from '@/lib/data-actions';
import { cortex, SystemLog } from '@/lib/cortex';
import {
    LayoutDashboard,
    Sprout,
    Activity,
    Server,
    Cpu,
    Globe,
    ArrowRight,
    Loader2,
    Terminal
} from "lucide-react";

export default function HubPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('Hub');
    const tNav = useTranslations('Navigation');
    const isRtl = locale === 'fa';

    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState({ total: 0, count: 0 });
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initHub() {
            const [projs, globalStats, recentLogs] = await Promise.all([
                getProjects(),
                getGlobalStats(),
                cortex.getRecentLogs()
            ]);
            setProjects(projs);
            setStats(globalStats);
            setLogs(recentLogs);
            setLoading(false);
        }
        initHub();

        // Auto-refresh logs every 10 seconds
        const interval = setInterval(async () => {
            const recentLogs = await cortex.getRecentLogs();
            setLogs(recentLogs);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const agents = [
        { name: 'Antigravity', role: 'Chief Architect & DevOps', status: 'online', expertise: 'System Architecture, CI/CD' },
        { name: 'Verdant', role: 'Business Strategist & PM', status: 'active', expertise: 'Harvard/McKinsey Strategy, User Stories' },
        { name: 'Canopy', role: 'Head of Design (UI/UX)', status: 'processing', expertise: 'Wireframing, Design Systems' },
        { name: 'Root', role: 'Lead Full-Stack Engineer', status: 'online', expertise: 'React, Node, DB Schema' },
        { name: 'Bloom', role: 'Growth & Digital Marketing', status: 'idle', expertise: 'Campaigns, Market Analysis' },
        { name: 'Grove', role: 'Content & SEO Specialist', status: 'offline', expertise: 'Copywriting, Impact Reporting' },
        { name: 'Sentinel', role: 'QA & Security Lead', status: 'waiting', expertise: 'Testing, Security Audits' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-palm-50 dark:bg-palm-950">
                <Loader2 className="w-12 h-12 text-palm-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-palm-50 dark:bg-palm-950 text-palm-900 dark:text-palm-50 font-sans ${isRtl ? 'font-vazir' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>

            <header className="bg-white/50 dark:bg-palm-900/50 backdrop-blur-md border-b border-palm-200 dark:border-palm-800 p-4 sticky top-0 z-40">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 text-palm-600" />
                        <span className="font-bold text-lg">{t('title')}</span>
                    </div>
                    <Link href="/" className="text-sm hover:text-palm-600 transition-colors flex items-center gap-1 font-medium">
                        <Globe className="w-4 h-4" /> {tNav('services')}
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-10 space-y-12">

                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{t('welcome')}</h1>
                            <p className="text-palm-600 dark:text-palm-400">{t('description')}</p>
                        </div>
                        <div className="text-sm text-palm-500 font-mono bg-palm-100 dark:bg-palm-900 px-3 py-1 rounded-md">
                            System: v0.1.0-alpha
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-palm-900 p-6 rounded-2xl shadow-sm border border-palm-100 dark:border-palm-800">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-palm-500">{t('globalStats')} - Trees</span>
                                <Sprout className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="text-3xl font-bold">{stats.total.toLocaleString()}</div>
                            <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                Database Sync: Active
                            </div>
                        </div>
                        <div className="bg-white dark:bg-palm-900 p-6 rounded-2xl shadow-sm border border-palm-100 dark:border-palm-800">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-palm-500">{t('agentStatus')}</span>
                                <Cpu className="w-5 h-5 text-gold-500" />
                            </div>
                            <div className="text-3xl font-bold">5/13</div>
                            <div className="text-xs text-palm-400 mt-2">Active Agents</div>
                        </div>
                        <div className="bg-white dark:bg-palm-900 p-6 rounded-2xl shadow-sm border border-palm-100 dark:border-palm-800 md:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-palm-500">System Health</span>
                                <Activity className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold uppercase text-palm-400">
                                    <span>Server Load</span>
                                    <span>12%</span>
                                </div>
                                <div className="h-2 w-full bg-palm-100 dark:bg-palm-800 rounded-full overflow-hidden relative">
                                    <div className="h-full bg-blue-500 w-[12%] absolute top-0 left-0 rounded-full"></div>
                                </div>
                                <div className="text-xs text-right text-green-600 font-medium pt-1">All Systems Operational</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Server className="w-5 h-5" /> {t('projects')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((proj) => (
                            <div key={proj.id} className="group bg-white dark:bg-palm-900 rounded-2xl border border-palm-200 dark:border-palm-700 hover:border-palm-400 transition-all overflow-hidden relative shadow-sm hover:shadow-md">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-3 h-3 rounded-full ${proj.status === 'active' ? 'bg-green-500 animate-pulse' : proj.status === 'planning' ? 'bg-purple-500' : 'bg-yellow-500'}`}></div>
                                        <span className="text-[10px] font-mono font-bold tracking-wider text-palm-400 uppercase border border-palm-100 dark:border-palm-800 px-2 py-0.5 rounded-md">{proj.status}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-gold-600 transition-colors uppercase">{proj.name}</h3>
                                    <p className="text-sm text-palm-500 dark:text-palm-400 mb-6 min-h-[40px] leading-relaxed">{proj.description}</p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-1 text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                                            <Sprout className="w-4 h-4" /> Impact Verified
                                        </div>
                                        <Link href={proj.slug === 'holdin' ? '/' : '#'} className="p-2 rounded-full bg-palm-50 dark:bg-palm-800 hover:bg-gold-500 hover:text-white transition-all transform group-hover:rotate-[-45deg]">
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-gradient-to-r from-palm-400 to-gold-400 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-0 left-0"></div>
                            </div>
                        ))}

                        <button className="group border-2 border-dashed border-palm-200 dark:border-palm-700 rounded-2xl p-6 flex flex-col items-center justify-center text-palm-400 hover:text-palm-600 hover:border-palm-400 hover:bg-palm-50 dark:hover:bg-palm-800/50 transition-all h-full min-h-[200px]">
                            <div className="w-12 h-12 rounded-full bg-palm-50 dark:bg-palm-900 group-hover:scale-110 transition-transform flex items-center justify-center mb-3">
                                <span className="text-2xl font-light text-palm-400 group-hover:text-gold-500">+</span>
                            </div>
                            <span className="font-medium">New Venture</span>
                        </button>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Cpu className="w-5 h-5" /> {t('agentStatus')}
                    </h2>
                    <div className="bg-white dark:bg-palm-900 rounded-2xl border border-palm-200 dark:border-palm-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-palm-50 dark:bg-palm-950 text-palm-500 border-b border-palm-100 dark:border-palm-800">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider">Agent Name</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider">Expertise</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agents.map((agent) => (
                                        <tr key={agent.name} className="border-b border-palm-50 dark:border-palm-800 last:border-0 hover:bg-palm-50/50 dark:hover:bg-palm-800/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-palm-800 dark:text-palm-200">{agent.name}</td>
                                            <td className="px-6 py-4 text-palm-500 font-medium">{agent.role}</td>
                                            <td className="px-6 py-4 text-xs text-palm-400 font-mono">{agent.expertise}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${agent.status === 'online' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                                                        agent.status === 'processing' || agent.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                                            'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${agent.status === 'online' ? 'bg-green-500' : agent.status === 'processing' || agent.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                                                    {agent.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-xs font-medium text-palm-400 hover:text-gold-500 transition-colors bg-palm-50 dark:bg-palm-800 px-3 py-1 rounded-md">Config</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* CORTEX MEMORY TERMINAL */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Terminal className="w-5 h-5" /> Cortex Memory Stream
                    </h2>
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 shadow-xl overflow-hidden font-mono text-sm h-96 flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2 text-xs text-gray-500">
                            <span>root@holdin-hub:~# tail -f /var/log/cortex.log</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> LIVE</span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {logs.length === 0 ? (
                                <div className="text-gray-500 italic p-4">Waiting for incoming signals...</div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="flex gap-3 hover:bg-white/5 p-1.5 rounded transition-colors group">
                                        <span className="text-gray-500 text-xs shrink-0 w-20 pt-0.5">
                                            {new Date(log.timestamp).toLocaleTimeString('fa-IR')}
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={`text-[10px] font-bold px-1.5 rounded 
                                        ${log.level === 'SUCCESS' ? 'bg-green-900 text-green-400' :
                                                        log.level === 'ERROR' ? 'bg-red-900 text-red-400' :
                                                            log.level === 'WARN' ? 'bg-yellow-900 text-yellow-400' :
                                                                'bg-blue-900 text-blue-400'}`}>
                                                    {log.level}
                                                </span>
                                                <span className="text-gray-400 text-xs">[{log.source}]</span>
                                            </div>
                                            <p className="text-gray-300">{log.message}</p>
                                            {log.metadata && (
                                                <pre className="mt-1 text-[10px] text-gray-500 overflow-x-auto">
                                                    {JSON.stringify(log.metadata)}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
