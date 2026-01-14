import { DesignerElement, ElementStyles } from "@/types/designer";

/**
 * AI Visual Polish Engine
 * Analyzes an element's color and "vibe" to apply professional lighting effects.
 */

// Helper to calculate luminance
const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Helper to darken/lighten color
const adjustColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

export const applyVisualPolish = (element: DesignerElement): Partial<ElementStyles> => {
    const baseColor = element.styles?.backgroundColor || '#222222';

    // Check if it's a token reference
    const isToken = baseColor.startsWith('var(--token-');
    // If token, we can't easily analyze hex without resolving it. 
    // For MVP, we'll assume a dark-ish default or skip if token is not resolvable.
    // Ideally we'd pass the resolved color, but for now let's apply a generic "Glass" polish if token.

    if (isToken || baseColor === 'transparent') {
        return {
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        };
    }

    const lum = getLuminance(baseColor);
    const isDark = lum < 128;

    if (isDark) {
        // "Neon/Glow" Effect for Dark Elements
        const glowColor = baseColor;
        return {
            boxShadow: `0 0 15px ${adjustColor(glowColor, -20)}, 0 0 30px ${adjustColor(glowColor, -10)}`,
            border: `1px solid ${adjustColor(glowColor, 20)}`
        };
    } else {
        // "Soft/Modern" Shadow for Light Elements
        return {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0,0,0,0.05)'
        };
    }
};

export const apply3DTilt = () => {
    // Returns styles for 3D tilt (to be applied via motion props later)
    return {
        transformStyle: 'preserve-3d',
        perspective: '1000px'
    };
}
