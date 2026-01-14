"use client";

import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Trash2, Edit2, Check, X, Palette } from 'lucide-react';

export function StylesPanel() {
    const { state, updateClass, deleteClass, renameClass } = useProjectStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const classes = state.designSystem.classes;

    const startEdit = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const saveEdit = (id: string) => {
        if (editName.trim()) {
            renameClass(id, editName.trim());
        }
        setEditingId(null);
    };

    return (
        <div className="flex flex-col h-full text-white">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-2">
                    <Palette size={14} className="text-pink-500" /> Global Styles
                </span>
                <span className="text-xs text-zinc-500">{classes.length} classes</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {classes.length === 0 && (
                    <div className="text-center text-zinc-600 text-xs mt-10">
                        No global classes yet. <br />
                        Create one in the Properties Panel.
                    </div>
                )}

                {classes.map(cls => (
                    <div key={cls.id} className="group flex items-center justify-between p-2 bg-zinc-900/50 border border-zinc-800 rounded hover:border-zinc-700 transition-colors">

                        {editingId === cls.id ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    autoFocus
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    // Handle Enter Key
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEdit(cls.id);
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                    className="bg-black text-xs p-1 border border-zinc-700 rounded w-full focus:outline-none focus:border-blue-500"
                                />
                                <button onClick={() => saveEdit(cls.id)} className="text-green-500"><Check size={12} /></button>
                                <button onClick={() => setEditingId(null)} className="text-zinc-500"><X size={12} /></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-pink-500/50"></div>
                                <span className="text-xs font-mono text-zinc-300">.{cls.name}</span>
                            </div>
                        )}

                        {!editingId && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 hover:text-blue-400 text-zinc-500" title="Rename Class" onClick={() => startEdit(cls.id, cls.name)}>
                                    <Edit2 size={12} />
                                </button>
                                <button className="p-1 hover:text-red-400 text-zinc-500" title="Delete Class" onClick={() => deleteClass(cls.id)}>
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
