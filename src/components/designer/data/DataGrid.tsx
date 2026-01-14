import React from 'react';
import { Collection, CollectionItem } from '@/types/designer';
import { useProjectStore } from '@/hooks/useProjectStore';
import { X, Calendar, Image as ImageIcon, Type, Link, Hash, AlignLeft, Sparkles, Loader2, Plus } from 'lucide-react';
import { aiBridgeSource } from '@/lib/ai/aiBridge';

interface DataGridProps {
    collection: Collection;
}

export const DataGrid: React.FC<DataGridProps> = ({ collection }) => {
    const { state, addItem, updateItem, deleteItem, addField } = useProjectStore(); // Added addField
    const [isAddingField, setIsAddingField] = React.useState(false);
    const [newFieldName, setNewFieldName] = React.useState('');
    const [newFieldType, setNewFieldType] = React.useState('text');
    const [targetCollectionId, setTargetCollectionId] = React.useState('');

    const [isGenerating, setIsGenerating] = React.useState(false);
    const items = state.data.items.filter(item => item.collectionId === collection.id);

    // Simple ID generator for new items
    const handleAddItem = () => {
        addItem(collection.id, {});
    };

    const handleUpdate = (itemId: string, fieldId: string, value: any) => {
        updateItem(itemId, { [fieldId]: value });
    };

    const handleMagicFill = async () => {
        setIsGenerating(true);
        try {
            const newItems = await aiBridgeSource.generateItems(collection.name, collection.fields);
            newItems.forEach(values => {
                addItem(collection.id, values);
            });
        } catch (err) {
            console.error("Magic Fill failed", err);
            setIsGenerating(false);
        }
    };
    const handleAddField = () => {
        if (!newFieldName) return;

        // Custom logic for reference type
        if (newFieldType === 'reference' && !targetCollectionId) {
            alert("Please select a target collection for the reference.");
            return;
        }

        // --- BATCH 5.1: RELATIONAL CMS ---
        // Pass the extra metadata (referenceCollectionId, required) to the store.
        // Even if the store signature was just updated, we pass it now.
        // We'll trust the store implementation we just wrote.

        addField(collection.id, {
            name: newFieldName,
            type: newFieldType,
            referenceCollectionId: newFieldType === 'reference' ? targetCollectionId : undefined,
            required: false // Default to false for now, UI can be expanded later
        });

        setIsAddingField(false);
        setNewFieldName('');
        setTargetCollectionId('');
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'text': return <Type size={14} />;
            case 'rich-text': return <AlignLeft size={14} />;
            case 'image': return <ImageIcon size={14} />;
            case 'date': return <Calendar size={14} />;
            case 'url': return <Link size={14} />;
            case 'number': return <Hash size={14} />;
            case 'reference': return <Link size={14} className="text-blue-400" />;
            default: return <Type size={14} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#09090b] text-white">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                    <h2 className="text-xl font-bold font-serif">{collection.name}</h2>
                    <p className="text-xs text-white/50">{items.length} Items</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleMagicFill}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold rounded-md transition-all border border-blue-500/30"
                    >
                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Magic Fill
                    </button>
                    <button
                        onClick={handleAddItem}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-md transition-colors"
                    >
                        + New Item
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-[#121214] sticky top-0 z-10">
                        <tr>
                            <th className="p-2 border-b border-r border-white/10 w-12 text-center text-white/30 font-mono">#</th>
                            {collection.fields.map(field => (
                                <th key={field.id} className="p-2 border-b border-r border-white/10 min-w-[150px] font-normal text-white/70">
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-50">{getIconForType(field.type)}</span>
                                        {field.name}
                                    </div>
                                </th>
                            ))}
                            <th className="p-2 border-b border-white/10 w-10">
                                <button
                                    onClick={() => setIsAddingField(true)}
                                    className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white"
                                    title="Add Field"
                                >
                                    <Plus size={14} />
                                </button>
                            </th>
                        </tr>
                        {isAddingField && (
                            <tr className="bg-blue-600/10 border-b border-blue-500/20">
                                <td className="p-2 border-r border-white/10 text-center text-white/30">
                                    <Sparkles size={12} />
                                </td>
                                {collection.fields.map(f => <td key={f.id} className="p-2 border-r border-white/10"></td>)}
                                <td className="p-2 min-w-[200px] flex items-center gap-2">
                                    <input
                                        autoFocus
                                        className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs text-white w-24"
                                        placeholder="Field Name"
                                        value={newFieldName}
                                        onChange={e => setNewFieldName(e.target.value)}
                                    />
                                    <select
                                        className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs text-white w-24"
                                        value={newFieldType}
                                        onChange={e => setNewFieldType(e.target.value)}
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="image">Image</option>
                                        <option value="reference">Reference</option>
                                    </select>
                                    {newFieldType === 'reference' && (
                                        <select
                                            className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs text-white w-24"
                                            value={targetCollectionId}
                                            onChange={e => setTargetCollectionId(e.target.value)}
                                        >
                                            <option value="">Target...</option>
                                            {state.data.collections.filter(c => c.id !== collection.id).map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    )}
                                    <button onClick={handleAddField} className="p-1 bg-blue-600 rounded text-white"><Plus size={12} /></button>
                                    <button onClick={() => setIsAddingField(false)} className="p-1 hover:bg-white/10 rounded text-white/50"><X size={12} /></button>
                                </td>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                                <td className="p-2 border-b border-r border-white/10 text-center text-white/30 font-mono text-xs">
                                    {index + 1}
                                </td>
                                {collection.fields.map(field => (
                                    <td key={field.id} className="p-0 border-b border-r border-white/10">
                                        {field.type === 'reference' ? (
                                            <select
                                                className="w-full h-full bg-transparent p-2 outline-none text-blue-400 focus:bg-blue-500/10 transition-colors appearance-none"
                                                value={item.values[field.id] || ''}
                                                onChange={(e) => handleUpdate(item.id, field.id, e.target.value)}
                                            >
                                                <option value="" className="bg-gray-900 text-gray-500">Select Item...</option>
                                                {state.data.items
                                                    .filter(i => i.collectionId === field.referenceCollectionId)
                                                    .map(refItem => (
                                                        <option key={refItem.id} value={refItem.id} className="bg-gray-900 text-white">
                                                            {/* Try to find a good display label: First non-id string field or fallback to ID */}
                                                            {Object.values(refItem.values).find(v => typeof v === 'string') || refItem.id}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type === 'number' ? 'number' : 'text'}
                                                className="w-full h-full bg-transparent p-2 outline-none text-white/90 placeholder-white/20 focus:bg-blue-500/10 transition-colors"
                                                value={item.values[field.id] || ''}
                                                placeholder="..."
                                                onChange={(e) => handleUpdate(item.id, field.id, e.target.value)}
                                            />
                                        )}
                                    </td>
                                ))}
                                <td className="p-2 border-b border-white/10 text-center">
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={collection.fields.length + 2} className="p-8 text-center text-white/30">
                                    No items in this collection. Click "New Item" to start.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
