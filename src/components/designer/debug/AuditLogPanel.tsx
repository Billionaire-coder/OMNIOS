"use client";

import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { ClipboardList, User, Calendar, Tag, ChevronRight } from 'lucide-react';

export const AuditLogPanel = () => {
    const { state } = useProjectStore();
    const logs = state.debugLogs.filter(l => l.type === 'audit');

    return (
        <div style={{ padding: '20px', borderTop: '1px solid #333', marginTop: '20px' }}>
            <h3 style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={12} /> Audit Log
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {logs.length === 0 && (
                    <div style={{ color: '#444', fontSize: '0.75rem', textAlign: 'center', padding: '10px' }}>
                        No changes recorded in this session.
                    </div>
                )}
                {logs.map(log => (
                    <div key={log.id} style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '4px 0'
                    }}>
                        <div style={{ marginTop: '3px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)' }}></div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#eee', fontWeight: '500' }}>{log.message}</span>
                                <span style={{ fontSize: '0.6rem', color: '#444' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            {log.elementId && (
                                <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Tag size={10} /> {log.elementId}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button style={{
                marginTop: '15px',
                width: '100%',
                padding: '8px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#888',
                fontSize: '0.7rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}>
                View Full Audit History <ChevronRight size={12} />
            </button>
        </div>
    );
};
