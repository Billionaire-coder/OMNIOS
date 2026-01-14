import React, { useRef, useState } from 'react';

interface SpacingHandlesProps {
    elementId: string;
    styles: any;
    updateStyles: (id: string, newStyles: any) => void;
}

export function SpacingHandles({ elementId, styles, updateStyles }: SpacingHandlesProps) {
    const [dragInfo, setDragInfo] = useState<{ type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left', value: number } | null>(null);
    const dragRef = useRef<{ type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left', startVal: number, startX: number, startY: number } | null>(null);

    const startDrag = (e: React.MouseEvent, type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left') => {
        e.stopPropagation();
        e.preventDefault();

        let valStr = styles[`${type}${capitalize(side)}`] || styles[type] || '0px';
        const match = valStr.match(/(-?\d+)/);
        const startVal = match ? parseInt(match[0]) : 0;

        dragRef.current = { type, side, startVal, startX: e.clientX, startY: e.clientY };
        setDragInfo({ type, side, value: startVal });

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!dragRef.current) return;
        const { type, side, startVal, startX, startY } = dragRef.current;

        let delta = 0;
        if (type === 'margin') {
            switch (side) {
                case 'top': delta = startY - e.clientY; break;
                case 'bottom': delta = e.clientY - startY; break;
                case 'left': delta = startX - e.clientX; break;
                case 'right': delta = e.clientX - startX; break;
            }
        } else {
            switch (side) {
                case 'top': delta = e.clientY - startY; break;
                case 'bottom': delta = startY - e.clientY; break;
                case 'left': delta = e.clientX - startX; break;
                case 'right': delta = startX - e.clientX; break;
            }
        }

        const newVal = Math.max(0, startVal + delta);
        updateStyles(elementId, { [`${type}${capitalize(side)}`]: `${newVal}px` });
        setDragInfo({ type, side, value: newVal });
    };

    const onMouseUp = () => {
        dragRef.current = null;
        setDragInfo(null);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    const marginColor = 'rgba(255, 153, 0, 0.4)'; // Orange
    const paddingColor = 'rgba(0, 204, 102, 0.4)'; // Green

    const renderHandle = (type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left') => {
        const isHorizontal = side === 'left' || side === 'right';
        const color = type === 'margin' ? '#ff9900' : '#00cc66';

        let positionProps: any = {};
        if (type === 'margin') {
            if (side === 'top') positionProps = { top: '-14px', left: '50%', transform: 'translateX(-50%)' };
            if (side === 'bottom') positionProps = { bottom: '-14px', left: '50%', transform: 'translateX(-50%)' };
            if (side === 'left') positionProps = { left: '-14px', top: '50%', transform: 'translateY(-50%)' };
            if (side === 'right') positionProps = { right: '-14px', top: '50%', transform: 'translateY(-50%)' };
        } else {
            if (side === 'top') positionProps = { top: '4px', left: '50%', transform: 'translateX(-50%)' };
            if (side === 'bottom') positionProps = { bottom: '4px', left: '50%', transform: 'translateX(-50%)' };
            if (side === 'left') positionProps = { left: '4px', top: '50%', transform: 'translateY(-50%)' };
            if (side === 'right') positionProps = { right: '4px', top: '50%', transform: 'translateY(-50%)' };
        }

        return (
            <div
                onMouseDown={(e) => startDrag(e, type, side)}
                style={{
                    position: 'absolute',
                    ...positionProps,
                    width: isHorizontal ? '4px' : '16px',
                    height: isHorizontal ? '16px' : '4px',
                    backgroundColor: color,
                    borderRadius: '2px',
                    cursor: isHorizontal ? 'ew-resize' : 'ns-resize',
                    zIndex: 1005,
                    border: '1px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    transition: 'transform 0.1s ease',
                    transform: `${positionProps.transform} ${dragInfo?.side === side && dragInfo?.type === type ? 'scale(1.2)' : ''}`
                }}
            />
        );
    };

    const renderArea = () => {
        if (!dragInfo) return null;
        const { type, side, value } = dragInfo;
        const color = type === 'margin' ? marginColor : paddingColor;

        let areaStyles: React.CSSProperties = {
            position: 'absolute',
            pointerEvents: 'none',
            backgroundColor: color,
            zIndex: 1000,
            transition: 'none'
        };

        if (type === 'margin') {
            if (side === 'top') areaStyles = { ...areaStyles, bottom: '100%', left: 0, right: 0, height: value };
            if (side === 'bottom') areaStyles = { ...areaStyles, top: '100%', left: 0, right: 0, height: value };
            if (side === 'left') areaStyles = { ...areaStyles, right: '100%', top: 0, bottom: 0, width: value };
            if (side === 'right') areaStyles = { ...areaStyles, left: '100%', top: 0, bottom: 0, width: value };
        } else {
            if (side === 'top') areaStyles = { ...areaStyles, top: 0, left: 0, right: 0, height: value };
            if (side === 'bottom') areaStyles = { ...areaStyles, bottom: 0, left: 0, right: 0, height: value };
            if (side === 'left') areaStyles = { ...areaStyles, left: 0, top: 0, bottom: 0, width: value };
            if (side === 'right') areaStyles = { ...areaStyles, right: 0, top: 0, bottom: 0, width: value };
        }

        return (
            <div style={areaStyles}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontSize: '9px',
                    fontWeight: 'bold'
                }}>
                    {value}px
                </div>
            </div>
        );
    };

    return (
        <>
            {renderArea()}
            {renderHandle('margin', 'top')}
            {renderHandle('margin', 'bottom')}
            {renderHandle('margin', 'left')}
            {renderHandle('margin', 'right')}
            {renderHandle('padding', 'top')}
            {renderHandle('padding', 'bottom')}
            {renderHandle('padding', 'left')}
            {renderHandle('padding', 'right')}
        </>
    );
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
