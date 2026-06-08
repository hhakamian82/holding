'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TreePalm, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { addTreePledge } from '@/lib/data-actions';

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: {
        id: string;
        title: string;
        price: string;
    } | null;
    locale: string;
}

export default function OrderModal({ isOpen, onClose, service, locale }: OrderModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!service) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Extract numeric value from price string (handling both English and Persian digits)
            const normalizedPrice = service.price.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
            const amount = parseInt(normalizedPrice.replace(/[^\d]/g, '')) || 0;

            await addTreePledge(
                service.id,
                amount,
                name || 'Anonymous Benefactor'
            );

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                setName('');
                setEmail('');
            }, 3000);
        } catch (err) {
            console.error(err);
            alert('Error submitting order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isRtl = locale === 'fa';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-palm-950/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`relative w-full max-w-lg bg-white dark:bg-palm-900 rounded-3xl shadow-2xl overflow-hidden ${isRtl ? 'font-vazir' : ''}`}
                        dir={isRtl ? 'rtl' : 'ltr'}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-palm-50 dark:hover:bg-palm-800 transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {success ? (
                            <div className="p-12 text-center space-y-6">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-palm-900 dark:text-palm-50 font-display">
                                    {isRtl ? 'سفارش شما ثبت شد!' : 'Order Received!'}
                                </h2>
                                <p className="text-palm-600 dark:text-palm-400">
                                    {isRtl
                                        ? `ممنون ${name}! ریشه‌های هدیه شما به زودی در خاک ایران کاشته خواهد شد.`
                                        : `Thank you ${name}! Your roots will be planted in Iran shortly.`}
                                </p>
                            </div>
                        ) : (
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-2xl bg-palm-100 dark:bg-palm-800">
                                        <TreePalm className="w-6 h-6 text-palm-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold font-display">{isRtl ? 'جزئیات سفارش درخت' : 'Tree Order Details'}</h2>
                                        <p className="text-sm text-palm-500">{service.title}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-palm-700 dark:text-palm-300">
                                            {isRtl ? 'نام شما (واقف/مشتری)' : 'Full Name (Benefactor)'}
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-palm-200 dark:border-palm-700 bg-palm-50 dark:bg-palm-800 focus:ring-2 focus:ring-palm-500 outline-none transition-all placeholder:text-palm-300"
                                            placeholder={isRtl ? 'مثلا: مانی حکامیان' : 'e.g. Mani Hakamian'}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-palm-700 dark:text-palm-300">
                                            {isRtl ? 'ایمیل یا شماره تماس' : 'Email or Phone'}
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-palm-200 dark:border-palm-700 bg-palm-50 dark:bg-palm-800 focus:ring-2 focus:ring-palm-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="p-4 rounded-2xl bg-gold-50 dark:bg-gold-900/10 border border-gold-100 dark:border-gold-800/30 flex items-center justify-between">
                                        <span className="text-sm font-bold text-gold-700 dark:text-gold-500">
                                            {isRtl ? 'تعداد نهال تعهدی:' : 'Saplings Pledged:'}
                                        </span>
                                        <span className="text-xl font-black text-palm-800 dark:text-palm-100 flex items-center gap-1">
                                            {service.price} <TreePalm className="w-5 h-5" />
                                        </span>
                                    </div>

                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full py-4 bg-palm-600 hover:bg-palm-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-palm-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                {isRtl ? 'تایید و ثبت تعهد' : 'Confirm & Pledge'}
                                                <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180' : ''}`} />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-[10px] text-center text-palm-400 uppercase tracking-widest font-bold">
                                        {isRtl ? 'AI-Verified Carbon Neutral Project' : 'AI-Verified Carbon Neutral Project'}
                                    </p>
                                </form>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
