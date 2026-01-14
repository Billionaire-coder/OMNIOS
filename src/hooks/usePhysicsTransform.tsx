import { useEffect, useRef } from 'react';
import { hyperBridge } from '@/lib/engine/HyperBridge';

/**
 * High-performance hook that synchronizes an element's DOM position 
 * with the Rust physics engine @ 60fps, bypassing React's render cycle.
 */
export function usePhysicsTransform(id: string, ref: React.RefObject<HTMLElement>) {
    useEffect(() => {
        if (!id || !ref) return;

        const unsubscribe = hyperBridge.subscribe(() => {
            if (!ref.current) return;

            const pos = hyperBridge.getPhysicsPosition(id);
            if (pos) {
                // Direct DOM manipulation for maximum 60fps performance
                ref.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

                // Force absolute if driven by physics
                if (ref.current.style.position !== 'absolute') {
                    ref.current.style.position = 'absolute';
                }
            }
        });

        return unsubscribe;
    }, [id, ref]);
}
