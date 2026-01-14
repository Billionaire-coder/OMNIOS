import React, { useEffect } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';

/**
 * GlobalCursorManager
 * 
 * Enforces cursor state globally to prevent "flickering" and "fighting" between
 * CSS :hover states and JavaScript drag states.
 * 
 * Strategy:
 * 1. Listens to `activeCursor` (Explicit overrides like Resize)
 * 2. Listens to `isSpacePressed` (Pan Tool)
 * 3. Renders a transparent, full-screen overlay with z-index 99999 when an override is active.
 */
export const GlobalCursorManager = () => {
    const { state } = useProjectStore();
    const { activeCursor, isSpacePressed, dragState } = state;

    // Determine the effective global cursor
    let effectiveCursor: string | null = null;

    if (activeCursor) {
        effectiveCursor = activeCursor;
    } else if (isSpacePressed) {
        effectiveCursor = dragState.isDragging ? 'grabbing' : 'grab';
    } else if (dragState.isDragging) {
        // Fallback if no specific cursor is set but we are dragging (e.g. standard dnd)
        // effectiveCursor = 'grabbing'; 
        // We might not want to force 'grabbing' for all drags if some are specific (like resize).
        // But if activeCursor is null, maybe standard move?
        if (!effectiveCursor) effectiveCursor = 'grabbing';
    }

    // Effect to handle document body cursor (optional, but overlay is better)
    // We use overlay for 100% guarantee.

    if (!effectiveCursor) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999, // Stratosphere
            cursor: effectiveCursor,
            pointerEvents: 'all', // Capture all events so underlying hover effects don't trigger? 
            // WAIT: If we capture 'all', we block interaction!
            // If we are resizing, we WANT to block interaction with other elements.
            // If we are panning (Space), we WANT to block interaction.
            // So yes, 'all' is correct for these modes.
            // But we must forward events? 
            // React events bubble. If this is at the top, it might block?
            // Actually, this overlay is a SIBLING to the Editor.
            // If pointer-events: all, clicks won't reach the editor.
            // For Resizing/Dragging, we usually attach window listeners, so blocking clicks is GOOD.
            // For Spacebar (Pan), blocking clicks is also GOOD (so you don't select stuff while panning).
        }} />
    );
};
