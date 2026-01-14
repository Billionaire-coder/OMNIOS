import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Trash2, Save, Code, Braces, Table, ArrowRight, Activity, X } from 'lucide-react';
import { ApiManager } from '@/lib/api/ApiManager';
import { useProjectStore } from '@/hooks/useProjectStore';
import { ApiRequest } from '@/types/designer';
import { v4 as uuidv4 } from 'uuid';
import { JsonTree } from './JsonTree';

interface ApiRequestEditorProps {
    onClose: () => void;
}

export const ApiRequestEditor: React.FC<ApiRequestEditorProps> = ({ onClose }) => {
    const { state, setState } = useProjectStore();
    const manager = new ApiManager(state, setState);

    // Ensure apiRequests exists (migration safety)
    const requests = state.data.apiRequests || [];

    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const activeRequest = requests.find(r => r.id === selectedRequestId);

    const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'outputs' | 'logs'>('params');
    const [isRunning, setIsRunning] = useState(false);
    const [lastResponse, setLastResponse] = useState<any>(null);

    const handleCreateRequest = () => {
        const name = prompt("Request Name (e.g. 'Get Users'):");
        if (name) {
            const newReq = manager.createRequest(name);
            setSelectedRequestId(newReq.id);
        }
    };

    const updateRequest = (updates: Partial<ApiRequest>) => {
        if (!selectedRequestId) return;
        manager.updateRequest(selectedRequestId, updates);
    };

    const handleRun = async () => {
        if (!selectedRequestId) return;
        setIsRunning(true);
        setLastResponse(null);

        // Mock variables for now - later allow user to input test vars
        const variables = {
            // e.g. userId: '123'
        };

        const res = await manager.executeRequest(selectedRequestId, variables);
        setLastResponse(res);
        setIsRunning(false);
    };

    // Helper to edit array items (headers/params/outputs)
    const updateListItem = (
        field: 'headers' | 'params' | 'outputs',
        itemId: string,
        key: string,
        newVal: string
    ) => {
        if (!activeRequest) return;
        const list = (activeRequest[field] as any[]) || [];
        const updatedList = list.map(item => item.id === itemId ? { ...item, [key]: newVal } : item);
        updateRequest({ [field]: updatedList });
    };

    const addListItem = (field: 'headers' | 'params' | 'outputs') => {
        if (!activeRequest) return;
        const list = (activeRequest[field] as any[]) || [];
        const newItem = field === 'outputs'
            ? { id: uuidv4(), path: '', variableName: '', type: 'string' }
            : { id: uuidv4(), key: '', value: '' };

        updateRequest({ [field]: [...list, newItem] });
    };

    const removeListItem = (field: 'headers' | 'params' | 'outputs', itemId: string) => {
        if (!activeRequest) return;
        const list = (activeRequest[field] as any[]) || [];
        updateRequest({ [field]: list.filter(item => item.id !== itemId) });
    };

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed inset-4 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl z-50 flex overflow-hidden"
        >
            {/* Sidebar List */}
            <div className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-sm font-medium text-white flex items-center gap-2">
                        <Activity size={16} className="text-teal-400" />
                        API Resources
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white">
                        <X size={14} />
                    </button>
                </div>

                <div className="p-2">
                    <button
                        onClick={handleCreateRequest}
                        className="w-full py-2 px-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 rounded flex items-center justify-center gap-2 text-sm transition-colors"
                    >
                        <Plus size={14} />
                        New Request
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1">
                    {requests.map(req => (
                        <button
                            key={req.id}
                            onClick={() => setSelectedRequestId(req.id)}
                            className={`w-full text-left px-3 py-2.5 rounded text-sm flex items-center gap-3 group transition-all ${selectedRequestId === req.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                                }`}
                        >
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${req.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                                req.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                                    req.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {req.method}
                            </span>
                            <span className="truncate flex-1">{req.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Editor Area */}
            {activeRequest ? (
                <div className="flex-1 flex flex-col bg-[#111]">
                    {/* Top Bar: Method & URL */}
                    <div className="h-16 border-b border-white/10 flex items-center px-6 gap-4 bg-[#141414]">
                        <select
                            value={activeRequest.method}
                            onChange={(e) => updateRequest({ method: e.target.value as any })}
                            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-medium text-white focus:border-teal-500/50 outline-none w-28"
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                        </select>

                        <div className="flex-1 relative">
                            <input
                                value={activeRequest.url}
                                onChange={(e) => updateRequest({ url: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-sm text-white font-mono focus:border-teal-500/50 outline-none"
                                placeholder="https://api.example.com/v1/resource"
                            />
                        </div>

                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="px-6 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded font-medium text-sm flex items-center gap-2 shadow-lg shadow-teal-900/20 active:scale-95 transition-all"
                        >
                            {isRunning ? <Activity size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                            Run
                        </button>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Left: Configuration */}
                        <div className="flex-1 flex flex-col border-r border-white/10">
                            {/* Tabs */}
                            <div className="flex border-b border-white/10">
                                {(['params', 'headers', 'body', 'outputs', 'logs'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-teal-500 text-teal-400 bg-teal-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto p-0">
                                {activeTab === 'body' ? (
                                    <div className="p-4 h-full flex flex-col">
                                        <div className="flex gap-4 mb-4">
                                            <label className="flex items-center gap-2 text-sm text-gray-400">
                                                <input
                                                    type="radio"
                                                    checked={activeRequest.bodyType === 'none'}
                                                    onChange={() => updateRequest({ bodyType: 'none' })}
                                                />
                                                None
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-400">
                                                <input
                                                    type="radio"
                                                    checked={activeRequest.bodyType === 'json'}
                                                    onChange={() => updateRequest({ bodyType: 'json' })}
                                                />
                                                JSON
                                            </label>
                                        </div>
                                        {activeRequest.bodyType === 'json' && (
                                            <textarea
                                                value={activeRequest.body}
                                                onChange={(e) => updateRequest({ body: e.target.value })}
                                                className="flex-1 bg-black/40 border border-white/10 rounded p-4 text-xs font-mono text-green-300 outline-none resize-none focus:border-white/20"
                                                spellCheck={false}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <div className="space-y-2">
                                            {['params', 'headers', 'outputs'].includes(activeTab) && ((activeRequest[activeTab as 'params' | 'headers' | 'outputs'] as any[]) || []).map(item => (
                                                <div key={item.id} className="flex gap-2">
                                                    <input
                                                        placeholder={activeTab === 'outputs' ? "JSON Path (e.g. data.user.id)" : "Key"}
                                                        value={activeTab === 'outputs' ? (item as any).path : (item as any).key}
                                                        onChange={(e) => updateListItem(activeTab as any, item.id, activeTab === 'outputs' ? 'path' : 'key', e.target.value)}
                                                        className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-teal-500/40"
                                                    />
                                                    <input
                                                        placeholder={activeTab === 'outputs' ? "Variable Name" : "Value"}
                                                        value={activeTab === 'outputs' ? (item as any).variableName : (item as any).value}
                                                        onChange={(e) => updateListItem(activeTab as any, item.id, activeTab === 'outputs' ? 'variableName' : 'value', e.target.value)}
                                                        className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-teal-500/40"
                                                    />
                                                    <button
                                                        onClick={() => removeListItem(activeTab as any, item.id)}
                                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {['params', 'headers', 'outputs'].includes(activeTab) && (
                                                <button
                                                    onClick={() => addListItem(activeTab as any)}
                                                    className="flex items-center gap-2 text-xs text-teal-400 hover:text-teal-300 transition-colors mt-2"
                                                >
                                                    <Plus size={14} /> Add {activeTab === 'outputs' ? 'Output' : (activeTab === 'headers' ? 'Header' : 'Param')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Response Preview */}
                        <div className="w-[400px] bg-[#0c0c0c] flex flex-col">
                            <div className="h-10 border-b border-white/10 flex items-center px-4 bg-[#111]">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Response</span>
                            </div>
                            <div className="flex-1 overflow-auto p-4">
                                {lastResponse ? (
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className={`px-2 py-1 rounded text-xs font-bold ${lastResponse.status >= 200 && lastResponse.status < 300 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {lastResponse.status} {lastResponse.statusText}
                                            </div>
                                            <div className="text-xs text-gray-500 py-1">
                                                {lastResponse.duration}ms
                                            </div>
                                        </div>

                                        {lastResponse.error ? (
                                            <div className="text-red-400 text-xs font-mono">{lastResponse.error}</div>
                                        ) : (
                                            <div className="bg-black/50 rounded p-3 overflow-auto max-h-[500px]">
                                                <JsonTree
                                                    data={lastResponse.data}
                                                    onSelectPath={(path, type, value) => {
                                                        const name = path.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '_') || 'variable';
                                                        // Prevent duplicates
                                                        if ((activeRequest.outputs || []).some(o => o.path === path)) return;

                                                        const newOutput = {
                                                            id: uuidv4(),
                                                            path,
                                                            variableName: name,
                                                            type: type as any
                                                        };
                                                        const currentOutputs = activeRequest.outputs || [];
                                                        updateRequest({ outputs: [...currentOutputs, newOutput] });
                                                        setActiveTab('outputs'); // Switch tab to show it
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-2">
                                        <ArrowRight size={24} className="opacity-20" />
                                        <span className="text-xs">Click Run to see response</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-600 bg-[#111]">
                    <Activity size={48} className="opacity-20 mb-4" />
                    <p>Select or create an API request</p>
                </div>
            )}
        </motion.div>
    );
};
