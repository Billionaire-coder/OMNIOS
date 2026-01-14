
import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../../hooks/useProjectStore';
import * as Icons from 'lucide-react';
import { Secret, Environment } from '../../../types/designer';

interface EnvironmentManagerProps {
    onClose: () => void;
}

export const EnvironmentManager: React.FC<EnvironmentManagerProps> = ({ onClose }) => {
    const { state, createEnvironment, setSecret, getSecrets } = useProjectStore();
    const [activeEnvId, setActiveEnvId] = useState<string | null>(null);
    const [secrets, setSecrets] = useState<Secret[]>([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [isCreatingEnv, setIsCreatingEnv] = useState(false);
    const [newEnvName, setNewEnvName] = useState('');
    const [newEnvSlug, setNewEnvSlug] = useState('');

    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [isSavingSecret, setIsSavingSecret] = useState(false);

    useEffect(() => {
        if (state.environments.length > 0 && !activeEnvId) {
            setActiveEnvId(state.environments[0].id);
        }
    }, [state.environments]);

    useEffect(() => {
        const fetchSecrets = async () => {
            if (!activeEnvId) return;
            setLoading(true);
            try {
                const list = await getSecrets(activeEnvId);
                setSecrets(list || []);
            } finally {
                setLoading(false);
            }
        };
        fetchSecrets();
    }, [activeEnvId, getSecrets]);

    const handleCreateEnv = async () => {
        if (!newEnvName || !newEnvSlug) return;
        try {
            await createEnvironment(newEnvName, newEnvSlug);
            setIsCreatingEnv(false);
            setNewEnvName('');
            setNewEnvSlug('');
        } catch (e) {
            alert('Failed to create environment');
        }
    };

    const handleSaveSecret = async () => {
        if (!activeEnvId || !newKey || !newValue) return;
        setIsSavingSecret(true);
        try {
            await setSecret(activeEnvId, newKey, newValue);
            // Refresh
            const list = await getSecrets(activeEnvId);
            setSecrets(list || []);
            setNewKey('');
            setNewValue('');
        } catch (e) {
            console.error(e);
            alert('Failed to save secret');
        } finally {
            setIsSavingSecret(false);
        }
    };

    const activeEnv = state.environments.find(e => e.id === activeEnvId);

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="w-full max-w-4xl h-[600px] bg-[#111] border border-white/10 rounded-xl shadow-2xl flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-white/10 flex flex-col bg-[#161616]">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <span className="text-sm font-bold text-white uppercase tracking-wider">Environments</span>
                        <button onClick={() => setIsCreatingEnv(true)} className="p-1 hover:bg-white/10 rounded">
                            <Icons.Plus size={14} className="text-white/60" />
                        </button>
                    </div>

                    {isCreatingEnv && (
                        <div className="p-3 bg-white/5 border-b border-white/5 space-y-2">
                            <input
                                className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-xs text-white"
                                placeholder="Name (e.g. Staging)"
                                value={newEnvName}
                                onChange={e => setNewEnvName(e.target.value)}
                            />
                            <input
                                className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-xs text-white"
                                placeholder="Slug (e.g. staging)"
                                value={newEnvSlug}
                                onChange={e => setNewEnvSlug(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setIsCreatingEnv(false)} className="text-[10px] text-white/50 hover:text-white">Cancel</button>
                                <button onClick={handleCreateEnv} className="text-[10px] bg-blue-600 px-2 py-1 rounded text-white">Create</button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {state.environments.map(env => (
                            <button
                                key={env.id}
                                onClick={() => setActiveEnvId(env.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeEnvId === env.id
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icons.Server size={14} />
                                {env.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-[#0f0f0f]">
                    <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#161616]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                <Icons.Lock size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Secret Management</h3>
                                <p className="text-[10px] text-zinc-500">Encrypted at rest • {activeEnv?.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <Icons.X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="flex gap-4 items-end mb-8 bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
                            <div className="flex-1 space-y-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Key Name</label>
                                <div className="relative">
                                    <Icons.Key className="absolute left-3 top-2.5 text-zinc-600" size={14} />
                                    <input
                                        className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-purple-500 outline-none"
                                        placeholder="DATABASE_URL"
                                        value={newKey}
                                        onChange={e => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                                    />
                                </div>
                            </div>
                            <div className="flex-[2] space-y-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Value</label>
                                <input
                                    type="password"
                                    className="w-full bg-[#111] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:border-purple-500 outline-none"
                                    placeholder="Value is encrypted..."
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleSaveSecret}
                                disabled={isSavingSecret || !newKey || !newValue}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                <Icons.Plus size={16} />
                                Add
                            </button>
                        </div>

                        <div className="space-y-2">
                            {secrets.length === 0 ? (
                                <div className="text-center py-20 text-zinc-600">
                                    <Icons.ShieldAlert size={40} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-sm">No secrets configured for this environment.</p>
                                </div>
                            ) : (
                                secrets.map(secret => (
                                    <div key={secret.id} className="group flex items-center justify-between p-4 bg-[#141414] border border-white/5 rounded-lg hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 font-mono text-xs">
                                                $
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-zinc-200 font-mono">{secret.keyName}</div>
                                                <div className="text-[10px] text-zinc-600">Added {new Date(secret.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded border border-white/5 text-xs text-zinc-500 font-mono">
                                                ••••••••••••••••
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white" title="Copy Key">
                                                    <Icons.Copy size={14} />
                                                </button>
                                                <button className="p-2 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-500" title="Delete">
                                                    <Icons.Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
