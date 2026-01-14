
import React from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Table, Key, Hash, Type, ToggleLeft, Calendar, Database, Trash2, Plus, X } from 'lucide-react';
import { CollectionField } from '@/types/designer';

const FieldIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'number': return <Hash size={10} className="text-blue-400" />;
        case 'boolean': return <ToggleLeft size={10} className="text-amber-400" />;
        case 'date': return <Calendar size={10} className="text-purple-400" />;
        case 'reference': return <Key size={10} className="text-emerald-400" />;
        default: return <Type size={10} className="text-gray-400" />;
    }
};

type TableNodeData = {
    name: string;
    fields: CollectionField[];
    onAddFields: () => void;
    onDeleteField: (id: string) => void;
    onDeleteTable: () => void;
    isMultiTenant?: boolean;
    onToggleMultiTenant: (enabled: boolean) => void;
};

export const TableNode = ({ data }: NodeProps<Node<TableNodeData>>) => {
    const { name, fields, onAddFields, onDeleteField, onDeleteTable } = data;

    return (
        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[200px] group">
            {/* Table Header */}
            <div className="bg-white/5 p-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                        <Table size={14} className="text-indigo-400" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => data.onToggleMultiTenant(!data.isMultiTenant)}
                        className={`p-1 rounded transition-colors ${data.isMultiTenant ? 'bg-amber-500/20 text-amber-400' : 'text-white/20 hover:text-white/40'}`}
                        title={data.isMultiTenant ? 'Multi-tenant: ON' : 'Multi-tenant: OFF'}
                    >
                        <ToggleLeft size={14} className={data.isMultiTenant ? 'rotate-180' : ''} />
                    </button>
                    <button
                        onClick={() => onDeleteTable()}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/20 rounded text-rose-400 transition-all"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Fields List */}
            <div className="p-2 space-y-1">
                {/* Standard ID Field */}
                <div className="flex items-center justify-between px-2 py-1 bg-white/5 rounded border border-white/5 opacity-50">
                    <div className="flex items-center gap-2">
                        <Key size={10} className="text-emerald-400" />
                        <span className="text-[10px] font-mono text-gray-400">id</span>
                    </div>
                    <span className="text-[8px] font-bold text-white/20 uppercase letter-spacing-widest">UUID PK</span>
                </div>

                {fields.map((field: CollectionField) => (
                    <div key={field.id} className="relative flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded group/field">
                        <div className="flex items-center gap-2">
                            <FieldIcon type={field.type} />
                            <span className="text-[10px] font-mono text-gray-200">{field.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {field.type === 'reference' && (
                                <Handle
                                    type="target"
                                    position={Position.Left}
                                    id={`${field.id}-target`}
                                    className="!bg-emerald-500 !w-2 !h-2 !border-none !-left-2"
                                />
                            )}
                            <span className="text-[8px] text-white/20 uppercase font-bold">{field.type}</span>
                            <button
                                onClick={() => onDeleteField(field.id)}
                                className="opacity-0 group-hover/field:opacity-100 p-0.5 hover:text-rose-400"
                            >
                                <X size={10} />
                            </button>
                        </div>

                        {/* Connection points for relations */}
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={`${field.id}-source`}
                            className="!bg-indigo-500/40 !w-1.5 !h-1.5 !border-none opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </div>
                ))}

                <button
                    onClick={() => onAddFields()}
                    className="w-full mt-2 py-1.5 border border-dashed border-white/10 rounded-lg text-[9px] font-bold text-white/20 hover:text-indigo-400 hover:border-indigo-400/50 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-1.5"
                >
                    <Plus size={10} /> ADD FIELD
                </button>
            </div>

            {/* Standard Timestamps */}
            <div className="px-3 py-2 border-t border-white/5 bg-black/20 flex flex-col gap-1 opacity-30">
                <div className="flex items-center gap-2 text-white/60">
                    <Calendar size={10} />
                    <span className="text-[9px] font-mono whitespace-nowrap">created_at</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                    <Calendar size={10} />
                    <span className="text-[9px] font-mono whitespace-nowrap">updated_at</span>
                </div>
                {data.isMultiTenant && (
                    <div className="flex items-center gap-2 text-amber-400/60 font-bold border-t border-white/5 pt-1 mt-1">
                        <Key size={10} />
                        <span className="text-[9px] font-mono whitespace-nowrap uppercase">tenant_id</span>
                    </div>
                )}
            </div>
        </div>
    );
};
