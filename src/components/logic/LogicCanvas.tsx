import React, { useCallback, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { EventNode } from './nodes/EventNode';
import { ActionNode } from './nodes/ActionNode';

const nodeTypes = {
    event: EventNode,
    action: ActionNode,
};

const defaultNodes = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'On Click' }, type: 'event' },
    { id: '2', position: { x: 500, y: 100 }, data: { label: 'Navigate to /home' }, type: 'action' },
];
const defaultEdges = [{ id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'var(--accent-primary)' } }];

import { useProjectStore } from '@/hooks/useProjectStore';

export function LogicCanvas() {
    const { state, setLogicGraph } = useProjectStore();

    // Initialize from Store (Logic Persistence)
    const initialNodes = state.logicNodes && state.logicNodes.length > 0 ? state.logicNodes : defaultNodes;
    const initialEdges = state.logicEdges && state.logicEdges.length > 0 ? state.logicEdges : defaultEdges;

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Sync back to store whenever graph changes
    useEffect(() => {
        setLogicGraph(nodes, edges);
    }, [nodes, edges, setLogicGraph]);

    const selectedId = state.selectedElementId;
    const selectedElement = selectedId ? state.elements[selectedId] : null;

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--accent-primary)' } }, eds)),
        [setEdges],
    );

    const handleCreateLogic = () => {
        if (!selectedElement) return;
        const newNode = {
            id: `event-${selectedId}`,
            position: { x: 250, y: 250 },
            data: { label: `On Click: ${selectedElement.name || selectedElement.type}`, elementId: selectedId },
            type: 'event',
            selected: true
        };
        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                colorMode="dark"
                fitView
            >
                <Controls style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }} />
                <MiniMap style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }} nodeColor={() => '#00E0FF'} />
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333" />
            </ReactFlow>

            {/* Context Aware Action Button */}
            {selectedElement && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        padding: '8px 16px',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid var(--accent-primary)',
                        borderRadius: '20px',
                        color: 'white',
                        fontSize: '0.8rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        Context: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{selectedElement.name || selectedElement.type}</span>
                    </div>

                    {!nodes.find(n => n.data.elementId === selectedId) && (
                        <button
                            onClick={handleCreateLogic}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--accent-primary)',
                                color: 'black',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                boxShadow: '0 0 15px rgba(0, 224, 255, 0.3)'
                            }}
                        >
                            + Add Click Event
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
