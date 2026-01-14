'use client';

import React, { useState } from 'react';
import axe from 'axe-core';
import { AlertTriangle, CheckCircle, Play, RotateCw, Eye } from 'lucide-react';

interface A11yPanelProps {
    isSimulatorActive: boolean;
    onToggleSimulator: () => void;
}

export function A11yPanel({ isSimulatorActive, onToggleSimulator }: A11yPanelProps) {
    const [violations, setViolations] = useState<axe.Result[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);

    const runAudit = async () => {
        setIsScanning(true);
        setViolations([]);
        try {
            // Target the canvas explicitly to avoid auditing the editor UI itself
            // or audit 'document' but ignore .editor-ui
            const results = await axe.run('.design-canvas', {
                runOnly: {
                    type: 'tag',
                    values: ['wcag2a', 'wcag2aa']
                }
            });
            setViolations(results.violations);
            setScanComplete(true);
        } catch (error) {
            console.error("Axe Audit Failed:", error);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#111] text-white p-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Accessibility Audit</h2>
                <div className="bg-white/5 rounded-full px-2 py-1 text-xs text-white/50">WCAG 2.1 AA</div>
            </div>

            <div className="mb-6 space-y-3">
                <button
                    onClick={onToggleSimulator}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${isSimulatorActive ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <Eye size={18} />
                        <span className="text-sm font-medium">Screen Reader Simulator</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${isSimulatorActive ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-white/20'}`} />
                </button>

                <button
                    onClick={runAudit}
                    disabled={isScanning}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isScanning ? <RotateCw className="animate-spin" size={18} /> : <Play size={18} />}
                    {isScanning ? "Scanning Canvas..." : "Run Audit"}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
                {scanComplete && violations.length === 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                        <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                        <h3 className="font-bold text-green-500">No Violations Found</h3>
                        <p className="text-sm text-green-500/70 mt-1">Good job! The canvas is accessible.</p>
                    </div>
                )}

                {violations.map((violation, index) => (
                    <div key={index} className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="font-bold text-red-400 text-sm">{violation.help}</h4>
                                <p className="text-xs text-red-400/60 mt-1">{violation.description}</p>
                                <div className="mt-3 space-y-1">
                                    {violation.nodes.map((node, nIndex) => (
                                        <div key={nIndex} className="bg-black/40 rounded px-2 py-1 font-mono text-[10px] text-white/50 truncate">
                                            {node.target.join(' ')}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 text-xs text-white/30 hover:text-white/60 transition-colors">
                                    <a href={violation.helpUrl} target="_blank" rel="noopener noreferrer">Learn how to fix →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
