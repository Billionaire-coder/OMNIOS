import React, { useState, useEffect } from 'react';
import { pluginManager } from '@/lib/plugins/PluginManager';
import { OMNIOSPlugin } from '@/types/plugins';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Puzzle, Zap, CheckCircle2, Circle, Settings2, ExternalLink } from 'lucide-react';

export const PluginsPanel = () => {
    const [plugins, setPlugins] = useState<OMNIOSPlugin[]>([]);
    const [refresh, setRefresh] = useState(0);
    const { state, addToken, addElement, updateElementStyles, updateElementProp, removeElement } = useProjectStore();

    useEffect(() => {
        // Build the context for plugins
        const context = {
            projectId: state.id,
            projectName: state.name,
            addElement,
            updateElementStyles,
            updateElementProp,
            removeElement,
            addToken,
            showNotification: (msg: string) => console.log('Plugin Notification:', msg),
            getState: () => state
        };

        pluginManager.setContext(context as any);
        setPlugins(pluginManager.getPlugins());
    }, [state, addToken, addElement, updateElementStyles, updateElementProp, removeElement, refresh]);

    const togglePlugin = (id: string) => {
        if (pluginManager.isPluginEnabled(id)) {
            pluginManager.disablePlugin(id);
        } else {
            pluginManager.enablePlugin(id);
        }
        setRefresh(prev => prev + 1);
    };

    return (
        <div style={{ padding: '20px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Puzzle size={20} color="var(--accent-teal)" />
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Project Plugins</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {plugins.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed #333' }}>
                        <Puzzle size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.8rem', color: '#666' }}>No plugins installed in this project.</p>
                        <button style={{
                            marginTop: '12px', padding: '8px 16px', background: 'var(--accent-teal)',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', color: 'black'
                        }}>
                            Browse Marketplace
                        </button>
                    </div>
                ) : (
                    plugins.map(plugin => (
                        <div key={plugin.id} style={{
                            padding: '16px',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            borderRadius: '12px',
                            border: '1px solid #222',
                            transition: 'border-color 0.2s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '8px',
                                        backgroundColor: 'rgba(0, 255, 213, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Zap size={20} color="var(--accent-teal)" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '0.9rem' }}>{plugin.name}</h3>
                                        <span style={{ fontSize: '0.7rem', color: '#666' }}>v{plugin.version} by {plugin.author}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => togglePlugin(plugin.id)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: pluginManager.isPluginEnabled(plugin.id) ? 'var(--accent-teal)' : '#444'
                                    }}
                                >
                                    {pluginManager.isPluginEnabled(plugin.id) ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                </button>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: '#888', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                                {plugin.description}
                            </p>

                            {pluginManager.isPluginEnabled(plugin.id) && plugin.type === 'panel' && (
                                <div style={{
                                    marginTop: '12px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px', border: '1px solid rgba(0, 255, 213, 0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', opacity: 0.6 }}>
                                        <Settings2 size={12} />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Plugin Interface</span>
                                    </div>
                                    {/* Inline Plugin Rendering */}
                                    {plugin.render?.(pluginManager['context'] as any)}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div style={{
                marginTop: '32px', padding: '20px', backgroundColor: 'rgba(0, 255, 213, 0.03)',
                borderRadius: '12px', border: '1px solid rgba(0, 255, 213, 0.1)'
            }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--accent-teal)' }}>Developer Mode</h4>
                <p style={{ fontSize: '0.75rem', color: '#888', margin: '0 0 12px 0' }}>
                    Load a local plugin manifest or use the CLI to push live updates to the OMNIOS runtime.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                        flex: 1, padding: '8px', background: '#222', border: '1px solid #333',
                        borderRadius: '6px', color: 'white', fontSize: '0.7rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}>
                        <ExternalLink size={14} /> Open Docs
                    </button>
                    <button style={{
                        flex: 1, padding: '8px', background: '#222', border: '1px solid #333',
                        borderRadius: '6px', color: 'white', fontSize: '0.7rem', cursor: 'pointer'
                    }}>
                        Load Local manifest.json
                    </button>
                </div>
            </div>
        </div>
    );
};
