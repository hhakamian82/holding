
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Lightbulb, Sprout, ShoppingBasket, Search, MapPin, HandHeart } from 'lucide-react';

const steps = [
    {
        icon: Search,
        key: 'step1',
        color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
    },
    {
        icon: MapPin,
        key: 'step2',
        color: 'text-green-500 bg-green-100 dark:bg-green-900/20',
    },
    {
        icon: Sprout,
        key: 'step3',
        color: 'text-gold-500 bg-gold-100 dark:bg-gold-900/20',
    },
    {
        icon: ShoppingBasket,
        key: 'step4',
        color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20',
    }
];

export function TransparencySection() {
    const t = useTranslations('Transparency');
    const locale = useLocale();
    const isRtl = locale === 'fa';

    return (
        <section className="py-20 bg-white dark:bg-palm-900 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#166534 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palm-100 dark:bg-palm-800 text-palm-700 dark:text-palm-300 text-sm font-medium mb-4"
                    >
                        <Lightbulb className="w-4 h-4" />
                        <span>{t('badge')}</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-palm-800 to-palm-600 dark:from-palm-100 dark:to-palm-400 mb-6"
                    >
                        {t('title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-palm-600 dark:text-palm-400 leading-relaxed"
                    >
                        {t.rich('description', {
                            strong: (chunks) => <strong className="text-palm-900 dark:text-palm-200">{chunks}</strong>
                        })}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="relative group p-6 rounded-2xl border border-palm-100 dark:border-palm-800 bg-palm-50/50 dark:bg-palm-900/50 hover:bg-white dark:hover:bg-palm-800 transition-all hover:shadow-lg"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${step.color} transition-transform group-hover:scale-110`}>
                                <step.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-palm-800 dark:text-palm-200">
                                {t(`steps.${step.key}.title`)}
                            </h3>
                            <p className="text-sm text-palm-600 dark:text-palm-400 leading-relaxed">
                                {t(`steps.${step.key}.desc`)}
                            </p>

                            {/* Connector Line (Mobile hidden) */}
                            {index < steps.length - 1 && (
                                <div className={`hidden lg:block absolute top-12 w-8 h-[2px] bg-palm-200 dark:bg-palm-700 
                                    ${isRtl ? 'left-0 -ml-4 -translate-x-1/2' : 'right-0 -mr-4 translate-x-1/2'}`}></div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className={`mt-16 p-8 rounded-3xl bg-gradient-to-br from-palm-800 to-palm-900 text-white relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 ${isRtl ? 'md:text-right' : 'md:text-left'}`}
                >
                    <div className="relative z-10 max-w-2xl">
                        <div className={`flex items-center gap-2 mb-2 text-gold-400 font-semibold uppercase tracking-wider text-sm ${isRtl ? 'justify-center md:justify-start flex-row-reverse' : 'justify-center md:justify-start'}`}>
                            <HandHeart className="w-4 h-4" /> <span>{t('footer.badge')}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('footer.title')}</h3>
                        <p className="text-palm-100 leading-relaxed">
                            {t('footer.desc')}
                        </p>
                    </div>
                    <div className="relative z-10 shrink-0">
                        <button className="px-8 py-3 bg-white text-palm-900 font-bold rounded-full hover:bg-gold-500 hover:text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            {t('footer.cta')}
                        </button>
                    </div>

                    {/* Decorative Elements */}
                    <div className={`absolute top-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 ${isRtl ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}`}></div>
                    <div className={`absolute bottom-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl translate-y-1/2 ${isRtl ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'}`}></div>
                </motion.div>

            </div>
        </section>
    );
}
