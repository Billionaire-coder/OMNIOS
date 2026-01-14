import { PGlite } from '@electric-sql/pglite';

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';

export class SyncService {
    private db: PGlite | null = null;
    private status: SyncStatus = 'offline';
    private syncInterval: NodeJS.Timeout | null = null;
    private listeners: ((status: SyncStatus) => void)[] = [];

    constructor() {
        // Singleton pattern could be used, or instantiated in Context
    }

    public attach(db: PGlite) {
        this.db = db;
        this.setStatus('online');
        this.start();
    }

    public subscribe(listener: (status: SyncStatus) => void) {
        this.listeners.push(listener);
        listener(this.status); // Initial emit
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private setStatus(status: SyncStatus) {
        this.status = status;
        this.listeners.forEach(l => l(status));
    }

    public start() {
        if (this.syncInterval) return;
        this.syncInterval = setInterval(() => this.sync(), 5000); // 5s poll
    }

    public stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        this.setStatus('offline');
    }

    public setOnlineStatus(online: boolean) {
        this.setStatus(online ? 'online' : 'offline');
    }

    private async sync() {
        if (!this.db || this.status === 'offline') return;

        try {
            this.setStatus('syncing');
            await this.push();
            await this.pull();
            this.setStatus('online');
        } catch (e) {
            console.error("Sync Cycle Failed", e);
            this.setStatus('error');
        }
    }

    private async push() {
        if (!this.db) return;

        // 1. Get unsynced ops
        const res = await this.db.query(`SELECT * FROM _oplog WHERE synced = FALSE ORDER BY timestamp ASC LIMIT 50`);
        const ops = res.rows;

        if (ops.length === 0) return;

        console.log(`Pushing ${ops.length} changes...`);

        // 2. Mock Network Call (Replace with real API)
        await new Promise(r => setTimeout(r, 800));

        // 3. Mark as synced
        const ids = ops.map((op: any) => `'${op.id}'`).join(',');
        await this.db.query(`UPDATE _oplog SET synced = TRUE WHERE id IN(${ids})`);

        console.log("Push Complete");
    }

    private async pull() {
        // Mock Pull
    }
}

export const syncService = new SyncService();
