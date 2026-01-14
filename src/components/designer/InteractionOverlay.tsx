import React from 'react';
import { ProjectState } from '@/types/designer';
import { useSnapping } from '@/hooks/useSnapping';
import { useProjectStore } from '@/hooks/useProjectStore';
import { SmartGuides } from './SmartGuides';
import { hyperBridge } from '@/lib/engine/HyperBridge';

interface InteractionOverlayProps {
    elements: ProjectState['elements'];
    selectedId: string | null;
    selectedIds: string[]; // NEW: Support for multiple selection
    hoveredId: string | null;
    highlightedControl: string | null;
    dragState: {
        isDragging: boolean;
        targetId: string | null;
        position: 'before' | 'after' | 'inside' | null;
    } | null;
    canvasTransform: { x: number, y: number, scale: number };
    updateElementStyles: (id: string, styles: any, skipHistory?: boolean) => void;
}

export function InteractionOverlay({ elements, selectedId, selectedIds, hoveredId, highlightedControl, dragState, canvasTransform, updateElementStyles }: InteractionOverlayProps) {
    const parseVal = (str?: string) => {
        if (!str) return 0;
        const val = parseFloat(str);
        return isNaN(val) ? 0 : val;
    };

    const [dragging, setDragging] = React.useState<{
        type: 'resize' | 'margin' | 'padding' | 'move',
        handle: string, // e.g., 'top', 'bottom-right', 'top-left'
        startValue: number, // The initial value of the property being changed
        startMouseX: number,
        startMouseY: number,
        currentX?: number, // Optimization
        currentY?: number, // Optimization
        initialRect: DOMRect,
        startMouseY2?: number // Added for Y-axis start value
    } | null>(null);

    const [isAltPressed, setIsAltPressed] = React.useState(false);
    const { state, setGlobalCursor } = useProjectStore();
    // NOTE: We use props.updateElementStyles, so we don't destructure it from store here.
    const { activeGuides, calculateSnap, calculateEdgeSnap, clearGuides } = useSnapping();

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Alt') setIsAltPressed(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Alt') setIsAltPressed(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Helper to get element DOM rect
    const getRect = (id: string | null) => {
        if (!id) return null;

        // Batch 6.1: Optimization - Use cached rect during drag to prevent layout thrashing
        if (dragging && dragging.initialRect && selectedId === id && dragging.type === 'move') {
            const deltaX = (dragging.currentX || dragging.startMouseX) - dragging.startMouseX;
            const deltaY = (dragging.currentY || dragging.startMouseY) - dragging.startMouseY;
            // Synthesize Rect
            return {
                top: dragging.initialRect.top + deltaY,
                left: dragging.initialRect.left + deltaX,
                width: dragging.initialRect.width,
                height: dragging.initialRect.height,
                bottom: dragging.initialRect.bottom + deltaY,
                right: dragging.initialRect.right + deltaX,
            } as DOMRect;
        }

        const el = document.getElementById(id); // We rely on DOM IDs matching Element IDs
        if (!el) return null;
        return el.getBoundingClientRect();
    };

    const selectedRect = getRect(selectedId);
    const hoveredRect = getRect(hoveredId);
    const dragTargetRect = dragState ? getRect(dragState.targetId) : null;

    // --- GLOBAL DRAG HANDLERS ---
    React.useEffect(() => {
        if (!dragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!dragging || !selectedId) return;

            const deltaX = e.clientX - dragging.startMouseX;
            const deltaY = e.clientY - dragging.startMouseY;

            // Update local dragging state for render optimization
            setDragging(prev => prev ? ({ ...prev, currentX: e.clientX, currentY: e.clientY }) : null);

            const scale = canvasTransform.scale; // Adjust delta by zoom level

            const updates: any = {};
            const elStyles = elements[selectedId].styles || {};

            if (dragging.type === 'margin') {
                const isShift = e.shiftKey;

                if (dragging.handle === 'top') {
                    const newVal = Math.max(0, dragging.startValue - (deltaY / scale));
                    updates.marginTop = `${newVal}px`;
                    if (isShift) {
                        updates.marginBottom = `${newVal}px`;
                        updates.marginLeft = `${newVal}px`;
                        updates.marginRight = `${newVal}px`;
                    }
                } else if (dragging.handle === 'bottom') {
                    const newVal = Math.max(0, dragging.startValue + (deltaY / scale));
                    updates.marginBottom = `${newVal}px`;
                    if (isShift) {
                        updates.marginTop = `${newVal}px`;
                        updates.marginLeft = `${newVal}px`;
                        updates.marginRight = `${newVal}px`;
                    }
                } else if (dragging.handle === 'left') {
                    const newVal = Math.max(0, dragging.startValue - (deltaX / scale));
                    updates.marginLeft = `${newVal}px`;
                    if (isShift) {
                        updates.marginTop = `${newVal}px`;
                        updates.marginBottom = `${newVal}px`;
                        updates.marginRight = `${newVal}px`;
                    }
                } else if (dragging.handle === 'right') {
                    const newVal = Math.max(0, dragging.startValue + (deltaX / scale));
                    updates.marginRight = `${newVal}px`;
                    if (isShift) {
                        updates.marginTop = `${newVal}px`;
                        updates.marginBottom = `${newVal}px`;
                        updates.marginLeft = `${newVal}px`;
                    }
                }
            }
            else if (dragging.type === 'padding') {
                const isShift = e.shiftKey;
                if (dragging.handle === 'top') {
                    const newVal = Math.max(0, dragging.startValue + (deltaY / scale));
                    updates.paddingTop = `${newVal}px`;
                    if (isShift) {
                        updates.paddingBottom = `${newVal}px`;
                        updates.paddingLeft = `${newVal}px`;
                        updates.paddingRight = `${newVal}px`;
                    }
                } else if (dragging.handle === 'bottom') {
                    const newVal = Math.max(0, dragging.startValue - (deltaY / scale));
                    updates.paddingBottom = `${newVal}px`;
                    if (isShift) {
                        updates.paddingTop = `${newVal}px`;
                        updates.paddingLeft = `${newVal}px`;
                        updates.paddingRight = `${newVal}px`;
                    }
                } else if (dragging.handle === 'left') {
                    const newVal = Math.max(0, dragging.startValue + (deltaX / scale));
                    updates.paddingLeft = `${newVal}px`;
                    if (isShift) {
                        updates.paddingTop = `${newVal}px`;
                        updates.paddingBottom = `${newVal}px`;
                        updates.paddingRight = `${newVal}px`;
                    }
                } else if (dragging.handle === 'right') {
                    const newVal = Math.max(0, dragging.startValue - (deltaX / scale));
                    updates.paddingRight = `${newVal}px`;
                    if (isShift) {
                        updates.paddingTop = `${newVal}px`;
                        updates.paddingBottom = `${newVal}px`;
                        updates.paddingLeft = `${newVal}px`;
                    }
                }
            }
            else if (dragging.type === 'resize') {
                // RESIZE LOGIC
                // We update width/height.
                if (dragging.handle.includes('right')) {
                    updates.width = `${Math.max(10, dragging.startValue + (deltaX / scale))}px`; // Assuming startValue was width
                }
                // Handle Height separately? 
                // We need to store separate start values for width/height in state? 
                // Simplified: dragging state stores 'startValue' which is ambiguous if resizing 2D.
                // FIX: Let's read rect directly from `dragging.initialRect` for base dimensions.

                const initialW = dragging.initialRect.width / scale; // Back to unscaled? No, rect is screen coords.
                // Actually initialRect is screen coords.
                // Real width/height might be different (e.g. %)
                // For MVP Direct Manipulation, we switch to PX values.

                // Let's use the styles width/height if they are px, otherwise use computed rect size.
                // If we drag, we hard set pixel values.

                if (dragging.handle.includes('right')) {
                    const rawRight = dragging.initialRect.left + dragging.initialRect.width + deltaX; // Screen coords
                    // We need relative coords for the style update if parent is absolute? 
                    // For now assuming screen coords ~ local coords for freedom mode or we rely on 'scale'.
                    // Actually, visual snapping should be in screen space or consisten space.
                    // useSnapping expects raw pixel values relative to siblings.

                    // We need siblings.
                    const siblings = Object.values(elements).filter(e => e.parentId === elements[selectedId]?.parentId && e.id !== selectedId);

                    // rawRight is effectively "Left + Width".
                    // If we snap "Right Edge", we modify Width.
                    // But wait, `dragging.initialRect.width` is screen px. `deltaX` is screen px.
                    // `scale` is canvas zoom.
                    // We should snap in "Canvas Space".
                    // Rect is Zoomed Screen Space. 
                    // To get "Canvas Space Values": Val / Scale.

                    const canvasRight = (dragging.initialRect.left + dragging.initialRect.width + deltaX) / scale;
                    // BUT `calculateEdgeSnap` expects values matching the `left/top` styles which are likely unscaled pixels.
                    // So yes, divide by scale is correct if styles are 1:1.

                    const { snapped, guides } = calculateEdgeSnap(canvasRight, 'vertical', siblings);

                    // New Width = Snapped Right - Left
                    const currentLeft = parseVal(String(elStyles.left)) || 0; // Assuming absolute/freedom
                    // If not absolute, this logic is tricky. 
                    // Assuming Freedom Mode for snapping:

                    const newWidth = snapped - currentLeft;
                    updates.width = `${Math.max(10, newWidth)}px`;
                } else if (dragging.handle.includes('left')) {
                    // ... (implement left resize snap similarly if needed)
                }

                if (dragging.handle.includes('bottom')) {
                    const siblings = Object.values(elements).filter(e => e.parentId === elements[selectedId]?.parentId && e.id !== selectedId);
                    const canvasBottom = (dragging.initialRect.top + dragging.initialRect.height + deltaY) / scale;

                    const { snapped, guides } = calculateEdgeSnap(canvasBottom, 'horizontal', siblings);

                    const currentTop = parseVal(String(elStyles.top)) || 0;
                    const newHeight = snapped - currentTop;
                    updates.height = `${Math.max(10, newHeight)}px`;
                }
            }
            else if (dragging.type === 'move') {
                // MOVE LOGIC (Batch 25.4)
                // 1. Calculate proposed raw position
                const currentLeft = parseVal(String(elStyles.left)) || 0;
                const currentTop = parseVal(String(elStyles.top)) || 0;

                const rawX = dragging.startValue + (deltaX / scale); // startValue is X
                const rawY = (dragging.startMouseY2 || 0) + (deltaY / scale); // We need start Y value too

                // 2. Rust Constraint (Parent Bounds)
                // We drag the *element*, so we pass its ID.
                // Assuming absolute positioning (Freedom Mode).

                // Constrain logic usually happens *before* snap or *after*?
                // Usually: Snap -> Then Constrain to parent. OR Constrain -> Then Snap.
                // Best: Snap first (magnetic), then hard clamp to parent.

                const width = dragging.initialRect.width / scale;
                const height = dragging.initialRect.height / scale;

                const siblings = Object.values(elements).filter(e => e.parentId === elements[selectedId]?.parentId && e.id !== selectedId);

                // 3. Magnetic Snap (Rust via useSnapping -> finds guides)
                const { x: snappedX, y: snappedY } = calculateSnap(
                    rawX,
                    rawY,
                    width,
                    height,
                    siblings,
                    selectedId,
                    10 // Threshold
                );

                // 4. Hard Constraint (Rust)
                // We need to access hyperBridge directly or use a helper. 
                // Since calculateSnap returns proposed position, we can constrain THAT.
                // But constrain_drag needs the element ID and the proposed location.
                // NOTE: constrain_drag reads parent bounds from Rust Spatial Index.

                // Let's call it via our global import if available, or just rely on visual constraints for now.
                // Actually, let's wire it up properly.
                // We can't import hyperBridge here easily if not exposed, but useSnapping imports it? 
                // Yes, but we need `constrainDrag` which isn't in useSnapping.

                // For this batch, let's assume `calculateSnap` does the heavy lifting for alignment.
                // And for parent constraint, we'll add `constrainDrag` to the hook or import `hyperBridge` here.

                // 4. Hard Constraint (Rust)
                // This ensures that even if a snap point is outside the parent, we respect the parent bounds.
                let constrained = null;
                try {
                    constrained = hyperBridge.constrainDrag(selectedId, snappedX, snappedY);
                } catch (err) {
                    console.warn('Rust Constrain Failed:', err);
                }

                // If Rust returns null (not indexed yet) or fails, fallback to magnetic snap
                const finalX = (constrained && constrained.length === 2 && !isNaN(constrained[0])) ? constrained[0] : snappedX;
                const finalY = (constrained && constrained.length === 2 && !isNaN(constrained[1])) ? constrained[1] : snappedY;

                updates.left = `${finalX}px`;
                updates.top = `${finalY}px`;
            }

            updateElementStyles(selectedId, updates, true); // Skip History
        };

        const handleMouseUp = () => {
            // Commit final value with history
            if (selectedId && elements[selectedId]) {
                // Re-apply the current styles to force a history commit?
                // Or just existing state is fine, but we need one "History Push".
                // Since the last update was skipHistory=true, the store has the new value but no history entry.
                // We can just call update with empty object and skipHistory=false? 
                // Or re-send the last update.
                // Easiest: Just trigger a style update with current values.
                const s = elements[selectedId].styles;
                updateElementStyles(selectedId, { ...s }, false);
            }

            setDragging(null);
            setGlobalCursor(null); // Reset Cursor
            clearGuides();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, canvasTransform, elements, selectedId, updateElementStyles]);


    // --- RENDER HELPERS ---

    const renderBoxModel = (rect: DOMRect, color: string, label?: string) => (
        <div style={{
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            border: `1px solid var(--accent-primary)`,
            pointerEvents: 'none',
            zIndex: 9999,
            backgroundColor: 'rgba(0, 224, 255, 0.02)', // Very subtle fill
        }}>
            {label && (
                <div style={{
                    position: 'absolute',
                    top: -20,
                    left: 0,
                    backgroundColor: 'var(--accent-primary)',
                    color: 'black',
                    fontSize: 9,
                    padding: '2px 4px',
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'uppercase'
                }}>
                    {label}
                </div>
            )}
        </div>
    );

    // NEW: Render Drag Handles
    const renderHandles = (rect: DOMRect, elementId: string) => {
        const el = elements[elementId];
        const s = el.styles || {};

        const onMouseDown = (e: React.MouseEvent, type: 'margin' | 'padding' | 'resize' | 'move', handle: string, startValue: number) => {
            e.stopPropagation();
            if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();

            setDragging({
                type,
                handle,
                startValue,
                startMouseY2: type === 'move' ? (parseVal(String(s.top)) || 0) : undefined, // Store Y for move
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                initialRect: rect
            });

            // Batch 6.1: Global Cursor
            let cursor = 'grabbing';
            if (type === 'resize') {
                // Map handle to cursor
                if (handle === 'top' || handle === 'bottom') cursor = 'ns-resize';
                else if (handle === 'left' || handle === 'right') cursor = 'ew-resize';
                else if (handle === 'top-left' || handle === 'bottom-right') cursor = 'nwse-resize';
                else if (handle === 'top-right' || handle === 'bottom-left') cursor = 'nesw-resize';
            } else if (type === 'margin' || type === 'padding') {
                if (handle === 'top' || handle === 'bottom') cursor = 'ns-resize';
                else cursor = 'ew-resize';
            }
            setGlobalCursor(cursor);
        };

        // NEW: Move Handle (Invisible Overlay)
        const MoveHandle = ({ pos }: { pos: React.CSSProperties }) => (
            <div
                onMouseDown={(e) => onMouseDown(e, 'move', 'body', parseVal(String(s.left)) || 0)}
                style={{
                    position: 'fixed',
                    zIndex: 10004, // Below resize handles (10006) and pills (10005)
                    cursor: 'grab',
                    ...pos
                }}
            />
        );

        // MARGIN HANDLES (Orange pills outside)
        const MarginHandle = ({ pos, val, axis }: { pos: React.CSSProperties, val: number, axis: string }) => {
            const isDraggingThis = dragging?.type === 'margin' && dragging?.handle === axis;
            const displayVal = isDraggingThis ? Math.round(parseFloat(String(elements[selectedId || '']?.styles?.[axis === 'top' ? 'marginTop' : axis === 'bottom' ? 'marginBottom' : axis === 'left' ? 'marginLeft' : 'marginRight'] || '0'))) : Math.round(val);

            return (
                <div
                    onMouseDown={(e) => onMouseDown(e, 'margin', axis, val)}
                    className="handle-margin"
                    style={{
                        position: 'fixed',
                        backgroundColor: '#ff9500',
                        border: '1px solid white',
                        borderRadius: '10px', // More pill-like
                        zIndex: 10005,
                        cursor: axis === 'top' || axis === 'bottom' ? 'ns-resize' : 'ew-resize',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        ...pos
                    }}
                >
                    {(isDraggingThis || val > 0) && displayVal}
                </div>
            );
        };

        // PADDING HANDLES (Green pills inside, only on Alt)
        const PaddingHandle = ({ pos, val, axis }: { pos: React.CSSProperties, val: number, axis: string }) => {
            const isDraggingThis = dragging?.type === 'padding' && dragging?.handle === axis;
            const displayVal = isDraggingThis ? Math.round(parseFloat(String(elements[selectedId || '']?.styles?.[axis === 'top' ? 'paddingTop' : axis === 'bottom' ? 'paddingBottom' : axis === 'left' ? 'paddingLeft' : 'paddingRight'] || '0'))) : Math.round(val);

            return (
                <div
                    onMouseDown={(e) => onMouseDown(e, 'padding', axis, val)}
                    className="handle-padding"
                    style={{
                        position: 'fixed',
                        backgroundColor: '#4CAF50',
                        border: '1px solid white',
                        borderRadius: '10px',
                        zIndex: 10005,
                        cursor: axis === 'top' || axis === 'bottom' ? 'ns-resize' : 'ew-resize',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 0 4px rgba(0,0,0,0.2)',
                        ...pos
                    }}
                >
                    {(isDraggingThis || val > 0) && displayVal}
                </div>
            );
        };

        // RESIZE HANDLES (Neon dots)
        const ResizeHandle = ({ pos, cursor, h }: { pos: React.CSSProperties, cursor: string, h: string }) => (
            <div
                onMouseDown={(e) => onMouseDown(e, 'resize', h, 0)}
                style={{
                    position: 'fixed',
                    width: '6px', height: '6px',
                    backgroundColor: 'white',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: '50%', // Round handles
                    zIndex: 10006,
                    cursor,
                    boxShadow: '0 0 4px rgba(0, 224, 255, 0.5)',
                    ...pos
                }}
            />
        );

        const mTop = parseVal(String(s.marginTop));
        const mRight = parseVal(String(s.marginRight));
        const mBottom = parseVal(String(s.marginBottom));
        const mLeft = parseVal(String(s.marginLeft));

        const pTop = parseVal(String(s.paddingTop));
        const pRight = parseVal(String(s.paddingRight));
        const pBottom = parseVal(String(s.paddingBottom));
        const pLeft = parseVal(String(s.paddingLeft));

        const pillWidth = 24;
        const pillHeight = 12;

        return (
            <>
                {/* Move Handle (Covers entire element, behind knobs) */}
                <MoveHandle pos={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />

                {/* Margin Handles */}
                <MarginHandle pos={{ top: rect.top - pillHeight - 4, left: rect.left + rect.width / 2 - pillWidth / 2, width: pillWidth, height: pillHeight }} val={mTop} axis="top" />
                <MarginHandle pos={{ top: rect.bottom + 4, left: rect.left + rect.width / 2 - pillWidth / 2, width: pillWidth, height: pillHeight }} val={mBottom} axis="bottom" />
                <MarginHandle pos={{ top: rect.top + rect.height / 2 - pillHeight / 2, left: rect.left - pillWidth - 4, width: pillWidth, height: pillHeight }} val={mLeft} axis="left" />
                <MarginHandle pos={{ top: rect.top + rect.height / 2 - pillHeight / 2, left: rect.right + 4, width: pillWidth, height: pillHeight }} val={mRight} axis="right" />

                {/* Padding Handles (Only if Alt is pressed) */}
                {isAltPressed && (
                    <>
                        <PaddingHandle pos={{ top: rect.top + 4, left: rect.left + rect.width / 2 - pillWidth / 2, width: pillWidth, height: pillHeight }} val={pTop} axis="top" />
                        <PaddingHandle pos={{ top: rect.bottom - pillHeight - 4, left: rect.left + rect.width / 2 - pillWidth / 2, width: pillWidth, height: pillHeight }} val={pBottom} axis="bottom" />
                        <PaddingHandle pos={{ top: rect.top + rect.height / 2 - pillHeight / 2, left: rect.left + 4, width: pillWidth, height: pillHeight }} val={pLeft} axis="left" />
                        <PaddingHandle pos={{ top: rect.top + rect.height / 2 - pillHeight / 2, left: rect.right - pillWidth - 4, width: pillWidth, height: pillHeight }} val={pRight} axis="right" />
                    </>
                )}

                {/* Resize Handles - Corners */}
                <ResizeHandle pos={{ top: rect.top - 4, left: rect.left - 4 }} cursor="nwse-resize" h="top-left" />
                <ResizeHandle pos={{ top: rect.top - 4, left: rect.right - 4 }} cursor="nesw-resize" h="top-right" />
                <ResizeHandle pos={{ top: rect.bottom - 4, left: rect.left - 4 }} cursor="nesw-resize" h="bottom-left" />
                <ResizeHandle pos={{ top: rect.bottom - 4, left: rect.right - 4 }} cursor="nwse-resize" h="bottom-right" />

                {/* Resize Handles - Sides */}
                <ResizeHandle pos={{ top: rect.top + rect.height / 2 - 4, left: rect.right - 4 }} cursor="ew-resize" h="right" />
                <ResizeHandle pos={{ top: rect.bottom - 4, left: rect.left + rect.width / 2 - 4 }} cursor="ns-resize" h="bottom" />
            </>
        );
    };

    // NEW: Highlight specific property overlay (e.g., Margin Top)
    const renderPropertyHighlight = (rect: DOMRect) => {
        if (!highlightedControl) return null;

        const style: React.CSSProperties = {
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 10001, // Above selection
            backgroundColor: 'rgba(255, 165, 0, 0.4)', // Orange for Margin
        };

        const PAD_COLOR = 'rgba(76, 175, 80, 0.4)'; // Green for Padding
        const INDICATOR_SIZE = 20;

        if (highlightedControl === 'marginTop') {
            return <div style={{ ...style, top: rect.top - INDICATOR_SIZE, left: rect.left, width: rect.width, height: INDICATOR_SIZE }} />;
        }
        if (highlightedControl === 'marginBottom') {
            return <div style={{ ...style, top: rect.bottom, left: rect.left, width: rect.width, height: INDICATOR_SIZE }} />;
        }
        if (highlightedControl === 'marginLeft') {
            return <div style={{ ...style, top: rect.top, left: rect.left - INDICATOR_SIZE, width: INDICATOR_SIZE, height: rect.height }} />;
        }
        if (highlightedControl === 'marginRight') {
            return <div style={{ ...style, top: rect.top, left: rect.right, width: INDICATOR_SIZE, height: rect.height }} />;
        }

        if (highlightedControl === 'paddingTop') {
            return <div style={{ ...style, backgroundColor: PAD_COLOR, top: rect.top, left: rect.left, width: rect.width, height: INDICATOR_SIZE }} />;
        }
        if (highlightedControl === 'paddingBottom') {
            return <div style={{ ...style, backgroundColor: PAD_COLOR, top: rect.bottom - INDICATOR_SIZE, left: rect.left, width: rect.width, height: INDICATOR_SIZE }} />;
        }
        if (highlightedControl === 'paddingLeft') {
            return <div style={{ ...style, backgroundColor: PAD_COLOR, top: rect.top, left: rect.left, width: INDICATOR_SIZE, height: rect.height }} />;
        }
        if (highlightedControl === 'paddingRight') {
            return <div style={{ ...style, backgroundColor: PAD_COLOR, top: rect.top, left: rect.right - INDICATOR_SIZE, width: INDICATOR_SIZE, height: rect.height }} />;
        }

        return null;
    };


    const renderDropLine = () => {
        if (!dragState || !dragState.targetId || !dragTargetRect || !dragState.position) return null;

        const rect = dragTargetRect;
        const color = '#00E0FF'; // Cyan drop line
        const thickness = 4;

        let style: React.CSSProperties = {
            position: 'fixed',
            backgroundColor: color,
            zIndex: 10000,
            pointerEvents: 'none',
            boxShadow: '0 0 8px rgba(0, 224, 255, 0.8)'
        };

        if (dragState.position === 'before') {
            style = { ...style, top: rect.top - thickness / 2, left: rect.left, width: rect.width, height: thickness };
        } else if (dragState.position === 'after') {
            style = { ...style, top: rect.bottom - thickness / 2, left: rect.left, width: rect.width, height: thickness };
        } else if (dragState.position === 'inside') {
            return (
                <div style={{
                    position: 'fixed',
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    border: `2px solid ${color}`,
                    backgroundColor: 'rgba(0, 224, 255, 0.2)',
                    zIndex: 10000,
                    pointerEvents: 'none'
                }} />
            );
        }

        return <div style={style} />;
    };

    const renderGapLines = (r1: DOMRect, r2: DOMRect) => {
        // r1 = Selected, r2 = Hovered
        const gaps = [];
        const color = 'var(--accent-secondary)'; // Pink for measurement

        // Helper to Draw Line + Label
        const Line = ({ left, top, width, height, label, vertical }: any) => (
            <>
                <div style={{
                    position: 'absolute', left, top, width, height,
                    backgroundColor: color,
                    zIndex: 10002
                }} />
                {label && (
                    <div style={{
                        position: 'absolute',
                        left: left + (width / 2),
                        top: top + (height / 2),
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: color,
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600',
                        zIndex: 10003
                    }}>
                        {Math.round(label)}
                    </div>
                )}
            </>
        );

        // Top Gap
        if (r2.top < r1.top) {
            const dist = r1.top - r2.bottom;
            if (dist > 0) {
                // Check if horizontally aligned
                const start = Math.max(r1.left, r2.left);
                const end = Math.min(r1.right, r2.right);
                if (end > start) {
                    gaps.push(<Line key="top" left={start + (end - start) / 2} top={r2.bottom} width="1px" height={dist} label={dist} />);
                }
            }
        }

        // Bottom Gap
        if (r2.bottom > r1.bottom) {
            const dist = r2.top - r1.bottom;
            if (dist > 0) {
                const start = Math.max(r1.left, r2.left);
                const end = Math.min(r1.right, r2.right);
                if (end > start) {
                    gaps.push(<Line key="bottom" left={start + (end - start) / 2} top={r1.bottom} width="1px" height={dist} label={dist} />);
                }
            }
        }

        // Left Gap
        if (r2.left < r1.left) {
            const dist = r1.left - r2.right;
            if (dist > 0) {
                // Check if vertically aligned
                const start = Math.max(r1.top, r2.top);
                const end = Math.min(r1.bottom, r2.bottom);
                if (end > start) {
                    gaps.push(<Line key="left" left={r2.right} top={start + (end - start) / 2} width={dist} height="1px" label={dist} />);
                }
            }
        }

        // Right Gap
        if (r2.right > r1.right) {
            const dist = r2.left - r1.right;
            if (dist > 0) {
                const start = Math.max(r1.top, r2.top);
                const end = Math.min(r1.bottom, r2.bottom);
                if (end > start) {
                    gaps.push(<Line key="right" left={r1.right} top={start + (end - start) / 2} width={dist} height="1px" label={dist} />);
                }
            }
        }

        return gaps;
    };

    return (
        <>
            {/* Highlighted Control (Input Sync) */}
            {highlightedControl && selectedRect && renderPropertyHighlight(selectedRect)}

            {/* Hover Inspection (Green Box) - Only if not dragging */}
            {!dragState?.isDragging && hoveredId && hoveredId !== selectedId && hoveredRect && (
                <>
                    {renderBoxModel(hoveredRect, isAltPressed ? 'var(--accent-secondary)' : '#50ff50', isAltPressed ? 'Ref' : 'Padding')}

                    {/* Batch 7.2: Inspector Mode (Alt Key Gaps) */}
                    {isAltPressed && selectedRect && renderGapLines(selectedRect, hoveredRect)}
                </>
            )}

            {/* Multi-Selection Outlines */}
            {selectedIds.map(id => {
                const rect = getRect(id);
                if (!rect) return null;
                return (
                    <React.Fragment key={id}>
                        {renderBoxModel(rect, '#2997ff', elements[id]?.type)}
                        {/* Only render complex handles for the primary selection if dragging or just basic outlines for others */}
                        {id === selectedId && !dragState?.isDragging && renderHandles(rect, id)}
                    </React.Fragment>
                );
            })}

            {/* Drop Zone Indicator */}
            {dragState?.isDragging && renderDropLine()}

            {/* Snapping Guides from Resize */}
            <SmartGuides guides={activeGuides} />
        </>
    );
}
