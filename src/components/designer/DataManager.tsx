import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Database, Table, Type, Image as ImageIcon, Link as LinkIcon, Settings, Shield, Edit2 } from 'lucide-react';
import { CollectionManager } from '@/lib/data/CollectionManager';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Collection, CollectionItem, CollectionField } from '@/types/designer';

interface DataManagerProps {
    isOpen: boolean;
    onClose: () => void;
    manager: CollectionManager;
}

export const DataManager: React.FC<DataManagerProps> = ({ isOpen, onClose, manager }) => {
    const { state } = useProjectStore();
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    // UI State
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [fieldConfig, setFieldConfig] = useState<Partial<CollectionField>>({ name: '', type: 'text' });

    const [showSecurityModal, setShowSecurityModal] = useState(false);

    const collections = state.data.collections;
    const activeCollection = collections.find(c => c.id === selectedCollectionId);
    const items = activeCollection ? state.data.items.filter(i => i.collectionId === activeCollection.id) : [];

    const handleCreateCollection = () => {
        const name = prompt("Enter Collection Name (e.g., 'Blog Posts', 'Products'):");
        if (name) {
            const newCol = manager.createCollection(name);
            setSelectedCollectionId(newCol.id);
        }
    };

    const openFieldModal = (field?: CollectionField) => {
        if (field) {
            setEditingFieldId(field.id);
            setFieldConfig({ ...field });
        } else {
            setEditingFieldId(null);
            setFieldConfig({ name: '', type: 'text' });
        }
        setShowFieldModal(true);
    };

    const handleSaveField = () => {
        if (!activeCollection || !fieldConfig.name) return;

        if (editingFieldId) {
            manager.updateField(activeCollection.id, editingFieldId, fieldConfig);
        } else {
            manager.addField(activeCollection.id, fieldConfig as Omit<CollectionField, 'id'>);
        }
        setShowFieldModal(false);
    };

    const handleAddItem = () => {
        if (!activeCollection) return;
        manager.addItem(activeCollection.id, {
            name: 'New Item'
        });
    };

    // RLS Helper
    const toggleRLS = () => {
        if (!activeCollection) return;
        const current = activeCollection.policies && activeCollection.policies.length > 0;
        // Batch 2.9: Toggle simply adds/removes a public policy vs default deny?
        // Actually policies list empty = no RLS logic generated in SchemaTranslator unless we force "Enable RLS".
        // Let's assume enabling RLS adds a default "Public" policy.

        // BETTER: We need a Collection property `securityEnabled`? 
        // For now, let's just create a policy list.
        if (current) {
            // Disable = Clear policies
            manager.updateCollection(activeCollection.id, { policies: [] });
        } else {
            // Enable = Add Default "Owner Only" or "Public"? 
            // Let's add Public for now to avoid breaking app immediately
            manager.updateCollection(activeCollection.id, {
                policies: [
                    { name: 'public_read', action: 'SELECT', definition: 'true' },
                    { name: 'owner_write', action: 'ALL', definition: 'auth.uid = id' } // Example
                ]
            });
        }
    };

    return (
        <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-[60px] top-[40px] bottom-0 w-[900px] bg-[#0f0f0f] border-r border-white/10 z-40 flex flex-col shadow-2xl"
        >
            {/* Header */}
            <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#111]">
                <div className="flex items-center gap-2 text-white font-medium">
                    <Database size={16} className="text-teal-400" />
                    <span>Data Manager</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
                    <X size={16} className="text-gray-400" />
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Collections List */}
                <div className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col">
                    <div className="p-3">
                        <button
                            onClick={handleCreateCollection}
                            className="w-full py-2 px-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 rounded flex items-center justify-center gap-2 text-sm transition-colors"
                        >
                            <Plus size={14} />
                            New Collection
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="px-2 pb-2 space-y-1">
                            {collections.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-xs">
                                    No collections yet
                                </div>
                            )}
                            {collections.map(col => (
                                <button
                                    key={col.id}
                                    onClick={() => setSelectedCollectionId(col.id)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between group ${selectedCollectionId === col.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    <span className="truncate">{col.name}</span>
                                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-500">
                                        {state.data.items.filter(i => i.collectionId === col.id).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content: Table View */}
                <div className="flex-1 flex flex-col bg-[#111] relative">
                    {!activeCollection ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
                            <Table size={48} className="opacity-20" />
                            <p>Select or create a collection to manage data</p>
                        </div>
                    ) : (
                        <>
                            {/* Toolbar */}
                            <div className="h-12 border-b border-white/10 flex items-center px-4 gap-3 bg-[#161616]">
                                <h3 className="text-sm font-medium text-white mr-2">{activeCollection.name}</h3>
                                <div className="h-4 w-[1px] bg-white/10" />

                                <button
                                    onClick={() => openFieldModal()}
                                    className="px-2 py-1.5 hover:bg-white/5 text-gray-300 hover:text-white rounded text-xs flex items-center gap-1.5 transition-colors"
                                >
                                    <Plus size={14} />
                                    Add Field
                                </button>

                                <button
                                    onClick={() => setShowSecurityModal(true)}
                                    className="px-2 py-1.5 hover:bg-white/5 text-gray-300 hover:text-white rounded text-xs flex items-center gap-1.5 transition-colors ml-auto"
                                >
                                    <Shield size={14} className={activeCollection.policies?.length ? "text-green-400" : "text-gray-500"} />
                                    Security & RLS
                                </button>

                                <button
                                    onClick={handleAddItem}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/20"
                                >
                                    <Plus size={14} />
                                    New Item
                                </button>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-[#0a0a0a]">
                                            {activeCollection.fields.map(field => (
                                                <th key={field.id} className="px-4 py-2 text-xs font-medium text-gray-400 border-r border-white/5 min-w-[150px] group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {field.type === 'text' && <Type size={12} />}
                                                            {field.type === 'image' && <ImageIcon size={12} />}
                                                            {field.type === 'reference' && <LinkIcon size={12} className="text-purple-400" />}
                                                            {field.name}
                                                        </div>
                                                        <button
                                                            onClick={() => openFieldModal(field)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
                                                        >
                                                            <Edit2 size={10} />
                                                        </button>
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="px-4 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                {activeCollection.fields.map(field => (
                                                    <td key={field.id} className="px-4 py-2 border-r border-white/5">
                                                        <input
                                                            type="text"
                                                            value={item.values[field.id] || ''}
                                                            onChange={(e) => manager.updateItem(item.id, { [field.id]: e.target.value })}
                                                            className="w-full bg-transparent border-none outline-none text-sm text-gray-300 placeholder-gray-700 focus:bg-white/5 px-1 rounded"
                                                            placeholder="—"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-2 text-center">
                                                    <button
                                                        onClick={() => manager.deleteItem(item.id)}
                                                        className="p-1 hover:text-red-400 text-gray-600 transition-colors"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {items.length === 0 && (
                                            <tr>
                                                <td colSpan={activeCollection.fields.length + 1} className="py-8 text-center text-gray-600 text-xs">
                                                    No items found. Click "New Item" to add one.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Field Config Modal */}
                    <AnimatePresence>
                        {showFieldModal && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="w-[400px] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                                >
                                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                        <h3 className="text-white font-medium">{editingFieldId ? 'Edit Field' : 'New Field'}</h3>
                                        <button onClick={() => setShowFieldModal(false)}><X size={16} className="text-gray-400" /></button>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Field Name</label>
                                            <input
                                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-teal-500/50 outline-none"
                                                value={fieldConfig.name}
                                                onChange={e => setFieldConfig({ ...fieldConfig, name: e.target.value })}
                                                placeholder="e.g. Title, Author..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Type</label>
                                            <select
                                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none"
                                                value={fieldConfig.type}
                                                onChange={e => setFieldConfig({ ...fieldConfig, type: e.target.value as any })}
                                            >
                                                <option value="text">Text</option>
                                                <option value="rich-text">Rich Text</option>
                                                <option value="number">Number</option>
                                                <option value="boolean">Boolean</option>
                                                <option value="date">Date</option>
                                                <option value="reference">Reference (Relation)</option>
                                                <option value="image">Image</option>
                                            </select>
                                        </div>

                                        {/* Relation Settings */}
                                        {fieldConfig.type === 'reference' && (
                                            <div className="p-3 bg-white/5 rounded border border-white/5 space-y-3">
                                                <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Relation Config</h4>
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Target Collection</label>
                                                    <select
                                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none"
                                                        value={fieldConfig.referenceCollectionId || ''}
                                                        onChange={e => setFieldConfig({ ...fieldConfig, referenceCollectionId: e.target.value })}
                                                    >
                                                        <option value="">Select Collection</option>
                                                        {collections.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Cardinality</label>
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 text-xs text-gray-300">
                                                            <input
                                                                type="radio"
                                                                name="relType"
                                                                value="one-to-many"
                                                                checked={!fieldConfig.relationType || fieldConfig.relationType === 'one-to-many'}
                                                                onChange={() => setFieldConfig({ ...fieldConfig, relationType: 'one-to-many' })}
                                                            />
                                                            One-to-Many
                                                        </label>
                                                        <label className="flex items-center gap-2 text-xs text-gray-300">
                                                            <input
                                                                type="radio"
                                                                name="relType"
                                                                value="many-to-many"
                                                                checked={fieldConfig.relationType === 'many-to-many'}
                                                                onChange={() => setFieldConfig({ ...fieldConfig, relationType: 'many-to-many' })}
                                                            />
                                                            Many-to-Many
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-white/10 flex justify-end gap-2">
                                        <button onClick={() => setShowFieldModal(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
                                        <button onClick={handleSaveField} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-medium">Save Field</button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Security Modal */}
                    <AnimatePresence>
                        {showSecurityModal && activeCollection && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="w-[500px] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                                >
                                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-red-900/20 to-transparent">
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-red-400" />
                                            <h3 className="text-white font-medium">Security Policies (RLS)</h3>
                                        </div>
                                        <button onClick={() => setShowSecurityModal(false)}><X size={16} className="text-gray-400" /></button>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-sm font-medium text-white">Row Level Security</h4>
                                                <p className="text-xs text-gray-500 mt-1">If enabled, no one can Access data unless a Policy allows it.</p>
                                            </div>
                                            <button
                                                onClick={toggleRLS}
                                                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${activeCollection.policies && activeCollection.policies.length > 0
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {activeCollection.policies && activeCollection.policies.length > 0 ? 'Enabled' : 'Disabled (Public)'}
                                            </button>
                                        </div>

                                        {activeCollection.policies && activeCollection.policies.length > 0 && (
                                            <div className="space-y-3">
                                                <h5 className="text-xs font-semibold text-gray-400 uppercase">Active Policies</h5>
                                                {activeCollection.policies.map((policy, idx) => (
                                                    <div key={idx} className="bg-black/40 border border-white/10 rounded p-3 flex justify-between items-center">
                                                        <div>
                                                            <div className="text-sm text-white font-mono">{policy.name}</div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                <span className="text-yellow-500">{policy.action}</span> USING <span className="text-blue-400">{policy.definition}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <p className="text-[10px] text-gray-600 italic text-center mt-4">
                                                    Note: Advanced policy editing coming in Pro version.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};
