"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Layout, Palette, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DesignerPage() {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans selection:bg-purple-500/30">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="z-10 w-full max-w-7xl px-8 py-20 flex flex-col items-center">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest text-purple-300 mb-6 backdrop-blur-md shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]">
                        <Sparkles className="w-3 h-3" />
                        OMNI-OS WORKFLOW SELECTION
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black font-serif mb-6 tracking-tighter text-white drop-shadow-2xl">
                        Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">Masterpieces</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        The world's most advanced no-code environment. Select your path to begin.
                    </p>
                </motion.div>

                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">

                    {/* Blank Canvas Option */}
                    <Link
                        href="/editor/blank"
                        className="group relative"
                        onMouseEnter={() => setHoveredCard('blank')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className={`h-[450px] rounded-[2rem] border transition-all duration-500 flex flex-col items-center justify-center text-center p-12 relative overflow-hidden backdrop-blur-md
                            ${hoveredCard === 'blank'
                                    ? 'bg-white/10 border-blue-500/50 shadow-[0_0_60px_-15px_rgba(59,130,246,0.4)] scale-[1.02]'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            {/* Icon Circle */}
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-10 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500 z-10 p-[1px]">
                                <div className="w-full h-full rounded-2xl bg-[#050505]/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
                                    <Layout className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            <h2 className="text-4xl font-bold mb-4 z-10 tracking-tight text-white group-hover:text-blue-200 transition-colors">Blank Canvas</h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed z-10 group-hover:text-blue-100/70 transition-colors">
                                Total freedom. Start with a clean slate and build pixel-perfect layouts from scratch.
                            </p>

                            <div className="flex items-center gap-3 text-sm font-bold tracking-widest text-blue-400 uppercase group-hover:text-white transition-colors z-10">
                                <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                                Start Building
                            </div>
                        </motion.div>
                    </Link>

                    {/* Template Store Option */}
                    <Link
                        href="/templates"
                        className="group relative"
                        onMouseEnter={() => setHoveredCard('templates')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className={`h-[450px] rounded-[2rem] border transition-all duration-500 flex flex-col items-center justify-center text-center p-12 relative overflow-hidden backdrop-blur-md
                            ${hoveredCard === 'templates'
                                    ? 'bg-white/10 border-purple-500/50 shadow-[0_0_60px_-15px_rgba(168,85,247,0.4)] scale-[1.02]'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-bl from-purple-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            {/* Icon Circle */}
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-10 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-500 z-10 p-[1px]">
                                <div className="w-full h-full rounded-2xl bg-[#050505]/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
                                    <Palette className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            <h2 className="text-4xl font-bold mb-4 z-10 tracking-tight text-white group-hover:text-purple-200 transition-colors">Theme Store</h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed z-10 group-hover:text-purple-100/70 transition-colors">
                                Jump start with our premium collection of professionally crafted templates and UI kits.
                            </p>

                            <div className="flex items-center gap-3 text-sm font-bold tracking-widest text-purple-400 uppercase group-hover:text-white transition-colors z-10">
                                <div className="p-2 rounded-full bg-purple-500/20 group-hover:bg-purple-500 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                                Browse Templates
                            </div>
                        </motion.div>
                    </Link>
                </div>

                {/* Footer/Trust Indicators */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-20 flex gap-12 text-gray-600 text-xs font-mono uppercase tracking-widest opacity-60"
                >
                    <span className="flex items-center gap-3"><Zap className="w-4 h-4 text-amber-500" /> Instant Deploy</span>
                    <span className="flex items-center gap-3"><Layout className="w-4 h-4 text-teal-500" /> Visual Editor</span>
                </motion.div>
            </div>
        </div>
    );
}
