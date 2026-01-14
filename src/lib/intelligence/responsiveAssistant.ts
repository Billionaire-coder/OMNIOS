import { DesignerElement, ElementStyles } from '@/types/designer';

/**
 * Responsive Assistant Intelligence
 * Automatically adjusts font sizes and paddings for mobile/tablet based on best practices.
 */
export function applyResponsiveBestPractices(elements: Record<string, DesignerElement>): Record<string, Partial<DesignerElement>> {
    const updates: Record<string, Partial<DesignerElement>> = {};

    Object.values(elements).forEach(el => {
        const desktopStyles = el.styles || {};
        const mobileUpdates: Partial<ElementStyles> = {};
        const tabletUpdates: Partial<ElementStyles> = {};
        let hasChanges = false;

        // 1. Scale Font Sizes
        if (desktopStyles.fontSize) {
            const fs = parseFloat(String(desktopStyles.fontSize));
            const unit = String(desktopStyles.fontSize).replace(/[0-9.]/g, '') || 'rem';

            if (!isNaN(fs)) {
                // If it's a heading (> 2rem or > 32px), scale it down significantly for mobile
                if ((unit === 'rem' && fs > 2) || (unit === 'px' && fs > 32)) {
                    mobileUpdates.fontSize = `${(fs * 0.7).toFixed(2)}${unit}`;
                    tabletUpdates.fontSize = `${(fs * 0.85).toFixed(2)}${unit}`;
                } else if ((unit === 'rem' && fs > 1.2) || (unit === 'px' && fs > 20)) {
                    mobileUpdates.fontSize = `${(fs * 0.85).toFixed(2)}${unit}`;
                }
                hasChanges = true;
            }
        }

        // 2. Cap Paddings
        const paddingProps = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];
        paddingProps.forEach(prop => {
            const val = String(desktopStyles[prop as keyof ElementStyles] || '');
            if (val) {
                const p = parseFloat(val);
                const unit = val.replace(/[0-9.]/g, '');
                if (unit === 'px' && p > 40) {
                    mobileUpdates[prop as keyof ElementStyles] = '20px';
                    tabletUpdates[prop as keyof ElementStyles] = '32px';
                    hasChanges = true;
                }
            }
        });

        // 3. Stack Flex Containers
        if (desktopStyles.display === 'flex' && (!desktopStyles.flexDirection || desktopStyles.flexDirection === 'row')) {
            mobileUpdates.flexDirection = 'column';
            hasChanges = true;
        }

        if (hasChanges) {
            updates[el.id] = {
                ...el,
                mobileStyles: { ...(el.mobileStyles || {}), ...mobileUpdates },
                tabletStyles: { ...(el.tabletStyles || {}), ...tabletUpdates }
            };
        }
    });

    return updates;
}

import { containerQueryEngine } from './ContainerQueryEngine';

/**
 * Registers "Intrinsic" responsive rules that depend on parent size.
 */
export function applyContainerQueries(elementId: string, domElement: HTMLElement, type: 'card' | 'sidebar' | 'regular') {
    // Define standard queries based on semantic type
    if (type === 'card') {
        containerQueryEngine.setQueries(elementId, [
            { maxWidth: 300, styles: { flexDirection: 'column', fontSize: '14px' } },
            { minWidth: 301, styles: { flexDirection: 'row', fontSize: '16px' } }
        ]);
        containerQueryEngine.observe(elementId, domElement, (id, styles) => {
            // In a real React component, this callback would traversing state or DOM 
            // to apply the 'styles' override. 
            // For OMNIOS, we might dispatch an UPDATE_STYLE command or use a transient style cache.
            console.log(`[ContainerQuery] ${id} matched styles:`, styles);
        });
    }
}
