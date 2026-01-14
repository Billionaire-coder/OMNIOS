import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { useDB as usePGlite } from '@/lib/data/pglite/PGliteContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Table as TableIcon, Trash2, X, Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collection, CollectionField } from '@/types/designer';

interface SchemaEditorProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SchemaEditor({ isOpen, onClose }: SchemaEditorProps) {
    const { state, addCollection, removeCollection } = useProjectStore();
    const { db, executeQuery } = usePGlite();

    // UI State
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState<'collections' | 'physical'>('collections');

    // Physical DB State for Verification
    const [physicalTables, setPhysicalTables] = useState<string[]>([]);
    const [lastSync, setLastSync] = useState<number>(Date.now());

    // New Collection Form State
    const [colName, setColName] = useState('');
    const [fields, setFields] = useState<Partial<CollectionField>[]>([
        { name: 'title', type: 'text', required: true }
    ]);

    useEffect(() => {
        if (isOpen) refreshPhysicalTables();
    }, [isOpen, lastSync]);

    const refreshPhysicalTables = async () => {
        try {
            const res = await executeQuery(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name NOT IN ('_migrations')
            `);
            setPhysicalTables(res.rows.map((r: any) => r.table_name));
        } catch (e) {
            console.error("Failed to fetch physical tables", e);
        }
    };

    const handleCreateCollection = () => {
        if (!colName) return;

        const slug = colName.toLowerCase().replace(/[^a-z0-9]/g, '_');

        const newCollection: Collection = {
            id: `col-${Date.now()}`,
            name: colName,
            slug,
            type: 'flat',
            fields: [
                // Always auto-generated in SchemaTranslator for ID, created_at
                // But let's verify if user wants to add custom fields
                ...fields.map(f => ({
                    id: `fld-${Math.random().toString(36).substr(2, 9)}`,
                    name: f.name || 'untitled',
                    type: f.type || 'text',
                    required: f.required,
                    unique: f.unique,
                    referenceCollectionId: f.referenceCollectionId,
                    relationType: f.relationType
                } as CollectionField))
            ]
        };

        addCollection(newCollection);

        // Reset Form
        setColName('');
        setFields([{ name: 'title', type: 'text', required: true }]);
        setIsCreating(false);

        // Trigger verification shortly after
        setTimeout(() => setLastSync(Date.now()), 1000);
    };

    const addFieldRow = () => {
        setFields([...fields, { name: '', type: 'text', required: false }]);
    };

    const updateFieldRow = (index: number, key: keyof CollectionField, value: any) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
    };

    const removeFieldRow = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleDeleteCollection = (id: string) => {
        if (confirm('Are you sure? This will remove the definition from OMNIOS. Data in DB may persist until migration logic handles drops.')) {
            removeCollection(id);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-[60px] top-[40px] bottom-0 w-[500px] bg-[#0f0f0f] border-r border-white/10 z-50 flex flex-col shadow-2xl"
        >
            {/* Header */}
            <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#111]">
                <div className="flex items-center gap-2 text-white font-medium">
                    <Database size={16} className="text-teal-400" />
                    <span>Schema Engine</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
                    <X size={16} className="text-gray-400" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab('collections')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'collections' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Logical Collections
                </button>
                <button
                    onClick={() => setActiveTab('physical')}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'physical' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Physical Tables (DB)
                </button>
            </div>

            <div className="p-4 bg-background text-foreground h-full flex flex-col gap-4 overflow-y-auto">

                {activeTab === 'collections' && (
                    <>
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Defined Collections</h2>
                            <Button onClick={() => setIsCreating(true)} size="sm" variant="outline" className="h-7 text-xs border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                                <Plus size={14} className="mr-1" /> New
                            </Button>
                        </div>

                        {/* Creation Form */}
                        <AnimatePresence>
                            {isCreating && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border border-emerald-500/30 bg-emerald-950/20 p-4 rounded-lg flex flex-col gap-3 overflow-hidden"
                                >
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-emerald-400/80">Collection Name</label>
                                        <Input
                                            value={colName}
                                            onChange={e => setColName(e.target.value)}
                                            placeholder="e.g. Products"
                                            className="bg-black/40 border-emerald-500/20 h-8 text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 mt-2">
                                        <label className="text-xs text-emerald-400/80">Fields</label>
                                        {fields.map((f, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    value={f.name}
                                                    onChange={e => updateFieldRow(i, 'name', e.target.value)}
                                                    placeholder="field_name"
                                                    className="flex-1 bg-black/40 border-emerald-500/20 h-7 text-xs"
                                                />
                                                <select
                                                    value={f.type}
                                                    onChange={e => updateFieldRow(i, 'type', e.target.value)}
                                                    className="bg-black/40 border border-emerald-500/20 rounded px-2 h-7 text-xs text-gray-300"
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="number">Number</option>
                                                    <option value="boolean">Boolean</option>
                                                    <option value="date">Date</option>
                                                    <option value="image">Image</option>
                                                    <option value="reference">Reference</option>
                                                </select>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:bg-red-500/10" onClick={() => removeFieldRow(i)}>
                                                    <X size={12} />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button size="sm" variant="ghost" onClick={addFieldRow} className="self-start h-6 text-xs text-emerald-400/70">
                                            + Add Field
                                        </Button>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                                        <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)} className="h-7">Cancel</Button>
                                        <Button size="sm" onClick={handleCreateCollection} className="h-7 bg-emerald-600 hover:bg-emerald-500">Create</Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Collection List */}
                        <div className="flex flex-col gap-2">
                            {state.data.collections.length === 0 ? (
                                <div className="text-center py-8 text-gray-600 text-sm border border-dashed border-white/10 rounded-lg">
                                    No collections defined.<br />Start by creating one above.
                                </div>
                            ) : (
                                state.data.collections.map(col => {
                                    const physicalExists = physicalTables.includes(col.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'));

                                    return (
                                        <div key={col.id} className="p-3 bg-white/5 rounded border border-white/10 flex flex-col gap-2 group hover:border-white/20 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-white">{col.name}</span>
                                                    {physicalExists ? (
                                                        <span title="Synced to DB"><CheckCircle size={12} className="text-emerald-500" /></span>
                                                    ) : (
                                                        <span title="Not yet synced"><AlertCircle size={12} className="text-amber-500" /></span>
                                                    )}
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300" onClick={() => handleDeleteCollection(col.id)}>
                                                    <Trash2 size={12} />
                                                </Button>
                                            </div>
                                            <div className="text-xs text-gray-500 flex flex-wrap gap-1">
                                                {col.fields.map(f => (
                                                    <span key={f.id} className="bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                                                        {f.name}: <span className="text-gray-400">{f.type}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'physical' && (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase">PGlite Database Tables</h3>
                            <Button size="icon" variant="ghost" onClick={refreshPhysicalTables} className="h-6 w-6">
                                <RefreshCw size={12} />
                            </Button>
                        </div>
                        {physicalTables.map(t => (
                            <div key={t} className="p-2 border border-white/10 rounded bg-black/20 text-sm font-mono text-emerald-400/80">
                                {t}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

