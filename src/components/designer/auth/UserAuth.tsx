
import React, { useState } from 'react';
import { useProjectStore } from '../../../hooks/useProjectStore';
import * as Icons from 'lucide-react';
import Confetti from 'react-confetti';

export const UserAuth: React.FC = () => {
    const { login, signUp } = useProjectStore();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await signUp(email, password);
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[9999] bg-zinc-950 flex items-center justify-center">
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={500}
                />
                <div className="text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icons.Check size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome to OMNIOS</h1>
                    <p className="text-zinc-400">Your secure environment is ready.</p>
                    <button
                        onClick={() => window.location.reload()} // Quick reload to refresh state completely if needed
                        className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-colors"
                    >
                        Enter Studio
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-zinc-950 flex items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md p-8 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/20">
                        <Icons.Hexagon className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">OMNIOS Enterprise</h2>
                    <p className="text-zinc-400 text-sm mt-1">Secure Native Authentication</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs flex items-center gap-2">
                            <Icons.AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Email</label>
                        <div className="relative">
                            <Icons.Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
                                placeholder="developer@omnios.dev"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Password</label>
                        <div className="relative">
                            <Icons.Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
                                placeholder="••••••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                    >
                        {loading && <Icons.Loader2 size={16} className="animate-spin" />}
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login');
                            setError(null);
                        }}
                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                        {mode === 'login'
                            ? "Don't have an account? Create one."
                            : "Already have an account? Sign in."}
                    </button>
                </div>
            </div>
        </div>
    );
};
