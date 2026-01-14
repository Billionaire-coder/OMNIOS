import { DesignerElement } from '@/types/designer';

interface Rect {
    id: string;
    left: number;
    top: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
}

export class FluxEngine {
    /**
     * Detects collisions and calculates displacement vectors for neighbors.
     * This makes elements feel "physical" during drag.
     */
    static calculatePhysicalDisplacement(
        draggedId: string,
        x: number,
        y: number,
        width: number,
        height: number,
        siblings: DesignerElement[]
    ): Record<string, { x: number, y: number }> {
        const displacements: Record<string, { x: number, y: number }> = {};
        const draggedRect = {
            left: x,
            top: y,
            right: x + width,
            bottom: y + height
        };

        siblings.forEach(sibling => {
            if (sibling.id === draggedId) return;

            const sLeft = parseInt(String(sibling.styles?.left || '0'));
            const sTop = parseInt(String(sibling.styles?.top || '0'));
            const sWidth = parseInt(String(sibling.styles?.width || '100'));
            const sHeight = parseInt(String(sibling.styles?.height || '100'));

            const sRect = {
                left: sLeft,
                top: sTop,
                right: sLeft + sWidth,
                bottom: sTop + sHeight
            };

            // Check for overlap (Collision)
            const overlapX = Math.max(0, Math.min(draggedRect.right, sRect.right) - Math.max(draggedRect.left, sRect.left));
            const overlapY = Math.max(0, Math.min(draggedRect.bottom, sRect.bottom) - Math.max(draggedRect.top, sRect.top));

            if (overlapX > 0 && overlapY > 0) {
                // Collision detected! 
                // Determine direction of displacement (Push in the direction of minimal overlap)
                if (overlapX < overlapY) {
                    const direction = draggedRect.left < sRect.left ? 1 : -1;
                    displacements[sibling.id] = { x: sLeft + (overlapX * direction), y: sTop };
                } else {
                    const direction = draggedRect.top < sRect.top ? 1 : -1;
                    displacements[sibling.id] = { x: sLeft, y: sTop + (overlapY * direction) };
                }
            }
        });

        return displacements;
    }

    /**
     * Magnetic Buffer: Calculates attraction/repulsion forces for snapping.
     */
    static getMagneticForce(
        x: number,
        y: number,
        w: number,
        h: number,
        siblings: DesignerElement[],
        buffer: number = 24
    ): { x: number, y: number } | null {
        // Implementation for subtle snapping attraction goes here
        // For Phase 21.1, we focus on hard collisions first.
        return null;
    }
}
