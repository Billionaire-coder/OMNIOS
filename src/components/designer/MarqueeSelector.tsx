import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { DesignerElement } from '@/types/designer';

interface MarqueeSelectorProps {
    elements: Record<string, DesignerElement>;
    canvasTransform: { x: number; y: number; scale: number };
    onSelectionChange: (x: number, y: number, width: number, height: number) => void;
    clearSelection: () => void;
}

export interface MarqueeHandle {
    startSelection: (x: number, y: number) => void;
}

export const MarqueeSelector = forwardRef<MarqueeHandle, MarqueeSelectorProps>(({ elements, canvasTransform, onSelectionChange, clearSelection }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selection, setSelection] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

    useImperativeHandle(ref, () => ({
        startSelection: (x: number, y: number) => {
            setSelection({
                startX: x,
                startY: y,
                currentX: x,
                currentY: y
            });
        }
    }));

    useEffect(() => {
        if (!selection) return;

        const handleMouseMove = (e: MouseEvent) => {
            setSelection(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
        };

        const handleMouseUp = () => {
            if (selection && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();

                // 1. Convert Screen Coordinates to Local Container Coordinates
                const localStart = {
                    x: selection.startX - containerRect.left,
                    y: selection.startY - containerRect.top
                };
                const localCurrent = {
                    x: selection.currentX - containerRect.left,
                    y: selection.currentY - containerRect.top
                };

                // 2. Convert Local Container Coordinates to World Coordinates (Canvas Space)
                // world = (local - pan) / scale
                const worldStart = {
                    x: (localStart.x - canvasTransform.x) / canvasTransform.scale,
                    y: (localStart.y - canvasTransform.y) / canvasTransform.scale
                };
                const worldCurrent = {
                    x: (localCurrent.x - canvasTransform.x) / canvasTransform.scale,
                    y: (localCurrent.y - canvasTransform.y) / canvasTransform.scale
                };

                const worldRect = {
                    left: Math.min(worldStart.x, worldCurrent.x),
                    top: Math.min(worldStart.y, worldCurrent.y),
                    width: Math.abs(worldStart.x - worldCurrent.x),
                    height: Math.abs(worldStart.y - worldCurrent.y)
                };

                // Batch 24.1: High-Performance Selection via Rust Engine
                // Passing the correct World-Space coordinates matching the Taffy/SpatialIndex
                onSelectionChange(worldRect.left, worldRect.top, worldRect.width, worldRect.height);
            }
            setSelection(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [selection, canvasTransform, onSelectionChange, clearSelection]);

    if (!selection) return null;

    const marqueeRect = {
        left: Math.min(selection.startX, selection.currentX),
        top: Math.min(selection.startY, selection.currentY),
        width: Math.abs(selection.startX - selection.currentX),
        height: Math.abs(selection.startY - selection.currentY)
    };

    return (
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 10002, pointerEvents: 'none' }}>
            <div style={{
                position: 'fixed',
                ...marqueeRect,
                backgroundColor: 'rgba(0, 224, 255, 0.05)',
                border: '1.5px dashed var(--accent-teal)',
                borderRadius: '2px',
                boxShadow: '0 0 10px rgba(0, 224, 255, 0.2)',
                pointerEvents: 'none',
                zIndex: 10003
            }} />
        </div>
    );
});

MarqueeSelector.displayName = 'MarqueeSelector';
