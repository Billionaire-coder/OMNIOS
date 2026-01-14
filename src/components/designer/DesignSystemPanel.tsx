"use client";

import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Palette, Plus, Trash2, X, UploadCloud, Type, Sparkles, Sun, Moon } from 'lucide-react';
import { TokenType } from '@/types/designer';
import { calculateFluidTypography } from '@/lib/design/typography';
import { importFigmaTokens } from '@/lib/importers/figma';
import { rewriteAesthetic } from '@/lib/intelligence/aestheticEngine';

export const DesignSystemPanel = ({ onClose }: { onClose: () => void }) => {
    const { state, addToken, deleteToken, updateToken } = useProjectStore();
    const [activeTab, setActiveTab] = useState<'tokens' | 'graph'>('tokens');

    const handleAddToken = () => {
        const name = prompt("Token Name (e.g., Primary):");
        if (name) {
            addToken({
                name,
                type: 'color',
                value: '#000000',
                modes: {
                    dark: '#ffffff'
                }
            });
        }
    };

    const handleImport = () => {
        // Simulation of file upload
        const mockFigmaJSON = {
            "brand": {
                "primary": {
                    "$value": "#0070f3",
                    "$type": "color"
                }
            }
        };
        const tokens = importFigmaTokens(mockFigmaJSON);
        tokens.forEach(t => {
            const { id, ...rest } = t;
            addToken(rest);
        });
        alert("Imported " + tokens.length + " tokens from Figma / W3C format!");
    };

    const handleAddFluidToken = () => {
        const name = prompt("Fluid Token Name (e.g., H1-Fluid):");
        if (name) {
            const value = calculateFluidTypography(16, 32); // Default for demo
            addToken({
                name,
                type: 'fontSize',
                value: value
            });
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px',
            backgroundColor: '#111', borderLeft: '1px solid #333',
            zIndex: 100, display: 'flex', flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Design System</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                <button onClick={() => setActiveTab('tokens')} style={{ flex: 1, padding: '12px', background: activeTab === 'tokens' ? '#222' : 'transparent', color: activeTab === 'tokens' ? 'white' : '#888', border: 'none', cursor: 'pointer' }}>Tokens</button>
                <button onClick={() => setActiveTab('graph')} style={{ flex: 1, padding: '12px', background: activeTab === 'graph' ? '#222' : 'transparent', color: activeTab === 'graph' ? 'white' : '#888', border: 'none', cursor: 'pointer' }}>Graph</button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {activeTab === 'tokens' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Actions Toolbar */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <button onClick={handleImport} style={{ flex: 1, padding: '8px', backgroundColor: '#222', border: '1px solid #333', borderRadius: '4px', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' }}>
                                <UploadCloud size={14} /> Import Figma
                            </button>
                            <button onClick={handleAddFluidToken} style={{ flex: 1, padding: '8px', backgroundColor: '#222', border: '1px solid #333', borderRadius: '4px', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' }}>
                                <Type size={14} /> New Fluid Type
                            </button>
                        </div>

                        {/* COMMUNITY (Framer15) */}
                        <div style={{ padding: '16px', backgroundColor: 'rgba(46, 213, 115, 0.05)', border: '1px solid rgba(46, 213, 115, 0.1)', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <Palette size={14} color="#2ed573" />
                                <h3 style={{ fontSize: '0.75rem', color: 'white', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand Kit Marketplace</h3>
                            </div>
                            <button
                                onClick={() => {
                                    alert("Publishing " + (state.designSystem.tokens.length) + " design tokens as a Shared Brand Kit...");
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#111',
                                    border: '1px solid rgba(46, 213, 115, 0.3)',
                                    borderRadius: '6px',
                                    color: '#2ed573',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <UploadCloud size={14} /> List as Brand Kit
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>TOKENS</h3>
                            <button onClick={handleAddToken} style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer' }}><Plus size={16} /></button>
                        </div>

                        {state.designSystem.tokens.map(token => (
                            <div key={token.id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.7rem', padding: '2px 4px', borderRadius: '4px', backgroundColor: '#333', color: '#888' }}>{token.type}</span>
                                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>{token.name}</span>
                                    </div>
                                    <button onClick={() => deleteToken(token.id)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                </div>

                                {token.type === 'color' && (
                                    <>
                                        {/* Light Mode Value */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <Sun size={14} color="#888" />
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: token.value, border: '1px solid #444' }}></div>
                                            <input
                                                type="color"
                                                value={token.value}
                                                onChange={(e) => updateToken(token.id, { value: e.target.value })}
                                                style={{ background: 'transparent', border: 'none', width: '0', height: '0', padding: 0, opacity: 0 }}
                                                id={`picker - light - ${token.id} `}
                                            />
                                            <label htmlFor={`picker - light - ${token.id} `} style={{ color: '#aaa', fontSize: '0.8rem', fontFamily: 'monospace', cursor: 'pointer' }}>{token.value}</label>
                                        </div>

                                        {/* Dark Mode Value */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Moon size={14} color="#888" />
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: token.modes?.dark || token.value, border: '1px solid #444' }}></div>
                                            <input
                                                type="color"
                                                value={token.modes?.dark || token.value}
                                                onChange={(e) => updateToken(token.id, { modes: { ...token.modes, dark: e.target.value } })}
                                                style={{ background: 'transparent', border: 'none', width: '0', height: '0', padding: 0, opacity: 0 }}
                                                id={`picker - dark - ${token.id} `}
                                            />
                                            <label htmlFor={`picker - dark - ${token.id} `} style={{ color: '#aaa', fontSize: '0.8rem', fontFamily: 'monospace', cursor: 'pointer' }}>{token.modes?.dark || 'Inherit'}</label>
                                        </div>
                                    </>
                                )}

                                {token.type !== 'color' && (
                                    <div style={{ color: '#aaa', fontSize: '0.8rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {token.value}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'graph' && (
                    <>
                        {/* Framer7: AI Aesthetic Remix */}
                        <div style={{ padding: '15px', borderBottom: '1px solid #333', background: 'linear-gradient(to right, rgba(255,0,255,0.05), transparent)' }}>
                            <h3 style={{ fontSize: '0.75rem', color: '#ff00ff', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                <Sparkles size={12} style={{ display: 'inline', marginRight: '5px' }} />
                                AI Aesthetic Remix
                            </h3>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input
                                    type="text"
                                    placeholder="e.g., Cyberpunk, Corporate, Pastel..."
                                    className="glass"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const target = e.target as HTMLInputElement;
                                            const newTokens = rewriteAesthetic(target.value, state.designSystem.tokens);
                                            if (newTokens !== state.designSystem.tokens) {
                                                // Update all customized tokens
                                                newTokens.forEach(t => {
                                                    // We only update if it changed or is new
                                                    // addToken handles overwrite in our store logic? 
                                                    // Actually useProjectStore's addToken might push duplicate if ID not checked, 
                                                    // but our engine returns the whole list.
                                                    // Better: We need a bulkUpdateTokens or just loop update.
                                                    // Check if exists:
                                                    const exists = state.designSystem.tokens.find(ex => ex.name === t.name);
                                                    if (exists) {
                                                        updateToken(exists.id, { value: t.value });
                                                    } else {
                                                        addToken(t);
                                                    }
                                                });
                                                alert(`Aesthetic rewritten to: ${target.value} `);
                                            } else {
                                                alert("No matching theme found.");
                                            }
                                        }
                                    }}
                                    style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                                />
                            </div>
                        </div>

                        <div style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                                {/* Simple Visual Graph */}
                                {state.designSystem.tokens.map((token, i) => (
                                    <div key={token.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '60px', height: '60px',
                                            borderRadius: '50%', border: '2px solid #333',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: token.type === 'color' ? token.value : '#111',
                                            color: token.type === 'color' ? 'transparent' : 'white',
                                            transition: 'all 0.3s'
                                        }}>
                                            {token.type !== 'color' && <Type size={20} />}
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: '#666' }}>{token.name}</span>
                                        {i < state.designSystem.tokens.length - 1 && <div style={{ width: '2px', height: '20px', backgroundColor: '#333' }}></div>}
                                    </div>
                                ))}
                                {state.designSystem.tokens.length === 0 && <p style={{ color: '#666' }}>No tokens to visualize.</p>}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
