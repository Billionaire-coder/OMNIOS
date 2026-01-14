import React from 'react';
import { UnitInput } from './UnitInput';
import { SelectInput } from './SelectInput';

interface FilterEditorProps {
    styles: any;
    onChange: (updates: any) => void;
}

export function FilterEditor({ styles, onChange }: FilterEditorProps) {
    // Helper to parse filter string 'blur(10px) brightness(1.2)' -> { blur: '10px', brightness: '1.2' }
    // This is a simplified parser/serializer for the MVP
    const getFilterValue = (name: string, defaultValue: string = '0') => {
        if (!styles.filter) return defaultValue;
        const match = styles.filter.match(new RegExp(`${name}\\(([^)]+)\\)`));
        return match ? match[1] : defaultValue;
    };

    const updateFilter = (name: string, val: string, defaultVal: string) => {
        let currentFilter = styles.filter || '';
        const regex = new RegExp(`${name}\\([^)]+\\)`);

        let newFilter = '';
        if (currentFilter.match(regex)) {
            // If value is default, remove it
            if (val === defaultVal) {
                newFilter = currentFilter.replace(regex, '').trim();
            } else {
                newFilter = currentFilter.replace(regex, `${name}(${val})`);
            }
        } else {
            if (val !== defaultVal) {
                newFilter = `${currentFilter} ${name}(${val})`.trim();
            } else {
                newFilter = currentFilter;
            }
        }
        onChange({ filter: newFilter });
    };

    const getBackdropBlur = () => {
        if (!styles.backdropFilter) return '0px';
        const match = styles.backdropFilter.match(/blur\(([^)]+)\)/);
        return match ? match[1] : '0px';
    };

    const updateBackdropBlur = (val: string) => {
        if (!val || val === '0px') {
            onChange({ backdropFilter: undefined });
        } else {
            onChange({ backdropFilter: `blur(${val})` });
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Standard Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <UnitInput
                    label="Blur"
                    value={getFilterValue('blur', '0px')}
                    onChange={(v) => updateFilter('blur', v, '0px')}
                    placeholder="0px"
                />
                <UnitInput
                    label="Brightness"
                    value={getFilterValue('brightness', '100%')}
                    onChange={(v) => updateFilter('brightness', v, '100%')}
                    placeholder="100%"
                />
                <UnitInput
                    label="Contrast"
                    value={getFilterValue('contrast', '100%')}
                    onChange={(v) => updateFilter('contrast', v, '100%')}
                    placeholder="100%"
                />
                <UnitInput
                    label="Grayscale"
                    value={getFilterValue('grayscale', '0%')}
                    onChange={(v) => updateFilter('grayscale', v, '0%')}
                    placeholder="0%"
                />
                <UnitInput
                    label="Hue Rotate"
                    value={getFilterValue('hue-rotate', '0deg')}
                    onChange={(v) => updateFilter('hue-rotate', v, '0deg')}
                    placeholder="0deg"
                />
                <UnitInput
                    label="Sat (Saturate)"
                    value={getFilterValue('saturate', '100%')}
                    onChange={(v) => updateFilter('saturate', v, '100%')}
                    placeholder="100%"
                />
            </div>

            {/* Backdrop Filter (Glassmorphism) */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                <UnitInput
                    label="Backdrop Blur (Glass)"
                    value={getBackdropBlur()}
                    onChange={updateBackdropBlur}
                    placeholder="0px"
                />
            </div>

            {/* Mix Blend Mode */}
            <div>
                <span style={{ fontSize: '0.6rem', color: '#666', textTransform: 'uppercase' }}>Blend Mode</span>
                <SelectInput
                    value={styles.mixBlendMode || 'normal'}
                    onChange={(v) => onChange({ mixBlendMode: v })}
                    options={[
                        { label: 'Normal', value: 'normal' },
                        { label: 'Multiply', value: 'multiply' },
                        { label: 'Screen', value: 'screen' },
                        { label: 'Overlay', value: 'overlay' },
                        { label: 'Darken', value: 'darken' },
                        { label: 'Lighten', value: 'lighten' },
                        { label: 'Color Dodge', value: 'color-dodge' },
                        { label: 'Color Burn', value: 'color-burn' },
                        { label: 'Difference', value: 'difference' },
                        { label: 'Exclusion', value: 'exclusion' },
                        { label: 'Hue', value: 'hue' },
                        { label: 'Saturation', value: 'saturation' },
                        { label: 'Color', value: 'color' },
                        { label: 'Luminosity', value: 'luminosity' },
                    ]}
                />
            </div>
        </div>
    );
}
