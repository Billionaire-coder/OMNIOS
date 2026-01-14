import { DesignIssue } from '@/types/intelligence';
import { DesignerElement, DesignToken } from '@/types/designer';
import { DesignContext } from '@/types/intelligence';

export const ConsistencyChecker = {
    check: (element: DesignerElement, context: DesignContext): DesignIssue | null => {
        const { tokens } = context;
        if (!tokens || tokens.length === 0) return null;

        // Check Color Consistency
        if (element.styles?.backgroundColor) {
            const bg = element.styles.backgroundColor;
            if (bg.startsWith('#') || bg.startsWith('rgb')) {
                // Find closest color token
                const match = tokens.find(t => t.type === 'color' && t.value === bg);
                if (match) {
                    return {
                        id: `consistency-bg-${element.id}`,
                        type: 'consistency',
                        severity: 'suggestion',
                        message: 'Use Design Token',
                        elementId: element.id,
                        description: `Color '${bg}' matches token '${match.name}'.`,
                        metadata: { fixType: 'use-token', token: match, prop: 'backgroundColor' }
                    };
                }
            }
        }

        return null;
    }
};
