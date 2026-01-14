import { DesignerElement, ElementStyles } from "@/types/designer";

interface Rect {
    id: string;
    left: number;
    top: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
}

export function convertFreedomToSafety(
    containerId: string,
    elements: Record<string, DesignerElement>
): { updatedElements: Record<string, DesignerElement> } {
    const updatedElements = { ...elements };
    const container = elements[containerId];
    if (!container) return { updatedElements };

    const children = Object.values(elements).filter(el => el.parentId === containerId);
    if (children.length === 0) return { updatedElements };

    // 1. Convert children to rects
    const rects: Rect[] = children.map(el => {
        const styles = el.styles || {};
        const left = parseInt(String(styles.left || '0'));
        const top = parseInt(String(styles.top || '0'));
        const width = parseInt(String(styles.width || '100'));
        const height = parseInt(String(styles.height || '100'));
        return {
            id: el.id,
            left,
            top,
            width,
            height,
            right: left + width,
            bottom: top + height
        };
    });

    // 2. Determine Primary Axis
    const sortedY = [...rects].sort((a, b) => a.top - b.top);
    const sortedX = [...rects].sort((a, b) => a.left - b.left);

    // Heuristic: Check for overlap on axis
    let verticalOverlapCount = 0;
    for (let i = 0; i < sortedY.length - 1; i++) {
        const r1 = sortedY[i];
        const r2 = sortedY[i + 1];
        if (r1.bottom > r2.top + 10) verticalOverlapCount++; // Small buffer
    }

    let horizontalOverlapCount = 0;
    for (let i = 0; i < sortedX.length - 1; i++) {
        const r1 = sortedX[i];
        const r2 = sortedX[i + 1];
        if (r1.right > r2.left + 10) horizontalOverlapCount++;
    }

    let isColumn = horizontalOverlapCount < verticalOverlapCount;

    // 3. Determine Alignment
    let alignItems = 'center';
    if (isColumn) {
        // If lefts are mostly aligned
        const variance = sortedY.reduce((acc, curr) => acc + Math.abs(curr.left - sortedY[0].left), 0) / sortedY.length;
        if (variance < 10) alignItems = 'flex-start';
        else {
            const rightVariance = sortedY.reduce((acc, curr) => acc + Math.abs(curr.right - sortedY[0].right), 0) / sortedY.length;
            if (rightVariance < 10) alignItems = 'flex-end';
        }
    } else {
        // If tops are mostly aligned
        const variance = sortedX.reduce((acc, curr) => acc + Math.abs(curr.top - sortedX[0].top), 0) / sortedX.length;
        if (variance < 10) alignItems = 'flex-start';
        else {
            const bottomVariance = sortedX.reduce((acc, curr) => acc + Math.abs(curr.bottom - sortedX[0].bottom), 0) / sortedX.length;
            if (bottomVariance < 10) alignItems = 'flex-end';
        }
    }

    // 4. Calculate Gap
    let gap = 20;
    const sortedList = isColumn ? sortedY : sortedX;
    if (sortedList.length >= 2) {
        const gaps = [];
        for (let i = 0; i < sortedList.length - 1; i++) {
            const d = isColumn ? (sortedList[i + 1].top - sortedList[i].bottom) : (sortedList[i + 1].left - sortedList[i].right);
            gaps.push(Math.max(0, d));
        }
        gap = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }

    // 5. Apply Flex styles to container
    updatedElements[containerId] = {
        ...container,
        layoutMode: 'safety',
        styles: {
            ...container.styles,
            display: 'flex',
            flexDirection: isColumn ? 'column' : 'row',
            alignItems: alignItems as any,
            justifyContent: 'flex-start',
            gap: `${gap}px`,
            padding: '40px',
            position: container.styles?.position || 'relative'
        }
    };

    // 6. Update Children
    const sortedIds = sortedList.map(r => r.id);
    updatedElements[containerId].children = sortedIds;

    for (const child of children) {
        const { left, top, ...cleanStyles } = child.styles || {};
        updatedElements[child.id] = {
            ...child,
            layoutMode: 'safety',
            styles: {
                ...cleanStyles,
                width: child.styles?.width || 'auto',
                height: child.styles?.height || 'auto',
                position: 'relative' // Reset from absolute
            }
        };
    }

    return { updatedElements };
}

export function guessIntent(
    draggedId: string,
    targetId: string,
    elements: Record<string, DesignerElement>
): 'wrap-col' | 'wrap-row' | 'none' {
    const dragged = elements[draggedId];
    const target = elements[targetId];
    if (!dragged || !target) return 'none';

    const dStyles = dragged.styles || {};
    const tStyles = target.styles || {};

    const dRect = {
        left: parseInt(String(dStyles.left || '0')),
        top: parseInt(String(dStyles.top || '0')),
        width: parseInt(String(dStyles.width || '100')),
        height: parseInt(String(dStyles.height || '100'))
    };

    const tRect = {
        left: parseInt(String(tStyles.left || '0')),
        top: parseInt(String(tStyles.top || '0')),
        width: parseInt(String(tStyles.width || '100')),
        height: parseInt(String(tStyles.height || '100')),
        right: parseInt(String(tStyles.left || '0')) + parseInt(String(tStyles.width || '100')),
        bottom: parseInt(String(tStyles.top || '0')) + parseInt(String(tStyles.height || '100'))
    };

    const threshold = 80; // Increased for better magnetic range
    const alignThreshold = 50; // Horizontal/Vertical alignment tolerance

    // 1. Vertical stacking detection (Column Intent)
    const isXAligned = Math.abs(dRect.left - tRect.left) < alignThreshold ||
        Math.abs((dRect.left + dRect.width) - (tRect.left + tRect.width)) < alignThreshold ||
        Math.abs((dRect.left + dRect.width / 2) - (tRect.left + tRect.width / 2)) < alignThreshold;

    if (isXAligned) {
        // Dragged below target
        if (dRect.top > tRect.bottom - 20 && dRect.top < tRect.bottom + threshold) return 'wrap-col';
        // Dragged above target
        if (dRect.top + dRect.height < tRect.top + 20 && dRect.top + dRect.height > tRect.top - threshold) return 'wrap-col';
    }

    // 2. Horizontal stacking detection (Row Intent)
    const isYAligned = Math.abs(dRect.top - tRect.top) < alignThreshold ||
        Math.abs((dRect.top + dRect.height / 2) - (tRect.top + tRect.height / 2)) < alignThreshold;

    if (isYAligned) {
        // Dragged to the right of target
        if (dRect.left > tRect.right - 20 && dRect.left < tRect.right + threshold) return 'wrap-row';
        // Dragged to the left of target
        if (dRect.left + dRect.width < tRect.left + 20 && dRect.left + dRect.width > tRect.left - threshold) return 'wrap-row';
    }

    return 'none';
}

/**
 * Automatically wraps two elements in a parent flex container (Smart Stack),
 * or adds one element to the target's parent if it's already a stack.
 */
export function smartStackElements(
    draggedId: string,
    targetId: string,
    elements: Record<string, DesignerElement>,
    intent: 'wrap-col' | 'wrap-row'
): { updatedElements: Record<string, DesignerElement>, newParentId?: string } {
    const updatedElements = { ...elements };
    const dragged = elements[draggedId];
    const target = elements[targetId];

    if (!dragged || !target) return { updatedElements };

    const targetParent = elements[target.parentId || ''];
    const isTargetAlreadyInStack = targetParent && targetParent.layoutMode === 'safety';

    if (isTargetAlreadyInStack) {
        // Just add to the existing stack
        const children = [...(targetParent.children || [])];
        const targetIndex = children.indexOf(targetId);

        // Find if we should insert before or after
        // This is a simple heuristic based on intent
        const dStyles = dragged.styles || {};
        const tStyles = target.styles || {};
        const isAfter = intent === 'wrap-col'
            ? parseInt(String(dStyles.top || '0')) > parseInt(String(tStyles.top || '0'))
            : parseInt(String(dStyles.left || '0')) > parseInt(String(tStyles.left || '0'));

        if (isAfter) {
            children.splice(targetIndex + 1, 0, draggedId);
        } else {
            children.splice(targetIndex, 0, draggedId);
        }

        updatedElements[targetParent.id] = {
            ...targetParent,
            children
        };

        updatedElements[draggedId] = {
            ...dragged,
            parentId: targetParent.id,
            layoutMode: 'safety',
            styles: {
                ...dragged.styles,
                position: 'relative',
                left: undefined,
                top: undefined,
                width: dragged.styles?.width || 'auto',
                height: dragged.styles?.height || 'auto'
            }
        };

        return { updatedElements };
    } else {
        // Create a NEW Smart Stack (parent container)
        const newParentId = `stack-${Math.random().toString(36).substr(2, 9)}`;
        const containerId = target.parentId;

        const newParent: DesignerElement = {
            id: newParentId,
            type: 'container',
            name: 'Smart Stack',
            parentId: containerId,
            layoutMode: 'safety',
            children: [targetId, draggedId], // Order will be refined by convertFreedomToSafety anyway
            styles: {
                display: 'flex',
                flexDirection: intent === 'wrap-col' ? 'column' : 'row',
                gap: '20px',
                padding: '20px',
                position: 'absolute',
                left: target.styles?.left,
                top: target.styles?.top,
                width: 'auto',
                height: 'auto'
            }
        };

        updatedElements[newParentId] = newParent;

        // Update siblings to point to new parent
        updatedElements[targetId] = {
            ...target,
            parentId: newParentId,
            layoutMode: 'safety',
            styles: {
                ...target.styles,
                position: 'relative',
                left: undefined,
                top: undefined
            }
        };

        updatedElements[draggedId] = {
            ...dragged,
            parentId: newParentId,
            layoutMode: 'safety',
            styles: {
                ...dragged.styles,
                position: 'relative',
                left: undefined,
                top: undefined
            }
        };

        // Update old parent's children list
        if (containerId && updatedElements[containerId]) {
            const oldChildren = (updatedElements[containerId].children || []).filter(id => id !== draggedId && id !== targetId);
            updatedElements[containerId] = {
                ...updatedElements[containerId],
                children: [...oldChildren, newParentId]
            };
        }

        // Run full cleanup on the NEW parent to normalize everything
        const result = convertFreedomToSafety(newParentId, updatedElements);
        return { updatedElements: result.updatedElements, newParentId };
    }
}
