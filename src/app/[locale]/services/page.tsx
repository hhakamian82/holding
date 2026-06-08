'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, use } from 'react';
import OrderModal from '@/components/OrderModal';
import {
    Laptop,
    Smartphone,
    BrainCircuit,
    TreePalm,
    CheckCircle2,
    ArrowRight,
    Briefcase
} from "lucide-react";

interface ServiceItem {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
    price: string;
    features: string[];
}

export default function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('Services');
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isRtl = locale === 'fa';

    const services = [
        {
            id: 'web',
            icon: Laptop,
            title: t('webDesign.title'),
            desc: t('webDesign.desc'),
            price: t('webDesign.price'),
            features: locale === 'fa' ? ['Next.js 15', 'سئو پیشرفته', 'مدیریت محتوا', 'دوزبانه'] : ['Next.js 15', 'Advanced SEO', 'CMS Included', 'Bilingual Support']
        },
        {
            id: 'app',
            icon: Smartphone,
            title: t('appDev.title'),
            desc: t('appDev.desc'),
            price: t('appDev.price'),
            features: locale === 'fa' ? ['اپلیکیشن موبایل', 'درگاه پرداخت', 'سیستم انبارداری', 'پوش نوتیفیکیشن'] : ['Mobile App', 'Payment Gateway', 'Inventory System', 'Push Notifications']
        },
        {
            id: 'ai',
            icon: BrainCircuit,
            title: t('consulting.title'),
            desc: t('consulting.desc'),
            price: t('consulting.price'),
            features: locale === 'fa' ? ['ایجنت‌های هوشمند', 'خودکارسازی فرآیند', 'اتصال به API', 'گزارش تحلیلی'] : ['Smart Agents', 'Process Automation', 'API Integration', 'Analytical Reports']
        },
        {
            id: 'custom',
            icon: Briefcase,
            title: t('custom.title'),
            desc: t('custom.desc'),
            price: t('custom.price'),
            features: locale === 'fa' ? ['مشاوره اختصاصی', 'تیم فنی تمام‌وقت', 'نگهداری ویژه', 'مقیاس‌پذیری بالا'] : ['Custom Consulting', 'Full Technical Team', 'Premium Support', 'High Scalability']
        },
    ];

    return (
        <div className={`min-h-screen bg-palm-50 dark:bg-palm-950 text-palm-900 dark:text-palm-50 font-sans ${isRtl ? 'font-vazir' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/30 dark:bg-palm-950/30 border-b border-palm-200 dark:border-palm-800 p-4 transition-all">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="font-bold text-lg flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <TreePalm className="w-6 h-6 text-palm-600" /> Palm Grove
                    </Link>
                    <Link href="/hub" className="text-sm font-medium hover:text-palm-600 dark:hover:text-palm-300 transition-colors bg-palm-100 dark:bg-palm-900 px-3 py-1 rounded-full">
                        Dashboard
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 pt-32 pb-20">
                <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-palm-600 to-gold-500">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-palm-600 dark:text-palm-300 mb-6">
                        {t('subtitle')}
                    </p>
                    <div className="bg-gold-50 dark:bg-gold-900/10 border border-gold-200 dark:border-gold-800/50 p-4 rounded-2xl text-sm text-gold-800 dark:text-gold-300 max-w-2xl mx-auto italic shadow-sm">
                        {t('phaseDisclaimer')}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={service.id}
                            className="relative group bg-white dark:bg-palm-900/50 backdrop-blur-sm rounded-3xl border border-palm-100 dark:border-palm-800 p-8 shadow-sm hover:shadow-xl hover:border-gold-400 transition-all duration-300 hover:-translate-y-2 flex flex-col"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-palm-400 to-gold-400 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <service.icon className="w-12 h-12 text-palm-500 mb-6 group-hover:text-gold-500 transition-colors transform group-hover:scale-110 duration-300" />

                            <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                            <p className="text-palm-500 dark:text-palm-400 mb-6 h-12 text-sm leading-relaxed">{service.desc}</p>

                            <div className="flex items-center gap-2 mb-8 text-green-700 dark:text-green-400 font-mono font-bold text-lg bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg w-fit self-start border border-green-100 dark:border-green-800">
                                <TreePalm className="w-5 h-5" /> {service.price}
                            </div>

                            <ul className="space-y-3 mb-8 flex-grow">
                                {service.features.map((feat) => (
                                    <li key={feat} className="flex items-center gap-2 text-sm text-palm-600 dark:text-palm-300">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> {feat}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => {
                                    setSelectedService(service);
                                    setIsModalOpen(true);
                                }}
                                className="w-full py-3 rounded-xl bg-palm-600 text-white font-bold hover:bg-gold-500 transition-colors shadow-lg shadow-palm-500/30 flex items-center justify-center gap-2 group-hover:shadow-gold-500/20"
                            >
                                {t('cta')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            <OrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                service={selectedService}
                locale={locale}
            />
        </div>
    );
}
