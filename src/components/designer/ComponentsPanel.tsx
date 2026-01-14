import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import * as Icons from 'lucide-react';

export function ComponentsPanel({ onOpenWorkshop }: { onOpenWorkshop?: (componentId: string) => void }) {
    const { state, instantiateComponent } = useProjectStore();
    const components = state.designSystem.components || [];

    return (
        <div style={{ padding: '15px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.Component size={14} /> Master Components
            </h3>

            {components.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '0.8rem', border: '1px dashed #333', borderRadius: '4px' }}>
                    No components yet.<br />
                    Select an element and click <Icons.Component size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> to create one.
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* ... existing components map ... */}
                {components.map(comp => (
                    <div
                        key={comp.id}
                        onClick={() => instantiateComponent(comp.id, state.rootElementId)}
                        style={{
                            padding: '10px',
                            backgroundColor: '#222',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-teal)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; }}
                    >
                        <div style={{ marginBottom: '8px', height: '40px', backgroundColor: '#111', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Box size={16} color="#444" />
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {comp.name}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#666' }}>
                            {Object.keys(comp.elements).length} elements
                        </div>

                        {/* Batch 15.2: Workshop Integration */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenWorkshop?.(comp.id);
                            }}
                            style={{
                                marginTop: '8px',
                                width: '100%',
                                padding: '6px',
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                color: '#aaa',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-teal)'; e.currentTarget.style.color = 'black'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#aaa'; }}
                        >
                            <Icons.DollarSign size={12} /> Sell This
                        </button>
                    </div>
                ))}
            </div>

            {/* MARKETPLACE BUNDLES (Framer15) */}
            <div style={{
                marginTop: '30px',
                padding: '15px',
                backgroundColor: 'rgba(0, 224, 255, 0.03)',
                border: '1px solid rgba(0, 224, 255, 0.1)',
                borderRadius: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Icons.ShoppingBag size={14} color="var(--accent-teal)" />
                    <h4 style={{ fontSize: '0.75rem', color: 'white', fontWeight: 'bold', margin: 0 }}>Marketplace Bundles</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '8px', backgroundColor: '#111', borderRadius: '4px', border: '1px solid #222', fontSize: '0.7rem', color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Real Estate Pack</span>
                        <span style={{ color: 'var(--accent-teal)', fontWeight: 'bold' }}>$29</span>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#111', borderRadius: '4px', border: '1px solid #222', fontSize: '0.7rem', color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Restaurant Kit</span>
                        <span style={{ color: 'var(--accent-teal)', fontWeight: 'bold' }}>$19</span>
                    </div>
                    <button style={{
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: 'var(--accent-teal)',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        Browse All Bundles
                    </button>
                </div>
            </div>
        </div>
    );
}
