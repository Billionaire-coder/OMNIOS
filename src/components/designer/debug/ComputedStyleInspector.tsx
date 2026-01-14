"use client";

import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { MousePointer2, Box, Info, ChevronDown } from 'lucide-react';

export const ComputedStyleInspector = () => {
    const { state } = useProjectStore();
    const selectedElement = state.selectedElementId ? state.elements[state.selectedElementId] : null;

    if (!selectedElement) return null;

    const styles = selectedElement.styles || {};

    return (
        <div style={{ padding: '20px', borderTop: '1px solid #333', marginTop: '20px' }}>
            <h3 style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MousePointer2 size={12} /> Computed Styles
            </h3>

            {/* Box Model Visualization */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '20px',
                backgroundColor: '#111',
                borderRadius: '8px'
            }}>
                <div style={{
                    border: '1px dashed #444',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{ fontSize: '0.6rem', color: '#444' }}>margin</span>
                    <div style={{
                        border: '1px solid #666',
                        padding: '10px',
                        backgroundColor: 'rgba(255, 165, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span style={{ fontSize: '0.6rem', color: '#666' }}>padding</span>
                        <div style={{
                            width: '60px',
                            height: '30px',
                            backgroundColor: 'rgba(50, 205, 50, 0.1)',
                            border: '1px solid #2ed573',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>content</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Style List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.entries(styles).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '4px 0' }}>
                        <span style={{ color: '#aaa', fontFamily: 'monospace' }}>{key}</span>
                        <span style={{ color: 'var(--accent-teal)', fontFamily: 'monospace' }}>{String(value)}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '15px', padding: '8px', backgroundColor: 'rgba(0, 224, 255, 0.05)', borderRadius: '6px', fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={12} color="var(--accent-teal)" />
                Showing overrides and active tokens.
            </div>
        </div>
    );
};
