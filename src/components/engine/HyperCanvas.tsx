"use client";
import React, { useEffect, useRef, useState } from 'react';
import { InspectorOverlay } from '../designer/InspectorOverlay';
import { ProjectState } from '@/types/designer';
import { hyperBridge } from '@/lib/engine/HyperBridge';

// Define the type for the WASM module
type WasmModule = typeof import('../../omnios-engine/pkg/omnios_engine');

export const HyperCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [engine, setEngine] = useState<WasmModule | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [benchmarkResult, setBenchmarkResult] = useState<string | null>(null);

    useEffect(() => {
        const initEngine = async () => {
            if (!canvasRef.current) return;
            try {
                // Dynamically import the WASM module
                // @ts-ignore - The package will exist after build
                const wasm = await import('../../omnios-engine/pkg/omnios_engine');

                // Initialize the WASM module
                if (typeof wasm.default === 'function') {
                    await (wasm.default as any)();
                } else {
                    console.warn("WASM default export is not a function", wasm);
                }

                setEngine(wasm);

                // Initialize the engine with the canvas ID
                wasm.start_engine(canvasRef.current.id);
                console.log("[HyperCanvas] Engine initialized successfully");
            } catch (err: any) {
                console.error("[HyperCanvas] Failed to load WASM engine:", err);
                setError(err.message || "Failed to load engine");
            }
        };

        initEngine();
    }, []);

    const runBenchmark = () => {
        if (!engine || !canvasRef.current) return;
        try {
            const result = engine.run_benchmark(canvasRef.current.id, 5000);
            setBenchmarkResult(result);
        } catch (e: any) {
            console.error("Benchmark failed:", e);
            setBenchmarkResult("Error: " + e.message);
        }
    };

    if (error) {
        return <div className="p-4 text-red-500 bg-red-50 rounded">Engine Error: {error}</div>;
    }

    return (
        <div className="relative w-full h-full">
            <canvas
                id="omnios-hyper-canvas"
                ref={canvasRef}
                className="w-full h-full block bg-black"
                width={1200}
                height={800}
                style={{ width: '100%', height: '100%' }}
                // Batch 14.5: Telemetry Interception
                onMouseMove={(e) => hyperBridge.logInteraction('move', { x: e.clientX, y: e.clientY })}
                onClick={(e) => hyperBridge.logInteraction('click', { x: e.clientX, y: e.clientY })}
            />
            {/* Batch 12.2: Universal Inspector HUD */}
            <InspectorOverlay />

            <div className="absolute top-4 left-4 flex flex-col gap-4">
                <div className="p-4 bg-black/80 backdrop-blur border border-white/10 rounded-lg text-white max-w-sm">
                    <h3 className="font-bold text-accent-teal mb-2">Hyper-Engine Status</h3>
                    <div className="flex items-center gap-2 text-xs mb-4">
                        <div className={`w-2 h-2 rounded-full ${engine ? 'bg-green-500' : 'bg-red-500'}`} />
                        {engine ? 'WASM Module Loaded' : 'Initializing...'}
                    </div>

                    <button
                        onClick={runBenchmark}
                        className="w-full py-2 px-4 bg-accent-teal text-black font-bold rounded hover:bg-accent-teal/90 transition-colors"
                        disabled={!engine}
                    >
                        Run Taffy Benchmark (5k Nodes)
                    </button>

                    {benchmarkResult && (
                        <div className="mt-4 p-3 bg-white/5 rounded border border-white/10 text-xs font-mono">
                            {benchmarkResult}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
