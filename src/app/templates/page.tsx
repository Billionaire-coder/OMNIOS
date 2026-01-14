"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { THEMES } from '@/lib/data/themes';
import { ThemeCategory } from '@/types/designer';
import { ArrowLeft } from 'lucide-react';

export default function TemplatesPage() {
    const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('Ecommerce');
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

            {/* Header */}
            <div className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/designer')} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>
                        <h1 className="text-2xl font-bold tracking-tight">Theme Store</h1>
                    </div>
                    <div className="text-sm text-gray-400 font-mono">
                        {THEMES.length} PREMIUM THEMES AVAILABLE
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">

                {/* Categories */}
                <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                    {['Ecommerce', 'Portfolio', 'SaaS', 'Blog'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat as ThemeCategory)}
                            className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest transition-all duration-300 border ${selectedCategory === cat
                                    ? 'bg-white text-black border-white scale-105 shadow-lg shadow-white/20'
                                    : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50 hover:text-white'
                                }`}
                        >
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {THEMES.filter(t => t.category === selectedCategory || selectedCategory === 'Ecommerce').map((theme) => (
                        <Link
                            key={theme.id}
                            href={`/editor/theme/${theme.id}`}
                            className="group relative block rounded-2xl overflow-hidden bg-[#111] border border-white/10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-500 hover:-translate-y-2"
                        >
                            {/* Thumbnail */}
                            <div className="aspect-[4/3] relative overflow-hidden bg-gray-800">
                                {theme.thumbnail ? (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url(${theme.thumbnail})` }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 bg-gradient-to-br from-gray-800 to-gray-900">
                                        No Preview
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                                    <span className="px-6 py-3 bg-white text-black font-bold rounded-full tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        CUSTOMIZE
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-white mb-2">{theme.name}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{theme.description}</p>
                                <div className="flex items-center justify-between text-xs font-mono text-gray-500 uppercase tracking-wider">
                                    <span>{theme.category}</span>
                                    <span className="group-hover:text-purple-400 transition-colors">Use Template →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
