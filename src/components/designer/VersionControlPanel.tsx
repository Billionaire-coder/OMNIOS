
import React, { useState } from 'react';
import { useCollaboration } from '@/hooks/useCollaboration';
import { useProjectStore } from '@/hooks/useProjectStore';
import { History, GitBranch, Plus, Eye, RotateCcw, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface VersionControlPanelProps {
    onClose: () => void;
    onToggleDiff: (versionId: string | null) => void;
    diffVersionId: string | null;
}

export function VersionControlPanel({ onClose, onToggleDiff, diffVersionId }: VersionControlPanelProps) {
    const { versions, createSnapshot, user } = useCollaboration();
    const { state, setState } = useProjectStore();
    const [newVersionName, setNewVersionName] = useState('');
    const [newVersionDesc, setNewVersionDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = () => {
        if (!newVersionName.trim()) return;
        const metadata = {
            description: newVersionDesc,
            elementCount: Object.keys(state.elements).length,
            pageSize: Object.keys(state.pages).length
        };
        createSnapshot(`${newVersionName}||${JSON.stringify(metadata)}`, state);
        setNewVersionName('');
        setNewVersionDesc('');
        setIsCreating(false);
    };

    const handleRestore = (version: any) => {
        if (confirm(`Are you sure you want to restore "${version.name}"? Current unsaved changes might be lost.`)) {
            setState(version.state);
            onClose();
        }
    };

    return (
        <div className="fixed right-20 top-20 w-80 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden max-h-[80vh]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <History size={16} className="text-blue-400" /> Version History
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X size={16} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {versions.length === 0 && (
                    <div className="text-center text-gray-500 py-8 text-xs">
                        No versions created yet.
                    </div>
                )}
                {[...versions].reverse().map((v) => (
                    <div
                        key={v.id}
                        className={`p-3 rounded-lg border transition-colors ${diffVersionId === v.id ? 'bg-blue-500/20 border-blue-500/50' : 'bg-[#252525] border-[#333] hover:border-gray-500'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    {v.name.includes('||') ? v.name.split('||')[0] : v.name}
                                </h3>
                                {v.name.includes('||') && (
                                    <p className="text-[11px] text-blue-400 mt-0.5">
                                        {JSON.parse(v.name.split('||')[1]).description}
                                    </p>
                                )}
                                <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(v.timestamp).toLocaleString()} • {v.author?.name || 'Unknown'}
                                </p>
                                {v.name.includes('||') && (
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[9px] text-gray-500 uppercase tracking-tighter">
                                            {JSON.parse(v.name.split('||')[1]).elementCount} Elements
                                        </span>
                                        <span className="text-[9px] text-gray-500 uppercase tracking-tighter">
                                            {JSON.parse(v.name.split('||')[1]).pageSize} Pages
                                        </span>
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">
                                {v.id.substr(0, 4)}
                            </span>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => onToggleDiff(diffVersionId === v.id ? null : v.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors ${diffVersionId === v.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                            >
                                <Eye size={12} /> {diffVersionId === v.id ? 'Hide Diff' : 'Compare'}
                            </button>
                            <button
                                onClick={() => handleRestore(v)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium bg-white/5 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                            >
                                <RotateCcw size={12} /> Restore
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Create */}
            <div className="p-3 border-t border-white/10 bg-black/20">
                {isCreating ? (
                    <div className="space-y-2">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Version name (e.g. 'Hero Redesign')"
                            value={newVersionName}
                            onChange={(e) => setNewVersionName(e.target.value)}
                            className="w-full bg-[#333] text-white text-xs rounded px-2 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500"
                        />
                        <textarea
                            placeholder="Description of changes..."
                            value={newVersionDesc}
                            onChange={(e) => setNewVersionDesc(e.target.value)}
                            className="w-full bg-[#333] text-white text-xs rounded px-2 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500 min-h-[60px] resize-none"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex-1 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                            >
                                Save Version
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus size={14} /> Create New Version
                    </button>
                )}
            </div>
        </div>
    );
}
