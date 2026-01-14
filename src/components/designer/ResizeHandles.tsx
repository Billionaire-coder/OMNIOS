import React from 'react';

interface ResizeHandlesProps {
    onResizeStart: (e: React.MouseEvent, direction: string) => void;
}

export function ResizeHandles({ onResizeStart }: ResizeHandlesProps) {
    const handleStyle: React.CSSProperties = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        backgroundColor: '#fff',
        border: '1.5px solid var(--accent-teal)',
        borderRadius: '50%', // Circle handles for a more modern look
        zIndex: 1001,
        pointerEvents: 'auto',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.8)',
        transition: 'transform 0.1s ease',
    };

    const handleHover = (e: React.MouseEvent) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.2)';
    };

    const handleLeave = (e: React.MouseEvent) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
    };

    return (
        <>
            {/* Corners */}
            <div
                style={{ ...handleStyle, top: -6, left: -6, cursor: 'nwse-resize' }}
                onMouseDown={(e) => onResizeStart(e, 'nw')}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
            />
            <div
                style={{ ...handleStyle, top: -6, right: -6, cursor: 'nesw-resize' }}
                onMouseDown={(e) => onResizeStart(e, 'ne')}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
            />
            <div
                style={{ ...handleStyle, bottom: -6, left: -6, cursor: 'nesw-resize' }}
                onMouseDown={(e) => onResizeStart(e, 'sw')}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
            />
            <div
                style={{ ...handleStyle, bottom: -6, right: -6, cursor: 'nwse-resize' }}
                onMouseDown={(e) => onResizeStart(e, 'se')}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
            />

            {/* Edges */}
            <div
                style={{ ...handleStyle, top: 'calc(50% - 5px)', left: -6, cursor: 'ew-resize' }}
                onMouseDown={(e) => onResizeStart(e, 'w')}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
            />
            <div
                style={{ ...handleStyle, top: 'calc(50% - 5px)', right: -6, cursor: 'ew-resize' }}
                onMouseDown={(e) => onResizeStart(e, 'e')}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
            />
            <div
                style={{ ...handleStyle, bottom: -6, left: 'calc(50% - 5px)', cursor: 'ns-resize' }}
                onMouseDown={(e) => onResizeStart(e, 's')}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
            />
            <div
                style={{ ...handleStyle, top: -6, left: 'calc(50% - 5px)', cursor: 'ns-resize' }}
                onMouseDown={(e) => onResizeStart(e, 'n')}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
            />
        </>
    );
}
