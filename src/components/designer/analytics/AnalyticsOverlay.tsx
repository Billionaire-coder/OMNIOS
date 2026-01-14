import React, { useMemo } from 'react';
import { useProjectStore } from '../../../hooks/useProjectStore';

export const AnalyticsOverlay = () => {
    const { state } = useProjectStore();
    const analytics = state.analytics;

    if (!analytics || !analytics.isHeatmapEnabled) return null;

    return (
        <div className="analytics-overlay pointer-events-none absolute inset-0 z-[100] overflow-hidden">
            {/* Heatmap Layer */}
            <svg className="h-full w-full">
                <defs>
                    <radialGradient id="heatGradient">
                        <stop offset="0%" stopColor="rgba(255, 0, 0, 0.6)" />
                        <stop offset="50%" stopColor="rgba(255, 255, 0, 0.3)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 0, 0)" />
                    </radialGradient>
                </defs>
                {analytics.heatmap.map((point: any, i: number) => (
                    <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r={20 + point.intensity * 30}
                        fill="url(#heatGradient)"
                        className="animate-pulse"
                        style={{ filter: 'blur(15px)' }}
                    />
                ))}
            </svg>

            {/* Form Abandonment Markers */}
            {analytics.events
                .filter((e: any) => e.type === 'form_abandon')
                .map((event: any, i: number) => {
                    const element = state.elements[event.elementId!];
                    if (!element) return null;
                    // Mock position for now as we don't have real DOM bounds in this state
                    return (
                        <div
                            key={i}
                            className="absolute rounded bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg animate-bounce"
                            style={{ top: '20%', left: '20%' }} // Mock
                        >
                            ⚠️ Abandonment Spot
                        </div>
                    );
                })}
        </div>
    );
};
