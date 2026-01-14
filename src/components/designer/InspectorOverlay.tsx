import React, { useEffect, useState, useRef } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { hyperBridge } from '@/lib/engine/HyperBridge';

export const InspectorOverlay: React.FC = () => {
    const { state } = useProjectStore();
    const [bounds, setBounds] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (state.engineMode !== 'hyper' || !state.selectedElementId) {
            setBounds(null);
            return;
        }

        const updateBounds = () => {
            // Retrieve layout from Rust Spatial Index
            const b = hyperBridge.getElementBounds(state.selectedElementId!);
            if (b) {
                setBounds(b);
            }
            rafRef.current = requestAnimationFrame(updateBounds);
        };

        updateBounds();

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [state.engineMode, state.selectedElementId]); // Re-run on mode or selection change

    if (!bounds || state.engineMode !== 'hyper') return null;

    return (
        <div
            className="pointer-events-none absolute z-[100] border-2 border-cyan-400 bg-cyan-400/10 box-border"
            style={{
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
                transition: 'all 0.1s linear' // Smooth out jitter
            }}
        >
            <div className="absolute -top-6 left-0 bg-cyan-400 text-black text-[9px] px-1 font-mono font-bold">
                {Math.round(bounds.width)} x {Math.round(bounds.height)}
            </div>
        </div>
    );
};
