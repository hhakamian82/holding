
'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Zap, TreePalm, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import OrderModal from './OrderModal';

interface SupportOption {
    id: string;
    title: string;
    price: string;
}

export function SupportSection() {
    const t = useTranslations('Support');
    const locale = useLocale();
    const isRtl = locale === 'fa';
    const [selectedOption, setSelectedOption] = useState<SupportOption | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const options = [
        { id: 'small', icon: Zap, key: 'small', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
        { id: 'medium', icon: ShieldCheck, key: 'medium', color: 'bg-palm-50 dark:bg-palm-900/20 text-palm-600' },
        { id: 'large', icon: Heart, key: 'large', color: 'bg-gold-50 dark:bg-gold-900/20 text-gold-600' },
    ];

    return (
        <section className="py-24 bg-palm-50 dark:bg-palm-950/50 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black mb-6 text-palm-900 dark:text-palm-50"
                    >
                        {t('title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-palm-600 dark:text-palm-400"
                    >
                        {t('subtitle')}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {options.map((opt, idx) => (
                        <motion.div
                            key={opt.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 + 0.2 }}
                            className="bg-white dark:bg-palm-900 p-8 rounded-3xl border border-palm-100 dark:border-palm-800 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${opt.color} group-hover:scale-110 transition-transform`}>
                                <opt.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t(`options.${opt.key}.title`)}</h3>
                            <div className="text-2xl font-black text-palm-800 dark:text-palm-100 mb-4 flex items-center gap-1">
                                {t(`options.${opt.key}.price`)} <TreePalm className="w-5 h-5 text-palm-500" />
                            </div>
                            <p className="text-sm text-palm-500 dark:text-palm-400 mb-8">
                                {t(`options.${opt.key}.desc`)}
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedOption({
                                        id: `support_${opt.id}`,
                                        title: t(`options.${opt.key}.title`),
                                        price: t(`options.${opt.key}.price`)
                                    });
                                    setIsModalOpen(true);
                                }}
                                className="mt-auto w-full py-3 px-6 bg-palm-100 dark:bg-palm-800 text-palm-700 dark:text-palm-200 rounded-xl font-bold hover:bg-palm-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                {t('cta')} <ArrowRight className={`w-4 h-4 transition-transform group-hover/btn:translate-x-1 ${isRtl ? 'rotate-180 group-hover/btn:-translate-x-1' : ''}`} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <OrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                service={selectedOption}
                locale={locale}
            />
        </section>
    );
}
