import React, { useState } from 'react';
import { useProjectStore } from '../../hooks/useProjectStore';
import { Plus, Trash2, Edit2, Play, Brain, Variable } from 'lucide-react';
import { LogicBlueprint } from '../../types/designer';

interface VariablesPanelProps {
    onOpenBlueprint: (id: string) => void;
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({ onOpenBlueprint }) => {
    const { state, setVariable, addLogicBlueprint } = useProjectStore();
    const [newVarName, setNewVarName] = useState('');
    const [newVarValue, setNewVarValue] = useState('');
    const [newVarType, setNewVarType] = useState<'string' | 'number' | 'boolean'>('string');
    const [newVarServerOnly, setNewVarServerOnly] = useState(false);

    const handleAddVar = () => {
        if (!newVarName) return;
        let val: any = newVarValue;
        if (newVarType === 'number') val = Number(newVarValue);
        if (newVarType === 'boolean') val = newVarValue === 'true';

        setVariable(newVarName, val, { serverOnly: newVarServerOnly });

        setNewVarName('');
        setNewVarValue('');
        setNewVarServerOnly(false);
    };

    const handleAddBlueprint = () => {
        addLogicBlueprint();
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', color: 'white' }}>
            {/* Global Variables Section */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <Variable size={20} color="var(--accent-teal)" />
                    <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Global Variables</h2>
                </div>

                {/* Add Var Form */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                    <input
                        placeholder="Name"
                        value={newVarName}
                        onChange={e => setNewVarName(e.target.value)}
                        className="glass-input"
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#111', color: 'white' }}
                    />
                    <select
                        value={newVarType}
                        onChange={e => setNewVarType(e.target.value as any)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#111', color: 'white' }}
                    >
                        <option value="string">Text</option>
                        <option value="number">Num</option>
                        <option value="boolean">Bool</option>
                    </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        placeholder="Initial Value"
                        value={newVarValue}
                        onChange={e => setNewVarValue(e.target.value)}
                        className="glass-input"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #333', background: '#111', color: 'white' }}
                    />
                    <button
                        onClick={handleAddVar}
                        style={{ width: '100%', marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
                    >
                        + Add Variable
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <input
                            type="checkbox"
                            checked={newVarServerOnly}
                            onChange={e => setNewVarServerOnly(e.target.checked)}
                            id="serverOnly"
                        />
                        <label htmlFor="serverOnly" style={{ fontSize: '0.8rem', color: '#aaa' }}>Server Only (Secret)</label>
                    </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <button
                        onClick={handleAddVar}
                        style={{ width: '100%', marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
                    >
                        + Add Variable
                    </button>
                </div>

                {/* Var List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(state.variables).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid #333' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-teal)' }}>{key}</div>
                                <div style={{ fontSize: '0.7rem', color: '#888' }}>{String(val)}</div>
                            </div>
                            <button onClick={() => setVariable(key, undefined)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ height: '1px', background: '#333' }} />

            {/* Logic Blueprints Section */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <Brain size={20} color="var(--accent-teal)" />
                    <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Logic Blueprints</h2>
                </div>

                <button
                    onClick={handleAddBlueprint}
                    style={{ width: '100%', padding: '12px', background: 'var(--accent-teal)', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <Plus size={16} /> New Logic Blueprint
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.values(state.blueprints).map(bp => (
                        <div
                            key={bp.id}
                            onClick={() => onOpenBlueprint(bp.id)}
                            style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #333', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{bp.name || 'Untitled Blueprint'}</div>
                                <Play size={12} color="#666" />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>ID: {bp.id} • {Object.keys(bp.nodes).length} Nodes</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
