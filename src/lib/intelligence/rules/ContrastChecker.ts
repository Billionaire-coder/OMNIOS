import { DesignIssue } from '@/types/intelligence';
import { DesignerElement } from '@/types/designer';

function getLuminance(hex: string): number {
    try {
        const rgb = hexToRgb(hex);
        const rs = rgb.r / 255;
        const gs = rgb.g / 255;
        const bs = rgb.b / 255;
        const r = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
        const g = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
        const b = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    } catch (e) {
        return 0; // Fallback
    }
}

function hexToRgb(hex: string) {
    if (!hex) return { r: 0, g: 0, b: 0 };
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function getContrastRatio(l1: number, l2: number): number {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

export const ContrastChecker = {
    check: (element: DesignerElement): DesignIssue | null => {
        if (element.type !== 'text' && element.type !== 'button') return null;

        // Simplified check: assume white background if not set
        const textColor = element.styles?.color || '#000000';
        const bgColor = element.styles?.backgroundColor || '#ffffff';

        // Ignore transparent backgrounds for now to avoid false positives
        if (bgColor === 'transparent') return null;

        const l1 = getLuminance(textColor);
        const l2 = getLuminance(bgColor);
        const ratio = getContrastRatio(l1, l2);

        if (ratio < 4.5) {
            return {
                id: `contrast-${element.id}`,
                type: 'accessibility',
                severity: ratio < 3 ? 'critical' : 'warning',
                message: `Low contrast ratio (${ratio.toFixed(2)}:1)`,
                elementId: element.id,
                description: 'The text contrast is too low.',
                metadata: { ratio, textColor, bgColor }
            };
        }
        return null;
    }
};
