
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';

import { Suspense } from 'react';

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get('callbackUrl') || '/editor/blank';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const email = (e.target as any).email.value;
        const password = (e.target as any).password.value;

        try {
            await signIn('credentials', {
                email,
                password,
                callbackUrl,
            });

        } catch (err) {
            setError('An error occurred during sign in');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-black text-white tracking-tighter mb-2">OMNIOS</h1>
                <p className="text-white/40">Sign in to access the Designer</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/60">Email</label>
                        <input
                            name="email"
                            type="email"
                            defaultValue="demo@omnios.dev"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/60">Password</label>
                        <input
                            name="password"
                            type="password"
                            defaultValue="demo"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <p className="text-xs text-white/40">
                        Use <code className="text-white/60">demo@omnios.dev</code> / <code className="text-white/60">demo</code>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
