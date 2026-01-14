import React, { useState } from 'react';
import { UnitInput } from './UnitInput';
import { ColorInput } from './ColorInput';
import { SelectInput } from './SelectInput';
import { ChevronDown, ChevronRight, Square } from 'lucide-react';

interface AdvancedBorderEditorProps {
    styles: any;
    onChange: (updates: any) => void;
}

export function AdvancedBorderEditor({ styles, onChange }: AdvancedBorderEditorProps) {
    const [expanded, setExpanded] = useState(false);
    const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

    // Radius Helpers
    const updateRadius = (val: string, side?: string) => {
        if (!side) {
            // Unify all
            onChange({
                borderRadius: val,
                borderTopLeftRadius: undefined,
                borderTopRightRadius: undefined,
                borderBottomLeftRadius: undefined,
                borderBottomRightRadius: undefined
            });
        } else {
            onChange({ [`border${side}Radius`]: val });
        }
    };

    // Border Side Helpers
    const updateBorder = (prop: string, val: string, side?: string) => {
        if (!side) {
            // Unified border string "1px solid red" -> handled by simple input usually
            // Here we might just set specific props if in advanced mode
            // For now, let's assume we use explicit props for advanced
            onChange({ [prop]: val });
        } else {
            onChange({ [`border${side}${prop}`]: val });
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setExpanded(!expanded)}
            >
                <span style={{ fontSize: '0.6rem', color: '#666', textTransform: 'uppercase' }}>Advanced Borders</span>
                {expanded ? <ChevronDown size={12} color="#666" /> : <ChevronRight size={12} color="#666" />}
            </div>

            {expanded && (
                <div style={{ paddingLeft: '8px', borderLeft: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    {/* RADIUS */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.6rem', color: '#888' }}>CORNER RADIUS</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                    onClick={() => setMode('simple')}
                                    style={{ background: mode === 'simple' ? 'var(--accent-teal)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '2px', width: '12px', height: '12px', cursor: 'pointer' }}
                                    title="Uniform"
                                />
                                <button
                                    onClick={() => setMode('advanced')}
                                    style={{ background: mode === 'advanced' ? 'var(--accent-teal)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '2px', width: '12px', height: '12px', cursor: 'pointer', display: 'flex', flexWrap: 'wrap', gap: '1px', padding: '1px' }}
                                    title="Individual"
                                >
                                    <div style={{ width: '3px', height: '3px', background: 'white' }} />
                                    <div style={{ width: '3px', height: '3px', background: 'white' }} />
                                    <div style={{ width: '3px', height: '3px', background: 'white' }} />
                                    <div style={{ width: '3px', height: '3px', background: 'white' }} />
                                </button>
                            </div>
                        </div>

                        {mode === 'simple' ? (
                            <UnitInput label="All Corners" value={styles.borderRadius} onChange={(v) => updateRadius(v)} placeholder="0px" />
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                <UnitInput label="Top-Left" value={styles.borderTopLeftRadius || styles.borderRadius} onChange={(v) => updateRadius(v, 'TopLeft')} />
                                <UnitInput label="Top-Right" value={styles.borderTopRightRadius || styles.borderRadius} onChange={(v) => updateRadius(v, 'TopRight')} />
                                <UnitInput label="Btm-Left" value={styles.borderBottomLeftRadius || styles.borderRadius} onChange={(v) => updateRadius(v, 'BottomLeft')} />
                                <UnitInput label="Btm-Right" value={styles.borderBottomRightRadius || styles.borderRadius} onChange={(v) => updateRadius(v, 'BottomRight')} />
                            </div>
                        )}
                    </div>

                    {/* BORDERS */}
                    <div>
                        <span style={{ fontSize: '0.6rem', color: '#888', display: 'block', marginBottom: '4px' }}>INDIVIDUAL SIDES</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {/* Top */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.55rem', color: '#666' }}>TOP</span>
                                <UnitInput value={styles.borderTopWidth} onChange={(v) => updateBorder('Width', v, 'Top')} placeholder="width" />
                                <ColorInput value={styles.borderTopColor} onChange={(v) => updateBorder('Color', v, 'Top')} />
                                <SelectInput value={styles.borderTopStyle} onChange={(v) => updateBorder('Style', v, 'Top')} options={[{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'None', value: 'none' }]} />
                            </div>
                            {/* Right */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.55rem', color: '#666' }}>RIGHT</span>
                                <UnitInput value={styles.borderRightWidth} onChange={(v) => updateBorder('Width', v, 'Right')} placeholder="width" />
                                <ColorInput value={styles.borderRightColor} onChange={(v) => updateBorder('Color', v, 'Right')} />
                                <SelectInput value={styles.borderRightStyle} onChange={(v) => updateBorder('Style', v, 'Right')} options={[{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'None', value: 'none' }]} />
                            </div>
                            {/* Bottom */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.55rem', color: '#666' }}>BOTTOM</span>
                                <UnitInput value={styles.borderBottomWidth} onChange={(v) => updateBorder('Width', v, 'Bottom')} placeholder="width" />
                                <ColorInput value={styles.borderBottomColor} onChange={(v) => updateBorder('Color', v, 'Bottom')} />
                                <SelectInput value={styles.borderBottomStyle} onChange={(v) => updateBorder('Style', v, 'Bottom')} options={[{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'None', value: 'none' }]} />
                            </div>
                            {/* Left */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.55rem', color: '#666' }}>LEFT</span>
                                <UnitInput value={styles.borderLeftWidth} onChange={(v) => updateBorder('Width', v, 'Left')} placeholder="width" />
                                <ColorInput value={styles.borderLeftColor} onChange={(v) => updateBorder('Color', v, 'Left')} />
                                <SelectInput value={styles.borderLeftStyle} onChange={(v) => updateBorder('Style', v, 'Left')} options={[{ label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'None', value: 'none' }]} />
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
