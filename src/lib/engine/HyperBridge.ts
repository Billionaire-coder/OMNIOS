import { HyperCommand } from "@/types/designer";
import { spatialEngine } from './SpatialEngine';
import { physicsWorld } from './PhysicsWorld';

/**
 * HyperBridge manages the connection between OMNIOS TypeScript state 
 * and the high-performance Rust WASM engine.
 */
class HyperBridge {
    private wasm: any = null;
    private initialized: boolean = false;
    private lastSync: number = 0;
    private throttleMs: number = 100;
    private listeners: Set<() => void> = new Set();
    private animationFrameId: number | null = null;
    private lastFrameTime: number = 0;
    private onFrameCallback: (() => void) | null = null; // Legacy support
    private physicsBuffer: Float32Array = new Float32Array(0);
    private commandQueue: HyperCommand[] = [];

    // Batch 14.5: Telemetry
    private telemetryBuffer: { velocity: number, hoverDuration: number, clicked: boolean }[] = [];
    private lastCursorPos: { x: number, y: number } | null = null;
    private lastHoverStart: number = 0;
    private currentHoverId: string | null = null;

    private bridgeHandlers: Record<string, (payload: any) => void> = {};

    // Batch 15.2: Native Detection
    public isNative(): boolean {
        return typeof window !== 'undefined' && (window as any).__TAURI_METADATA__ !== undefined;
    }

    /**
     * Lazy-loads the OMNIOS Rust WASM module.
     */

    // ... imports

    async init() {
        if (this.initialized) return;
        try {
            // Parallel init of Physics and WASM (if exists)
            await Promise.all([
                (async () => {
                    try {
                        // @ts-ignore
                        this.wasm = await import('@/omnios-engine/pkg/omnios_engine');
                        await this.wasm.default();
                    } catch (e) { console.warn("WASM missing, running in Hybrid Mode"); }
                })(),
                physicsWorld.init()
            ]);

            this.initialized = true;
            this.loadWeights();
            console.log("Hyper-Engine (Hybrid) initialized.");

            // Drain command queue
            if (this.commandQueue.length > 0) {
                this.commandQueue.forEach(cmd => this.commit(cmd));
                this.commandQueue = [];
            }
            this.startLoop();
        } catch (error) {
            console.error("Hyper-Engine init failed:", error);
        }
    }

    /**
     * Synchronizes a single element (Hybrid: JS Spatial + WASM)
     */
    async syncElement(element: any) {
        if (!this.initialized) await this.init();

        // 1. Update Spatial Index (Blocking, Fast)
        // Ensure x, y, width, height are numbers
        const styles = element.styles || {};
        const x = parseFloat(styles.left || '0');
        const y = parseFloat(styles.top || '0');
        const w = parseFloat(styles.width || '100');
        const h = parseFloat(styles.height || '100');

        if (!isNaN(x) && !isNaN(y)) {
            spatialEngine.updateElement(element.id, x, y, w, h);

            // 2. Update Physics Body
            physicsWorld.addBody({
                id: element.id,
                x, y, width: w, height: h,
                isStatic: true // Default to static for layout elements unless "Physics Mode" on
            });
        }

        // 3. Sync to WASM if available
        if (this.wasm) {
            try { this.wasm.sync_element(element); } catch (e) { }
        }
    }

    /**
     * Synchronizes the project state to the Rust engine.
     */
    async syncState(state: any) {
        if (!this.initialized) await this.init();
        if (!this.wasm) return;

        const now = Date.now();
        if (now - this.lastSync < this.throttleMs) return;
        this.lastSync = now;

        try {
            const payload = {
                name: state.name || "Untitled Project",
                elements: state.elements,
                blueprints: state.blueprints,
                globalVariables: state.globalVariables,
                activePageId: state.activePageId,
                viewMode: state.viewMode,
            };
            this.wasm.sync_state(payload);
        } catch (error) { }
    }

    public commit(command: HyperCommand) {
        if (!this.initialized || !this.wasm) {
            this.commandQueue.push(command);
            return;
        }
        try {
            this.wasm.apply_command(JSON.stringify(command));
        } catch (e) { }
    }

    public getStateDeltas(): any[] {
        if (!this.initialized || !this.wasm) return [];
        try {
            return JSON.parse(this.wasm.get_state_deltas());
        } catch (e) { return []; }
    }

    public fireTrigger(blueprintId: string, triggerType: string, payload: any = {}) {
        if (!this.initialized || !this.wasm) return;
        try {
            this.wasm.fire_trigger(blueprintId, triggerType, JSON.stringify(payload));
        } catch (e) { }
    }

    public registerHandler(type: string, handler: (payload: any) => void) {
        this.bridgeHandlers[type] = handler;
    }

    subscribe(cb: () => void) {
        this.listeners.add(cb);
        return () => { this.listeners.delete(cb); };
    }

    private startLoop() {
        if (this.animationFrameId) return;
        this.lastFrameTime = performance.now();
        const loop = (now: number) => {
            const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
            this.lastFrameTime = now;

            if (this.initialized && this.wasm) {
                this.wasm.update_animations(dt);
                try {
                    this.physicsBuffer = this.wasm.get_batch_transforms();
                } catch (e) { }
                this.listeners.forEach(cb => cb());
                // Pulse Cyber-Nexus
                import('@/lib/intelligence/CyberNexus').then(m => m.cyberNexus.pulse());
            }
            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
    }

    getPhysicsPosition(id: string) {
        return physicsWorld.getTransform(id);
    }

    async getElementLayout(id: string) {
        return this.getElementLayoutSync(id);
    }

    getElementLayoutSync(id: string) {
        if (!this.initialized || !this.wasm) return null;
        try {
            const result = this.wasm.get_element_layout(id);
            return result ? JSON.parse(result) : null;
        } catch (e) { return null; }
    }

    async draw(canvasId: string, nodeCount: number) {
        if (!this.initialized || !this.wasm) return null;
        return this.wasm.run_benchmark(canvasId, nodeCount);
    }

    emitParticle(x: number, y: number, type: 'snow' | 'fire' | 'smoke' = 'snow') {
        if (!this.initialized || !this.wasm) return;
        this.wasm.emit_particle(x, y, type);
    }

    trigger(event: string): boolean {
        if (!this.initialized || !this.wasm) return false;
        return this.wasm.fire_state_trigger(event);
    }

    setVariable(id: string, value: any) {
        if (!this.initialized || !this.wasm) return;
        this.wasm.set_variable(id, JSON.stringify(value));
    }

    getVariable(id: string): any {
        if (!this.initialized || !this.wasm) return null;
        try {
            return JSON.parse(this.wasm.get_variable(id));
        } catch (e) { return null; }
    }

    hitTest(x: number, y: number): string | undefined {
        const spatialResult = spatialEngine.query(x, y, 1, 1);
        if (spatialResult.length > 0) return spatialResult[0];

        if (!this.initialized || !this.wasm) return undefined;
        try {
            return this.wasm.hit_test(x, y);
        } catch (e) { return undefined; }
    }

    queryArea(x: number, y: number, width: number, height: number): string[] {
        return spatialEngine.query(x, y, width, height);
    }

    constrainDrag(id: string, x: number, y: number): number[] | null {
        if (!this.initialized || !this.wasm) return null;
        try {
            const result = this.wasm.constrain_drag(id, x, y);
            return (result && result.length === 2) ? Array.from(result) : [x, y];
        } catch (e) { return null; }
    }

    getGroupBounds(ids: string[]): { x: number, y: number, width: number, height: number } | null {
        if (!this.initialized || !this.wasm) return null;
        try {
            const resultJson = this.wasm.get_group_bounds(JSON.stringify(ids));
            return JSON.parse(resultJson);
        } catch (e) { return null; }
    }

    /**
     * Batch 25.3: Calculate magnetic snap targets (Delegated to SpatialEngine)
     */
    findSnapTargets(elementId: string, x: number, y: number, width: number, height: number): { x: number, y: number, guides: Array<{ orientation: 'vertical' | 'horizontal', value: number, label: string }> } | null {
        // Use SpatialEngine (RBush) for high performance JS query
        return spatialEngine.findSnapTargets(elementId, x, y, width, height, 8);
    }

    // Batch 14.1: Neural Simulation Sync (Now powered by PhysicsWorld Drop)
    simulateLayout(iterations: number = 100): { score: number, best_config: any } | null {
        if (physicsWorld.initialized) {
            physicsWorld.simulateDrop(iterations);
            // Return dummy score for now, but physics simulation happened
            return { score: 0.99, best_config: {} };
        }
        return null;
    }

    // Batch 12.2: Universal Inspector HUD bounds
    getElementBounds(id: string): { x: number, y: number, width: number, height: number } | null {
        if (!this.wasm) return null;
        try {
            const bounds = this.wasm.get_element_bounds(id);
            if (!bounds || bounds.length !== 4) return null;
            return { x: bounds[0], y: bounds[1], width: bounds[2], height: bounds[3] };
        } catch (e) {
            console.warn("Failed to get element bounds:", e);
            return null;
        }
    }

    // Batch 13.1: Hybrid Asset Healing
    generatePlaceholder(width: number, height: number, colorStart: string, colorEnd: string): string {
        if (!this.wasm) return ''; // Start blank if engine not loaded
        try {
            // Returns raw SVG string
            const svg = this.wasm.generate_healing_placeholder(width, height, colorStart, colorEnd);
            // Convert to Data URI
            return `data:image/svg+xml;base64,${btoa(svg)}`;
        } catch (e) {
            console.error("Failed to generate healing placeholder:", e);
            return '';
        }
    }

    // Batch 21.1: SIMD Image Optimization
    async optimizeImage(data: Uint8Array, width: number, height: number): Promise<Uint8Array | null> {
        if (!this.initialized) await this.init();
        if (!this.wasm) return null;
        try {
            return this.wasm.optimize_asset_image(data, width, height);
        } catch (e) {
            console.error("SIMD Image Optimization Error:", e);
            return null;
        }
    }

    // Batch 13.2: Universal Shortcut Pipeline
    handleKeyEvent(key: string, ctrl: boolean, shift: boolean, alt: boolean, meta: boolean): string | null {
        if (!this.wasm) return null;
        try {
            // Batch 24.4: Returns raw string from Rust (via JsValue) or null
            // No JSON.parse needed if Rust returns string directly
            const action = this.wasm.handle_key_event(key, ctrl, shift, alt, meta);
            return action || null;
        } catch (e) {
            // console.warn("Key event not handled by Rust", e); // Verbose
            return null;
        }
    }

    // Batch 14.1: Neural Simulation Sync

    // Batch 14.2: VQA Parity Lab
    getLayoutDump(): any[] {
        if (!this.wasm) return [];
        try {
            return JSON.parse(this.wasm.get_full_layout_dump());
        } catch (e) {
            return [];
        }
    }

    checkParity(domDump: any[]): { average_drift: number, flagged_elements: string[] } | null {
        if (!this.wasm) return null;
        try {
            const result = this.wasm.compute_parity_score(JSON.stringify(domDump));
            return JSON.parse(result);
        } catch (e) {
            return null;
        }
    }
    // Batch 14.5: Telemetry Stream
    logInteraction(type: 'move' | 'hover' | 'click', data: { x: number, y: number, id?: string }) {
        const now = performance.now();

        if (type === 'move') {
            if (this.lastCursorPos) {
                const dx = data.x - this.lastCursorPos.x;
                const dy = data.y - this.lastCursorPos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                // Velocity in px/ms
                const velocity = dist;

                // Store incomplete session (no click yet)
                this.telemetryBuffer.push({ velocity, hoverDuration: 0, clicked: false });
                if (this.telemetryBuffer.length >= 50) this.trainModel(); // Auto-train every 50 events
            }
            this.lastCursorPos = { x: data.x, y: data.y };
        }
        else if (type === 'hover') {
            if (this.currentHoverId !== data.id) {
                this.currentHoverId = data.id || null;
                this.lastHoverStart = now;
            }
        }
        else if (type === 'click') {
            // A click occurred. Attribute it to the recent velocity/hover.
            // In a real simplified model, we just want to know: "Did high velocity lead to a click?"
            // Update the last few buffer entries to "clicked = true"
            const hoverTime = (now - this.lastHoverStart);

            // Mark last 5 move events as "leading to click"
            for (let i = 1; i <= 5; i++) {
                if (this.telemetryBuffer.length - i >= 0) {
                    this.telemetryBuffer[this.telemetryBuffer.length - i].clicked = true;
                    // Also attach the final hover duration if it was the same element
                    this.telemetryBuffer[this.telemetryBuffer.length - i].hoverDuration = hoverTime;
                }
            }
        }
    }

    getTrainingData(): any[] {
        return [...this.telemetryBuffer];
    }
    // --- NATIVE JS NEURAL ENGINE (FALLBACK) ---
    private neuralWeights = { velocity: 0.0, duration: 0.0, bias: 0.0 }; // Initialized in loadWeights
    private learningRate = 0.01;

    // Batch 14.5.2: In-WASM Training (With JS Fallback)
    async trainModel() {
        if (this.telemetryBuffer.length < 5) return;

        if (this.wasm) {
            // WASM Path
            try {
                const data = JSON.stringify(this.telemetryBuffer);
                const result = this.wasm.train_neural_model(data);
                console.log("[Neural AI WASM]", result);
                const weights = this.wasm.get_neural_weights();
                this.saveWeightsToStorage(weights);
            } catch (e) {
                console.error("WASM Training failed:", e);
            }
        } else {
            // JS Fallback Path (Logistic Regression)
            console.log(`[Neural AI JS] Training on ${this.telemetryBuffer.length} samples...`);

            // Normalize Data
            const samples = this.telemetryBuffer.map(s => ({
                v: s.velocity / 1000, // Normalize px/ms
                t: s.hoverDuration / 5000, // Normalize ms
                y: s.clicked ? 1 : 0
            }));

            // Gradient Descent
            for (let epoch = 0; epoch < 100; epoch++) {
                let dW_v = 0, dW_t = 0, dW_b = 0;

                for (const s of samples) {
                    const z = (s.v * this.neuralWeights.velocity) + (s.t * this.neuralWeights.duration) + this.neuralWeights.bias;
                    const prediction = 1 / (1 + Math.exp(-z)); // Sigmoid
                    const error = prediction - s.y;

                    dW_v += error * s.v;
                    dW_t += error * s.t;
                    dW_b += error;
                }

                // Average gradients
                const m = samples.length;
                this.neuralWeights.velocity -= this.learningRate * (dW_v / m);
                this.neuralWeights.duration -= this.learningRate * (dW_t / m);
                this.neuralWeights.bias -= this.learningRate * (dW_b / m);
            }

            console.log("[Neural AI JS] New Weights:", this.neuralWeights);
            this.saveWeightsToStorage(JSON.stringify(this.neuralWeights));
        }

        // Clear buffer (Online Learning - we don't re-train on old data)
        this.telemetryBuffer = [];
    }

    // Batch 21.2: Neural Interaction Forecasting
    predictInteraction(elementId: string, hoverMs: number, velocity: number): { targetElementId: string, confidence: number, predictedAction: string } | null {
        if (this.wasm) {
            try {
                const resultJson = this.wasm.predict_interaction(elementId, hoverMs, velocity);
                if (resultJson === 'null') return null;
                return JSON.parse(resultJson);
            } catch (e) {
                return null;
            }
        } else {
            // JS Fallback
            // Normalize inputs same as training
            const v = velocity / 1000;
            const t = hoverMs / 5000;

            const z = (v * this.neuralWeights.velocity) + (t * this.neuralWeights.duration) + this.neuralWeights.bias;
            const probability = 1 / (1 + Math.exp(-z));

            // console.debug(`[Neural AI JS] Prediction for ${elementId}: p=${probability.toFixed(2)}`);

            if (probability > 0.6) {
                return {
                    targetElementId: elementId,
                    confidence: probability,
                    predictedAction: 'click'
                };
            }
            return null;
        }
    }

    private async saveWeightsToStorage(weights: string) {
        if (this.isNative()) {
            try {
                // Dynamic import to avoid build errors in browser
                // @ts-ignore
                const { writeTextFile, BaseDirectory } = await import('@tauri-apps/plugin-fs');
                await writeTextFile('omnios_weights.json', weights, { baseDir: BaseDirectory.AppData });
            } catch (fsErr) {
                localStorage.setItem("omnios_neural_weights", weights);
            }
        } else {
            localStorage.setItem("omnios_neural_weights", weights);
        }
    }

    async loadWeights() {
        let weightsStr: string | null = null;

        if (this.isNative()) {
            try {
                // @ts-ignore
                const { readTextFile, BaseDirectory } = await import('@tauri-apps/plugin-fs');
                weightsStr = await readTextFile('omnios_weights.json', { baseDir: BaseDirectory.AppData });
            } catch (fsErr) { }
        }

        if (!weightsStr) {
            weightsStr = localStorage.getItem("omnios_neural_weights");
        }

        if (weightsStr) {
            if (this.wasm) {
                try {
                    this.wasm.load_neural_weights(weightsStr);
                    console.log("[Neural AI] WASM weights loaded.");
                } catch (e) { }
            }

            // Also load into JS Model
            try {
                const w = JSON.parse(weightsStr);
                if (typeof w.velocity === 'number') {
                    this.neuralWeights = w;
                    console.log("[Neural AI] JS weights loaded:", w);
                }
            } catch (e) { }
        } else {
            // Initialize defaults if no saved weights
            this.neuralWeights = { velocity: 0.5, duration: 2.0, bias: -3.0 };
        }
    }

    // Batch 21.3: Direct LLVM Export (Native OS)
    async compileNativeBundle(projectName: string, targetOs: 'windows' | 'macos' | 'linux'): Promise<any | null> {
        if (!this.initialized || !this.wasm) return null;
        try {
            const resultJson = this.wasm.compile_native_bundle(projectName, targetOs);
            return JSON.parse(resultJson);
        } catch (e) {
            console.error("Native Compilation Error:", e);
            return null;
        }
    }

    // Batch 23.1: Autonomous A/B Testing
    async createAutonomousExperiment(id: string, elementId: string, variants: any[]): Promise<void> {
        if (!this.initialized || !this.wasm) return;
        try {
            this.wasm.create_autonomous_experiment(id, elementId, JSON.stringify(variants));
        } catch (e) {
            console.error("Create Autonomous Experiment Error:", e);
        }
    }

    selectAutonomousVariant(experimentId: string): any | null {
        if (!this.initialized || !this.wasm) return null;
        try {
            const res = this.wasm.select_autonomous_variant(experimentId);
            return JSON.parse(res);
        } catch (e) {
            console.error("Select Autonomous Variant Error:", e);
            return null;
        }
    }

    recordExperimentOutcome(experimentId: string, variantId: string, conversion: boolean): void {
        if (!this.initialized || !this.wasm) return;
        try {
            this.wasm.record_experiment_outcome(experimentId, variantId, conversion);
        } catch (e) {
            console.error("Record Experiment Outcome Error:", e);
        }
    }

    mutateArchitecturalBlueprint(snapshot: string, strategy: 'performance' | 'layout'): string | null {
        if (!this.initialized || !this.wasm) return null;
        try {
            return this.wasm.mutate_architectural_blueprint(snapshot, strategy);
        } catch (e) {
            console.error("Mutate Blueprint Error:", e);
            return null;
        }
    }
}

export const hyperBridge = new HyperBridge();
