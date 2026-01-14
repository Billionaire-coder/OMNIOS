import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';

interface ColorInputProps {
    value?: string;
    onChange: (val: string) => void;
    label?: string;
    placeholder?: string;
}

export function ColorInput({ value, onChange, label, placeholder }: ColorInputProps) {
    const { state } = useProjectStore();
    const colorTokens = state.designSystem.tokens.filter(t => t.type === 'color');
    const [showTokens, setShowTokens] = useState(false);

    // Resolve value for display if it's a token
    const displayValue = value?.startsWith('var(--token-')
        ? state.designSystem.tokens.find(t => `var(--token-${t.name.replace(/[^a-zA-Z0-9-]/g, '-')})` === value)?.value || 'transparent'
        : (value || 'transparent');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {label && <span style={{ fontSize: '0.6rem', color: '#666' }}>{label}</span>}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <div
                        onClick={() => setShowTokens(!showTokens)}
                        style={{
                            width: '30px', height: '30px', borderRadius: '4px',
                            backgroundColor: displayValue,
                            border: '1px solid #444', cursor: 'pointer',
                            backgroundImage: value ? 'none' : 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                            backgroundSize: '10px 10px',
                            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
                        }}
                        title="Pick Color or Token"
                    />
                </div>

                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || "Hex, var(--token...)"}
                    className="glass"
                    style={{ width: '100%', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
                />
            </div>

            {/* Token Swatches */}
            {showTokens && colorTokens.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', padding: '5px', backgroundColor: '#111', borderRadius: '4px', border: '1px solid #333' }}>
                    {colorTokens.map(t => (
                        <button
                            key={t.id}
                            onClick={() => {
                                const sanitized = t.name.replace(/[^a-zA-Z0-9-]/g, '-');
                                onChange(`var(--token-${sanitized})`);
                                setShowTokens(false);
                            }}
                            title={`${t.name} (${t.value})`}
                            style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                backgroundColor: t.value, border: '1px solid #555', cursor: 'pointer',
                                padding: 0
                            }}
                        />
                    ))}
                    <button
                        onClick={() => { onChange('#ffffff'); setShowTokens(false); }}
                        style={{ width: 'auto', fontSize: '0.6rem', padding: '2px 6px', background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: '4px' }}
                    >
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
}
