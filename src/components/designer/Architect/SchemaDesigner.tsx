
import React, { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    Node,
    Edge,
    Connection,
    addEdge,
    Panel,
    BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjectStore } from '@/hooks/useProjectStore';
import { TableNode } from './TableNode';
import { Plus, Database, Sparkles, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collection, CollectionField } from '@/types/designer';

const nodeTypes: any = {
    table: TableNode,
};

export const SchemaDesigner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, updateCollection, addCollection, removeCollection } = useProjectStore();
    const collections = state.data.collections || [];

    // Map Collections to Nodes
    const nodes = useMemo(() => {
        return collections.map((col, idx) => ({
            id: col.id,
            type: 'table',
            position: { x: 100 + (idx * 300) % 900, y: 100 + Math.floor(idx / 3) * 400 },
            data: {
                name: col.name,
                fields: col.fields,
                onAddFields: () => {
                    const newField: CollectionField = {
                        id: `fld-${Math.random().toString(36).substr(2, 9)}`,
                        name: 'new_column',
                        type: 'text'
                    };
                    updateCollection(col.id, { fields: [...col.fields, newField] });
                },
                onDeleteField: (fieldId: string) => {
                    updateCollection(col.id, {
                        fields: col.fields.filter(f => f.id !== fieldId)
                    });
                },
                onDeleteTable: () => removeCollection(col.id),
                isMultiTenant: col.isMultiTenant,
                onToggleMultiTenant: (enabled: boolean) => {
                    updateCollection(col.id, { isMultiTenant: enabled });
                }
            },
        }));
    }, [collections, updateCollection, removeCollection]);

    // Map Relations to Edges
    const edges = useMemo(() => {
        const result: Edge[] = [];
        collections.forEach(col => {
            col.fields.forEach(field => {
                if (field.type === 'reference' && field.referenceCollectionId) {
                    result.push({
                        id: `e-${col.id}-${field.id}-${field.referenceCollectionId}`,
                        source: field.referenceCollectionId,
                        target: col.id,
                        targetHandle: `${field.id}-target`,
                        label: 'FK',
                        animated: true,
                        style: { stroke: '#10b981', strokeWidth: 2 }
                    });
                }
            });
        });
        return result;
    }, [collections]);

    const onConnect = useCallback((params: Connection) => {
        const sourceId = params.source;
        const targetId = params.target;
        const targetHandle = params.targetHandle; // fieldId-target

        if (!sourceId || !targetId || !targetHandle) return;

        const fieldId = targetHandle.replace('-target', '');

        // Update the field in the target collection to be a reference to source
        const targetCol = collections.find(c => c.id === targetId);
        if (!targetCol) return;

        const updatedFields = targetCol.fields.map(f =>
            f.id === fieldId
                ? { ...f, type: 'reference', referenceCollectionId: sourceId }
                : f
        );

        updateCollection(targetId, { fields: updatedFields });
    }, [collections, updateCollection]);

    const handleCreateDefaultTable = () => {
        const id = `col-${Date.now()}`;
        addCollection({
            id,
            name: 'NewTable',
            slug: 'new_table',
            type: 'relational',
            fields: [
                { id: `fld-${Math.random().toString(36).substr(2, 9)}`, name: 'title', type: 'text' }
            ]
        });
    };

    return (
        <div className="fixed inset-0 bg-[#050505]/90 backdrop-blur-xl z-[60] flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Toolbar Header */}
            <div className="h-16 border-b border-white/5 bg-black/40 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                        <Database className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            Schema Designer
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono tracking-tighter">BETA</span>
                        </h1>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">Architect // Visual Modeling Environment</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/40 hover:text-white"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> RE-SYNC DB
                    </Button>
                    <div className="w-[1px] h-6 bg-white/5" />
                    <Button
                        onClick={handleCreateDefaultTable}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 gap-2 h-9 px-4 rounded-xl font-bold text-xs"
                    >
                        <Plus className="w-4 h-4" /> ADD TABLE
                    </Button>
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

            {/* Canvas Area */}
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onConnect={onConnect}
                    fitView
                    className="bg-[#050505]"
                    colorMode="dark"
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={24}
                        size={1}
                        color="rgba(255,255,255,0.05)"
                    />
                    <Controls className="!bg-black/60 !border-white/10 !rounded-xl overflow-hidden" />

                    <Panel position="bottom-right" className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl m-6 max-w-[280px]">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold text-white italic underline underline-offset-4 decoration-amber-500/30">Intelligence Note</span>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                                Direct table connections automatically generate **Foreign Key Constraints** in the underlying PostgreSQL engine.
                            </p>
                            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                                <div className="flex items-center justify-between text-[9px] uppercase font-bold text-white/10">
                                    <span>Engine Status</span>
                                    <span className="text-emerald-500">Synced</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-full h-full bg-emerald-500/40" />
                                </div>
                            </div>
                        </div>
                    </Panel>
                </ReactFlow>
            </div>
        </div>
    );
};
