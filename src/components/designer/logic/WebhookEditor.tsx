import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Plus, Trash2, Copy, RefreshCw, X } from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Webhook } from '@/types/designer';
import { v4 as uuidv4 } from 'uuid';
import { JsonTree } from '../api/JsonTree';

interface WebhookEditorProps {
    onClose: () => void;
}

export const WebhookEditor: React.FC<WebhookEditorProps> = ({ onClose }) => {
    const { state, setState } = useProjectStore();
    const webhooks = state.data.webhooks || [];

    const [selectedHookId, setSelectedHookId] = useState<string | null>(null);
    const activeHook = webhooks.find(w => w.id === selectedHookId);

    // Initial load
    useEffect(() => {
        if (!state.data.webhooks) {
            setState({ ...state, data: { ...state.data, webhooks: [] } });
        }
    }, []);

    const [events, setEvents] = useState<any[]>([]);
    const [isPolling, setIsPolling] = useState(false);

    // Poll for events when a hook is selected
    useEffect(() => {
        if (!activeHook) return;

        const fetchEvents = async () => {
            try {
                const res = await fetch(`/api/webhooks/poll?hookId=${activeHook.id}`);
                const data = await res.json();
                setEvents(data.events || []);
            } catch (e) {
                console.error("Failed to poll events", e);
            }
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, [activeHook]);

    const createWebhook = () => {
        const name = prompt("Webhook Name (e.g. Stripe Payment):");
        if (name) {
            const newHook: Webhook = {
                id: uuidv4(),
                name,
                method: 'POST',
                enabled: true,
                recentEvents: []
            };
            setState({
                ...state,
                data: { ...state.data, webhooks: [...webhooks, newHook] }
            });
            setSelectedHookId(newHook.id);
        }
    };

    const deleteWebhook = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Delete this webhook?")) {
            setState({
                ...state,
                data: { ...state.data, webhooks: webhooks.filter(w => w.id !== id) }
            });
            if (selectedHookId === id) setSelectedHookId(null);
        }
    };

    const copyUrl = () => {
        if (!activeHook) return;
        const url = `${window.location.origin}/api/webhooks/${activeHook.id}`;
        navigator.clipboard.writeText(url);
        alert("Copied Listener URL to clipboard!");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-4 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl z-50 flex overflow-hidden font-sans"
        >
            {/* Sidebar */}
            <div className="w-64 bg-[#0f0f0f] border-r border-white/10 flex flex-col">
                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-[#141414]">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Radio size={14} /> Webhooks
                    </span>
                    <button onClick={createWebhook} className="p-1 hover:bg-white/10 rounded text-teal-400"><Plus size={14} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {webhooks.length === 0 && <div className="text-xs text-gray-600 p-2 italic">No webhooks yet.</div>}
                    {webhooks.map(w => (
                        <button
                            key={w.id}
                            onClick={() => setSelectedHookId(w.id)}
                            className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between group ${selectedHookId === w.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                            <span className="truncate">{w.name}</span>
                            <div
                                onClick={(e) => deleteWebhook(w.id, e)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1"
                            >
                                <Trash2 size={12} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            {activeHook ? (
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    <div className="h-14 border-b border-white/10 bg-[#141414] flex items-center justify-between px-6">
                        <div>
                            <h2 className="text-sm font-medium text-white">{activeHook.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${activeHook.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-xs text-gray-500">{activeHook.enabled ? 'Listening' : 'Disabled'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded border border-white/5">
                                <span className="text-xs text-gray-500 font-mono select-all">.../api/webhooks/{activeHook.id}</span>
                                <button onClick={copyUrl} className="text-gray-400 hover:text-white"><Copy size={12} /></button>
                            </div>
                            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded text-gray-400 ml-4"><X size={16} /></button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 flex gap-6 overflow-hidden">
                        {/* Status / Test */}
                        <div className="flex-1 space-y-4">
                            <div className="text-xs font-bold text-gray-500 uppercase">Configuration</div>
                            <div className="p-4 bg-black/20 rounded border border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-300">Method</span>
                                    <span className="text-xs font-mono bg-blue-500/20 text-blue-400 px-2 py-1 rounded">POST</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-300">Trigger Logic Flow</span>
                                    <span className="text-xs text-gray-500 italic">Not connected (Future)</span>
                                </div>
                            </div>

                            <div className="text-xs font-bold text-gray-500 uppercase pt-4">Payload Preview</div>
                            <div className="flex-1 bg-black/40 rounded border border-white/10 p-4 h-64 overflow-auto">
                                {events.length > 0 ? (
                                    <JsonTree
                                        data={events[0].payload}
                                        onSelectPath={(path) => console.log(path)}
                                    />
                                ) : (
                                    <div className="text-gray-600 text-xs italic flex items-center justify-center h-full">
                                        Waiting for the first event...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Events Log */}
                        <div className="w-[300px] border-l border-white/10 pl-6 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-xs font-bold text-gray-500 uppercase">Recent Events</div>
                                <RefreshCw size={12} className="text-gray-600 animate-spin-slow" />
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {events.length === 0 && <div className="text-xs text-gray-600 italic">No events received.</div>}
                                {events.map((e, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded border border-white/5 hover:bg-white/10 cursor-pointer">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] text-teal-400 font-mono">{new Date(e.timestamp).toLocaleTimeString()}</span>
                                            <span className="text-[10px] bg-green-900/40 text-green-400 px-1 rounded">200 OK</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono truncate">
                                            {JSON.stringify(e.payload)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-600">
                    Select a Webhook to configure.
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white"><X /></button>
                </div>
            )}
        </motion.div>
    );
};
