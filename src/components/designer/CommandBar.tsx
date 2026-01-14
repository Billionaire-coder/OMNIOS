import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, Plus, Layout, Settings, Rocket, Zap, X, Frown, ArrowDown, ArrowUp, CornerDownLeft } from 'lucide-react';
import { useProjectStore } from '../../hooks/useProjectStore';

export const CommandBar: React.FC = () => {
    const { state, toggleCommandBar, addElement, switchPage, updateOSSettings, setEngineMode } = useProjectStore();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const commands = [
        { id: 'add-box', label: 'Add Box', icon: <Plus size={16} />, category: 'Elements', action: () => addElement('box', state.selectedElementId || 'root') },
        { id: 'add-text', label: 'Add Heading', icon: <Plus size={16} />, category: 'Elements', action: () => addElement('text', state.selectedElementId || 'root') },
        { id: 'add-btn', label: 'Add Button', icon: <Plus size={16} />, category: 'Elements', action: () => addElement('button', state.selectedElementId || 'root') },
        { id: 'go-home', label: 'Go to Home', icon: <Layout size={16} />, category: 'Navigation', action: () => switchPage('index') },
        { id: 'toggle-title', label: 'Toggle Title Bar', icon: <Settings size={16} />, category: 'System', action: () => updateOSSettings({ showTitleBar: !state.osSettings.showTitleBar }) },
        { id: 'maximize', label: 'Maximize OMNIOS', icon: <Rocket size={16} />, category: 'System', action: () => updateOSSettings({ isMaximized: true }) },
        { id: 'switch-hyper', label: 'Switch to Hyper Engine (Rust)', icon: <Zap size={16} />, category: 'Engine', action: () => setEngineMode('hyper') },
        { id: 'switch-standard', label: 'Switch to Standard Engine (TS)', icon: <Layout size={16} />, category: 'Engine', action: () => setEngineMode('standard') },
    ];

    const filteredCommands = commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (state.isCommandBarOpen) {
            inputRef.current?.focus();
            setSelectedIndex(0);
        }
    }, [state.isCommandBarOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            toggleCommandBar(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            const cmd = filteredCommands[selectedIndex];
            if (cmd) {
                cmd.action();
                toggleCommandBar(false);
            }
        }
    };

    if (!state.isCommandBarOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onMouseDown={() => toggleCommandBar(false)}
        >
            <div
                className="w-full max-w-[640px] bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in outline-none"
                onMouseDown={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                    <Search size={18} className="text-[#00ffd5] mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search commands or elements..."
                        className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-white/20"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center gap-1.5 ml-4 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/40 font-mono">
                        <Command size={10} />
                        <span>K</span>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                            <div
                                key={cmd.id}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${index === selectedIndex ? 'bg-[#00ffd5]/10 text-white' : 'text-white/60 hover:bg-white/5'
                                    }`}
                                onClick={() => {
                                    cmd.action();
                                    toggleCommandBar(false);
                                }}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-md ${index === selectedIndex ? 'text-[#00ffd5]' : 'bg-white/5 text-white/40'}`}>
                                        {cmd.icon}
                                    </div>
                                    <span className="font-medium">{cmd.label}</span>
                                </div>
                                <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
                                    {cmd.category}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-white/20 flex flex-col items-center gap-3">
                            <Frown size={32} />
                            <p>No results found for "{query}"</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 px-4 py-2 border-t border-white/5 bg-white/[0.01] text-[10px] text-white/30 uppercase tracking-widest font-bold">
                    <div className="flex items-center gap-1.5">
                        <ArrowDown size={10} />
                        <ArrowUp size={10} />
                        <span>Navigate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CornerDownLeft size={10} />
                        <span>Execute</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                        <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 font-mono lowercase">Esc</span>
                        <span>Close</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
