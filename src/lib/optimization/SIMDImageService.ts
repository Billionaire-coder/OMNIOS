// SIMDImageService.ts
import { v4 as uuid } from 'uuid';

class SIMDImageService {
    private worker: Worker | null = null;
    private pendingRequests: Map<string, (result: Uint8Array | null) => void> = new Map();

    constructor() {
        if (typeof window !== 'undefined') {
            this.initWorker();
        }
    }

    private initWorker() {
        try {
            this.worker = new Worker(new URL('./imageWorker.ts', import.meta.url));
            this.worker.onmessage = (e) => {
                const { id, optimized, error } = e.data;
                const callback = this.pendingRequests.get(id);
                if (callback) {
                    if (error) {
                        console.error(`[SIMDImageService] Worker Error for ${id}:`, error);
                        callback(null);
                    } else {
                        callback(new Uint8Array(optimized));
                    }
                    this.pendingRequests.delete(id);
                }
            };
        } catch (err) {
            console.error("[SIMDImageService] Failed to initialize worker:", err);
        }
    }

    /**
     * Optimizes an image using WASM SIMD in a background worker.
     * @param fileData The raw image data as ArrayBuffer
     * @param width Target width
     * @param height Target height
     */
    async optimize(fileData: ArrayBuffer, width: number, height: number): Promise<Uint8Array | null> {
        if (!this.worker) return null;

        const id = uuid();
        return new Promise((resolve) => {
            this.pendingRequests.set(id, resolve);
            // Transfer fileData to worker for zero-copy performance
            this.worker?.postMessage({
                id,
                data: fileData,
                width,
                height
            }, [fileData]);
        });
    }

    /**
     * Helper to process a standard File object.
     */
    async optimizeFile(file: File, width: number, height: number): Promise<Uint8Array | null> {
        const buffer = await file.arrayBuffer();
        return this.optimize(buffer, width, height);
    }
}

export const simdImageService = new SIMDImageService();
