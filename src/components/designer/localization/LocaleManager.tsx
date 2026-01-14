"use client";

import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Globe, Plus, Trash2, Check, Languages, Type, Layout, ArrowRightLeft, Sparkles } from 'lucide-react';

export const LocaleManager = () => {
    const { state, addLocale, removeLocale, setActiveLocale } = useProjectStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newLocale, setNewLocale] = useState({ code: '', name: '', isRTL: false });

    const handleAdd = () => {
        if (!newLocale.code || !newLocale.name) return;
        addLocale(newLocale.code, newLocale.name, newLocale.isRTL);
        setNewLocale({ code: '', name: '', isRTL: false });
        setIsAdding(false);
    };

    return (
        <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={16} color="var(--accent-teal)" /> Locales
                </h3>
                <button
                    onClick={() => setIsAdding(true)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                >
                    <Plus size={14} /> Add
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {state.localization.locales.map(locale => (
                    <div
                        key={locale.code}
                        onClick={() => setActiveLocale(locale.code)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            backgroundColor: state.localization.activeLocale === locale.code ? 'rgba(45, 212, 191, 0.1)' : 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            border: `1px solid ${state.localization.activeLocale === locale.code ? 'var(--accent-teal)' : 'transparent'}`,
                            cursor: 'pointer',
                            transition: 'var(--transition-smooth)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#888' }}>
                                {locale.code.toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{locale.name}</div>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                    {locale.isRTL ? 'RTL Layout' : 'LTR Layout'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {locale.code !== 'en' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); useProjectStore().autoTranslateProject(locale.code); }}
                                    style={{ background: 'var(--accent-teal)', border: 'none', color: 'black', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <Sparkles size={12} /> Translate
                                </button>
                            )}
                            {state.localization.activeLocale === locale.code && <Check size={14} color="var(--accent-teal)" />}
                            {locale.code !== 'en' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeLocale(locale.code); }}
                                    style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isAdding && (
                <div style={{ marginTop: '20px', padding: '15px', borderTop: '1px solid #333' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input
                            placeholder="Code (e.g. jp)"
                            value={newLocale.code}
                            onChange={(e) => setNewLocale({ ...newLocale, code: e.target.value })}
                            style={{ background: '#111', border: '1px solid #333', padding: '8px', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
                        />
                        <input
                            placeholder="Name (e.g. Japanese)"
                            value={newLocale.name}
                            onChange={(e) => setNewLocale({ ...newLocale, name: e.target.value })}
                            style={{ background: '#111', border: '1px solid #333', padding: '8px', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#aaa', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={newLocale.isRTL}
                                onChange={(e) => setNewLocale({ ...newLocale, isRTL: e.target.checked })}
                                style={{ accentColor: 'var(--accent-teal)' }}
                            />
                            RTL Layout (Arabic, Hebrew)
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleAdd}
                                style={{ flex: 1, padding: '8px', backgroundColor: 'var(--accent-teal)', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Add Locale
                            </button>
                            <button
                                onClick={() => setIsAdding(false)}
                                style={{ padding: '8px', backgroundColor: '#222', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
