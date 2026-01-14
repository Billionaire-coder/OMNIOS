
import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { MousePointer2, Circle, X } from 'lucide-react';

interface Point {
    x: number;
    y: number;
    type: 'move' | 'line' | 'curve';
    cp1?: { x: number, y: number }; // Control Point 1 (for curves)
    cp2?: { x: number, y: number }; // Control Point 2
}

export const PenTool: React.FC = () => {
    const { state, addElement, setEditingElementId } = useProjectStore();
    const [points, setPoints] = useState<Point[]>([]);
    const [currentPos, setCurrentPos] = useState<{ x: number, y: number } | null>(null);
    const [isDrawing, setIsDrawing] = useState(true);

    // SVG Viewport Ref (Overlay on Canvas)
    const svgRef = useRef<SVGSVGElement>(null);

    const handleClick = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Curve Logic: If dragging? For MVP, simple polyline + basic curve placeholder
        // To do generic Pen Tool: Click = Corner, Drag = Curve.
        // Simplified V1: Click adds point.

        const newPoint: Point = {
            x, y,
            type: points.length === 0 ? 'move' : 'line'
        };

        setPoints(prev => [...prev, newPoint]);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        setCurrentPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const generatePathString = (pts: Point[], current?: { x: number, y: number }) => {
        if (pts.length === 0) return '';
        let d = `M ${pts[0].x} ${pts[0].y}`;

        for (let i = 1; i < pts.length; i++) {
            const p = pts[i];
            if (p.type === 'line') d += ` L ${p.x} ${p.y}`;
            // Curve support later
        }

        if (current) {
            d += ` L ${current.x} ${current.y}`;
        }

        return d;
    };

    const finishShape = () => {
        if (points.length < 2) return;

        // Close path
        const d = generatePathString(points) + ' Z';

        // Add Element
        // Add Element
        const targetId = state.selectedElementId || 'root';
        addElement('vector', targetId, {
            type: 'vector',
            name: 'Vector Shape',
            styles: {
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: Math.min(...points.map(p => p.y)) + 'px',
                left: Math.min(...points.map(p => p.x)) + 'px',
                widthVal: (Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x))) + 'px',
                heightVal: (Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y))) + 'px',
                fill: '#00ff96',
                stroke: 'none'
            },
            content: d, // Store path data in content for now
        });

        setPoints([]);
        setIsDrawing(false); // Mode switch back to select?
    };

    // Render Preview
    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1000, pointerEvents: 'auto', cursor: 'crosshair' }}>
            <svg
                ref={svgRef}
                style={{ width: '100%', height: '100%' }}
                onClick={handleClick}
                onMouseMove={handleMouseMove}
                onContextMenu={(e) => { e.preventDefault(); finishShape(); }}
            >
                <path
                    d={generatePathString(points, currentPos || undefined)}
                    stroke="var(--accent-teal)"
                    strokeWidth="2"
                    fill="rgba(0, 255, 150, 0.1)"
                />

                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="var(--accent-teal)" strokeWidth="2" />
                ))}
            </svg>

            <div className="glass" style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', padding: '10px', borderRadius: '8px', display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'white' }}>Vector Mode Active</span>
                <button onClick={finishShape} style={{ background: 'var(--accent-teal)', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold' }}>DONE (Right Click)</button>
            </div>
        </div>
    );
};
