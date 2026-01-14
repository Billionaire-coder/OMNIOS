
import React from 'react';
import { useProjectStore } from '../../hooks/useProjectStore';
import { ElementRenderer } from './ElementRenderer';
import { Smartphone } from 'lucide-react';

interface MobilePreviewProps {
    onClose: () => void;
}

export const MobilePreview: React.FC<MobilePreviewProps> = ({ onClose }) => {
    const { state, setSelectedElement } = useProjectStore();
    const activePage = state.pages[state.activePageId];

    // Filter root elements for the active page
    // Use single root element from active page
    const rootId = activePage?.rootElementId;
    const rootElement = rootId ? state.elements[rootId] : null;
    const rootElements = rootElement ? [rootElement] : [];

    // Device Dimensions (iPhone 14 Pro-ish)
    const deviceWidth = 393;
    const deviceHeight = 852;

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#050505',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            {/* Header */}
            <div style={{
                position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: '10px', alignItems: 'center',
                padding: '10px 20px', borderRadius: '30px', backgroundColor: '#111', border: '1px solid #333'
            }}>
                <Smartphone size={16} color="var(--accent-teal)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Native Mobile Preview</span>
                <span style={{ fontSize: '0.7rem', color: '#666', borderLeft: '1px solid #333', paddingLeft: '10px' }}>
                    React Native Validation Active
                </span>
                <button
                    onClick={onClose}
                    style={{
                        marginLeft: '10px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px'
                    }}
                >
                    Exit
                </button>
            </div>

            {/* Phone Frame */}
            <div style={{
                position: 'relative',
                width: `${deviceWidth + 24}px`,
                height: `${deviceHeight + 24}px`,
                backgroundColor: '#222',
                borderRadius: '50px',
                border: '4px solid #444',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8)',
                padding: '12px',
                overflow: 'hidden'
            }}>
                {/* Screen Area */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000',
                    borderRadius: '38px', // Inner radius
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Notch Simulation */}
                    <div style={{
                        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                        width: '120px', height: '35px', backgroundColor: '#000',
                        borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px',
                        zIndex: 9999
                    }} />

                    {/* Content Renderer */}
                    {/* We need a scrolling container here since native apps scroll the body */}
                    <div className="no-scrollbar" style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
                        <div style={{ minHeight: '100%', position: 'relative' }}>
                            {rootElements.map(el => (
                                <ElementRenderer
                                    key={el.id}
                                    elementId={el.id}
                                    elements={state.elements}
                                    selectedElementId={state.selectedElementId}
                                    onSelect={(id, e) => setSelectedElement(id)}
                                    // Disable move in preview
                                    onMove={() => { }}
                                    nativeMode={true}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
