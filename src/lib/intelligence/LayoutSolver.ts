import { DesignerElement, ElementStyles } from '@/types/designer';

export class LayoutSolver {
    static solveMobileLayout(element: DesignerElement): ElementStyles {
        const newStyles: ElementStyles = { ...element.styles };

        // 1. Fix Width Overflow
        if (newStyles.width && typeof newStyles.width === 'string' && newStyles.width.endsWith('px')) {
            const pxVal = parseInt(newStyles.width);
            if (pxVal > 375) {
                newStyles.width = '100%';
                newStyles.maxWidth = '100%';
            }
        }

        // 2. Stack Horizontal Layouts
        if (newStyles.display === 'flex' && (!newStyles.flexDirection || newStyles.flexDirection === 'row')) {
            newStyles.flexDirection = 'column';
            newStyles.alignItems = 'stretch';
        }

        // 3. Adjust Padding
        if (newStyles.padding) {
            // Simplify padding for mobile
            newStyles.padding = '16px';
        }

        return newStyles;
    }
}
