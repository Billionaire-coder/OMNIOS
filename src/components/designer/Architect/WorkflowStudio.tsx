
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Panel,
    BackgroundVariant,
    Handle,
    Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    Activity,
    Plus,
    Trash2,
    Play,
    Zap,
    Database,
    Mail,
    MessageSquare,
    Clock,
    GitBranch,
    Save,
    Settings,
    X,
    ChevronRight,
    Search,
    Braces,
    Package
} from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';

// --- CUSTOM NODES ---

const WorkflowBaseNode = ({ data, selected, headerColor, children, isTrigger }: any) => (
    <div className={`group relative min-w-[240px] bg-[#0a0a0a]/90 backdrop-blur-xl border-2 rounded-2xl overflow-hidden transition-all duration-300 ${selected ? 'ring-4 ring-offset-4 ring-offset-black' : 'border-white/5 shadow-2xl hover:border-white/20'}`}
        style={{ borderColor: selected ? headerColor : 'rgba(255,255,255,0.05)', boxShadow: selected ? `0 0 0 4px ${headerColor}40` : undefined }}>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/5" style={{ background: `linear-gradient(to right, ${headerColor}20, transparent)` }}>
            <div className="p-2 rounded-lg bg-black/40 border border-white/10" style={{ color: headerColor }}>
                {data.icon || <Zap className="w-4 h-4" />}
            </div>
            <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white/90">{data.type || 'Action'}</h4>
                <p className="text-[10px] font-bold text-white/30 lowercase tracking-tight">{data.label}</p>
            </div>
        </div>

        {/* Port Handles */}
        {!isTrigger && <Handle type="target" position={Position.Left} className="w-3 h-3 border-2 border-black !bg-white/40 ring-4 ring-black" />}
        <Handle type="source" position={Position.Right} className="w-3 h-3 border-2 border-black !bg-white/40 ring-4 ring-black" />

        {/* Content */}
        <div className="p-4 bg-white/[0.02]">
            {children}
            <div className="mt-4 flex items-center justify-between text-[8px] font-black text-white/20 uppercase tracking-tighter">
                <span>OMNIOS // WORKFLOW</span>
                <span className="group-hover:text-white/40 transition-colors">v1.2.0</span>
            </div>
        </div>
    </div>
);

const TriggerNode = (props: any) => (
    <WorkflowBaseNode {...props} headerColor="#FF2D55" isTrigger>
        <div className="text-[10px] font-medium text-white/50 leading-relaxed italic">
            This flow starts when {props.data.description || 'a signal is received'}.
        </div>
    </WorkflowBaseNode>
);

const ActionNode = (props: any) => (
    <WorkflowBaseNode {...props} headerColor="#00E0FF">
        <div className="flex flex-col gap-2">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] font-mono text-teal-400/80">
                {props.data.configSummary || 'No config set'}
            </div>
        </div>
    </WorkflowBaseNode>
);

const ConditionNode = (props: any) => (
    <WorkflowBaseNode {...props} headerColor="#FFD60A">
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[9px] font-black text-white/40 uppercase">
                <span>IF TRUE</span>
                <Handle type="source" position={Position.Right} id="true" className="!top-1/3 !right-0 !bg-yellow-400" />
            </div>
            <div className="flex items-center justify-between text-[9px] font-black text-white/40 uppercase mt-2">
                <span>IF FALSE</span>
                <Handle type="source" position={Position.Right} id="false" className="!top-2/3 !right-0 !bg-rose-400" />
            </div>
        </div>
    </WorkflowBaseNode>
);

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    condition: ConditionNode
};

// --- SIDEBAR DATA (BASE) ---
const BASE_NODE_MENU = [
    {
        category: 'Triggers',
        items: [
            { type: 'trigger', subType: 'db_trigger', label: 'DB Event', icon: <Database className="w-4 h-4" />, description: 'When a record is created/updated' },
            { type: 'trigger', subType: 'cron_trigger', label: 'Schedule', icon: <Clock className="w-4 h-4" />, description: 'At a fixed time interval' },
            { type: 'trigger', subType: 'webhook_trigger', label: 'Webhook', icon: <Zap className="w-4 h-4" />, description: 'When an HTTP call is received' },
        ]
    },
    {
        category: 'Integrations',
        items: [
            { type: 'action', subType: 'send_email', label: 'Send Email', icon: <Mail className="w-4 h-4" />, configSummary: 'Resend: Welcome template' },
            { type: 'action', subType: 'openai_completion', label: 'AI Analysis', icon: <Braces className="w-4 h-4" />, configSummary: 'GPT-4: Analyze Sentiment' },
            { type: 'action', subType: 'stripe_charge', label: 'Stripe Payment', icon: <MessageSquare className="w-4 h-4" />, configSummary: 'Create Checkout Session' },
        ]
    },
    {
        category: 'Logic',
        items: [
            { type: 'condition', subType: 'condition', label: 'Condition', icon: <GitBranch className="w-4 h-4" />, configSummary: 'Check if user is pro' },
        ]
    }
];

export const WorkflowStudio: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, updateWorkflow, addWorkflow, removeWorkflow } = useProjectStore();
    const [selectedWfId, setSelectedWfId] = useState<string | null>(Object.keys(state.workflows || {})[0] || null);

    const nodeMenu = useMemo(() => {
        const menu = [...BASE_NODE_MENU];
        if (state.installedPlugins?.length > 0) {
            menu.push({
                category: 'Installed Plugins',
                items: state.installedPlugins.map((p: any) => ({
                    type: 'action',
                    subType: `plugin_${p.id}`,
                    label: p.name,
                    icon: <Package className="w-4 h-4 text-rose-400" />,
                    description: p.description || 'Custom NPM Logic',
                    isPlugin: true,
                    plugin: p
                }))
            });
        }
        return menu;
    }, [state.installedPlugins]);


    // Safety check for workflow state
    const currentWf = state.workflows?.[selectedWfId || ''];

    // Convert Record to Array for React Flow
    const initialNodes = useMemo(() => {
        if (!currentWf) return [];
        return Object.values(currentWf.nodes || {}).map(n => ({
            ...n,
            selected: false,
            // Map types to Workflow specific ones if needed or keep raw
            type: n.type.includes('trigger') ? 'trigger' : (n.type === 'condition' ? 'condition' : 'action')
        }));
    }, [currentWf?.id]);

    const initialEdges = useMemo(() => {
        if (!currentWf) return [];
        return currentWf.connections.map(c => ({
            id: c.id,
            source: c.fromId,
            target: c.toId,
            sourceHandle: c.port,
            animated: true,
            style: { strokeWidth: 2, stroke: 'rgba(255,255,255,0.2)' }
        }));
    }, [currentWf?.id]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as any);

    // Sync state updates
    useEffect(() => {
        if (!selectedWfId) return;
        const blueprintNodes: Record<string, any> = {};
        nodes.forEach(n => {
            blueprintNodes[n.id] = { ...n };
        });
        const blueprintEdges = edges.map(e => ({
            id: e.id,
            fromId: e.source,
            toId: e.target,
            port: e.sourceHandle
        }));
        updateWorkflow(selectedWfId, { nodes: blueprintNodes, connections: blueprintEdges as any });
    }, [nodes, edges]);

    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => addEdge({
            ...params,
            animated: true,
            style: { strokeWidth: 2, stroke: 'rgba(255,255,255,0.4)' }
        }, eds));
    }, [setEdges]);

    const handleAddNode = (item: any) => {
        const id = uuidv4();
        const newNode = {
            id,
            type: item.type,
            position: { x: 400 + Math.random() * 50, y: 300 + Math.random() * 50 },
            data: {
                label: item.label,
                type: item.isPlugin ? 'PLUGIN' : item.subType.replace('_', ' ').toUpperCase(),
                icon: item.icon,
                configSummary: item.configSummary,
                description: item.description,
                isPlugin: item.isPlugin,
                plugin: item.plugin
            }
        };
        setNodes(nds => nds.concat(newNode as any));
    };

    const handleCreateWorkflow = () => {
        const id = addWorkflow('New Backend Pipeline');
        setSelectedWfId(id);
    };

    return (
        <div className="fixed inset-0 bg-[#050505] z-[80] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Glass Header */}
            <div className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-3xl flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-rose-500/20 rounded-xl border border-rose-500/30">
                        <Activity className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            Workflow Studio
                            <span className="text-[9px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30 font-black tracking-widest uppercase">Server-Side</span>
                        </h1>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">The Pipeline Engine // Phase 11.2</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleCreateWorkflow}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest px-6 h-10 rounded-xl shadow-xl shadow-rose-600/20"
                    >
                        NEW PIPELINE
                    </Button>
                    <div className="w-[1px] h-6 bg-white/10 mx-2" />
                    <Button onClick={onClose} variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Flow List */}
                <div className="w-64 border-r border-white/5 bg-[#080808] flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-white/2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                            <input
                                placeholder="Search Flows..."
                                className="w-full bg-black/40 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[11px] text-white/80 focus:outline-none focus:border-rose-500/30 transition-all font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                        {Object.values(state.workflows || {}).map(wf => (
                            <button
                                key={wf.id}
                                onClick={() => setSelectedWfId(wf.id)}
                                className={`w-full group relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${selectedWfId === wf.id
                                    ? 'bg-rose-500/10 border border-rose-500/20 text-white ring-1 ring-rose-500/40'
                                    : 'border border-transparent text-white/40 hover:bg-white/5 hover:text-white/60'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Activity className={`w-3.5 h-3.5 ${selectedWfId === wf.id ? 'text-rose-400' : 'text-white/10'}`} />
                                    <span className="text-[11px] font-bold tracking-tight">{wf.name}</span>
                                </div>
                                {selectedWfId === wf.id && <ChevronRight className="w-3.5 h-3.5 text-rose-400" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Workflow Canvas */}
                <div className="flex-1 relative bg-black">
                    {selectedWfId ? (
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                            colorMode="dark"
                            fitView
                        >
                            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#333" />
                            <Controls style={{ backgroundColor: '#111', border: '1px solid #333', color: 'white' }} />
                            <MiniMap style={{ backgroundColor: '#111', border: '1px solid #333' }} nodeColor={(n) => n.type === 'trigger' ? '#FF2D55' : '#00E0FF'} />

                            {/* Floating Node Picker */}
                            <Panel position="top-right" className="mr-4 mt-20">
                                <div className="w-72 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                                    <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Logic Arsenal</h3>
                                        <Zap className="w-3 h-3 text-rose-400" />
                                    </div>
                                    <div className="p-2 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                                        {nodeMenu.map(cat => (
                                            <div key={cat.category}>
                                                <h4 className="px-3 py-2 text-[9px] font-black text-white/20 uppercase tracking-widest">{cat.category}</h4>
                                                <div className="space-y-1">
                                                    {cat.items.map((item: any) => (
                                                        <button
                                                            key={item.subType}
                                                            onClick={() => handleAddNode(item)}
                                                            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all text-white/50 hover:text-white border border-transparent hover:border-white/5 group"
                                                        >
                                                            <div className={`p-2 rounded-lg bg-black group-hover:bg-rose-500/20 transition-colors ${cat.category === 'Triggers' ? 'text-rose-400' : (cat.category === 'Logic' ? 'text-yellow-400' : (cat.category === 'Installed Plugins' ? 'text-rose-400' : 'text-teal-400'))}`}>
                                                                {item.icon}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-[11px] font-bold">{item.label}</p>
                                                                <p className="text-[8px] text-white/20 font-medium group-hover:text-white/40 transition-colors uppercase tracking-widest leading-relaxed">
                                                                    {item.description || 'Action Node'}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Panel>

                            {/* Stats Panel */}
                            <Panel position="bottom-center" className="mb-4">
                                <div className="flex items-center gap-6 px-6 py-2.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-white/30 tracking-widest">NODES:</span>
                                        <span className="text-[10px] font-mono text-rose-400 font-bold">{nodes.length}</span>
                                    </div>
                                    <div className="w-[1px] h-3 bg-white/10" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-white/30 tracking-widest">EDGES:</span>
                                        <span className="text-[10px] font-mono text-teal-400 font-bold">{edges.length}</span>
                                    </div>
                                    <div className="w-[1px] h-3 bg-white/10" />
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                                        <span className="text-[8px] font-black text-emerald-400/80 tracking-widest">ENGINE READY</span>
                                    </div>
                                </div>
                            </Panel>
                        </ReactFlow>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/5 animate-pulse">
                            <Zap className="w-24 h-24 mb-6" />
                            <h2 className="text-sm font-black uppercase tracking-[0.4em]">Awaiting Selection</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
