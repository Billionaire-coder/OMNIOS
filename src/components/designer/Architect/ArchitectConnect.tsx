
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe,
    Plus,
    Trash2,
    Play,
    Link as LinkIcon,
    Code,
    ChevronRight,
    X,
    Activity,
    Save,
    Braces,
    ArrowRight,
    Zap
} from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { ApiManager } from '@/lib/api/ApiManager';
import { ApiRequest } from '@/types/designer';
import { v4 as uuidv4 } from 'uuid';
import { JsonTree } from '../api/JsonTree';
import { Button } from '@/components/ui/button';

export const ArchitectConnect: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, setState } = useProjectStore();
    const manager = new ApiManager(state, setState);
    const requests = state.data.apiRequests || [];

    const [selectedReqId, setSelectedReqId] = useState<string | null>(requests[0]?.id || null);
    const activeReq = requests.find(r => r.id === selectedReqId);

    const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'outputs'>('params');
    const [isRunning, setIsRunning] = useState(false);
    const [lastResponse, setLastResponse] = useState<any>(null);

    const handleCreate = () => {
        const newReq = manager.createRequest('new-api-resource');
        setSelectedReqId(newReq.id);
    };

    const handleRun = async () => {
        if (!selectedReqId) return;
        setIsRunning(true);
        const res = await manager.executeRequest(selectedReqId);
        setLastResponse(res);
        setIsRunning(false);
    };

    const updateRequest = (updates: Partial<ApiRequest>) => {
        if (!selectedReqId) return;
        manager.updateRequest(selectedReqId, updates);
    };

    return (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-3xl z-[70] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Toolbar Header */}
            <div className="h-16 border-b border-white/5 bg-black/40 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-teal-500/20 rounded-xl border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                        <Globe className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                            Architect Connect
                            <span className="text-[9px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/30 font-mono tracking-widest uppercase">Live API</span>
                        </h1>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">API Workbench // Data Binding Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleCreate}
                        className="bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 gap-2 h-9 px-4 rounded-xl font-bold text-xs transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> NEW ENDPOINT
                    </Button>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                        className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl ml-2"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Request List */}
                <div className="w-72 border-r border-white/5 bg-black/20 flex flex-col">
                    <div className="p-4 flex items-center justify-between">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Resources</span>
                        <Zap className="w-3 h-3 text-white/10" />
                    </div>
                    <div className="flex-1 overflow-y-auto px-3 space-y-1">
                        {requests.map(req => (
                            <button
                                key={req.id}
                                onClick={() => setSelectedReqId(req.id)}
                                className={`w-full group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border ${selectedReqId === req.id
                                        ? 'bg-teal-500/10 border-teal-500/20 text-white translate-x-1'
                                        : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white/60'
                                    }`}
                            >
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 border ${req.method === 'GET' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                        req.method === 'POST' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    }`}>
                                    {req.method}
                                </span>
                                <span className="text-[11px] font-bold truncate tracking-tight">{req.name}</span>
                                {selectedReqId === req.id && (
                                    <div className="absolute left-[-12px] w-1 h-4 bg-teal-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                {activeReq ? (
                    <div className="flex-1 flex flex-col bg-[#080808]">
                        {/* URL Bar */}
                        <div className="p-6 pb-2">
                            <div className="flex gap-4 items-center bg-black/40 p-2 rounded-2xl border border-white/5 shadow-inner">
                                <select
                                    value={activeReq.method}
                                    onChange={(e) => updateRequest({ method: e.target.value as any })}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white/80 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all cursor-pointer"
                                >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                </select>
                                <input
                                    value={activeReq.url}
                                    onChange={(e) => updateRequest({ url: e.target.value })}
                                    className="flex-1 bg-transparent border-none text-sm text-teal-300 font-mono focus:ring-0 placeholder:text-white/10"
                                    placeholder="https://api.example.com/v1/resource"
                                />
                                <Button
                                    onClick={handleRun}
                                    disabled={isRunning}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest px-6 h-10 rounded-xl shadow-xl shadow-indigo-600/20 gap-3 active:scale-95 transition-all"
                                >
                                    {isRunning ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                    EXECUTE
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden p-6 gap-6">
                            {/* Left: Config Tabs */}
                            <div className="flex-1 flex flex-col bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
                                <div className="flex border-b border-white/5">
                                    {(['params', 'headers', 'body', 'outputs'] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === tab
                                                    ? 'border-teal-400 text-teal-400 bg-teal-400/5'
                                                    : 'border-transparent text-white/30 hover:text-white/60 hover:bg-white/5'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {/* Tab Content Rendering */}
                                    {activeTab === 'body' ? (
                                        <div className="h-full flex flex-col gap-4">
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => updateRequest({ bodyType: 'none' })}
                                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${activeReq.bodyType === 'none' ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-white/20 hover:text-white/40'}`}
                                                >NONE</button>
                                                <button
                                                    onClick={() => updateRequest({ bodyType: 'json' })}
                                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${activeReq.bodyType === 'json' ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' : 'border-transparent text-white/20 hover:text-white/40'}`}
                                                >JSON</button>
                                            </div>
                                            {activeReq.bodyType === 'json' && (
                                                <textarea
                                                    value={activeReq.body}
                                                    onChange={(e) => updateRequest({ body: e.target.value })}
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-6 text-[11px] font-mono text-emerald-400/80 outline-none resize-none focus:border-emerald-500/30"
                                                    spellCheck={false}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Dynamic List for params/headers/outputs */}
                                            {/* (Logic simplified for brevity, similar to legacy editor but with architect styling) */}
                                            <p className="text-[10px] text-white/20 italic font-medium leading-relaxed">
                                                Visual mapping of JSON paths to Logic Variables is enabled on the right response panel.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Response Inspector */}
                            <div className="w-[450px] flex flex-col gap-6">
                                <div className="flex-1 bg-black/60 rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                                    <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
                                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Response Inspector</span>
                                        {lastResponse && (
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold ${lastResponse.status < 400 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {lastResponse.status}
                                                </span>
                                                <span className="text-[9px] font-mono text-white/20">{lastResponse.duration}ms</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                                        {lastResponse ? (
                                            <JsonTree
                                                data={lastResponse.data}
                                                onSelectPath={(path, type, value) => {
                                                    const name = path.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '_') || 'variable';
                                                    if ((activeReq.outputs || []).some(o => o.path === path)) return;
                                                    const newOutput = { id: uuidv4(), path, variableName: name, type: type as any };
                                                    updateRequest({ outputs: [...(activeReq.outputs || []), newOutput] });
                                                    setActiveTab('outputs');
                                                }}
                                            />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-white/5 gap-4">
                                                <Braces className="w-12 h-12" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Signal</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Mapped Outputs */}
                                <div className="h-48 bg-teal-500/5 rounded-3xl border border-teal-500/10 p-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Active Bindings</h3>
                                        <div className="p-1 px-2 bg-teal-500/20 border border-teal-500/30 rounded text-[8px] font-black text-teal-300">
                                            {activeReq.outputs?.length || 0} LINKED
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-2">
                                        {activeReq.outputs?.map(output => (
                                            <div key={output.id} className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-white/5 group">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <LinkIcon className="w-3 h-3 text-teal-500/60" />
                                                    <span className="text-[10px] font-mono text-teal-300/80 truncate">{output.path}</span>
                                                    <ArrowRight className="w-2 h-2 text-white/20" />
                                                    <span className="text-[10px] font-bold text-white/60 truncate italic">{output.variableName}</span>
                                                </div>
                                                <button
                                                    onClick={() => updateRequest({ outputs: activeReq.outputs!.filter(o => o.id !== output.id) })}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-all"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-black/40 text-white/10 animate-pulse">
                        <Zap className="w-24 h-24 mb-6 opacity-5" />
                        <h2 className="text-sm font-black uppercase tracking-[0.4em]">Initialize Connection</h2>
                    </div>
                )}
            </div>
        </div>
    );
};
