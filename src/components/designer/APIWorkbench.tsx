import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Globe, Plus, Trash2, RefreshCw, Link as LinkIcon, ChevronRight } from 'lucide-react';

export const APIWorkbench: React.FC = () => {
    const { state, addAPISource, removeAPISource, fetchAPIData, mapAPIDataToElement } = useProjectStore();
    const [newSource, setNewSource] = useState({ name: '', url: '', method: 'GET' as 'GET' | 'POST' });
    const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

    const handleAdd = () => {
        if (!newSource.name || !newSource.url) return;
        addAPISource(newSource);
        setNewSource({ name: '', url: '', method: 'GET' });
    };

    const activeSource = state.apiSources.find(s => s.id === selectedSourceId);
    const selectedElement = state.selectedElementId ? state.elements[state.selectedElementId] : null;

    return (
        <div style={{ display: 'flex', height: '100%', backgroundColor: '#09090b', color: 'white' }}>
            {/* Sidebar: Source List */}
            <div style={{ width: '250px', borderRight: '1px solid #222', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>API Sources</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="Source Name"
                        value={newSource.name}
                        onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                        style={{ backgroundColor: '#111', border: '1px solid #333', padding: '8px', fontSize: '0.8rem', borderRadius: '4px', color: 'white' }}
                    />
                    <input
                        type="text"
                        placeholder="Endpoint URL"
                        value={newSource.url}
                        onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                        style={{ backgroundColor: '#111', border: '1px solid #333', padding: '8px', fontSize: '0.8rem', borderRadius: '4px', color: 'white' }}
                    />
                    <button
                        onClick={handleAdd}
                        style={{ backgroundColor: 'var(--accent-teal)', color: 'black', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                        <Plus size={14} /> Add Source
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {state.apiSources.map(source => (
                        <button
                            key={source.id}
                            onClick={() => setSelectedSourceId(source.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px',
                                cursor: 'pointer',
                                backgroundColor: selectedSourceId === source.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                border: 'none',
                                borderRadius: '4px',
                                textAlign: 'left',
                                width: '100%',
                                color: selectedSourceId === source.id ? 'white' : '#888'
                            }}
                        >
                            <Globe size={14} />
                            <span style={{ fontSize: '0.8rem', flex: 1 }}>{source.name}</span>
                            <Trash2 size={12} onClick={(e) => { e.stopPropagation(); removeAPISource(source.id); }} style={{ opacity: 0.5 }} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area: Interaction & Mapping */}
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                {activeSource ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{activeSource.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#666' }}>{activeSource.url}</div>
                            </div>
                            <button
                                onClick={() => fetchAPIData(activeSource.id)}
                                style={{ backgroundColor: '#222', color: 'white', padding: '8px 15px', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <RefreshCw size={14} /> Fetch Now
                            </button>
                        </div>

                        {activeSource.lastResponse ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', marginBottom: '10px' }}>Response Data (JSON)</div>
                                    <pre style={{
                                        backgroundColor: '#0c0c0e',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        fontSize: '0.7rem',
                                        maxHeight: '400px',
                                        overflow: 'auto',
                                        border: '1px solid #222',
                                        color: '#00ff00'
                                    }}>
                                        {JSON.stringify(activeSource.lastResponse, null, 2)}
                                    </pre>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>Visual Mapper</div>
                                    <div style={{ padding: '15px', borderRadius: '8px', border: '1px solid #333', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                        {selectedElement ? (
                                            <>
                                                <div style={{ fontSize: '0.8rem', marginBottom: '10px' }}>Mapping to: <strong style={{ color: 'var(--accent-teal)' }}>{selectedElement.id} ({selectedElement.type})</strong></div>
                                                <input
                                                    type="text"
                                                    placeholder="JSON Path (e.g. data.title)"
                                                    id="mapping_path_input"
                                                    style={{ width: '100%', backgroundColor: '#000', border: '1px solid #444', padding: '10px', color: 'white', marginBottom: '10px', borderRadius: '4px' }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const path = (document.getElementById('mapping_path_input') as HTMLInputElement).value;
                                                        if (path) mapAPIDataToElement(selectedElement.id, path, activeSource.id);
                                                    }}
                                                    style={{ width: '100%', backgroundColor: 'white', color: 'black', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                >
                                                    <LinkIcon size={14} /> Bind Data
                                                </button>
                                            </>
                                        ) : (
                                            <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>Select an element on canvas to map data</div>
                                        )}
                                    </div>

                                    <div style={{ fontSize: '0.7rem', color: '#444', fontStyle: 'italic' }}>
                                        TIP: You can use dot notation like `user.profile.name` or `products.0.price`.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                <Globe size={48} style={{ opacity: 0.1, marginBottom: '15px' }} />
                                <div>Click "Fetch Now" to see response data</div>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                        <Globe size={64} style={{ opacity: 0.1, marginBottom: '20px' }} />
                        <div>Select an API source to begin mapping</div>
                    </div>
                )}
            </div>
        </div>
    );
};
