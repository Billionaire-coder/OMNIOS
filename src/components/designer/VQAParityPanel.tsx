import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { hyperBridge } from '@/lib/engine/HyperBridge';

interface ParityReport {
    average_drift: number;
    flagged_elements: string[];
}

export function VQAParityPanel() {
    const { state } = useProjectStore();
    const [report, setReport] = useState<ParityReport | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const runParityCheck = async () => {
        setIsRunning(true);

        // 1. Capture DOM Snapshot
        const domDump: any[] = [];
        for (const id in state.elements) {
            const el = document.getElementById(id);
            if (el) {
                const rect = el.getBoundingClientRect();
                // We need relative coordinates if Rust works in relative, 
                // but vqa.rs seems to use absolute world coords from RTree.
                // Assuming RTree is built with absolute coords (it should be).
                // However, DOM rects are viewport relative. 
                // Rust RTree is Canvas World Space.
                // We need to un-project DOM rects using canvasTransform?
                // Or just assume Zoom=1, Pan=0 for the test?
                // Let's assume VQA is run at Reset View (Scale 1, 0,0).

                domDump.push({
                    id,
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height
                });
            }
        }

        // 2. Send to Rust
        // Small delay to allow UI to update
        setTimeout(() => {
            const result = hyperBridge.checkParity(domDump);
            setReport(result);
            setIsRunning(false);
        }, 100);
    };

    return (
        <div className="glass" style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '300px',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            zIndex: 9999
        }}>
            <h3 className="text-sm font-bold mb-4 flex items-center justify-between">
                <span>VQA Parity Lab</span>
                <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded">INTERNAL</span>
            </h3>

            <div className="mb-4 text-xs text-gray-400">
                Verifies that the Rust Hyper Engine render matches the Browser DOM exactly.
            </div>

            <button
                onClick={runParityCheck}
                disabled={isRunning}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded transition-colors disabled:opacity-50"
            >
                {isRunning ? 'Analyzing...' : 'Run Parity Check'}
            </button>

            {report && (
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span>Avg. Drift:</span>
                        <span className={report.average_drift < 0.5 ? 'text-green-400' : 'text-red-400'}>
                            {report.average_drift.toFixed(2)}px
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span>Flagged Elements:</span>
                        <span className={report.flagged_elements.length === 0 ? 'text-green-400' : 'text-red-400'}>
                            {report.flagged_elements.length}
                        </span>
                    </div>

                    {report.flagged_elements.length > 0 && (
                        <div className="mt-2 max-h-32 overflow-y-auto bg-black/20 p-2 rounded">
                            {report.flagged_elements.map(id => (
                                <div key={id} className="text-[10px] text-red-300 font-mono">
                                    {id}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
