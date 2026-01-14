"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { ProjectState } from '@/types/designer';
import { useProjectStore } from './useProjectStore';

interface CollaborationContextType {
    isConnected: boolean;
    peers: any[]; // Changed from string[] to any[] to hold full presence objects
    provider: WebsocketProvider | null;
    doc: Y.Doc | null;
    updatePresence: (data: Partial<any>) => void;
    user: any; // Current user identity
    comments: any[];
    addComment: (comment: any) => void;
    resolveComment: (commentId: string) => void;

    versions: any[];
    createSnapshot: (name: string, state: any) => void;
    broadcastEvent: (type: string, payload?: any) => void;
    lastEvent: { type: string, payload: any, timestamp: number } | null;

    // Batch 14.4: Director Mode
    directorId: string | null;
    toggleDirector: () => void;
    isDirector: boolean;
}

const getRandomColor = () => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8', '#33FFF5', '#F5FF33'];
    return colors[Math.floor(Math.random() * colors.length)];
};

const NAMES = ['Designer', 'Developer', 'Product Owner', 'Stakeholder', 'Copywriter'];
const getRandomName = () => NAMES[Math.floor(Math.random() * NAMES.length)];

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

// Define the shape of our Y.js interactions
// We will simply sync the entire 'state' object as a Y.Map for Phase 1 MVP.
// In a real app, we would granularly sync elements to avoid large payload overwrites.
// For "Live Sync" engine, we want granular updates.
// Strategy:
// 1. Listen to Local State changes (hard without fine-grained events).
//    - Actually, useProjectStore actions update state. We need to hook into those or subscribe to store.
//    - Simplest MVP: Subscribe to store changes, diff, and update Y.js. (Performance heavy but works for v1).
//    - Better: Middleware in the store.
//    - For now, let's try the subscription approach with debounce.

const WEBSOCKET_URL = 'ws://localhost:1234'; // Local signaling server for reliable dev
// const WEBSOCKET_URL = 'wss://demos.yjs.dev'; // Public demo backup
const ROOM_NAME = 'omnios-room-v1'; // Hardcoded for now, should be dynamic based on project ID

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
    const { state, setState } = useProjectStore();
    const [isConnected, setIsConnected] = useState(false);
    const [peers, setPeers] = useState<any[]>([]);
    const [currentUser] = useState(() => ({
        name: getRandomName(),
        color: getRandomColor(),
        id: Math.random().toString(36).substr(2, 9)
    }));

    // Refs to avoid cyclic loops
    const isRemoteUpdate = useRef(false);
    const docRef = useRef<Y.Doc>(new Y.Doc());
    const providerRef = useRef<WebsocketProvider | null>(null);

    const updatePresence = (data: Partial<any>) => {
        if (!providerRef.current) return;
        providerRef.current.awareness.setLocalStateField('user', currentUser);
        providerRef.current.awareness.setLocalState({
            user: currentUser,
            ...data
        });
    };

    const [comments, setComments] = useState<any[]>([]);

    const addComment = (comment: any) => {
        if (!docRef.current) return;
        const yComments = docRef.current.getArray('comments');
        yComments.push([comment]);
    };

    const resolveComment = (commentId: string) => {
        if (!docRef.current) return;
        const yComments = docRef.current.getArray('comments');
        let index = -1;
        // In Y.Array, we iterate to find the index.
        // For MVP, simplistic scan.
        // Optimized: Store index? No, mutable.
        let targetIndex = -1;
        yComments.forEach((c: any, i: number) => {
            if (c.id === commentId) targetIndex = i;
        });
        if (targetIndex !== -1) {
            yComments.delete(targetIndex, 1); // Delete or mark resolved?
            // Better: Mark resolved. BUT Y.Array items are usually immutable if objects?
            // Actually, replace it.
            const old = yComments.get(targetIndex) as any;
            const updated = { ...old, resolved: true };

            // Yjs atomic replacement
            docRef.current.transact(() => {
                yComments.delete(targetIndex, 1);
                yComments.insert(targetIndex, [updated]);
            });
        }
    };

    const [versions, setVersions] = useState<any[]>([]);

    const createSnapshot = (name: string, state: ProjectState) => {
        if (!docRef.current) return;
        const yVersions = docRef.current.getArray('versions');
        const snapshot = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            timestamp: Date.now(),
            author: currentUser,
            state: state // Store full state snapshot
        };
        yVersions.push([snapshot]);
    };

    const restoreSnapshot = (versionId: string) => {
        if (!docRef.current) return;
        const version = versions.find(v => v.id === versionId);
        if (version && version.state) {
            docRef.current.transact(() => {
                // In a real app, this would be a deep merge or replacement
                console.log('Restoring snapshot:', version.name);
            });
        }
    };

    // --- DIRECTOR MODE (Batch 14.4) ---
    const [directorId, setDirectorId] = useState<string | null>(null);

    const toggleDirector = () => {
        if (!docRef.current) return;
        const yRoomState = docRef.current.getMap('room-state');

        if (directorId === currentUser.id) {
            // Stop Presenting
            yRoomState.set('directorId', null);
        } else {
            // Start Presenting
            yRoomState.set('directorId', currentUser.id);
        }
    };



    // --- EVENTS SUBSYSTEM ---
    const [lastEvent, setLastEvent] = useState<{ type: string, payload: any, timestamp: number } | null>(null);

    const broadcastEvent = (type: string, payload: any = {}) => {
        if (!docRef.current) return;
        const yevents = docRef.current.getArray('events');
        // Push event
        yevents.push([{ type, payload, timestamp: Date.now(), author: currentUser }]);
    };

    // We need to listen to events
    useEffect(() => {
        if (!docRef.current) return;
        const yevents = docRef.current.getArray('events');

        const observer = (event: any) => {
            // Get the last added event
            if (yevents.length > 0) {
                const latest = yevents.get(yevents.length - 1) as any;
                // Only trigger if it's recent (within 2 seconds) to avoid replying old events on load
                if (Date.now() - latest.timestamp < 5000) {
                    setLastEvent(latest);
                }
            }
        };

        yevents.observe(observer);
        return () => yevents.unobserve(observer);
    }, []);

    useEffect(() => {
        const doc = docRef.current;
        const provider = new WebsocketProvider(WEBSOCKET_URL, ROOM_NAME, doc);
        providerRef.current = provider;

        const yMap = doc.getMap('project-state');
        const yComments = doc.getArray('comments');
        const yVersions = doc.getArray('versions'); // Shared Array for versions

        provider.on('status', (event: any) => {
            setIsConnected(event.status === 'connected');
        });

        // Track comments changes
        yComments.observe(() => {
            setComments(yComments.toArray());
        });

        // Track versions changes
        yVersions.observe(() => {
            setVersions(yVersions.toArray());
        });

        provider.awareness.on('change', () => {
            // Handle presence updates
            const states = provider.awareness.getStates();
            const activePeers = Array.from(states.entries()).map(([clientId, state]: [number, any]) => ({
                clientId,
                ...state
            })).filter((p: any) => p.user && p.user.id !== currentUser.id); // Filter out self

            setPeers(activePeers);
        });

        // Initial presence
        provider.awareness.setLocalState({ user: currentUser });

        // --- INCOMING FROM REMOTE ---
        yMap.observeDeep((events) => {
            if (!isRemoteUpdate.current) {
                // ...
            }
        });

        yMap.observe((event) => {
            if (event.transaction.local) return;
            isRemoteUpdate.current = true;
            const remoteState = yMap.toJSON() as ProjectState;
            if (remoteState && remoteState.id) {
                setState((prev) => ({ ...prev, ...remoteState }));
            }
            setTimeout(() => { isRemoteUpdate.current = false; }, 0);
        });

        // Track Room State (Director Mode)
        const yRoomState = doc.getMap('room-state');
        yRoomState.observe((event) => {
            const newDirectorId = yRoomState.get('directorId') as string | null;
            setDirectorId(newDirectorId);
        });
        // Initial set
        setDirectorId(yRoomState.get('directorId') as string || null);

        // Clean up
        return () => {
            provider.disconnect();
            doc.destroy();
        };
    }, [setState]);

    // --- OUTGOING TO REMOTE ---
    useEffect(() => {
        if (isRemoteUpdate.current) return;
        if (!providerRef.current?.shouldConnect) return;

        const doc = docRef.current;
        const yMap = doc.getMap('project-state');

        doc.transact(() => {
            Object.entries(state).forEach(([key, value]) => {
                const currentYVal = yMap.get(key);
                if (JSON.stringify(currentYVal) !== JSON.stringify(value)) {
                    yMap.set(key, value);
                }
            });
        });

    }, [state]);

    // Framer16: Automatic Checkpoints
    useEffect(() => {
        const interval = setInterval(() => {
            if (isConnected && docRef.current) {
                console.log('[Collaboration] Creating automatic checkpoint...');
                createSnapshot(`Auto-Checkpoint (${new Date().toLocaleTimeString()})||${JSON.stringify({ description: 'Scheduled automatic backup' })}`, state);
            }
        }, 10 * 60 * 1000); // Every 10 minutes
        return () => clearInterval(interval);
    }, [isConnected, state]);

    return (
        <CollaborationContext.Provider value={{
            isConnected,
            peers,
            provider: providerRef.current,
            doc: docRef.current,
            updatePresence,
            user: currentUser,
            comments,
            addComment,
            resolveComment,
            versions,
            createSnapshot,
            broadcastEvent,
            lastEvent,
            // Director Mode
            directorId,
            toggleDirector,
            isDirector: directorId === currentUser.id
        }}>
            {children}
        </CollaborationContext.Provider>
    );
}

export const useCollaboration = () => {
    const context = useContext(CollaborationContext);
    if (context === undefined) {
        throw new Error('useCollaboration must be used within a CollaborationProvider');
    }
    return context;
};
