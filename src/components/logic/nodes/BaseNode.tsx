import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LucideIcon } from 'lucide-react';

interface BaseNodeProps {
    data: {
        label: string;
        icon?: LucideIcon;
    };
    selected?: boolean;
    headerColor?: string;
    children?: React.ReactNode;
}

export const BaseNode = memo(({ data, selected, headerColor = 'var(--accent-primary)', children }: BaseNodeProps) => {
    return (
        <div
            className="glass"
            style={{
                minWidth: '200px',
                borderRadius: '8px',
                overflow: 'hidden',
                borderColor: selected ? headerColor : 'var(--glass-border)',
                boxShadow: selected ? `0 0 10px ${headerColor}40` : 'var(--glass-shadow)',
                transition: 'all 0.2s ease',
                backgroundColor: 'rgba(10, 10, 10, 0.8)'
            }}
        >
            {/* Header */}
            <div style={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: `1px solid ${selected ? headerColor : 'rgba(255,255,255,0.1)'}`,
                background: `linear-gradient(to right, ${headerColor}20, transparent)`
            }}>
                {data.icon && <data.icon size={16} color={headerColor} />}
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{data.label}</span>
            </div>

            {/* Body */}
            <div style={{ padding: '12px', color: '#ccc', fontSize: '0.8rem' }}>
                {children}
            </div>
        </div>
    );
});

BaseNode.displayName = 'BaseNode';
