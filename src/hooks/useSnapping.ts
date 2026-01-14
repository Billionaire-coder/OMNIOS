import { useState, useCallback } from 'react';
import { hyperBridge } from '@/lib/engine/HyperBridge';

export interface SnapGuide {
    type: 'vertical' | 'horizontal' | 'gap';
    pos: number;
    orientation?: 'v' | 'h'; // 'v' for gaps between stacked items, 'h' for gaps between side-by-side items
    gapStart?: number;
    gapSize?: number;
    color?: string;
}

export interface SnapResult {
    x: number;
    y: number;
    guides: SnapGuide[];
    suggestedRect?: { left: number, top: number, width: number, height: number }; // For ghost preview
}

interface SiblingRect {
    id: string;
    left: number;
    top: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
    centerX: number;
    centerY: number;
}

export function useSnapping() {
    const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);

    const calculateSnap = useCallback((
        proposedX: number,
        proposedY: number,
        width: number,
        height: number,
        siblings: any[],
        elementId: string, // ADDED: Need ID for Rust exclusion
        threshold: number = 8 // Increased for better feel
    ): SnapResult => {
        try {
            // Rust Engine: Zero-Latency Spatial Query
            const rustSnap = hyperBridge.findSnapTargets(elementId, proposedX, proposedY, width, height);

            if (rustSnap) {
                // Convert Rust guides to UI guides
                const guides: SnapGuide[] = rustSnap.guides.map(g => ({
                    type: g.orientation as 'vertical' | 'horizontal',
                    pos: g.value,
                    color: 'var(--accent-primary)'
                }));

                setActiveGuides(guides);
                return { x: rustSnap.x, y: rustSnap.y, guides };
            }
        } catch (e) {
            console.warn("WASM Snapping Failed:", e);
        }

        // --- FALLBACK (If WASM fails or not ready) ---
        return { x: proposedX, y: proposedY, guides: [] };

    }, []);

    const calculateEdgeSnap = useCallback((
        edgeValue: number,
        orientation: 'vertical' | 'horizontal',
        siblings: any[],
        threshold: number = 8 // Consistent threshold
    ): { snapped: number, guides: SnapGuide[] } => {
        let snapped = edgeValue;
        const guides: SnapGuide[] = [];

        // Convert siblings to relevant edges
        const targets: number[] = [];
        siblings.forEach(s => {
            const left = parseInt(s.styles.left || '0', 10);
            const top = parseInt(s.styles.top || '0', 10);
            const w = parseInt(s.styles.width || '0', 10) || 100;
            const h = parseInt(s.styles.height || '0', 10) || 100;
            if (orientation === 'vertical') {
                targets.push(left, left + w, left + w / 2);
            } else {
                targets.push(top, top + h, top + h / 2);
            }
        });

        for (const t of targets) {
            if (Math.abs(edgeValue - t) < threshold) {
                snapped = t;
                guides.push({
                    type: orientation,
                    pos: t,
                    color: 'var(--accent-primary)'
                });
                break; // Snap to first match
            }
        }

        setActiveGuides(guides);
        return { snapped, guides };
    }, []);

    const clearGuides = useCallback(() => setActiveGuides([]), []);

    return { activeGuides, calculateSnap, calculateEdgeSnap, clearGuides };
}
