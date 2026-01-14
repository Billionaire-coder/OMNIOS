
import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Terminal, Plus, Trash2, Play, Rocket, Code, ChevronRight, Settings, Database, Globe, Activity, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ServerlessPanel: React.FC<{ onClose: () => void; onOpenSchema?: () => void; onOpenConnect?: () => void; onOpenWorkflow?: () => void; onOpenSaaSAdmin?: () => void }> = ({ onClose, onOpenSchema, onOpenConnect, onOpenWorkflow, onOpenSaaSAdmin }) => {
    const { state, addFunction, updateFunction, removeFunction, deployFunction, runFunction } = useProjectStore();
    const [selectedFuncId, setSelectedFuncId] = useState<string | null>(
        Object.keys(state.serverlessFunctions || {})[0] || null
    );

    const selectedFunc = selectedFuncId ? state.serverlessFunctions[selectedFuncId] : null;

    const handleCreate = () => {
        const id = addFunction('new-api-endpoint', '/api/new-route');
        setSelectedFuncId(id);
    };

    return (
        <div className="fixed inset-y-20 right-8 w-[500px] bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500 z-50">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Terminal className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Full-Stack Sovereignty</h2>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">The Architect | Serverless</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white/40 hover:text-white">
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-40 border-r border-white/5 flex flex-col bg-black/20">
                    <div className="p-3">
                        <Button
                            onClick={handleCreate}
                            className="w-full h-8 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 rounded-lg gap-2"
                        >
                            <Plus className="w-3 h-3" /> NEW FUNC
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 space-y-1">
                        <div className="px-2 py-2 mt-2 border-t border-white/5">
                            <h3 className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-2">Database</h3>
                            <Button
                                onClick={onOpenSchema}
                                className="w-full h-8 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 rounded-lg gap-2 mb-2 shadow-inner transition-all active:scale-95"
                            >
                                <Database className="w-3 h-3" /> VISUAL SCHEMA
                            </Button>
                            <Button
                                onClick={onOpenConnect}
                                className="w-full h-8 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-[10px] font-bold border border-teal-500/20 rounded-lg gap-2 shadow-inner transition-all active:scale-95 mb-2"
                            >
                                <Globe className="w-3 h-3" /> API CONNECT
                            </Button>
                        </div>

                        <div className="px-2 py-2 mt-2 border-t border-white/5">
                            <h3 className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-2">Automation</h3>
                            <Button
                                onClick={onOpenWorkflow}
                                className="w-full h-8 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/20 rounded-lg gap-2 shadow-inner transition-all active:scale-95"
                            >
                                <Activity className={`w-3.5 h-3.5`} /> WORKFLOW STUDIO
                            </Button>
                        </div>

                        <div className="px-2 py-2 mt-2 border-t border-white/5">
                            <h3 className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-2">Platform</h3>
                            <Button
                                onClick={onOpenSaaSAdmin}
                                className="w-full h-8 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/20 rounded-lg gap-2 shadow-inner transition-all active:scale-95"
                            >
                                <Shield className="w-3.5 h-3.5" /> SAAS ADMIN
                            </Button>
                        </div>

                        <div className="px-2 py-2 mt-2 border-t border-white/5">
                            <h3 className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-2">Functions</h3>
                            {Object.values(state.serverlessFunctions || {}).map(fn => (
                                <button
                                    key={fn.id}
                                    onClick={() => setSelectedFuncId(fn.id)}
                                    className={`w-full p-2 text-left rounded-lg transition-all group mb-1 ${selectedFuncId === fn.id
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/40 hover:bg-white/5 hover:text-white/60'
                                        }`}
                                >
                                    <div className="text-[11px] font-medium truncate">{fn.name}</div>
                                    <div className="text-[9px] opacity-40 truncate">{fn.route}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col bg-black/40">
                    {selectedFunc ? (
                        <>
                            <div className="p-4 space-y-4 flex flex-col flex-1">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-white/20 uppercase">Function Name</label>
                                        <input
                                            value={selectedFunc.name}
                                            onChange={(e) => updateFunction(selectedFunc.id, { name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-white/20 uppercase">Endpoint Route</label>
                                        <input
                                            value={selectedFunc.route}
                                            onChange={(e) => updateFunction(selectedFunc.id, { route: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-bold text-white/20 uppercase flex items-center gap-2">
                                            <Code className="w-3 h-3" /> Logic Implementation (TypeScript)
                                        </label>
                                        <span className="text-[9px] text-white/20 flex items-center gap-1 font-mono">
                                            <Settings className="w-2 h-2" /> RUNTIME: NODEJS V18
                                        </span>
                                    </div>
                                    <textarea
                                        value={selectedFunc.code}
                                        onChange={(e) => updateFunction(selectedFunc.id, { code: e.target.value })}
                                        spellCheck={false}
                                        className="flex-1 bg-black/60 border border-white/10 rounded-xl p-4 text-emerald-400 font-mono text-[11px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none shadow-inner"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => runFunction(selectedFunc.id)}
                                        variant="outline"
                                        className="flex-1 h-10 border-white/10 hover:bg-white/5 text-white gap-2 rounded-xl"
                                    >
                                        <Play className="w-4 h-4 text-emerald-400" /> Simulate
                                    </Button>
                                    <Button
                                        onClick={() => deployFunction(selectedFunc.id)}
                                        className="flex-1 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white gap-2 rounded-xl"
                                    >
                                        <Rocket className="w-4 h-4 shadow-lg text-white" /> Deploy
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            if (confirm('Delete internal sovereignty?')) {
                                                removeFunction(selectedFunc.id);
                                                setSelectedFuncId(null);
                                            }
                                        }}
                                        className="h-10 w-10 text-rose-400 hover:bg-rose-500/10 rounded-xl"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                            <div className="p-4 bg-white/5 rounded-full border border-white/5">
                                <Code className="w-8 h-8 text-white/10" />
                            </div>
                            <div>
                                <h3 className="text-white/40 font-bold uppercase tracking-widest text-xs">No functions selected</h3>
                                <p className="text-[10px] text-white/20 max-w-[200px] mt-2 leading-relaxed">
                                    Scaffold your first endpoint to begin absolute stack control.
                                </p>
                            </div>
                            <Button onClick={handleCreate} className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30">
                                Create API Node
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Footer */}
            <div className="p-2 bg-black/40 border-t border-white/5 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-bold text-white/40 uppercase">Engine Online</span>
                    </div>
                    {selectedFunc && selectedFunc.lastDeployedAt && (
                        <div className="text-[8px] font-bold text-white/20 uppercase italic">
                            Last Sync: {new Date(selectedFunc.lastDeployedAt).toLocaleTimeString()}
                        </div>
                    )}
                </div>
                <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                    Build 10.1 // OMNIOS-BACKEND
                </div>
            </div>
        </div>
    );
};
