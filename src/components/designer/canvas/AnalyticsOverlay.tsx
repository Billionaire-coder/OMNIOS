"use client";

import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { HeatmapPoint } from '@/types/designer';

export function AnalyticsOverlay() {
    const { state } = useProjectStore();

    if (!state.analytics.isHeatmapEnabled) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
            {state.analytics.heatmap.map((point: HeatmapPoint, i: number) => (
                <div
                    key={i}
                    className="absolute rounded-full blur-xl transition-all duration-1000"
                    style={{
                        left: `${point.x}px`,
                        top: `${point.y}px`,
                        width: `${point.intensity * 100}px`,
                        height: `${point.intensity * 100}px`,
                        backgroundColor: `rgba(255, 100, 0, ${point.intensity * 0.4})`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/20">
                        {Math.round(point.intensity * 100)}%
                    </div>
                </div>
            ))}

            {/* Visual Optimization Suggestion Flag */}
            <div className="absolute bottom-4 left-4 p-3 bg-zinc-900/90 border border-yellow-500/30 rounded-lg backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Aesthetic Audit Suggestion</span>
                </div>
                <p className="text-[11px] text-zinc-300 w-48">
                    AI detected lower click-through rate on the "Hero" button. Try increasing the `borderRadius` to match the brand's soft aesthetic.
                </p>
            </div>
        </div>
    );
}
