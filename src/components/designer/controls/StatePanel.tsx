import React, { useState } from 'react';
import { MousePointer2, Zap, Hand, Target, Plus, X, Edit3 } from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { ElementStyles } from '@/types/designer';

export function StatePanel() {
    const { state, setActiveState, addVariant, removeVariant } = useProjectStore();
    const { activeState, selectedElementId, elements, editingClassId, designSystem } = state;

    const selectedElement = selectedElementId ? elements[selectedElementId] : null;

    const [isAddingState, setIsAddingState] = useState(false);
    const [newStateName, setNewStateName] = useState('');

    const checkStateDefined = (stateId: string) => {
        if (stateId === 'none') return true;

        if (selectedElement) {
            // Check in the NEW variants structure
            if (selectedElement.variants && selectedElement.variants[stateId]) {
                return Object.keys(selectedElement.variants[stateId] || {}).length > 0;
            }

            // Check legacy properties
            const legacyKey = `${stateId}Styles` as keyof typeof selectedElement;
            if (selectedElement[legacyKey] && typeof selectedElement[legacyKey] === 'object') {
                return Object.keys(selectedElement[legacyKey] as object).length > 0;
            }
        }

        return false;
    };

    const baseStates = [
        { id: 'none', icon: MousePointer2, label: 'Base' },
        { id: 'hover', icon: Hand, label: 'Hover' },
        { id: 'active', icon: Zap, label: 'Active' },
        { id: 'focus', icon: Target, label: 'Focus' },
    ];

    // Collect custom variants from the selected element
    const customStates = selectedElement?.variants
        ? Object.keys(selectedElement.variants)
            .filter(v => !['hover', 'active', 'focus'].includes(v))
            .map(v => ({ id: v, icon: CircleState, label: v }))
        : [];

    function CircleState({ size }: { size: number }) {
        return <div style={{ width: size, height: size, borderRadius: '50%', border: '2px solid currentColor' }} />;
    }

    const handleAddState = () => {
        if (!newStateName.trim() || !selectedElementId) return;
        addVariant(selectedElementId, newStateName.trim().toLowerCase());
        setActiveState(newStateName.trim().toLowerCase());
        setNewStateName('');
        setIsAddingState(false);
    };

    const handleRemoveState = (e: React.MouseEvent, stateId: string) => {
        e.stopPropagation();
        if (!selectedElementId) return;
        if (confirm(`Are you sure you want to delete the "${stateId}" variant?`)) {
            removeVariant(selectedElementId, stateId);
            if (activeState === stateId) setActiveState('none');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '800' }}>
                    States & Variants
                </span>
                {activeState !== 'none' && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'rgba(0,255,150,0.1)',
                        padding: '3px 10px',
                        borderRadius: '100px',
                        border: '1px solid rgba(0,255,150,0.2)'
                    }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)', animation: 'pulse 1.5s infinite' }} />
                        <span style={{ fontSize: '0.6rem', color: 'var(--accent-teal)', fontWeight: 'bold' }}>
                            EDITING: {activeState.toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[...baseStates, ...customStates].map((s) => {
                    const isDefined = checkStateDefined(s.id);
                    const isActive = activeState === s.id;

                    return (
                        <button
                            key={s.id}
                            onClick={() => setActiveState(s.id)}
                            title={s.label}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px 4px',
                                borderRadius: '10px',
                                border: '1px solid',
                                borderColor: isActive ? 'var(--accent-teal)' : 'rgba(255,255,255,0.08)',
                                cursor: 'pointer',
                                backgroundColor: isActive ? 'rgba(0,255,150,0.08)' : 'rgba(255,255,255,0.02)',
                                color: isActive ? 'white' : '#777',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <s.icon size={14} strokeWidth={isActive ? 2.5 : 2} style={{ filter: isActive ? 'drop-shadow(0 0 8px var(--accent-teal))' : 'none' }} />
                            <span style={{ fontSize: '0.55rem', fontWeight: isActive ? '700' : '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
                                {s.label}
                            </span>

                            {/* DELETE BUTTON FOR CUSTOM STATES */}
                            {!baseStates.find(b => b.id === s.id) && (
                                <button
                                    onClick={(e) => handleRemoveState(e, s.id)}
                                    style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-6px',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        backgroundColor: '#ff4444',
                                        color: 'white',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        opacity: isActive ? 1 : 0,
                                        transition: 'opacity 0.2s',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                        zIndex: 10
                                    }}
                                    className="delete-state-btn"
                                >
                                    <X size={10} strokeWidth={3} />
                                </button>
                            )}

                            {/* INDICATOR FOR MODIFIED STYLES */}
                            {isDefined && s.id !== 'none' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '6px',
                                    right: '6px',
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '50%',
                                    backgroundColor: isActive ? 'white' : 'var(--accent-teal)',
                                    boxShadow: isActive ? '0 0 5px white' : 'none'
                                }} />
                            )}
                        </button>
                    );
                })}

                {/* ADD STATE BUTTON */}
                {!isAddingState ? (
                    <button
                        onClick={() => setIsAddingState(true)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 4px',
                            borderRadius: '10px',
                            border: '1px dashed rgba(255,255,255,0.2)',
                            cursor: 'pointer',
                            backgroundColor: 'transparent',
                            color: '#555',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Plus size={14} />
                        <span style={{ fontSize: '0.55rem', fontWeight: '600' }}>New</span>
                    </button>
                ) : (
                    <div style={{ gridColumn: 'span 4', display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <input
                            autoFocus
                            value={newStateName}
                            onChange={(e) => setNewStateName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddState()}
                            placeholder="Variant name..."
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                border: '1px solid var(--accent-teal)',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '0.75rem'
                            }}
                        />
                        <button
                            onClick={handleAddState}
                            style={{ padding: '8px', backgroundColor: 'var(--accent-teal)', border: 'none', borderRadius: '6px', color: 'black', cursor: 'pointer' }}
                        >
                            <Plus size={16} />
                        </button>
                        <button
                            onClick={() => setIsAddingState(false)}
                            style={{ padding: '8px', backgroundColor: '#333', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                    100% { opacity: 0.5; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
