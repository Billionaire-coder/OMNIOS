export type BuildStatus = 'idle' | 'queued' | 'building' | 'finished' | 'failed';

interface BuildInfo {
    id: string;
    platform: 'ios' | 'android';
    status: BuildStatus;
    progress: number;
    downloadUrl?: string;
    error?: string;
}

export class BuildOrchestrator {
    private static activeBuilds: Map<string, BuildInfo> = new Map();

    /**
     * Simulation of triggering a cloud build (EAS or Capacitor)
     */
    static async startBuild(platform: 'ios' | 'android', onStatusUpdate: (build: BuildInfo) => void): Promise<string> {
        const buildId = Math.random().toString(36).substr(2, 9);
        const build: BuildInfo = {
            id: buildId,
            platform,
            status: 'queued',
            progress: 0
        };

        this.activeBuilds.set(buildId, build);
        onStatusUpdate(build);

        // Simulate Build Lifecycle
        this.runSimulation(buildId, onStatusUpdate);

        return buildId;
    }

    private static async runSimulation(id: string, onUpdate: (build: BuildInfo) => void) {
        const build = this.activeBuilds.get(id);
        if (!build) return;

        // 1. Queued -> Building
        await new Promise(r => setTimeout(r, 2000));
        build.status = 'building';
        onUpdate({ ...build });

        // 2. Progressing
        for (let i = 10; i <= 90; i += 20) {
            await new Promise(r => setTimeout(r, 3000));
            build.progress = i;
            onUpdate({ ...build });
        }

        // 3. Finished
        await new Promise(r => setTimeout(r, 2000));
        build.status = 'finished';
        build.progress = 100;
        build.downloadUrl = `https://build.omnios.dev/exports/${id}.${build.platform === 'ios' ? 'ipa' : 'apk'}`;
        onUpdate({ ...build });
    }

    static getBuildStatus(id: string): BuildInfo | undefined {
        return this.activeBuilds.get(id);
    }
}
