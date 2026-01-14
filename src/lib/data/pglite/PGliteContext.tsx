"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PGlite } from '@electric-sql/pglite';
import { getDB } from './client';
import { SchemaMigrator } from '../orm/SchemaMigrator';
import { useProjectStore } from '@/hooks/useProjectStore';
import { syncService } from '@/lib/data/sync/SyncService';
import { SYNC_SCHEMA_SQL } from '@/lib/data/sync/schema';
import { authService } from '@/lib/auth/AuthService';
import { secretService } from '@/lib/secrets/SecretService';

interface PGliteContextType {
    db: PGlite | null;
    isLoading: boolean;
    error: Error | null;
    executeQuery: (query: string, params?: any[]) => Promise<any>;
}

const PGliteContext = createContext<PGliteContextType | undefined>(undefined);

export function PGliteProvider({ children }: { children: React.ReactNode }) {
    const [db, setDb] = useState<PGlite | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { state } = useProjectStore();

    useEffect(() => {
        const initDB = async () => {
            try {
                const database = await getDB();
                setDb(database);

                // Batch 8.3: Initialize Sync Infrastructure (Oplog & Triggers)
                await database.exec(SYNC_SCHEMA_SQL);
                syncService.attach(database);

                // Batch 13.1: Initialize Auth Service
                authService.attach(database);
                await authService.init();

                // Batch 13.2: Initialize Secret Service
                secretService.attach(database);
                await secretService.init();

                // Batch 8.2: Check Schema Migration on boot
                // We pass the current collection definitions to ensure DB matches design
                if (state.data?.collections) {
                    await SchemaMigrator.migrate(database, state.data.collections);
                }

            } catch (err: any) {
                console.error("Failed to initialize PGlite:", err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        initDB();
    }, []); // Run once on mount. 
    // Ideally we re-run migration if state.data.collections changes? 
    // Yes, but let's be careful about loop. 
    // Let's add state.data.collections as dependency but ideally debounce it or use a separate effect.

    useEffect(() => {
        if (db && state.data?.collections) {
            SchemaMigrator.migrate(db, state.data.collections).catch(console.error);
        }
    }, [db, state.data?.collections]);


    const executeQuery = async (query: string, params?: any[]) => {
        if (!db) throw new Error("Database not ready");
        return await db.query(query, params);
    };

    return (
        <PGliteContext.Provider value={{ db, isLoading, error, executeQuery }}>
            {children}
        </PGliteContext.Provider>
    );
}

export function useDB() {
    const context = useContext(PGliteContext);
    if (context === undefined) {
        throw new Error('useDB must be used within a PGliteProvider');
    }
    return context;
}

// Batch 2.1.2: Sync Hook
export function useSync() {
    const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const { state } = useProjectStore();

    const saveProject = async () => {
        if (!state.id) return;
        setSyncStatus('saving');
        try {
            const res = await fetch('/_api/sync/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: state.id,
                    name: state.name,
                    machineState: state, // Send full store state
                    thumbnailUrl: '' // TODO: Capture canvas thumbnail
                })
            });

            if (!res.ok) throw new Error('Save failed');

            setSyncStatus('saved');
            setTimeout(() => setSyncStatus('idle'), 2000);
            return true;
        } catch (e) {
            console.error("Sync Failed:", e);
            setSyncStatus('error');
            return false;
        }
    };

    const loadProject = async (id: string) => {
        try {
            const res = await fetch(`/_api/sync/load/${id}`);
            if (!res.ok) throw new Error('Load failed');
            return await res.json();
        } catch (e) {
            console.error("Load Failed:", e);
            return null;
        }
    };

    return { syncStatus, saveProject, loadProject };
}
