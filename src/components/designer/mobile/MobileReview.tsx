"use client";

import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { ElementRenderer } from '../ElementRenderer';

export const MobileReview = () => {
    const { state, isInitialized, setSelectedElement } = useProjectStore();

    if (!isInitialized || !state.elements[state.rootElementId]) {
        return (
            <div style={{ color: '#888', padding: '100px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Establishing Bridge...</h2>
                <p>Establishing mobile bridge to OMNIOS editor</p>
            </div>
        );
    }

    return (
        <div style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
        }}>
            <div style={{
                width: '100%',
                aspectRatio: '9/16',
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '8px solid #222',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    transform: 'scale(0.8)', // Scale down to fit the "phone" frame
                    transformOrigin: 'top center',
                    overflow: 'auto',
                    backgroundColor: 'white'
                }}>
                    <ElementRenderer
                        elementId={state.rootElementId}
                        elements={state.elements}
                        selectedElementId={state.selectedElementId}
                        onSelect={(id) => setSelectedElement(id)}
                    />
                </div>
            </div>

            <div style={{ textAlign: 'center', padding: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Design Review Mode</h2>
                <p style={{ fontSize: '0.8rem', color: '#888' }}>
                    This is a live preview of your OMNIOS project.
                    Changes made in the editor will reflect here instantly.
                </p>
            </div>
        </div>
    );
};
