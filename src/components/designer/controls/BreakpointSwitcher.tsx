import React from 'react';
import { Monitor, Tablet, Smartphone, ChevronRight } from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';

export function BreakpointSwitcher() {
    const { state, setViewMode } = useProjectStore();
    const { viewMode } = state;

    const breakpoints = [
        { id: 'desktop', icon: Monitor, label: 'Desktop', width: '1920+' },
        { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768' },
        { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '100px',
                border: '1px solid var(--glass-border)',
                position: 'relative',
                height: '36px'
            }}>
                {breakpoints.map((bp, idx) => {
                    const isActive = viewMode === bp.id;
                    const isLast = idx === breakpoints.length - 1;

                    return (
                        <React.Fragment key={bp.id}>
                            <button
                                onClick={() => setViewMode(bp.id as any)}
                                title={`${bp.label} (${bp.width}px)`}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    height: '100%',
                                    borderRadius: '100px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    backgroundColor: isActive ? 'var(--accent-teal)' : 'transparent',
                                    color: isActive ? '#000' : '#888',
                                    zIndex: 2,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontWeight: isActive ? 'bold' : 'normal'
                                }}
                            >
                                <bp.icon size={13} strokeWidth={isActive ? 3 : 2} />
                                <span style={{ fontSize: '0.65rem', display: isActive ? 'inline' : 'none' }}>{bp.label}</span>
                            </button>

                            {!isLast && (
                                <ChevronRight
                                    size={10}
                                    color="rgba(255,255,255,0.1)"
                                    strokeWidth={3}
                                    style={{ flexShrink: 0 }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.55rem', color: '#444', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Cascade Flow
                </span>
            </div>
        </div>
    );
}
