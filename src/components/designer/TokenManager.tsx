import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { DesignToken, TokenType } from '@/types/designer';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export function TokenManager() {
    const { state, addToken, updateToken, deleteToken } = useProjectStore();
    const [activeCategory, setActiveCategory] = useState<TokenType>('color');
    const [isCreating, setIsCreating] = useState(false);
    const [newTokenParts, setNewTokenParts] = useState({ name: '', value: '' });
    const [editingId, setEditingId] = useState<string | null>(null);

    const tokens = state.designSystem.tokens.filter(t => t.type === activeCategory);

    const categories: { id: TokenType, label: string }[] = [
        { id: 'color', label: 'Colors' },
        { id: 'fontSize', label: 'Typography' },
        { id: 'spacing', label: 'Spacing' },
        { id: 'radius', label: 'Radius' },
        { id: 'shadow', label: 'Shadows' },
    ];

    const handleCreate = () => {
        if (!newTokenParts.name || !newTokenParts.value) return;
        addToken({ ...newTokenParts, type: activeCategory });
        setIsCreating(false);
        setNewTokenParts({ name: '', value: '' });
    };

    return (
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '20px', color: 'white', letterSpacing: '1px' }}>DESIGN TOKENS</h3>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => { setActiveCategory(cat.id); setIsCreating(false); }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            backgroundColor: activeCategory === cat.id ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                            color: activeCategory === cat.id ? 'black' : '#888',
                            border: 'none',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Create New Prompt */}
            {!isCreating && (
                <button
                    onClick={() => setIsCreating(true)}
                    style={{
                        padding: '10px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px dashed #444',
                        color: '#888',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        marginBottom: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                >
                    <Plus size={14} /> Create {categories.find(c => c.id === activeCategory)?.label} Token
                </button>
            )}

            {/* Creation Form */}
            {isCreating && (
                <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--accent-teal)' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '5px' }}>TOKEN NAME</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. primary-500"
                            value={newTokenParts.name}
                            onChange={(e) => setNewTokenParts({ ...newTokenParts, name: e.target.value })}
                            style={{ width: '100%', padding: '8px', background: '#000', border: '1px solid #333', color: 'white', fontSize: '0.8rem', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '5px' }}>VALUE</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {activeCategory === 'color' && (
                                <input
                                    type="color"
                                    value={newTokenParts.value || '#ffffff'}
                                    onChange={(e) => setNewTokenParts({ ...newTokenParts, value: e.target.value })}
                                    style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }}
                                />
                            )}
                            <input
                                type="text"
                                placeholder={activeCategory === 'color' ? '#ffffff' : (activeCategory === 'spacing' ? '16px' : '1.2rem')}
                                value={newTokenParts.value}
                                onChange={(e) => setNewTokenParts({ ...newTokenParts, value: e.target.value })}
                                style={{ flex: 1, padding: '8px', background: '#000', border: '1px solid #333', color: 'white', fontSize: '0.8rem', borderRadius: '4px' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setIsCreating(false)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #444', color: '#888', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleCreate} style={{ flex: 1, padding: '8px', background: 'var(--accent-teal)', border: 'none', color: 'black', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>Create Token</button>
                    </div>
                </div>
            )}

            {/* Token List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {tokens.length === 0 && !isCreating && (
                    <div style={{ textAlign: 'center', color: '#444', fontSize: '0.8rem', marginTop: '40px' }}>
                        No tokens found in this category.
                    </div>
                )}
                {tokens.map(token => (
                    <div key={token.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #222', backgroundColor: editingId === token.id ? '#1a1a1a' : 'transparent' }}>
                        {editingId === token.id ? (
                            <div style={{ flex: 1, display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    defaultValue={token.value}
                                    onBlur={(e) => {
                                        updateToken(token.id, { value: e.target.value });
                                        setEditingId(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            updateToken(token.id, { value: (e.target as any).value });
                                            setEditingId(null);
                                        }
                                    }}
                                    autoFocus
                                    style={{ width: '100px', padding: '4px', background: '#000', border: '1px solid var(--accent-teal)', color: 'white', fontSize: '0.8rem' }}
                                />
                                <span style={{ fontSize: '0.65rem', color: '#666' }}>Enter to save</span>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {token.type === 'color' && (
                                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: token.value, border: '1px solid #444' }}></div>
                                )}
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'white' }}>{token.name}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#666' }}>{token.value}</div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '5px' }}>
                            {editingId !== token.id && (
                                <button onClick={() => setEditingId(token.id)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px' }} title="Edit Value">
                                    <Edit2 size={12} />
                                </button>
                            )}
                            <button onClick={() => deleteToken(token.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '4px' }} title="Delete Token">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
