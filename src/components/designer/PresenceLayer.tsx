"use client";

import React, { useEffect, useState } from 'react';
import { collabService } from '@/lib/collab/CollabService';


interface PresenceState {
    user: {
        id: string;
        name: string;
        color: string;
        cursor?: { x: number; y: number };
        selection?: string[];
    };
}

export function PresenceLayer({ elements }: { elements: Record<string, any> }) {
    const [peers, setPeers] = useState<PresenceState[]>([]);
    const myId = collabService.getUserId();

    useEffect(() => {
        const unsubscribe = collabService.onPresenceUpdate((states) => {
            // Filter out self and peers without cursor data
            const otherPeers = states.filter(s => s.user && s.user.id !== myId) as PresenceState[];
            setPeers(otherPeers);
        });

        return unsubscribe;
    }, [myId]);

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
            {/* Peer Cursors */}
            {/* Peer Cursors - HANDLED BY CursorOverlay.tsx */}


            {/* Peer Selections */}
            {peers.map(peer => {
                const { user } = peer;
                if (!user.selection || user.selection.length === 0) return null;

                return user.selection.map(elId => {
                    const el = elements[elId];
                    if (!el || !el.styles) return null;

                    // This is a simplified highlight. In a real app, we'd need the actual rendered bounds.
                    // For now, if it has absolute positioning, we can draw a box.
                    if (el.styles.position === 'absolute') {
                        return (
                            <div
                                key={`${user.id}-${elId}`}
                                style={{
                                    position: 'absolute',
                                    left: el.styles.left || 0,
                                    top: el.styles.top || 0,
                                    width: el.styles.width || 'auto',
                                    height: el.styles.height || 'auto',
                                    border: `2px solid ${user.color}`,
                                    opacity: 0.4,
                                    borderRadius: el.styles.borderRadius || 0,
                                    pointerEvents: 'none'
                                }}
                            />
                        );
                    }
                    return null;
                });
            })}
        </div>
    );
}
