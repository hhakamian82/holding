'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { loginAction } from '@/app/actions/auth';
import { Lock, TreePalm, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('password', password);

        const result = await loginAction(formData);

        if (result.success) {
            router.push('/hub');
        } else {
            setError(result.error as string);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Animated Background Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500 animate-pulse"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                        <TreePalm className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-100 font-mono">CORTEX ACCESS</h1>
                    <p className="text-gray-500 text-sm mt-1">Chief Architect Identity Verification</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-700 text-gray-100 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600 font-mono tracking-widest"
                                placeholder="ENTER_ACCESS_CODE"
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs text-center font-mono bg-red-900/20 py-2 rounded border border-red-900/50 animate-shake">
                            ⚠ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'AUTHENTICATE'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-gray-600 font-mono">
                        SECURE KEY SYSTEM v4.0.2<br />
                        UNAUTHORIZED ACCESS IS PROHIBITED
                    </p>
                </div>
            </div>
        </div>
    );
}
