import React, { useState } from 'react';
import { useProjectStore } from '../../../hooks/useProjectStore';
import { X, TrendingUp, Users, MousePointer2, Activity, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const AnalyticsDashboard = ({ onClose }: { onClose: () => void }) => {
    const { state } = useProjectStore();
    const [tab, setTab] = useState<'overview' | 'funnels' | 'heatmap'>('overview');

    const MockChart = () => (
        <div className="h-48 flex items-end justify-between gap-1 mt-4">
            {[40, 65, 45, 70, 85, 60, 90, 75, 55, 80, 70, 95].map((h, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5, type: 'spring' }}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/40 rounded-t-sm relative group cursor-pointer border-t border-blue-500/50"
                >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black border border-white/10 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {h * 12} Views
                    </div>
                </motion.div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-8 text-white">
            <div className="w-full max-w-5xl h-[80vh] bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#09090b]">
                    <div className="flex items-center gap-4">
                        <Activity className="text-blue-500" />
                        <h2 className="font-bold text-lg">Analytics & Insights</h2>
                        <div className="flex bg-white/5 rounded-lg p-1 ml-8">
                            {[
                                { id: 'overview', label: 'Overview', icon: TrendingUp },
                                { id: 'funnels', label: 'Funnels', icon: Users },
                                { id: 'heatmap', label: 'Heatmaps', icon: MousePointer2 },
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id as any)}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <t.icon size={14} />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {tab === 'overview' && (
                        <div className="space-y-8">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Views', value: '12,450', diff: '+12%', color: 'text-blue-400' },
                                    { label: 'Unique Visitors', value: '8,210', diff: '+5%', color: 'text-purple-400' },
                                    { label: 'Avg. Time', value: '2m 14s', diff: '-2%', color: 'text-orange-400' },
                                    { label: 'Bounce Rate', value: '42%', diff: '-5%', color: 'text-green-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                                        <div className="flex items-end justify-between">
                                            <h3 className="text-3xl font-bold">{stat.value}</h3>
                                            <span className={`text-sm font-medium ${stat.diff.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{stat.diff}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Main Chart */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-semibold text-lg">Traffic Overview</h3>
                                    <select className="bg-black border border-white/20 rounded-lg px-3 py-1 text-sm outline-none">
                                        <option>Last 30 Days</option>
                                        <option>Last 7 Days</option>
                                        <option>Last 24 Hours</option>
                                    </select>
                                </div>
                                <MockChart />
                            </div>
                        </div>
                    )}

                    {tab === 'funnels' && (
                        <div className="space-y-6">
                            {state.analytics?.funnels.map((funnel: any) => (
                                <div key={funnel.id} className="bg-white/5 border border-white/10 rounded-xl p-8">
                                    <h3 className="text-xl font-bold mb-8">{funnel.name}</h3>
                                    <div className="flex items-center gap-4">
                                        {funnel.steps.map((step: any, i: any) => (
                                            <div key={step.id} className="flex-1 relative">
                                                <div className="bg-gradient-to-b from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-lg p-6 relative z-10">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">{i + 1}</span>
                                                        <span className="text-green-400 text-sm font-bold">{100 - (i * 15)}%</span>
                                                    </div>
                                                    <h4 className="font-semibold text-lg mb-1">{step.name}</h4>
                                                    <p className="text-gray-400 text-sm">{Math.floor(1000 * Math.pow(0.85, i))} Users</p>
                                                </div>
                                                {i < funnel.steps.length - 1 && (
                                                    <div className="absolute top-1/2 -right-6 -translate-y-1/2 z-0 text-gray-600">
                                                        <ArrowRight size={24} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'heatmap' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                                <MousePointer2 size={40} className="text-orange-500" />
                            </div>
                            <h3 className="text-2xl font-bold">Heatmap Visualization</h3>
                            <p className="text-gray-400 max-w-md">Toggle the Heatmap Overlay on the canvas to see real-time interaction density.</p>
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                                Enable Overlay
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
