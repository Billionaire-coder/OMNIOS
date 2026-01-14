import { ProjectState } from '../../types/designer';
import path from 'path';
import fs from 'fs';

// Dynamically import the WASM module
// In a real Edge Function, this might need specific handling (e.g., .wasm file placement)
// For Node.js (Next.js API Routes), we can import the pkg directly if built for nodejs

let wasmModule: any;

export async function loadRuntime() {
    if (wasmModule) return wasmModule;

    try {
        // We assume the wasm-pack output is at src/omnios-engine/onmios_engine/pkg
        // or copied to a standard location.
        // For this batch, let's try importing from the local build path.
        // Note: Dynamic import might fail if the path isn't analyzed by Webpack/Next.js properly.

        // Strategy: Use the generated JS file.
        // We need to ensure 'src/omnios-engine/pkg' exists and has 'omnios_engine.js'

        // This path is relative to the project root for verification, but at runtime??
        // In Next.js server context, it's tricky.

        // Hack for MVP: Require it (Node.js style)
        // We might need to adjust based on where the build puts it.
        const runtimePath = path.join(process.cwd(), 'src/omnios-engine/pkg/omnios_engine.js');

        if (fs.existsSync(runtimePath)) {
            // Use native require if available (in Node)
            wasmModule = require(runtimePath);
            return wasmModule;
        } else {
            console.error("WASM Runtime not found at", runtimePath);
            throw new Error("WASM Runtime not found");
        }

    } catch (e) {
        console.error("Failed to load OMNIOS Runtime:", e);
        throw e;
    }
}

export interface ExecutionResult {
    status: 'success' | 'error';
    output: any;
    logs: string[];
    performance: number;
}

export async function executeFlow(blueprintId: string, input: any): Promise<ExecutionResult> {
    const runtime = await loadRuntime();

    // We need to allow the runtime to access the Global State.
    // In strict purity, we pass the State in.
    // But our Rust `execute_headless_flow` takes `blueprint_id` and `input`.
    // It assumes `PROJECT_STATE` is populated.
    // This is a problem for stateless server functions unless we hydrate it first.

    // For Batch 7.1/7.2 MVP, we will assume "Singleton State" model for the active user/editor session.
    // Or we pass the state string.

    // Let's modify `execute_headless_flow` in Rust to take state? 
    // Or we add `hydrate_state(json)` to the API.

    // Assuming state is already synced via `sync_state` (which we call on editor change).
    // But if this is a standalone API call, we might not have state.

    // TODO: Verify if we need to call `sync_state` here.
    // For now, let's assume this runs in the context where we CAN sync it or it's shared.

    try {
        const start = performance.now();
        const jsonResult = runtime.execute_headless_flow(blueprintId, JSON.stringify(input));
        const end = performance.now();

        const parsed = JSON.parse(jsonResult);

        return {
            status: 'success',
            output: parsed,
            logs: [],
            performance: end - start
        };
    } catch (e: any) {
        return {
            status: 'error',
            output: null,
            logs: [e.toString()],
            performance: 0
        };
    }
}
