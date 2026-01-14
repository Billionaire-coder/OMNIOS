import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { syncService, SyncStatus } from '@/lib/data/sync/SyncService';

export function SyncIndicator() {
    const [status, setStatus] = useState<SyncStatus>('offline');

    useEffect(() => {
        const unsubscribe = syncService.subscribe(setStatus);
        return () => unsubscribe();
    }, []);

    if (status === 'online') {
        return (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded select-none" title="All changes saved">
                <Cloud size={14} className="text-emerald-500" />
                <span>Saved</span>
            </div>
        );
    }

    if (status === 'syncing') {
        return (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 select-none">
                <RefreshCw size={14} className="animate-spin" />
                <span>Syncing...</span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 select-none">
                <AlertCircle size={14} />
                <span>Sync Error</span>
            </div>
        );
    }

    // Offline
    return (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-2 py-1 rounded" title="Working Offline">
            <CloudOff size={14} />
            <span>Offline</span>
        </div>
    );
}
