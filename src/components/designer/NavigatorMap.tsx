import React from 'react';
import { DesignerElement } from '@/types/designer';

interface NavigatorMapProps {
    elements: Record<string, DesignerElement>;
    canvasTransform: { x: number; y: number; scale: number };
    onNavigate: (x: number, y: number) => void;
}

export function NavigatorMap({ elements, canvasTransform, onNavigate }: NavigatorMapProps) {
    const mapSize = 180; // Slightly larger for better detail

    const getBounds = () => {
        const rects = Object.values(elements).map(el => {
            const l = parseInt(String(el.styles?.left || '0'));
            const t = parseInt(String(el.styles?.top || '0'));
            const w = parseInt(String(el.styles?.width || '0')) || 100;
            const h = parseInt(String(el.styles?.height || '0')) || 100;
            return { l, t, w, h, r: l + w, b: t + h };
        });

        if (rects.length === 0) return { minX: -500, minY: -500, maxX: 1500, maxY: 1500 };

        const minX = Math.min(...rects.map(r => r.l)) - 400;
        const minY = Math.min(...rects.map(r => r.t)) - 400;
        const maxX = Math.max(...rects.map(r => r.r)) + 400;
        const maxY = Math.max(...rects.map(r => r.b)) + 400;

        return { minX, minY, maxX, maxY };
    };

    const bounds = getBounds();
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    const maxContentDim = Math.max(contentWidth, contentHeight);
    const scale = mapSize / maxContentDim;
    const mapHeight = contentHeight * scale;

    const viewWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    const viewWorldMinX = -canvasTransform.x / canvasTransform.scale;
    const viewWorldMinY = -canvasTransform.y / canvasTransform.scale;
    const viewWorldMaxX = (viewWidth - canvasTransform.x) / canvasTransform.scale;
    const viewWorldMaxY = (viewHeight - canvasTransform.y) / canvasTransform.scale;

    const handleMapClick = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const worldX = (clickX / scale) + bounds.minX;
        const worldY = (clickY / scale) + bounds.minY;

        const zoom = canvasTransform.scale;
        const centerX = viewWidth / 2;
        const centerY = viewHeight / 2;

        const newCanvasX = centerX - (worldX * zoom);
        const newCanvasY = centerY - (worldY * zoom);

        onNavigate(newCanvasX, newCanvasY);
    };

    return (
        <div style={{
            position: 'absolute',
            bottom: '24px',
            right: '320px',
            width: mapSize,
            height: mapHeight,
            background: 'rgba(10, 10, 10, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            zIndex: 100,
            cursor: 'crosshair',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            transition: 'opacity 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div
                onClick={handleMapClick}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                }}
            >
                {/* Element Thumbnails */}
                {Object.values(elements).map(el => {
                    const l = parseInt(String(el.styles?.left || '0'));
                    const t = parseInt(String(el.styles?.top || '0'));
                    const w = parseInt(String(el.styles?.width || '0')) || 100;
                    const h = parseInt(String(el.styles?.height || '0')) || 100;
                    const isSelected = String(el.styles?.outline || '').includes('var(--accent-gold)');

                    return (
                        <div key={el.id} style={{
                            position: 'absolute',
                            left: (l - bounds.minX) * scale,
                            top: (t - bounds.minY) * scale,
                            width: Math.max(2, w * scale),
                            height: Math.max(2, h * scale),
                            backgroundColor: isSelected ? 'rgba(255, 224, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '1px'
                        }} />
                    );
                })}

                {/* Viewport Frame */}
                <div style={{
                    position: 'absolute',
                    left: (viewWorldMinX - bounds.minX) * scale,
                    top: (viewWorldMinY - bounds.minY) * scale,
                    width: (viewWorldMaxX - viewWorldMinX) * scale,
                    height: (viewWorldMaxY - viewWorldMinY) * scale,
                    border: '1px solid var(--accent-teal)',
                    backgroundColor: 'rgba(0, 224, 255, 0.05)',
                    pointerEvents: 'none',
                    boxShadow: '0 0 10px rgba(0, 224, 255, 0.2)',
                    zIndex: 10
                }} />
            </div>

            {/* Scale Indicator */}
            <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: '8px',
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 'bold',
                fontFamily: 'monospace'
            }}>
                NAVIGATOR
            </div>
        </div>
    );
}
