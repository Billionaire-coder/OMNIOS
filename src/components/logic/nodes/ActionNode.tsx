import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { PlayCircle } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const ActionNode = memo(({ data, selected }: NodeProps) => {
    return (
        <BaseNode
            data={{ ...(data as any), icon: PlayCircle }}
            selected={selected}
            headerColor="var(--accent-secondary)"
        >
            {/* Input Handle */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <Handle
                    type="target"
                    position={Position.Left}
                    style={{
                        background: 'var(--accent-primary)', // Matches Event Output
                        width: '10px', height: '10px'
                    }}
                />
                <span style={{ fontSize: '0.7rem', color: '#888', marginLeft: '8px' }}>Trigger</span>
            </div>

            <div>
                System Action
            </div>
        </BaseNode>
    );
});

ActionNode.displayName = 'ActionNode';
