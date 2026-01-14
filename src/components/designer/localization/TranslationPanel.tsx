"use client";

import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Globe, Plus, Search, Languages, Type } from 'lucide-react';

export const TranslationPanel = () => {
    const { state, addTranslation } = useProjectStore();
    const activeLocale = state.localization.activeLocale;
    const translations = state.translations[activeLocale] || {};

    // Convert map to array for rendering
    const entries = Object.entries(translations).map(([key, value]) => ({ key, value }));

    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    const handleAdd = () => {
        if (!newKey || !newValue) return;
        addTranslation(newKey, newValue, activeLocale);
        setNewKey('');
        setNewValue('');
        setIsAdding(false);
    };

    const filteredEntries = entries.filter(e =>
        e.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Languages size={16} color="var(--accent-teal)" />
                    Translations ({activeLocale.toUpperCase()})
                </h3>
                <button
                    onClick={() => setIsAdding(true)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer' }}
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '15px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                    placeholder="Search keys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        padding: '8px 8px 8px 30px',
                        color: 'white',
                        fontSize: '0.8rem'
                    }}
                />
            </div>

            {/* Add New */}
            {isAdding && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid var(--accent-teal)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                            placeholder="Key (e.g. hero_title)"
                            value={newKey} onChange={(e) => setNewKey(e.target.value)}
                            style={{ background: '#111', border: '1px solid #333', padding: '6px', borderRadius: '4px', color: 'white', fontSize: '0.8rem' }}
                        />
                        <textarea
                            placeholder="Translation value..."
                            value={newValue} onChange={(e) => setNewValue(e.target.value)}
                            style={{ background: '#111', border: '1px solid #333', padding: '6px', borderRadius: '4px', color: 'white', fontSize: '0.8rem', minHeight: '60px', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button onClick={handleAdd} style={{ flex: 1, background: 'var(--accent-teal)', color: 'black', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                            <button onClick={() => setIsAdding(false)} style={{ background: '#222', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
                {filteredEntries.map(entry => (
                    <div key={entry.key} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace' }}>{entry.key}</span>
                        </div>
                        <input
                            value={entry.value}
                            onChange={(e) => addTranslation(entry.key, e.target.value, activeLocale)}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                        />
                    </div>
                ))}
                {filteredEntries.length === 0 && !isAdding && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '0.8rem' }}>
                        No translations found for {activeLocale.toUpperCase()}.
                    </div>
                )}
            </div>
        </div>
    );
};
