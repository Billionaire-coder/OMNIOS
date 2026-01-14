import React, { useState } from 'react';
import { UnitInput } from './UnitInput';
import { Link2, Link2Off, Box, Maximize2, Minimize2 } from 'lucide-react';

interface BoxModelEditorProps {
    styles: any;
    onChange: (updates: any) => void;
}

export function BoxModelEditor({ styles, onChange }: BoxModelEditorProps) {
    const [editingProp, setEditingProp] = useState<string | null>(null);
    const [isMarginLinked, setIsMarginLinked] = useState(false);
    const [isPaddingLinked, setIsPaddingLinked] = useState(false);
    const [hoveredType, setHoveredType] = useState<'margin' | 'padding' | null>(null);

    const sides = ['Top', 'Right', 'Bottom', 'Left'];

    const handleSync = (type: 'margin' | 'padding', sourceProp: string, value: string) => {
        const isLinked = type === 'margin' ? isMarginLinked : isPaddingLinked;
        if (!isLinked) {
            onChange({ [sourceProp]: value });
            return;
        }

        const updates: any = {};
        sides.forEach(side => {
            updates[`${type}${side}`] = value;
        });
        onChange(updates);
    };

    const renderEdgeValue = (type: 'margin' | 'padding', side: string) => {
        const propName = `${type}${side}`;
        const value = styles[propName] || '0px';
        const isActive = editingProp === propName;

        return (
            <div
                onClick={() => setEditingProp(propName)}
                style={{
                    fontSize: '9px',
                    color: isActive ? 'var(--accent-teal)' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    padding: '1px 3px',
                    borderRadius: '2px',
                    backgroundColor: isActive ? 'rgba(0,255,150,0.15)' : 'transparent',
                    whiteSpace: 'nowrap',
                    fontFamily: 'monospace',
                    transition: 'all 0.1s ease',
                    zIndex: 2
                }}
                onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                }}
            >
                {value === '0px' ? '0' : value.replace('px', '')}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                    Box Model
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setIsMarginLinked(!isMarginLinked)}
                        title="Link Margins"
                        style={{ background: 'none', border: 'none', color: isMarginLinked ? 'var(--accent-gold)' : '#444', cursor: 'pointer', padding: 0 }}
                    >
                        {isMarginLinked ? <Link2 size={12} /> : <Link2Off size={12} />}
                    </button>
                    <button
                        onClick={() => setIsPaddingLinked(!isPaddingLinked)}
                        title="Link Paddings"
                        style={{ background: 'none', border: 'none', color: isPaddingLinked ? 'var(--accent-teal)' : '#444', cursor: 'pointer', padding: 0 }}
                    >
                        {isPaddingLinked ? <Link2 size={12} /> : <Link2Off size={12} />}
                    </button>
                </div>
            </div>

            <div style={{
                position: 'relative',
                width: '100%',
                padding: '24px 32px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* MARGIN BOX (OUTER) */}
                <div
                    onMouseEnter={() => setHoveredType('margin')}
                    onMouseLeave={() => setHoveredType(null)}
                    style={{
                        position: 'absolute',
                        inset: '8px',
                        border: `1px solid ${hoveredType === 'margin' ? 'rgba(255,165,0,0.3)' : 'rgba(255,255,255,0.05)'}`,
                        borderRadius: '6px',
                        backgroundColor: hoveredType === 'margin' ? 'rgba(255,165,0,0.02)' : 'transparent',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)' }}>{renderEdgeValue('margin', 'Top')}</div>
                    <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)' }}>{renderEdgeValue('margin', 'Bottom')}</div>
                    <div style={{ position: 'absolute', left: '2px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)' }}>{renderEdgeValue('margin', 'Left')}</div>
                    <div style={{ position: 'absolute', right: '2px', top: '50%', transform: 'translateY(-50%) rotate(90deg)' }}>{renderEdgeValue('margin', 'Right')}</div>

                    <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '7px', color: '#444', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
                        Margin
                    </span>
                </div>

                {/* PADDING BOX (INNER) */}
                <div
                    onMouseEnter={() => setHoveredType('padding')}
                    onMouseLeave={() => setHoveredType(null)}
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '60px',
                        backgroundColor: hoveredType === 'padding' ? 'rgba(0,255,150,0.05)' : 'rgba(0,255,150,0.02)',
                        border: `1px solid ${hoveredType === 'padding' ? 'rgba(0,255,150,0.3)' : 'rgba(0,255,150,0.1)'}`,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{ position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)' }}>{renderEdgeValue('padding', 'Top')}</div>
                    <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)' }}>{renderEdgeValue('padding', 'Bottom')}</div>
                    <div style={{ position: 'absolute', left: '2px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)' }}>{renderEdgeValue('padding', 'Left')}</div>
                    <div style={{ position: 'absolute', right: '2px', top: '50%', transform: 'translateY(-50%) rotate(90deg)' }}>{renderEdgeValue('padding', 'Right')}</div>

                    <span style={{ position: 'absolute', top: '4px', left: '6px', fontSize: '7px', color: 'rgba(0,255,150,0.3)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
                        Padding
                    </span>

                    {/* CONTENT AREA */}
                    <div style={{
                        width: '40%',
                        height: '40%',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px dashed rgba(255,255,255,0.1)',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Box size={10} color="#333" />
                    </div>
                </div>
            </div>

            {/* FOCUSED EDITOR */}
            {editingProp && (
                <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {editingProp.startsWith('margin') ? <Maximize2 size={12} color="orange" /> : <Minimize2 size={12} color="var(--accent-teal)" />}
                            <span style={{ fontSize: '0.7rem', color: editingProp.startsWith('margin') ? 'orange' : 'var(--accent-teal)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {editingProp}
                            </span>
                        </div>
                        <button
                            onClick={() => setEditingProp(null)}
                            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '10px' }}
                        >
                            DONE
                        </button>
                    </div>
                    <UnitInput
                        value={styles[editingProp]}
                        onChange={(v) => handleSync(editingProp.startsWith('margin') ? 'margin' : 'padding', editingProp, v)}
                        placeholder="0px"
                    />
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
