"use client";

import React, { useState, useMemo } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Sparkles, Hash, Box, Search, Trash2, Edit3, Merge, ArrowRight, Zap } from 'lucide-react';

export function StyleManager() {
    const { state, getDuplicateStyles, mergeStylesIntoClass, deleteClass, renameClass, setEditingClassId } = useProjectStore();
    const [activeTab, setActiveTab] = useState<'classes' | 'crawler' | 'tokens'>('classes');
    const [searchQuery, setSearchQuery] = useState('');

    const duplicateGroups = useMemo(() => getDuplicateStyles(), [state.elements]);
    const classes = state.designSystem.classes || [];
    const tokens = state.designSystem.tokens || [];

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleMerge = (group: any) => {
        const name = prompt('Enter a name for the new class:', 'shared-style');
        if (name) {
            mergeStylesIntoClass(name, group.styles, group.elementIds);
        }
    };

    // Calculate usage count for each class
    const classUsage = useMemo(() => {
        const counts: Record<string, number> = {};
        Object.values(state.elements).forEach(el => {
            el.classNames?.forEach(cn => {
                counts[cn] = (counts[cn] || 0) + 1;
            });
        });
        return counts;
    }, [state.elements]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'var(--panel-bg)',
            borderRight: '1px solid var(--glass-border)',
            color: 'white',
            userSelect: 'none'
        }}>
            {/* TABS */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', padding: '4px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                {[
                    { id: 'classes', icon: Hash, label: 'Classes' },
                    { id: 'crawler', icon: Sparkles, label: 'Crawler' },
                    { id: 'tokens', icon: Zap, label: 'Tokens' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '10px 4px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--accent-teal)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'white' : '#666',
                            cursor: 'pointer',
                            fontSize: '0.65rem',
                            transition: 'all 0.2s ease',
                            fontWeight: activeTab === tab.id ? '800' : '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        <tab.icon size={11} strokeWidth={activeTab === tab.id ? 3 : 2} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} className="custom-scrollbar">
                {activeTab === 'classes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ position: 'relative', marginBottom: '4px' }}>
                            <Search size={11} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                            <input
                                type="text"
                                placeholder="Search classes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '4px',
                                    padding: '8px 10px 8px 28px',
                                    fontSize: '0.7rem',
                                    color: 'white',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {filteredClasses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#333', fontSize: '0.7rem', fontStyle: 'italic' }}>
                                No styles found.
                            </div>
                        ) : (
                            filteredClasses.map(cls => {
                                const isEditing = state.editingClassId === cls.id;
                                const usage = classUsage[cls.id] || 0;

                                return (
                                    <div key={cls.id} style={{
                                        padding: '8px 10px',
                                        backgroundColor: isEditing ? 'rgba(0,255,150,0.05)' : 'rgba(255,255,255,0.01)',
                                        border: '1px solid',
                                        borderColor: isEditing ? 'rgba(0,255,150,0.2)' : 'var(--glass-border)',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: isEditing ? 'var(--accent-teal)' : '#ccc' }}>
                                                    .{cls.name}
                                                </span>
                                                {usage > 0 && (
                                                    <span style={{
                                                        fontSize: '0.55rem',
                                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                                        padding: '1px 4px',
                                                        borderRadius: '3px',
                                                        color: '#555'
                                                    }}>
                                                        {usage}x
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.55rem', color: '#444', fontFamily: 'monospace' }}>
                                                {Object.keys(cls.styles || {}).length} props
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            <button
                                                onClick={() => setEditingClassId(isEditing ? null : cls.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: isEditing ? 'var(--accent-teal)' : '#444',
                                                    cursor: 'pointer',
                                                    padding: '6px',
                                                    borderRadius: '4px',
                                                    backgroundColor: isEditing ? 'rgba(0,255,150,0.1)' : 'transparent',
                                                    transition: 'all 0.2s'
                                                }}
                                                title="Edit Class Styles"
                                                onMouseEnter={(e) => !isEditing && (e.currentTarget.style.color = '#888')}
                                                onMouseLeave={(e) => !isEditing && (e.currentTarget.style.color = '#444')}
                                            >
                                                <Edit3 size={12} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Delete class .${cls.name}?`)) deleteClass(cls.id);
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#444',
                                                    cursor: 'pointer',
                                                    padding: '6px'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#444'}
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'crawler' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{
                            padding: '12px',
                            backgroundColor: 'rgba(0,255,150,0.03)',
                            borderRadius: '8px',
                            border: '1px solid rgba(0,255,150,0.1)',
                            backgroundImage: 'linear-gradient(135deg, rgba(0,255,150,0.05) 0%, transparent 100%)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(0,255,150,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Sparkles size={12} color="var(--accent-teal)" />
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-teal)', letterSpacing: '0.02em' }}>CSS CRAWLER</span>
                            </div>
                            <p style={{ fontSize: '0.65rem', color: '#666', lineHeight: '1.5', margin: 0 }}>
                                Scanning for identical inline styles... Found <strong>{duplicateGroups.length}</strong> opportunities to modularize your CSS.
                            </p>
                        </div>

                        {duplicateGroups.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#333', fontSize: '0.7rem' }}>
                                Your project is perfectly optimized! <br /> No duplicates found.
                            </div>
                        ) : (
                            duplicateGroups.map((group: any, idx: number) => (
                                <div key={idx} style={{
                                    padding: '12px',
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {group.elementIds.slice(0, 3).map((_: any, i: number) => (
                                                    <div key={i} style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '2px',
                                                        border: '1px solid #444',
                                                        backgroundColor: '#222',
                                                        marginLeft: i > 0 ? '-6px' : 0,
                                                        zIndex: 3 - i
                                                    }} />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#ccc' }}>{group.count} Elements</span>
                                        </div>
                                        <button
                                            onClick={() => handleMerge(group)}
                                            style={{
                                                padding: '5px 10px',
                                                backgroundColor: 'rgba(0,255,150,0.1)',
                                                color: 'var(--accent-teal)',
                                                border: '1px solid rgba(0,255,150,0.2)',
                                                borderRadius: '4px',
                                                fontSize: '0.6rem',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--accent-teal)';
                                                e.currentTarget.style.color = 'black';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(0,255,150,0.1)';
                                                e.currentTarget.style.color = 'var(--accent-teal)';
                                            }}
                                        >
                                            <Merge size={10} />
                                            Merge
                                        </button>
                                    </div>
                                    <div style={{
                                        padding: '10px',
                                        backgroundColor: '#000',
                                        borderRadius: '4px',
                                        fontSize: '0.6rem',
                                        fontFamily: 'monospace',
                                        color: '#555',
                                        maxHeight: '80px',
                                        overflow: 'auto',
                                        border: '1px solid #111',
                                        lineHeight: '1.4'
                                    }} className="custom-scrollbar">
                                        {Object.entries(group.styles).map(([k, v]) => (
                                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#444' }}>{k}:</span>
                                                <span style={{ color: '#666' }}>{String(v)};</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'tokens' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>Color Tokens</span>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                {tokens.filter(t => t.type === 'color').map(token => (
                                    <div key={token.id} style={{
                                        padding: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: token.value, border: '1px solid rgba(255,255,255,0.1)' }} />
                                        <span style={{ fontSize: '0.65rem', color: '#888' }}>{token.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
