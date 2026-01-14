import React, { useState } from 'react';
import { useProjectStore } from '../../hooks/useProjectStore';
import { Plus, Trash2, Brain, Type, Hash, CheckSquare, Box } from 'lucide-react';

export const VariableManager: React.FC = () => {
    const { state, setVariable } = useProjectStore();
    const [newVarName, setNewVarName] = useState('');
    const [newVarType, setNewVarType] = useState<'string' | 'number' | 'boolean'>('string');

    const handleAddVariable = () => {
        if (!newVarName) return;
        const defaultValue = newVarType === 'string' ? '' : newVarType === 'number' ? 0 : false;
        setVariable(newVarName, defaultValue);
        setNewVarName('');
    };

    return (
        <div style={{
            position: 'absolute',
            left: '260px',
            top: '60px',
            bottom: 0,
            width: '300px',
            backgroundColor: '#0a0a0a',
            borderRight: '1px solid #222',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            color: 'white',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Brain size={18} color="var(--accent-teal)" />
                <h2 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>Global Variables</h2>
            </div>

            <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid #111' }}>
                <input
                    type="text"
                    placeholder="Variable Name..."
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    style={{ backgroundColor: '#111', border: '1px solid #333', color: 'white', padding: '8px', borderRadius: '4px', fontSize: '0.75rem' }}
                />
                <div style={{ display: 'flex', gap: '5px' }}>
                    <select
                        value={newVarType}
                        onChange={(e) => setNewVarType(e.target.value as any)}
                        style={{ flex: 1, backgroundColor: '#111', border: '1px solid #333', color: 'white', padding: '8px', borderRadius: '4px', fontSize: '0.75rem' }}
                    >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                    </select>
                    <button
                        onClick={handleAddVariable}
                        style={{ backgroundColor: 'var(--accent-teal)', border: 'none', color: 'black', padding: '0 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {Object.values(state.globalVariables).length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#444', fontSize: '0.7rem' }}>
                        No variables defined. Create one to power dynamic UI logic.
                    </div>
                )}
                {Object.values(state.globalVariables).map(variable => (
                    <div key={variable.id} style={{
                        padding: '12px',
                        borderBottom: '1px solid #111',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderRadius: '6px',
                        marginBottom: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {variable.type === 'string' && <Type size={12} color="#888" />}
                                {variable.type === 'number' && <Hash size={12} color="#888" />}
                                {variable.type === 'boolean' && <CheckSquare size={12} color="#888" />}
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{variable.name}</span>
                            </div>
                            <button style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}><Plus size={12} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.6rem', color: '#666' }}>VALUE:</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontFamily: 'monospace' }}>
                                {typeof variable.value === 'object' ? JSON.stringify(variable.value) : String(variable.value)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
