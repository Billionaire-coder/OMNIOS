import React, { useState, useEffect, useRef } from 'react';

interface UnitInputProps {
    value: string | undefined;
    onChange: (val: string) => void;
    label?: string;
    placeholder?: string;
    units?: string[];
    overridden?: boolean;
    source?: 'local' | 'class' | 'inherited' | 'none';
}

const DEFAULT_UNITS = ['px', '%', 'rem', 'em', 'vw', 'vh', 'fr', 'auto'];

export function UnitInput({ 
    value = '', 
    onChange, 
    label, 
    placeholder, 
    units = DEFAULT_UNITS, 
    overridden,
    source = 'none'
}: UnitInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('px');
    const [isHovered, setIsHovered] = useState(false);
    const [showUnitMenu, setShowUnitMenu] = useState(false);
    const labelRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync state with incoming value
    useEffect(() => {
        if (!value) {
            setInputValue('');
            setSelectedUnit('px');
            return;
        }

        if (value === 'auto') {
            setInputValue('');
            setSelectedUnit('auto');
            return;
        }

        // Regex to match number and unit (e.g., 10px, -5.5%, 100)
        const match = value.match(/^(-?[\d.]+)([a-z%]*)$/i);
        if (match) {
            setInputValue(match[1]);
            setSelectedUnit(match[2] || 'px');
        } else {
            setInputValue(value);
            setSelectedUnit('custom');
        }
    }, [value]);

    // DRAG SCRUBBING LOGIC
    const handleMouseDown = (e: React.MouseEvent) => {
        if (selectedUnit === 'auto' || selectedUnit === 'custom') return;
        
        const startX = e.clientX;
        const startValue = parseFloat(inputValue) || 0;
        const sensitivity = e.shiftKey ? 10 : (e.altKey ? 0.1 : 1);

        const onMouseMove = (moveEvent: MouseEvent) => {
            const delta = (moveEvent.clientX - startX) * sensitivity;
            const newValue = Math.round((startValue + delta) * 100) / 100;
            onChange(newValue + selectedUnit);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'ew-resize';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setInputValue(newVal);
        const unit = selectedUnit === 'auto' ? 'px' : (selectedUnit === 'custom' ? '' : selectedUnit);
        onChange(newVal + unit);
    };

    const handleUnitSelect = (unit: string) => {
        setSelectedUnit(unit);
        setShowUnitMenu(false);
        if (unit === 'auto') {
            onChange('auto');
        } else if (unit === 'custom') {
            onChange(inputValue);
        } else {
            const num = parseFloat(inputValue) || 0;
            onChange(num + unit);
        }
    };

    // Determine the accent color based on source
    const getSourceColor = () => {
        if (overridden) return 'var(--accent-teal)';
        switch (source) {
            case 'class': return '#60a5fa'; // Blue
            case 'inherited': return '#a78bfa'; // Purple
            case 'local': return 'var(--accent-teal)';
            default: return '#666';
        }
    };

    const sourceColor = getSourceColor();

    return (
        <div 
            style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setShowUnitMenu(false); }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {label && (
                    <div 
                        ref={labelRef}
                        onMouseDown={handleMouseDown}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            cursor: (selectedUnit === 'auto' || selectedUnit === 'custom') ? 'default' : 'ew-resize',
                            userSelect: 'none'
                        }}
                        title="Drag to scrub value (Shift for 10x, Alt for 0.1x)"
                    >
                        <span style={{ 
                            fontSize: '0.6rem', 
                            color: isHovered || overridden ? sourceColor : '#666', 
                            textTransform: 'uppercase', 
                            fontWeight: '600',
                            transition: 'color 0.2s ease'
                        }}>
                            {label}
                        </span>
                        {overridden && (
                            <div style={{ 
                                width: '4px', 
                                height: '4px', 
                                borderRadius: '50%', 
                                backgroundColor: sourceColor,
                                boxShadow: `0 0 4px ${sourceColor}`
                            }} />
                        )}
                    </div>
                )}
                
                {/* SOURCE INDICATOR LABEL */}
                {source !== 'none' && source !== 'local' && (
                    <span style={{ fontSize: '0.55rem', color: sourceColor, opacity: 0.8, textTransform: 'lowercase' }}>
                        via {source}
                    </span>
                )}
            </div>

            <div style={{
                display: 'flex',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: `1px solid ${isHovered ? 'rgba(255,255,255,0.1)' : 'var(--glass-border)'}`,
                borderRadius: '4px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
            }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={selectedUnit === 'auto'}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.75rem',
                        padding: '6px 8px',
                        outline: 'none',
                        width: '40px',
                        fontFamily: 'monospace'
                    }}
                />
                
                {/* CUSTOM UNIT SWITCHER */}
                <div 
                    onClick={() => setShowUnitMenu(!showUnitMenu)}
                    style={{
                        padding: '0 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        color: sourceColor,
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderLeft: '1px solid var(--glass-border)',
                        cursor: 'pointer',
                        userSelect: 'none',
                        minWidth: '35px',
                        fontWeight: 'bold'
                    }}
                >
                    {selectedUnit}
                    <span style={{ fontSize: '8px', marginLeft: '3px', opacity: 0.5 }}>▼</span>
                </div>
            </div>

            {/* UNIT DROPDOWN */}
            {showUnitMenu && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 100,
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '4px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2px',
                    marginTop: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                    {units.map(u => (
                        <div
                            key={u}
                            onClick={() => handleUnitSelect(u)}
                            style={{
                                padding: '4px 8px',
                                fontSize: '0.65rem',
                                color: selectedUnit === u ? 'var(--accent-teal)' : '#aaa',
                                cursor: 'pointer',
                                borderRadius: '2px',
                                backgroundColor: selectedUnit === u ? 'rgba(0,255,150,0.1)' : 'transparent',
                                textAlign: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedUnit === u ? 'rgba(0,255,150,0.1)' : 'transparent'}
                        >
                            {u}
                        </div>
                    ))}
                    <div
                        onClick={() => handleUnitSelect('custom')}
                        style={{
                            gridColumn: 'span 2',
                            padding: '4px 8px',
                            fontSize: '0.65rem',
                            textAlign: 'center',
                            borderTop: '1px solid #222',
                            color: '#666'
                        }}
                    >
                        custom
                    </div>
                </div>
            )}
        </div>
    );
}
