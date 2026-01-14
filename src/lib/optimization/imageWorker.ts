// imageWorker.ts - Background SIMD Image Processor
import { hyperBridge } from "../engine/HyperBridge";

self.onmessage = async (e: MessageEvent) => {
    const { id, data, width, height } = e.data;

    try {
        // Initialize bridge if needed (it might need to download WASM again in the worker context)
        await hyperBridge.init();

        const optimized = await hyperBridge.optimizeImage(new Uint8Array(data), width, height);

        if (optimized) {
            // Transfer back as ArrayBuffer for zero-copy
            self.postMessage({ id, optimized: optimized.buffer }, { transfer: [optimized.buffer] } as any);
        } else {
            self.postMessage({ id, error: "Optimization failed" });
        }
    } catch (err: any) {
        self.postMessage({ id, error: err.message });
    }
};
