"use client";

import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { DataInspector } from './DataInspector';
import { Terminal, Play, Pause, ArrowRight, X, History as RotateCcw } from 'lucide-react';

export const LogicDebugger = ({ onClose }: { onClose: () => void }) => {
    const { state, setDebuggerMode, stepDebugger, replayEvent } = useProjectStore();

    // Filter debug logs to only show logic events
    const logs = state.debugLogs.filter(l => l.type === 'logic');

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '420px', // Positioned next to the properties panel
            width: '400px',
            height: '500px',
            backgroundColor: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            color: 'white',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #222',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#111'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={14} color="var(--accent-teal)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Logic Debugger</span>

                    {/* Mode Status Indicators */}
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                        <button
                            onClick={() => setDebuggerMode(state.debugger.mode === 'paused' ? 'running' : 'paused')}
                            style={{
                                background: state.debugger.mode === 'paused' ? '#222' : 'var(--accent-teal)',
                                border: '1px solid #333', borderRadius: '4px', padding: '4px', cursor: 'pointer',
                                color: state.debugger.mode === 'paused' ? 'white' : 'black',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title={state.debugger.mode === 'paused' ? "Resume" : "Pause"}
                        >
                            {state.debugger.mode === 'paused' ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
                        </button>

                        <button
                            onClick={stepDebugger}
                            disabled={state.debugger.mode === 'running' || state.debugger.eventQueue.length === 0}
                            style={{
                                background: '#222', border: '1px solid #333', borderRadius: '4px', padding: '4px',
                                cursor: (state.debugger.mode === 'running' || state.debugger.eventQueue.length === 0) ? 'not-allowed' : 'pointer',
                                opacity: (state.debugger.mode === 'running' || state.debugger.eventQueue.length === 0) ? 0.5 : 1,
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Step Over"
                        >
                            <ArrowRight size={12} />
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px' }}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Watch Window (Next Event in Queue) */}
                <section>
                    <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Pending Queue ({state.debugger.eventQueue.length})
                    </div>

                    {state.debugger.eventQueue.length > 0 ? (
                        <div style={{
                            padding: '10px',
                            backgroundColor: 'rgba(255, 165, 0, 0.05)',
                            border: '1px solid rgba(255, 165, 0, 0.2)',
                            borderRadius: '8px',
                        }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--accent-orange)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ArrowRight size={12} />
                                NEXT INSTRUCTION: {state.debugger.eventQueue[0].type}
                            </div>
                            <div style={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                                backgroundColor: '#050505',
                                borderRadius: '4px',
                                padding: '8px',
                                border: '1px solid #222'
                            }}>
                                <DataInspector data={state.debugger.eventQueue[0].payload} expandLevel={1} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '10px', backgroundColor: '#111', borderRadius: '8px', color: '#444', fontSize: '0.7rem', border: '1px dashed #222', textAlign: 'center' }}>
                            Queue empty. All events executed.
                        </div>
                    )}
                </section>

                {/* Execution History (Time Travel) */}
                <section>
                    <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Execution History
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                        {state.debugger.history.length > 0 ? (
                            state.debugger.history.map(evt => (
                                <div
                                    key={evt.id}
                                    onClick={() => replayEvent(evt.id)}
                                    title="Click to Re-queue (Replay)"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '8px', borderRadius: '6px',
                                        backgroundColor: evt.status === 'error' ? 'rgba(255,0,0,0.1)' : '#151515',
                                        border: evt.status === 'error' ? '1px solid rgba(255,0,0,0.3)' : '1px solid #222',
                                        cursor: 'pointer',
                                        fontSize: '0.7rem',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = evt.status === 'error' ? 'rgba(255,0,0,0.1)' : '#151515'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '6px', height: '6px', borderRadius: '50%',
                                            backgroundColor: evt.status === 'error' ? '#ff4757' : '#2ed573',
                                            boxShadow: evt.status === 'error' ? '0 0 5px #ff4757' : 'none'
                                        }} />
                                        <span style={{ color: '#ccc', fontWeight: '500' }}>{evt.type}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#555', fontSize: '0.6rem' }}>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                                        <RotateCcw size={10} color="#444" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '10px', color: '#333', fontSize: '0.7rem' }}>No history recorded yet.</div>
                        )}
                    </div>
                </section>

                {/* Detailed Logs */}
                <section style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        System Logs
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {logs.length > 0 ? (
                            logs.slice().reverse().map(log => (
                                <div key={log.id} style={{
                                    padding: '8px',
                                    backgroundColor: '#080808',
                                    borderLeft: '2px solid var(--accent-teal)',
                                    fontSize: '0.7rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ color: 'var(--accent-teal)' }}>{log.message}</span>
                                        <span style={{ color: '#333' }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                    </div>
                                    {log.payload && (
                                        <div style={{ color: '#555', fontSize: '0.6rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {JSON.stringify(log.payload)}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '10px', color: '#333', fontSize: '0.7rem' }}>Listening for logic events...</div>
                        )}
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div style={{
                padding: '8px 16px',
                borderTop: '1px solid #222',
                backgroundColor: '#080808',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: state.debugger.mode === 'running' ? '#2ed573' : 'orange',
                        boxShadow: state.debugger.mode === 'running' ? '0 0 5px #2ed573' : '0 0 5px orange'
                    }} />
                    {state.debugger.mode}
                </div>
                <div style={{ fontSize: '0.6rem', color: '#333' }}>
                    v1.0.0 Debug Engine
                </div>
            </div>
        </div>
    );
};
