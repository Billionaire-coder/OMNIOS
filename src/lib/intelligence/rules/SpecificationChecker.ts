import { DesignIssue } from '@/types/intelligence';
import { DesignerElement } from '@/types/designer';

export const SpecificationChecker = {
    check: (element: DesignerElement): DesignIssue | null => {
        if (element.type !== 'button') return null;

        const width = parsePixelValue(element.styles?.width);
        const height = parsePixelValue(element.styles?.height);

        if (width !== null && width < 44) {
            return {
                id: `touch-target-w-${element.id}`,
                type: 'accessibility',
                severity: 'warning',
                message: 'Touch target too small',
                elementId: element.id,
                description: `Button width (${width}px) is below the recommended 44px for touch targets.`
            };
        }

        if (height !== null && height < 44) {
            return {
                id: `touch-target-h-${element.id}`,
                type: 'accessibility',
                severity: 'warning',
                message: 'Touch target too small',
                elementId: element.id,
                description: `Button height (${height}px) is below the recommended 44px for touch targets.`
            };
        }

        return null;
    }
};

function parsePixelValue(val: string | number | undefined): number | null {
    if (typeof val === 'number') return val;
    if (!val) return null;
    if (val === 'auto' || val === '100%') return null; // Ignore dynamic sizes for now
    if (typeof val === 'string') {
        const match = val.match(/^(\d+(\.\d+)?)px$/);
        return match ? parseFloat(match[1]) : null;
    }
    return null;
}
