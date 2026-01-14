'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function PerformanceMonitor() {
    useReportWebVitals((metric) => {
        // In production, this would send to Analytics (GA4/Vercel)
        // For now, we log to console in dev mode, or strict performance logging
        if (process.env.NODE_ENV === 'development') {
            console.groupCollapsed(`[Telemetry] ${metric.name}`);
            console.log(`Value: ${Math.round(metric.value)}ms`);
            console.log(`ID: ${metric.id}`);
            console.log(`Delta: ${metric.delta}`);
            console.groupEnd();
        }
    });

    return null;
}
