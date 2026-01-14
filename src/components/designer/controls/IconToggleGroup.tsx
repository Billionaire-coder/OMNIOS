import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface IconToggleOption {
    value: string;
    icon: LucideIcon;
    label?: string; // Optional tooltip or label
    title?: string; // Native tooltip
}

interface IconToggleGroupProps {
    options: IconToggleOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string; // Optional group label
}

export function IconToggleGroup({ options, value, onChange, label }: IconToggleGroupProps) {
    return (
        <div style={{ marginBottom: '10px' }}>
            {label && (
                <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '6px', fontWeight: '500', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    {label}
                </div>
            )}
            <div style={{
                display: 'flex',
                backgroundColor: '#111',
                borderRadius: '6px',
                padding: '2px',
                border: '1px solid #333'
            }}>
                {options.map((option) => {
                    const isActive = value === option.value;
                    return (
                        <button
                            key={option.value}
                            onClick={() => onChange(option.value)}
                            title={option.title || option.label}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '6px',
                                border: 'none',
                                background: isActive ? '#333' : 'transparent',
                                color: isActive ? 'white' : '#666',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.1s ease',
                                outline: 'none'
                            }}
                        >
                            <option.icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
