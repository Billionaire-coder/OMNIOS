import React from 'react';
import { UnitInput } from './UnitInput';
import { ColorInput } from './ColorInput';
import { Plus, X, Layers, ArrowRight } from 'lucide-react';

interface ShadowEditorProps {
    value: string;
    onChange: (value: string) => void;
}

interface ShadowLayer {
    x: string;
    y: string;
    blur: string;
    spread: string;
    color: string;
    inset: boolean;
}

const parseShadows = (shadowStr: string): ShadowLayer[] => {
    if (!shadowStr || shadowStr === 'none') return [];
    // Basic parser for comma-separated shadows
    // This is a simplified regex, might need robustness for complex color strings
    // Splitting by comma that is NOT inside parentheses (for rgba)
    const parts = shadowStr.split(/,(?![^(]*\))/);

    return parts.map(part => {
        const p = part.trim();
        const isInset = p.includes('inset');
        const cleanP = p.replace('inset', '').trim();

        // Match color (hex, rgb, rgba) - simplified assumption: color is at the end or start?
        // Standard CSS syntax: [inset] <offset-x> <offset-y> <blur-radius>? <spread-radius>? <color>?
        // Let's assume a simplified format we enforce: x y blur spread color

        // We will just try to match numeric parts
        const numbers = cleanP.match(/(-?[\d.]+(?:px|em|rem|%|vh|vw)?)/g) || [];
        const x = numbers[0] || '0px';
        const y = numbers[1] || '0px';
        const blur = numbers[2] || '0px';
        const spread = numbers[3] || '0px';

        // Isolate color by removing numbers and inset
        let color = cleanP;
        numbers.forEach(n => { color = color.replace(n, ''); });
        color = color.trim();
        if (!color) color = 'rgba(0,0,0,0.5)';

        return { x, y, blur, spread, color, inset: isInset };
    });
};

const stringifyShadows = (layers: ShadowLayer[]): string => {
    if (layers.length === 0) return 'none';
    return layers.map(l => `${l.inset ? 'inset ' : ''}${l.x} ${l.y} ${l.blur} ${l.spread} ${l.color}`).join(', ');
};

export function ShadowEditor({ value, onChange }: ShadowEditorProps) {
    const [layers, setLayers] = React.useState<ShadowLayer[]>(parseShadows(value));
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

    React.useEffect(() => {
        setLayers(parseShadows(value));
    }, [value]);

    const updateLayers = (newLayers: ShadowLayer[]) => {
        setLayers(newLayers);
        onChange(stringifyShadows(newLayers));
    };

    const addLayer = () => {
        const newLayer: ShadowLayer = { x: '0px', y: '4px', blur: '10px', spread: '0px', color: 'rgba(0,0,0,0.25)', inset: false };
        const newLayers = [...layers, newLayer];
        updateLayers(newLayers);
        setEditingIndex(newLayers.length - 1);
    };

    const removeLayer = (index: number) => {
        const newLayers = layers.filter((_, i) => i !== index);
        updateLayers(newLayers);
        if (editingIndex === index) setEditingIndex(null);
    };

    const updateLayer = (index: number, updates: Partial<ShadowLayer>) => {
        const newLayers = [...layers];
        newLayers[index] = { ...newLayers[index], ...updates };
        updateLayers(newLayers);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#666', textTransform: 'uppercase' }}>Box Shadows</span>
                <button
                    onClick={addLayer}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
                >
                    <Plus size={12} /> Add
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {layers.length === 0 && (
                    <div style={{ padding: '10px', border: '1px dashed #333', borderRadius: '4px', color: '#555', fontSize: '0.7rem', textAlign: 'center' }}>
                        No shadows found.
                    </div>
                )}

                {layers.map((layer, i) => (
                    <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                            style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.2)' }}
                            onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: layer.color, border: '1px solid #444' }} />
                                <span style={{ fontSize: '0.7rem', color: '#eee' }}>Shadow {i + 1}</span>
                                {layer.inset && <span style={{ fontSize: '0.5rem', padding: '1px 3px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>INSET</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Layers size={12} color="#666" />
                                {editingIndex === i ? <ArrowRight size={12} style={{ transform: 'rotate(90deg)' }} /> : <ArrowRight size={12} />}
                            </div>
                        </div>

                        {editingIndex === i && (
                            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <UnitInput label="X Offset" value={layer.x} onChange={(v) => updateLayer(i, { x: v })} />
                                    <UnitInput label="Y Offset" value={layer.y} onChange={(v) => updateLayer(i, { y: v })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <UnitInput label="Blur" value={layer.blur} onChange={(v) => updateLayer(i, { blur: v })} />
                                    <UnitInput label="Spread" value={layer.spread} onChange={(v) => updateLayer(i, { spread: v })} />
                                </div>

                                <ColorInput value={layer.color} onChange={(v) => updateLayer(i, { color: v })} label="Color" />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#ccc', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={layer.inset}
                                            onChange={(e) => updateLayer(i, { inset: e.target.checked })}
                                        />
                                        Inset
                                    </label>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeLayer(i); }}
                                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                                    >
                                        <X size={10} /> Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
