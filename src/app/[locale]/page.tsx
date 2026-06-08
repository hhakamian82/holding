'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { useState, useEffect, use } from 'react';
import { loginAction, checkAuth } from '@/app/actions/auth';
import { Terminal, Lock, Shield, Cpu, Database, Eye, EyeOff, Loader2, Globe2 } from "lucide-react";

export default function EntrancePortal({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('SecurePortal');
    const tNav = useTranslations('Navigation');
    const router = useRouter();
    const pathname = usePathname();

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAuthed, setIsAuthed] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Simulated diagnostics telemetry
    const [memoryUsage, setMemoryUsage] = useState(128);
    const [cpuLoad, setCpuLoad] = useState(8);
    const [activeNodes, setActiveNodes] = useState(5);

    useEffect(() => {
        // Check if user is already authenticated
        checkAuth().then(authed => {
            setIsAuthed(authed);
            setCheckingAuth(false);
        });

        // Telemetry simulations
        const interval = setInterval(() => {
            setMemoryUsage(prev => Math.min(512, Math.max(90, Math.floor(prev + (Math.random() * 10 - 5)))));
            setCpuLoad(prev => Math.min(100, Math.max(3, Math.floor(prev + (Math.random() * 6 - 3)))));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('password', password);

        const result = await loginAction(formData);

        if (result.success) {
            router.push('/hub');
        } else {
            setError(t('invalid_code'));
            setPassword('');
            setLoading(false);
            // Shake effect trigger
            const card = document.getElementById('auth-card');
            if (card) {
                card.classList.add('animate-shake');
                setTimeout(() => card.classList.remove('animate-shake'), 500);
            }
        }
    };

    const isRtl = locale === 'fa';

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-radial from-slate-900 to-black text-emerald-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <span className="font-mono text-sm tracking-widest">BOOTING CORTEX SYSTEM...</span>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-black text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono ${isRtl ? 'font-vazir' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Background Grid & Matrix Glow */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#14532d15_1px,transparent_1px),linear-gradient(to_bottom,#14532d15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header / Language Switcher */}
            <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <div className="flex items-center gap-2 text-emerald-500">
                    <Shield className="w-5 h-5 animate-pulse" />
                    <span className="text-xs uppercase tracking-widest font-bold">Hoshak Secure Core</span>
                </div>
                <Link
                    href={pathname}
                    locale={locale === 'en' ? 'fa' : 'en'}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 px-3 py-1.5 rounded-full transition-all bg-slate-950/50 backdrop-blur-sm"
                >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>{locale === 'en' ? 'فارسی' : 'English'}</span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-lg z-10 space-y-6">
                {/* Title branding */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] mb-2">
                        <Terminal className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 tracking-wider">
                        {t('title')}
                    </h1>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Secure Card Container */}
                <div
                    id="auth-card"
                    className="bg-slate-950/80 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-emerald-500/20"
                >
                    {/* Security laser scanner line */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-40 animate-pulse"></div>

                    {isAuthed ? (
                        <div className="space-y-6 py-4 text-center">
                            <div className="flex justify-center">
                                <span className="relative flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                                </span>
                            </div>
                            <p className="text-xs text-emerald-400 font-bold tracking-widest uppercase">
                                CORTEX_SESSION_VALID
                            </p>
                            <Link
                                href="/hub"
                                className="inline-flex w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.5)] justify-center items-center gap-2"
                            >
                                <span>{t('bypass')}</span>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest block">
                                    {isRtl ? 'کد رمزگذاری کورتکس' : 'CORTEX ENCRYPTION CODE'}
                                </label>
                                <div className="relative">
                                    <span className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500`}>
                                        <Lock className="w-5 h-5" />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`w-full bg-black border border-slate-800 focus:border-emerald-500/50 text-slate-200 rounded-xl py-4 ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'} outline-none transition-all placeholder:text-slate-700 text-sm font-mono tracking-widest focus:ring-1 focus:ring-emerald-500/20`}
                                        placeholder={t('placeholder')}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors`}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-400 text-xs text-center border border-red-950 bg-red-950/20 py-3 rounded-lg animate-pulse flex items-center justify-center gap-2">
                                    <span>⚠</span>
                                    <span>{error.toUpperCase()}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !password.trim()}
                                className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-600 disabled:border-slate-800 border border-emerald-600/20 hover:border-emerald-500/40 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-[0_4px_15px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        <span>{t('verifying').toUpperCase()}</span>
                                    </>
                                ) : (
                                    <span>{t('authenticate').toUpperCase()}</span>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Telemetry Diagnostics Grid */}
                <div className="bg-slate-950/50 border border-slate-900/60 rounded-3xl p-5 space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs border-b border-slate-900 pb-2">
                        <Cpu className="w-4 h-4 text-emerald-500" />
                        <span>{t('diagnostics.title')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400">
                        <div className="space-y-1 p-2 bg-black/40 rounded-lg border border-slate-900">
                            <span className="text-slate-500">{t('diagnostics.db_status')}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                <span className="text-slate-300 font-bold">{t('diagnostics.connected')}</span>
                            </div>
                        </div>

                        <div className="space-y-1 p-2 bg-black/40 rounded-lg border border-slate-900">
                            <span className="text-slate-500">{t('diagnostics.active_nodes')}</span>
                            <div className="text-slate-300 font-bold">{activeNodes} / 6</div>
                        </div>

                        <div className="space-y-1 p-2 bg-black/40 rounded-lg border border-slate-900">
                            <span className="text-slate-500">{t('diagnostics.memory')}</span>
                            <div className="text-slate-300 font-bold">{memoryUsage}MB / 512MB</div>
                        </div>

                        <div className="space-y-1 p-2 bg-black/40 rounded-lg border border-slate-900">
                            <span className="text-slate-500">{t('diagnostics.version')}</span>
                            <div className="text-emerald-500 font-bold">v1.1.2-cortex</div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[9px] text-slate-600 tracking-wider">
                        SECURE KEY SYSTEM v4.1.0 // AUTHORIZED ARCHITECT ONLY
                    </p>
                </div>
            </main>
        </div>
    );
}
