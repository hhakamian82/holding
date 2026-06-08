
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { TreePalm, Github, Twitter, Linkedin, Mail, ArrowRight } from 'lucide-react';

export function Footer() {
    const t = useTranslations('Footer');
    const tNav = useTranslations('Navigation');
    const locale = useLocale();
    const isRtl = locale === 'fa';

    return (
        <footer className="bg-white dark:bg-palm-950 border-t border-palm-100 dark:border-palm-900 pt-20 pb-10 overflow-hidden relative">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <TreePalm className="w-8 h-8 text-palm-600 dark:text-palm-400" />
                            <span className="text-2xl font-black tracking-tight text-palm-900 dark:text-palm-50 uppercase">
                                Palm Grove
                            </span>
                        </div>
                        <p className="text-palm-600 dark:text-palm-400 leading-relaxed text-sm">
                            {t('description')}
                        </p>
                        <div className="flex items-center gap-4">
                            {[
                                { icon: Twitter, href: "#" },
                                { icon: Linkedin, href: "#" },
                                { icon: Github, href: "#" },
                                { icon: Mail, href: "mailto:hello@palmgrove.ir" }
                            ].map((social, i) => (
                                <Link
                                    key={i}
                                    href={social.href}
                                    className="w-10 h-10 rounded-xl bg-palm-50 dark:bg-palm-900 flex items-center justify-center text-palm-600 dark:text-palm-400 hover:bg-palm-600 hover:text-white dark:hover:bg-palm-500 transition-all border border-palm-100 dark:border-palm-800"
                                >
                                    <social.icon className="w-5 h-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h4 className="text-palm-900 dark:text-palm-50 font-bold mb-6 text-lg">{t('explore')}</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/" className="text-palm-600 dark:text-palm-400 hover:text-palm-900 dark:hover:text-palm-100 transition-colors uppercase">{tNav('about')}</Link></li>
                            <li><Link href="/impact" className="text-palm-600 dark:text-palm-400 hover:text-palm-900 dark:hover:text-palm-100 transition-colors uppercase">{tNav('impact')}</Link></li>
                            <li><Link href="/services" className="text-palm-600 dark:text-palm-400 hover:text-palm-900 dark:hover:text-palm-100 transition-colors uppercase">{tNav('services')}</Link></li>
                            <li><Link href="/hub" className="text-palm-600 dark:text-palm-400 hover:text-palm-900 dark:hover:text-palm-100 transition-colors uppercase">Central Hub</Link></li>
                        </ul>
                    </div>

                    {/* Services Column */}
                    <div>
                        <h4 className="text-palm-900 dark:text-palm-50 font-bold mb-6 text-lg">{t('services')}</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {[0, 1, 2, 3].map((idx) => (
                                <li key={idx} className="text-palm-600 dark:text-palm-400">
                                    {t(`serviceList.${idx}`)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="space-y-6">
                        <h4 className="text-palm-900 dark:text-palm-50 font-bold text-lg">{t('newsletter')}</h4>
                        <p className="text-palm-500 dark:text-palm-400 text-sm leading-relaxed">
                            {t('newsletterDesc')}
                        </p>
                        <form className="relative">
                            <input
                                type="email"
                                placeholder={t('placeholder')}
                                className={`w-full bg-palm-50 dark:bg-palm-900 border border-palm-100 dark:border-palm-800 rounded-2xl py-4 ${isRtl ? 'pr-5 pl-12' : 'pl-5 pr-12'} text-sm focus:outline-none focus:ring-2 focus:ring-palm-500/50 transition-all text-palm-900 dark:text-palm-100`}
                            />
                            <button
                                type="button"
                                className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-palm-600 text-white flex items-center justify-center hover:bg-gold-500 transition-all shadow-lg shadow-palm-500/20 ${isRtl ? 'left-2' : 'right-2'}`}
                            >
                                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-palm-100 dark:border-palm-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-palm-400 dark:text-palm-600 text-xs font-medium">
                        {t('rights')}
                    </p>
                    <div className="flex gap-8 text-[10px] font-bold text-palm-400 uppercase tracking-widest">
                        <Link href="/terms" className="hover:text-palm-900 dark:hover:text-palm-100 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-palm-900 dark:hover:text-palm-100 transition-colors">Terms of Service</Link>
                        <Link href="/terms" className="hover:text-palm-900 dark:hover:text-palm-100 transition-colors">Contact</Link>
                    </div>
                </div>
            </div>

            {/* Decorative Gradients */}
            <div className={`absolute bottom-0 w-96 h-96 bg-green-500/5 rounded-full blur-[100px] -translate-y-1/2 ${isRtl ? '-left-48' : '-right-48'}`}></div>
            <div className={`absolute top-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px] -translate-y-1/2 ${isRtl ? '-right-32' : '-left-32'}`}></div>
        </footer>
    );
}
