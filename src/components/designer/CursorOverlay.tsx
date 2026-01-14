import React from 'react';
import { useCollaboration } from '@/hooks/useCollaboration';
import { MousePointer2 } from 'lucide-react';

interface CursorOverlayProps {
    canvasTransform: { x: number, y: number, scale: number };
}

export function CursorOverlay({ canvasTransform }: CursorOverlayProps) {
    const { peers } = useCollaboration();

    if (!peers || peers.length === 0) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999, // Ensure cursors are on top
            overflow: 'hidden'
        }}>
            {peers.map((peer: any) => {
                if (!peer.cursor) return null;

                const { x, y } = peer.cursor;
                const { name, color } = peer.user || { name: 'Anonymous', color: '#ccc' };

                // Transform world coordinates to screen coordinates
                // ScreenX = WorldX * scale + transX
                const screenX = x * canvasTransform.scale + canvasTransform.x;
                const screenY = y * canvasTransform.scale + canvasTransform.y;

                return (
                    <div
                        key={peer.clientId}
                        style={{
                            position: 'absolute',
                            transform: `translate(${screenX}px, ${screenY}px)`,
                            transition: 'transform 0.1s linear', // Smooth interpolation
                            willChange: 'transform'
                        }}
                    >
                        <MousePointer2
                            fill={color}
                            color={color}
                            size={24}
                            style={{
                                transform: 'rotate(-15deg)', // Slightly rotated like a real cursor
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            left: '14px',
                            backgroundColor: color,
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '10px 10px 10px 0',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            {name}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
