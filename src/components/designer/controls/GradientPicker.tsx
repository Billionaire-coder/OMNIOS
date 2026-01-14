import React from 'react';
import { UnitInput } from './UnitInput';
import { ColorInput } from './ColorInput';

interface GradientPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export function GradientPicker({ value, onChange }: GradientPickerProps) {
    const isGradient = value?.includes('linear-gradient');
    const [enabled, setEnabled] = React.useState(isGradient);

    // Parse gradient: linear-gradient(90deg, red 0%, blue 100%)
    const parseGradient = (str: string) => {
        if (!str || !str.includes('linear-gradient')) return { angle: '180deg', startColor: 'rgba(0,0,0,1)', endColor: 'rgba(255,255,255,1)' };
        const match = str.match(/linear-gradient\(([^,]+),\s*([^,]+)(?:,\s*([^)]+))?\)/);
        if (!match) return { angle: '180deg', startColor: '#000000', endColor: '#ffffff' };

        // Simplified parser for MVP: Angle, Start, End
        const angle = match[1].trim();
        // Colors might have percentages, we try to strip them for the color input if needed, 
        // but let's assume standard "color %" format or just "color"
        const startRaw = match[2].trim().split(' ')[0];
        const endRaw = match[3] ? match[3].trim().split(' ')[0] : '#ffffff';

        return { angle, startColor: startRaw, endColor: endRaw };
    };

    const [params, setParams] = React.useState(parseGradient(value));

    React.useEffect(() => {
        if (value && value.includes('linear-gradient')) {
            setEnabled(true);
            setParams(parseGradient(value));
        } else if (value && value !== 'none') {
            setEnabled(false);
        }
    }, [value]);

    const updateGradient = (newParams: any) => {
        const p = { ...params, ...newParams };
        setParams(p);
        if (enabled) {
            onChange(`linear-gradient(${p.angle}, ${p.startColor}, ${p.endColor})`);
        }
    };

    const toggleGradient = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isEnabled = e.target.checked;
        setEnabled(isEnabled);
        if (isEnabled) {
            onChange(`linear-gradient(${params.angle}, ${params.startColor}, ${params.endColor})`);
        } else {
            onChange('transparent'); // Or revert to solid color? Hard to say without history.
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#666', textTransform: 'uppercase' }}>Use Gradient</span>
                <input type="checkbox" checked={enabled} onChange={toggleGradient} />
            </div>

            {enabled && (
                <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <UnitInput label="Angle" value={params.angle} onChange={(v) => updateGradient({ angle: v })} placeholder="180deg" />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <ColorInput label="Start" value={params.startColor} onChange={(v) => updateGradient({ startColor: v })} />
                        <ColorInput label="End" value={params.endColor} onChange={(v) => updateGradient({ endColor: v })} />
                    </div>
                </div>
            )}
        </div>
    );
}
