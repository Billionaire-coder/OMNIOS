import React, { useState } from 'react';
import { Package, UploadCloud, Tag, DollarSign, Image as ImageIcon, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { MarketplaceService, MarketplaceItem } from '@/lib/plugins/MarketplaceService';
import { generateOptimizedAsset } from '@/lib/assets/optimizer';

// Batch 15.1: The Workshop (Creator Studio)
// Dedicated panel for packaging and publishing components.

export const WorkshopPanel: React.FC<{ onClose: () => void, initialComponentId?: string }> = ({ onClose, initialComponentId }) => {
    const { state } = useProjectStore();
    const components = state.designSystem.components || [];

    // Selection State
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(initialComponentId || null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '0',
        tags: '',
        category: 'ui',
        coverImage: ''
    });

    // Process State
    const [status, setStatus] = useState<'idle' | 'packaging' | 'publishing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Load initial data if component selected
    React.useEffect(() => {
        if (selectedComponentId) {
            const comp = components.find(c => c.id === selectedComponentId);
            if (comp) {
                setFormData(prev => ({
                    ...prev,
                    name: comp.name,
                    description: `A custom ${comp.name} component for OMNIOS.`,
                }));
            }
        }
    }, [selectedComponentId, components]);

    const handlePublish = async () => {
        if (!selectedComponentId) return;

        setStatus('packaging');

        try {
            // 1. Package Component Data
            const comp = components.find(c => c.id === selectedComponentId);
            if (!comp) throw new Error("Component not found");

            // Simulate Packaging delay
            await new Promise(r => setTimeout(r, 800));

            setStatus('publishing');

            // 2. Create Marketplace Item Payload
            const payload: MarketplaceItem = {
                id: `com.user.${comp.id.substring(0, 8)}`,
                name: formData.name,
                description: formData.description,
                version: '1.0.0',
                author: 'You (Creator)',
                category: formData.category as any,
                type: 'component',
                price: parseFloat(formData.price) || 0,
                icon: 'Package',
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                downloads: 0,
                rating: 0,
                manifestUrl: '',
                sourceUrl: '', // In real app, this would be the IPFS hash or S3 URL of the packaged JSON
                permissions: []
            };

            // 3. Submit to Registry
            await MarketplaceService.publishItem(payload);

            setStatus('success');

        } catch (e: any) {
            console.error(e);
            setErrorMessage(e.message || "Failed to publish");
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Published Successfully!</h2>
                <p className="text-gray-400 mb-8 max-w-sm">
                    <strong className="text-white">{formData.name}</strong> is now live in the marketplace.
                    You can manage it from your creator dashboard.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium transition-colors border border-white/10"
                    >
                        Close Workshop
                    </button>
                    <button
                        onClick={() => {
                            setStatus('idle');
                            setSelectedComponentId(null);
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Publish Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Package className="text-blue-500" />
                        The Workshop
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">Component Foundry</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Component Selector */}
                <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-2 overflow-y-auto bg-black/10">
                    <div className="text-xs font-bold text-gray-500 mb-2 px-2 uppercase tracking-widest">Select Component</div>
                    {components.length === 0 ? (
                        <div className="text-sm text-gray-600 italic px-2">No components found. Create a Master Component in the canvas first.</div>
                    ) : (
                        components.map(comp => (
                            <button
                                key={comp.id}
                                onClick={() => {
                                    setSelectedComponentId(comp.id);
                                    setStatus('idle');
                                }}
                                className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${selectedComponentId === comp.id
                                        ? 'bg-blue-500/10 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                        : 'hover:bg-white/5 border-transparent text-gray-400'
                                    }`}
                            >
                                <div className="font-medium truncate">{comp.name}</div>
                                <div className="text-[10px] opacity-60 mt-1">{Object.keys(comp.elements).length} elements</div>
                            </button>
                        ))
                    )}
                </div>

                {/* Main: Form */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {selectedComponentId ? (
                        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">

                            {/* Packaging Preview */}
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex items-center gap-6">
                                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                    <Package size={32} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{formData.name || 'Untitled Component'}</h3>
                                    <p className="text-sm text-gray-400">Ready to package version 1.0.0</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-400">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Component Name"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-400">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    >
                                        <option value="ui">UI Kit</option>
                                        <option value="layout">Layout</option>
                                        <option value="form">Form & Input</option>
                                        <option value="data">Data Display</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-400">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-32 resize-none"
                                    placeholder="Describe your component features..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-400 flex items-center gap-2">
                                        <DollarSign size={14} /> Price (USD)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                    <p className="text-[10px] text-gray-500">Set to 0 for Free distribution.</p>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-400 flex items-center gap-2">
                                        <Tag size={14} /> Tags
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                        placeholder="react, tailwind, dark-mode..."
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                                    <AlertCircle size={20} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <button
                                onClick={handlePublish}
                                disabled={status !== 'idle' || !formData.name}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${status !== 'idle' || !formData.name
                                        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                                    }`}
                            >
                                {status === 'idle' && <><UploadCloud /> Publish to Marketplace</>}
                                {status === 'packaging' && <><Package className="animate-bounce" /> Packaging Component...</>}
                                {status === 'publishing' && <><UploadCloud className="animate-pulse" /> Uploading to Registry...</>}
                            </button>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-4 border border-white/10 border-dashed">
                                <ArrowLeft size={24} />
                            </div>
                            <p>Select a Master Component from the sidebar to begin packaging.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
