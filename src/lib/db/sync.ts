import { db } from './database';

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error';

export interface SyncQueueItem {
    id: string;
    table_name: string;
    row_id: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    payload: any;
    created_at: string;
}

class SyncManager {
    private isSyncing = false;
    private status: SyncStatus = 'idle';
    private listeners: ((status: SyncStatus) => void)[] = [];

    // Initialize Sync Queue Table
    public async init() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS sync_queue (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                table_name TEXT NOT NULL,
                row_id TEXT NOT NULL,
                operation TEXT NOT NULL,
                payload JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('SyncManager Initialized.');
        this.processQueue(); // Try to process on init
    }

    // Capture a change (Called by DataLoader or UI)
    public async captureChange(tableName: string, rowId: string, operation: 'INSERT' | 'UPDATE' | 'DELETE', payload: any) {
        await db.query(`
            INSERT INTO sync_queue (table_name, row_id, operation, payload)
            VALUES ($1, $2, $3, $4)
        `, [tableName, rowId, operation, JSON.stringify(payload)]);

        this.notifyChange('idle'); // Just to trigger UI update if needed
        this.processQueue();
    }

    // Process the Queue (Push to Remote)
    private async processQueue() {
        if (this.isSyncing) return;

        // Check if online
        if (!navigator.onLine) {
            this.updateStatus('offline');
            return;
        }

        this.updateStatus('syncing');
        this.isSyncing = true;

        try {
            // Get pending items
            const rows = await db.query<SyncQueueItem>(`SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 10`); // Batch size 10

            if (rows.length === 0) {
                this.isSyncing = false;
                this.updateStatus('idle');
                return;
            }

            console.log(`[Sync] Processing ${rows.length} items...`);

            // SIMULATE NETWORK REQUEST
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In real app: Post to /api/sync
            // await fetch('/api/sync', { method: 'POST', body: JSON.stringify(rows) });

            // Delete processed items
            for (const row of rows) {
                await db.query(`DELETE FROM sync_queue WHERE id = $1`, [row.id]);
            }

            // Recurse if more items might exist
            this.isSyncing = false;
            this.processQueue();

        } catch (e) {
            console.error('[Sync] Error:', e);
            this.updateStatus('error');
            this.isSyncing = false;
        }
    }

    public subscribe(callback: (status: SyncStatus) => void) {
        this.listeners.push(callback);
        callback(this.status);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private updateStatus(newStatus: SyncStatus) {
        if (this.status !== newStatus) {
            this.status = newStatus;
            this.listeners.forEach(l => l(newStatus));
        }
    }

    private notifyChange(status: SyncStatus) {
        this.listeners.forEach(l => l(status));
    }

    // UI Helpers
    public async getPendingCount() {
        const res = await db.query<{ count: number }>(`SELECT COUNT(*) as count FROM sync_queue`);
        return res[0]?.count || 0;
    }
}

export const syncManager = new SyncManager();
