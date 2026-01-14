import React from 'react';

interface SelectInputProps {
    value: any;
    onChange: (val: string) => void;
    options: { label: string, value: string }[];
}

export function SelectInput({ value, onChange, options }: SelectInputProps) {
    return (
        <select
            className="glass"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '100%', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
        >
            {options.map(o => <option key={o.value} value={o.value} style={{ backgroundColor: '#111', color: 'white' }}>{o.label}</option>)}
        </select>
    );
}
