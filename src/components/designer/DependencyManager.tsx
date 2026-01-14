import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Package, Download, Trash2, Globe, Search, AlertCircle } from 'lucide-react';

export const DependencyManager: React.FC = () => {
    // This assumes we add a 'dependencies' field to ProjectState later.
    // For now, we'll just mock the UI to show the concept as per Framer4 requirements.
    const [mockDeps, setMockDeps] = useState([
        { name: 'framer-motion', version: '10.16.4', size: '150KB' },
        { name: 'lucide-react', version: '0.292.0', size: '420KB' },
        { name: 'canvas-confetti', version: '1.9.2', size: '12KB' }
    ]);
    const [search, setSearch] = useState('');

    const handleAdd = () => {
        if (!search) return;
        setMockDeps([...mockDeps, { name: search, version: 'latest', size: 'unknown' }]);
        setSearch('');
    };

    return (
        <div className="glass" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} color="var(--accent-teal)" />
                    PACKAGE MANAGER
                </h3>
                <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '5px' }}>
                    Import NPM packages via ESM.sh to use in Custom Code.
                </p>
            </div>

            <div style={{ padding: '15px' }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search npm..."
                            className="glass"
                            style={{
                                width: '100%',
                                padding: '8px 8px 8px 30px',
                                border: '1px solid #333',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '0.75rem'
                            }}
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        style={{ background: 'var(--accent-teal)', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', color: 'black' }}
                    >
                        <Download size={14} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {mockDeps.map((dep, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Globe size={14} color="#666" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'white', fontWeight: '500' }}>{dep.name}</div>
                                    <div style={{ fontSize: '0.6rem', color: '#666' }}>v{dep.version} • {dep.size}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setMockDeps(mockDeps.filter((_, idx) => idx !== i))}
                                style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ padding: '15px', marginTop: 'auto', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ padding: '10px', backgroundColor: 'rgba(255, 165, 0, 0.1)', border: '1px solid rgba(255, 165, 0, 0.2)', borderRadius: '6px', display: 'flex', gap: '8px' }}>
                    <AlertCircle size={14} color="orange" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '0.65rem', color: '#aaa', margin: 0 }}>
                        Packages are loaded dynamically from CDN. Ensure you are connected to the internet.
                    </p>
                </div>
            </div>
        </div>
    );
};
