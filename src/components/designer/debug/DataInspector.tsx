import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy } from 'lucide-react';

interface DataInspectorProps {
    data: any;
    label?: string;
    expandLevel?: number;
}

export const DataInspector: React.FC<DataInspectorProps> = ({ data, label, expandLevel = 1 }) => {
    const [isExpanded, setIsExpanded] = useState(expandLevel > 0);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const getType = (value: any) => {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    };

    const renderValue = (value: any) => {
        const type = getType(value);

        switch (type) {
            case 'string':
                return <span style={{ color: '#ce9178' }}>"{value}"</span>;
            case 'number':
                return <span style={{ color: '#b5cea8' }}>{value}</span>;
            case 'boolean':
                return <span style={{ color: '#569cd6' }}>{value ? 'true' : 'false'}</span>;
            case 'null':
                return <span style={{ color: '#569cd6' }}>null</span>;
            case 'object':
            case 'array':
                return <DataInspector data={value} expandLevel={expandLevel - 1} />;
            default:
                return String(value);
        }
    };

    const type = getType(data);
    const isObject = type === 'object' || type === 'array';
    const isEmpty = isObject && Object.keys(data).length === 0;

    if (!isObject) {
        return (
            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', display: 'flex', gap: '4px' }}>
                {label && <span style={{ color: '#9cdcfe' }}>{label}:</span>}
                {renderValue(data)}
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            <div
                onClick={!isEmpty ? toggleExpand : undefined}
                style={{
                    display: 'flex', alignItems: 'center', gap: '4px', cursor: !isEmpty ? 'pointer' : 'default',
                    color: '#e0e0e0'
                }}
            >
                {!isEmpty && (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
                {label && <span style={{ color: '#9cdcfe' }}>{label}:</span>}
                <span style={{ color: '#888' }}>
                    {type === 'array' ? `Array(${data.length})` : 'Object'}
                    {!isExpanded && !isEmpty && ' {...}'}
                    {isEmpty && (type === 'array' ? ' []' : ' {}')}
                </span>
            </div>

            {isExpanded && !isEmpty && (
                <div style={{ paddingLeft: '16px', borderLeft: '1px solid #333', marginLeft: '6px' }}>
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key} style={{ marginTop: '2px' }}>
                            <DataInspector
                                data={value}
                                label={key}
                                expandLevel={expandLevel - 1}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
