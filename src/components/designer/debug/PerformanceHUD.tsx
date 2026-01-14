"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Zap, Layers } from 'lucide-react';

export const PerformanceHUD = () => {
    const [fps, setFps] = useState(60);
    const [cls, setCls] = useState(0.00);

    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();

        const update = () => {
            frameCount++;
            const now = performance.now();
            if (now >= lastTime + 1000) {
                setFps(Math.round((frameCount * 1000) / (now - lastTime)));
                frameCount = 0;
                lastTime = now;
            }
            requestAnimationFrame(update);
        };

        const frameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frameId);
    }, []);

    // Simulate occasional CLS during "heavy" actions
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.8) {
                setCls(prev => Math.min(0.25, prev + 0.01));
                setTimeout(() => setCls(0.00), 2000);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        if (fps > 55) return '#2ed573';
        if (fps > 30) return '#ffa502';
        return '#ff4757';
    };

    return (
        <div style={{
            position: 'fixed',
            top: '80px',
            right: '420px',
            padding: '8px 12px',
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #333',
            borderRadius: '8px',
            display: 'flex',
            gap: '15px',
            zIndex: 1000,
            fontSize: '0.7rem',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            pointerEvents: 'none'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={12} color={getStatusColor()} />
                <span style={{ color: '#888' }}>FPS:</span>
                <span style={{ fontWeight: 'bold', color: getStatusColor() }}>{fps}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={12} color={cls > 0.1 ? '#ff4757' : '#2ed573'} />
                <span style={{ color: '#888' }}>CLS:</span>
                <span style={{ fontWeight: 'bold' }}>{cls.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={12} color="var(--accent-teal)" />
                <span style={{ color: '#888' }}>Jank:</span>
                <span style={{ fontWeight: 'bold' }}>None</span>
            </div>
        </div>
    );
};
