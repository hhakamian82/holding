'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useState, useEffect, use } from 'react';
import { getGlobalStats } from '@/lib/data-actions';
import { TransparencySection } from '@/components/TransparencySection';
import { SupportSection } from '@/components/SupportSection';
import { Footer } from '@/components/Footer';
import { ArrowRight, Globe, Leaf, Monitor, TreePalm } from "lucide-react";

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('HomePage');
    const tNav = useTranslations('Navigation');
    const [totalTrees, setTotalTrees] = useState(1240); // Initial placeholder
    const pathname = usePathname();

    useEffect(() => {
        getGlobalStats().then(stats => setTotalTrees(stats.total));
    }, []);

    const isRtl = locale === 'fa';

    return (
        <div className={`min-h-screen bg-palm-50 dark:bg-palm-950 text-palm-900 dark:text-palm-50 font-sans selection:bg-gold-500 selection:text-white ${isRtl ? 'font-vazir' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* --- HEADER --- */}
            <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/30 dark:bg-palm-950/30 border-b border-palm-200 dark:border-palm-800 transition-all duration-300">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TreePalm className="w-8 h-8 text-palm-600 dark:text-palm-400" />
                        <span className="text-xl font-bold tracking-tight">Palm Grove</span>
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm font-medium">
                        <Link href="/services" className="hover:text-palm-600 dark:hover:text-palm-300 transition-colors">{tNav('services')}</Link>
                        <Link href="/impact" className="hover:text-palm-600 dark:hover:text-palm-300 transition-colors">{tNav('impact')}</Link>
                        <Link href="/about" className="hover:text-palm-600 dark:hover:text-palm-300 transition-colors">{tNav('about')}</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link
                            href={pathname}
                            locale={locale === 'en' ? 'fa' : 'en'}
                            className="text-sm font-medium hover:text-palm-600 dark:hover:text-palm-300 uppercase"
                        >
                            {locale === 'en' ? 'FA' : 'EN'}
                        </Link>
                        <Link
                            href="/start"
                            className="bg-palm-600 hover:bg-palm-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-palm-500/30 flex items-center gap-2 group"
                        >
                            <span>{tNav('start')}</span>
                            <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <main className="pt-32 pb-20 container mx-auto px-6 flex flex-col items-center justify-center min-h-screen">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-palm-100 dark:bg-palm-900/50 text-palm-700 dark:text-palm-300 text-sm font-medium border border-palm-200 dark:border-palm-800 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        {locale === 'fa' ? 'درحال کاشت در بوشهر و خوزستان' : 'Currently planting in Bushehr & Khuzestan'}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-palm-900 dark:text-palm-50 drop-shadow-sm">
                        {t('title')}
                    </h1>

                    <p className="text-xl md:text-2xl text-palm-600 dark:text-palm-300 max-w-2xl mx-auto leading-relaxed opacity-90">
                        {t('subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 w-full sm:w-auto">
                        <Link
                            href="/services"
                            className="w-full sm:w-auto px-8 py-4 bg-palm-600 hover:bg-palm-700 text-white rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-palm-500/40 flex items-center justify-center gap-2 group"
                        >
                            <span>{t('cta')}</span> <TreePalm className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </Link>
                        <Link
                            href="/mission"
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-palm-900 border border-palm-200 dark:border-palm-700 text-palm-700 dark:text-palm-200 rounded-full font-bold text-lg hover:bg-palm-50 dark:hover:bg-palm-800 transition-all flex items-center justify-center gap-2"
                        >
                            <span>{t('mission')}</span> <Globe className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                <div className="mt-24 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: t('stats.trees'), value: totalTrees.toLocaleString() + "+", icon: TreePalm },
                        { label: t('stats.projects'), value: locale === 'fa' ? 'شروع شد' : 'Starting Now', icon: Monitor },
                        { label: t('stats.offset'), value: "...", icon: Leaf },
                    ].map((stat, index) => (
                        <div key={index} className="p-8 rounded-3xl bg-white/50 dark:bg-palm-900/30 border border-palm-100 dark:border-palm-800 backdrop-blur-sm hover:border-palm-300 dark:hover:border-palm-600 transition-all group hover:-translate-y-1 hover:shadow-lg">
                            <stat.icon className="w-10 h-10 text-palm-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
                            <div className="text-4xl font-black text-palm-800 dark:text-palm-100 mb-1">{stat.value}</div>
                            <div className="text-palm-500 dark:text-palm-400 font-medium">{stat.label}</div>
                        </div>
                    ))}

                </div>
            </main>

            <TransparencySection />
            <SupportSection />

            <Footer />
        </div>
    );
}
