import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { BaseNode } from './BaseNode';

export const EventNode = memo(({ data, selected }: NodeProps) => {
    return (
        <BaseNode
            data={{ ...(data as any), icon: Zap }}
            selected={selected}
            headerColor="var(--accent-primary)"
        >
            <div style={{ marginBottom: '8px' }}>
                Event Trigger
            </div>

            {/* Output Handle */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', marginRight: '8px' }}>Connect</span>
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{
                        background: 'var(--accent-primary)',
                        width: '10px', height: '10px'
                    }}
                />
            </div>
        </BaseNode>
    );
});

EventNode.displayName = 'EventNode';
