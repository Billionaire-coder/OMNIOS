import React from 'react';

export interface SnapGuide {
    type: 'vertical' | 'horizontal' | 'gap';
    pos: number;
    orientation?: 'v' | 'h'; // 'v' for gaps between stacked items, 'h' for gaps between side-by-side items
    gapStart?: number;
    gapSize?: number;
    color?: string;
}

export function SmartGuides({ guides, suggestedRect }: {
    guides: SnapGuide[],
    suggestedRect?: { left: number, top: number, width: number, height: number }
}) {
    if (!guides.length && !suggestedRect) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: 'none',
            zIndex: 9999
        }}>
            {guides.map((g, i) => {
                const color = g.color || 'var(--accent-primary)';
                const secondary = 'var(--accent-secondary)';

                if (g.type === 'vertical') {
                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            left: g.pos,
                            top: -2000,
                            bottom: -2000,
                            width: '1px',
                            backgroundColor: color, // Solid line
                            boxShadow: `0 0 4px ${color}`,
                            zIndex: 10000
                        }} />
                    );
                } else if (g.type === 'horizontal') {
                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            top: g.pos,
                            left: -2000,
                            right: -2000,
                            height: '1px',
                            backgroundColor: color, // Solid line
                            boxShadow: `0 0 4px ${color}`,
                            zIndex: 10000
                        }} />
                    );
                } else if (g.type === 'gap') {
                    if (g.gapStart === undefined || g.gapSize === undefined) return null;

                    const isHorizontal = g.orientation === 'h';

                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            left: isHorizontal ? g.gapStart : 0,
                            top: isHorizontal ? 0 : g.gapStart,
                            width: isHorizontal ? g.gapSize : '100%',
                            height: isHorizontal ? '100%' : g.gapSize,
                            backgroundColor: 'rgba(255, 0, 230, 0.05)', // Subtle pink fill
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9998
                        }}>
                            {/* Visual line indicators in the gap */}
                            <div style={{
                                position: 'absolute',
                                width: isHorizontal ? '100%' : '1px',
                                height: isHorizontal ? '1px' : '100%',
                                backgroundColor: secondary,
                                opacity: 0.8
                            }} />

                            <div style={{
                                backgroundColor: secondary,
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '600',
                                fontFamily: 'var(--font-ui)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                pointerEvents: 'none',
                                transform: isHorizontal ? 'none' : 'rotate(-90deg)',
                                zIndex: 10001
                            }}>
                                {Math.round(g.gapSize)}
                            </div>
                        </div>
                    );
                }
                return null;
            })}

            {/* MAGNETIC BUFFER GHOST BOX */}
            {suggestedRect && (
                <div style={{
                    position: 'absolute',
                    left: suggestedRect.left,
                    top: suggestedRect.top,
                    width: suggestedRect.width,
                    height: suggestedRect.height,
                    border: '1px solid var(--accent-secondary)',
                    backgroundColor: 'rgba(255, 0, 230, 0.1)',
                    borderRadius: '4px',
                    zIndex: 9997,
                    pointerEvents: 'none',
                }}>
                </div>
            )}
        </div>
    );
}
