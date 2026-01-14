import { ElementStyles } from '@/types/designer';

export class StyleTranslator {

    /**
     * Translates base styles + variants (responsive/state) into a single Tailwind className string.
     * Also returns 'inline' styles for anything that can't be mapped to utilities.
     */
    public translate(
        base: ElementStyles,
        variants: {
            tablet?: ElementStyles,
            mobile?: ElementStyles,
            hover?: ElementStyles,
            active?: ElementStyles
        } = {}
    ): { className: string, inline: Record<string, string | number> } {
        const classes: Set<string> = new Set();
        const inline: Record<string, string | number> = {};

        // 1. Base Styles (Mobile First approach usually implies Base is Mobile, but in OMNIOS Base is potentially Desktop)
        // OMNIOS logic: Base = Desktop. Tablet = <1024. Mobile = <768.
        // Tailwind logic: Base = Mobile. sm = Tablet. md = Desktop.
        // DIRECTION REVERSAL NEEDED:
        // OMNIOS Desktop -> Tailwind 'lg:' or 'xl:'? 
        // Actually, simplest mapping for now:
        // Base -> Tailwind Base (assuming mobile-first is NOT strictly followed by OMNIOS users, which might be an issue).
        // Let's assume OMNIOS "Base" applies everywhere unless overridden.

        // Processing Base
        this.processStyles(base, '', classes, inline);

        // Processing Variants
        if (variants.mobile) this.processStyles(variants.mobile, 'sm:', classes, null); // OMNIOS Mobile -> Tailwind sm (Small Screen)
        if (variants.tablet) this.processStyles(variants.tablet, 'md:', classes, null); // OMNIOS Tablet -> Tailwind md (Medium Screen)
        if (variants.hover) this.processStyles(variants.hover, 'hover:', classes, null);
        if (variants.active) this.processStyles(variants.active, 'active:', classes, null);

        return {
            className: Array.from(classes).join(' '),
            inline
        };
    }

    private processStyles(
        styles: ElementStyles,
        prefix: string,
        classes: Set<string>,
        inline: Record<string, string | number> | null
    ) {
        for (const [key, value] of Object.entries(styles)) {
            const tailwindClass = this.mapPropertyToTailwind(key, String(value));
            if (tailwindClass) {
                classes.add(prefix + tailwindClass);
            } else if (prefix === '' && inline) {
                // Only add to inline if it's base style (variants can't easily be inlined without style tag hacks)
                inline[key] = value;
            }
        }
    }

    private mapPropertyToTailwind(key: string, value: string): string | null {
        // Layout
        if (key === 'display') {
            if (value === 'flex') return 'flex';
            if (value === 'grid') return 'grid';
            if (value === 'block') return 'block';
            if (value === 'none') return 'hidden';
        }
        if (key === 'flexDirection') {
            if (value === 'row') return 'flex-row';
            if (value === 'column') return 'flex-col';
        }
        if (key === 'justifyContent') {
            if (value === 'center') return 'justify-center';
            if (value === 'flex-start' || value === 'start') return 'justify-start';
            if (value === 'flex-end' || value === 'end') return 'justify-end';
            if (value === 'space-between') return 'justify-between';
        }
        if (key === 'alignItems') {
            if (value === 'center') return 'items-center';
            if (value === 'flex-start') return 'items-start';
            if (value === 'flex-end') return 'items-end';
        }
        if (key === 'gap') {
            // Check for standard spacing values
            const num = parseInt(value);
            if (!isNaN(num)) {
                return `gap-${Math.floor(num / 4)}`; // Tailwind uses 1 = 4px usually
            }
        }

        // Sizing
        if (key === 'width') {
            if (value === '100%') return 'w-full';
            if (value === '100vw') return 'w-screen';
        }
        if (key === 'height') {
            if (value === '100%') return 'h-full';
            if (value === '100vh') return 'h-screen';
        }

        // Colors (Simplified mapping)
        if (key === 'backgroundColor') {
            if (value === 'black') return 'bg-black';
            if (value === 'white') return 'bg-white';
            if (value === 'transparent') return 'bg-transparent';
            // Complex colors go to inline for now
        }

        // Typography
        if (key === 'textAlign') {
            if (value === 'center') return 'text-center';
            if (value === 'left') return 'text-left';
            if (value === 'right') return 'text-right';
        }
        if (key === 'fontWeight') {
            if (value === 'bold' || value === '700') return 'font-bold';
            if (value === 'normal' || value === '400') return 'font-normal';
        }

        return null;
    }
}
