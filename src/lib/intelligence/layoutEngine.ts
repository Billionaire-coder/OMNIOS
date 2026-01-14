import { DesignerElement } from '@/types/designer';

/**
 * Cleanup Layout Intelligence
 * Converts elements in "freedom" mode (absolute) into clean "safety" structures (Flex/Grid).
 */
export function cleanupLayout(container: DesignerElement, children: DesignerElement[]): Record<string, DesignerElement> {
    if (!children.length) return {};

    const updates: Record<string, DesignerElement> = {};
    const threshold = 20; // px threshold for grouping into rows

    // 1. Sort children by top position
    const sorted = [...children].sort((a, b) => {
        const topA = parseInt(String(a.styles?.top || '0'));
        const topB = parseInt(String(b.styles?.top || '0'));
        return topA - topB;
    });

    // 2. Group into rows
    const rows: DesignerElement[][] = [];
    let currentRow: DesignerElement[] = [];
    let lastTop = -Infinity;

    sorted.forEach(el => {
        const top = parseInt(String(el.styles?.top || '0'));
        if (top > lastTop + threshold) {
            if (currentRow.length > 0) rows.push(currentRow);
            currentRow = [el];
            lastTop = top;
        } else {
            currentRow.push(el);
        }
    });
    if (currentRow.length > 0) rows.push(currentRow);

    // 3. Transformation Strategy:
    // If we have rows, we use Flex Column for the container.
    // Each row becomes a Flex Row (if multiple items) or a direct child.
    // For now, let's keep it simple: Convert all to relative (safety) and stack them.
    // "Intelligence" part: If multiple items in a row, suggest a Grid or Row.

    // Update container to be a Flex Column with proper gap
    updates[container.id] = {
        ...container,
        layoutMode: 'safety',
        styles: {
            ...container.styles,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'stretch',
            padding: '40px',
            position: 'relative' // Ensure it's not absolute if it was
        }
    };

    // Update all children to safety mode
    children.forEach(el => {
        updates[el.id] = {
            ...el,
            layoutMode: 'safety',
            styles: {
                ...el.styles,
                position: 'relative',
                top: 'auto',
                left: 'auto',
                width: String(el.styles?.width || '').includes('%') ? el.styles?.width : '100%', // Assume full width for rows
                height: 'auto'
            }
        };

        // If it's part of a multi-item row, we might need more complex nesting.
        // For Batch 7.2 MVP, we focus on the basic "Cleanup" from absolute to relative stack.
    });

    return updates;
}
/**
 * Neural Layout Reconstruction
 * Converts a flat array of absolute elements into a nested, responsive Flexbox structure.
 */
export function reconstructFromAbsolute(
    containerId: string,
    allElements: Record<string, DesignerElement>
): Record<string, DesignerElement> {
    const parent = allElements[containerId];
    if (!parent) return {};

    const children = Object.values(allElements).filter(el => el.parentId === containerId);
    if (!children.length) return {};

    const updates: Record<string, DesignerElement> = {};
    const threshold = 20; // px threshold for row grouping

    // 1. Sort by top position
    const sorted = [...children].sort((a, b) => {
        const topA = parseInt(String(a.styles?.top || '0'));
        const topB = parseInt(String(b.styles?.top || '0'));
        return topA - topB;
    });

    // 2. Group into Rows
    const rows: DesignerElement[][] = [];
    let currentRow: DesignerElement[] = [];
    let lastTop = -Infinity;

    sorted.forEach(el => {
        const top = parseInt(String(el.styles?.top || '0'));
        if (top > lastTop + threshold) {
            if (currentRow.length > 0) rows.push(currentRow);
            currentRow = [el];
            lastTop = top;
        } else {
            currentRow.push(el);
            // Update lastTop to the max bottom of the row if desired, 
            // but for simple grouping, top-alignment is usually enough.
        }
    });
    if (currentRow.length > 0) rows.push(currentRow);

    // 3. Process each row
    const rowIds: string[] = [];

    rows.forEach((row, index) => {
        if (row.length === 1) {
            // Simple direct child
            const el = row[0];
            rowIds.push(el.id);
            updates[el.id] = {
                ...el,
                layoutMode: 'safety',
                styles: {
                    ...el.styles,
                    position: 'relative',
                    top: 'auto',
                    left: 'auto',
                    width: el.styles?.width || '100%'
                }
            };
        } else {
            // Complex Row: Create a nested wrapper
            const rowWrapperId = `row-${containerId}-${index}`;
            rowIds.push(rowWrapperId);

            // Sort row items by left position
            const sortedRow = [...row].sort((a, b) => {
                const leftA = parseInt(String(a.styles?.left || '0'));
                const leftB = parseInt(String(b.styles?.left || '0'));
                return leftA - leftB;
            });

            updates[rowWrapperId] = {
                id: rowWrapperId,
                type: 'container',
                name: 'Auto Row',
                parentId: containerId,
                layoutMode: 'safety',
                children: sortedRow.map(el => el.id),
                styles: {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '20px',
                    width: '100%',
                    position: 'relative'
                }
            };

            sortedRow.forEach(el => {
                updates[el.id] = {
                    ...el,
                    parentId: rowWrapperId,
                    layoutMode: 'safety',
                    styles: {
                        ...el.styles,
                        position: 'relative',
                        top: 'auto',
                        left: 'auto',
                        width: el.styles?.width || 'auto'
                    }
                };
            });
        }
    });

    // 4. Update Main Container
    updates[containerId] = {
        ...parent,
        layoutMode: 'safety',
        children: rowIds,
        styles: {
            ...parent.styles,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative'
        }
    };

    // ... existing Flex logic above ...
    return updates;
}

/**
 * Intelligent Grid Detection
 * Analyzes children positions to see if they form an implicit grid (e.g. 3 columns aligned).
 */
export function detectGridPattern(children: DesignerElement[]): { isGrid: boolean, cols: number, rows: number, gap: number } {
    if (children.length < 2) return { isGrid: false, cols: 0, rows: 0, gap: 0 };

    // 1. Histograms for X and Y starts
    const xStarts = new Set<number>();
    const yStarts = new Set<number>();

    children.forEach(el => {
        xStarts.add(parseInt(String(el.styles?.left || 0)));
        yStarts.add(parseInt(String(el.styles?.top || 0)));
    });

    const cols = xStarts.size;
    const rows = yStarts.size;

    // Simple heuristic: If we have multiple rows and cols, and total items ~= rows * cols
    if (cols > 1 && rows > 1 && Math.abs((cols * rows) - children.length) <= 1) {
        // It's likely a grid
        return { isGrid: true, cols, rows, gap: 20 }; // default gap
    }

    return { isGrid: false, cols: 0, rows: 0, gap: 0 };
}

/**
 * Converts a container to CSS Grid based on absolute positions of children.
 */
export function convertToGrid(container: DesignerElement, children: DesignerElement[]): Record<string, DesignerElement> {
    const analysis = detectGridPattern(children);
    if (!analysis.isGrid) return cleanupLayout(container, children); // Fallback to Flex

    const updates: Record<string, DesignerElement> = {};

    // 1. Update Container
    updates[container.id] = {
        ...container,
        layoutMode: 'safety',
        styles: {
            ...container.styles,
            display: 'grid',
            gridTemplateColumns: `repeat(${analysis.cols}, 1fr)`,
            gap: `${analysis.gap}px`,
            position: 'relative',
            padding: '20px'
        }
    };

    // 2. Sort children (Row-major order: Top-Left to Bottom-Right)
    const sorted = [...children].sort((a, b) => {
        const topA = parseInt(String(a.styles?.top || 0));
        const topB = parseInt(String(b.styles?.top || 0));
        if (Math.abs(topA - topB) > 10) return topA - topB;

        const leftA = parseInt(String(a.styles?.left || 0));
        const leftB = parseInt(String(b.styles?.left || 0));
        return leftA - leftB;
    });

    // 3. Update Children
    sorted.forEach(el => {
        updates[el.id] = {
            ...el,
            layoutMode: 'safety',
            styles: {
                ...el.styles,
                position: 'relative',
                top: 'auto',
                left: 'auto',
                width: '100%',
                height: 'auto'
            }
        };
    });

    return updates;
}
