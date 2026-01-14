import { DesignIssue } from '@/types/intelligence';
import { DesignerElement } from '@/types/designer';

export const LayoutOverflowChecker = {
    check: (element: DesignerElement): DesignIssue | null => {
        // Only relevant context-aware checking can be done if we know the viewport.
        // For now, we assume mobile viewport (375px) check for elements with fixed width.

        const width = element.styles?.width;

        if (typeof width === 'string' && width.endsWith('px')) {
            const pxVal = parseInt(width);
            if (pxVal > 375) {
                return {
                    id: `overflow-${element.id}`,
                    type: 'responsive',
                    severity: 'critical',
                    message: 'Content overflow on mobile',
                    elementId: element.id,
                    description: `Element width (${pxVal}px) exceeds mobile viewport (375px).`,
                    metadata: { fixType: 'auto-width' }
                };
            }
        }

        return null;
    }
};
