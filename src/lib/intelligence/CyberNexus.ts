// CyberNexus.ts
import { hyperBridge } from "../engine/HyperBridge";

class CyberNexus {
    private lastPulse: number = Date.now();
    private heartbeatInterval: any = null;
    private stateSnapshots: string[] = [];
    private MAX_SNAPSHOTS = 5;

    private stateProvider: (() => any) | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.startMonitoring();
        }
    }

    public registerProvider(provider: () => any) {
        this.stateProvider = provider;
        console.log("[Cyber-Nexus] State provider registered.");
    }

    private startMonitoring() {
        console.log("[Cyber-Nexus] Autonomous monitoring engaged.");

        this.heartbeatInterval = setInterval(() => {
            const now = Date.now();
            // 3 seconds threshold for stall
            if (now - this.lastPulse > 3000) {
                this.handleStallDetected();
            }
            this.lastPulse = now;
        }, 1000);

        // Periodically take snapshots for healing
        setInterval(() => this.takeSnapshot(), 10000); // 10s for snappier recovery
    }

    private takeSnapshot() {
        if (!this.stateProvider) return;
        const state = this.stateProvider();
        if (state) {
            this.stateSnapshots.push(JSON.stringify(state));
            if (this.stateSnapshots.length > this.MAX_SNAPSHOTS) {
                this.stateSnapshots.shift();
            }
            // console.log("[Cyber-Nexus] State snapshot secured.");
        }
    }

    private handleStallDetected() {
        console.warn("[Cyber-Nexus] CRITICAL: Engine stall detected. Initiating autonomous recovery...");

        if (this.stateSnapshots.length > 0) {
            const lastGoodState = this.stateSnapshots[this.stateSnapshots.length - 1];
            hyperBridge.syncState(lastGoodState);
            console.log("[Cyber-Nexus] RECOVERY: Reverted to last known good state.");

            // Trigger emergency visual feedback
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,0,0,0.1);z-index:9999;pointer-events:none;border:4px solid red;transition:opacity 2s;';
            document.body.appendChild(overlay);
            setTimeout(() => overlay.style.opacity = '0', 500);
            setTimeout(() => document.body.removeChild(overlay), 2500);
        }
    }

    /**
     * Public API to pulse the watchdog.
     */
    public pulse() {
        this.lastPulse = Date.now();
    }
}

export const cyberNexus = new CyberNexus();
