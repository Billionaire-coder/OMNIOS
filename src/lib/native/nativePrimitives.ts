import { ElementStyles } from "@/types/designer";

/**
 * Mobile Style Mapping
 * Maps standard CSS properties used in OMNIOS to React Native compatible styles.
 */
export const mapToNativeStyles = (styles: ElementStyles): any => {
    const native: any = {};

    // 1. Layout
    if (styles.display === 'flex') {
        native.display = 'flex';
        native.flexDirection = styles.flexDirection || 'column';
    } else {
        // React Native uses Flexbox by default
        native.display = 'flex';
    }

    if (styles.gap) {
        native.gap = parseInt(String(styles.gap)) || 0;
    }

    // 2. Sizing & Spacing
    const parseUnit = (val?: string | number) => {
        if (typeof val === 'number') return val;
        if (!val) return undefined;
        return parseInt(String(val)) || undefined;
    };

    native.width = styles.width === '100%' ? '100%' : parseUnit(styles.width);
    native.height = styles.height === '100%' ? '100%' : parseUnit(styles.height);
    native.padding = parseUnit(styles.padding);
    native.paddingLeft = parseUnit(styles.paddingLeft);
    native.paddingRight = parseUnit(styles.paddingRight);
    native.paddingTop = parseUnit(styles.paddingTop);
    native.paddingBottom = parseUnit(styles.paddingBottom);
    native.margin = parseUnit(styles.margin);

    // 3. Aesthetics
    if (styles.backgroundColor) {
        // Resolve var() if present (future refinement needed for full token resolution)
        native.backgroundColor = styles.backgroundColor.startsWith('var') ? '#000000' : styles.backgroundColor;
    }

    if (styles.borderRadius) {
        native.borderRadius = parseUnit(styles.borderRadius);
    }

    if (styles.border) {
        // Simplified border mapping: "1px solid #000" -> borderTopWidth: 1, etc.
        const match = String(styles.border).match(/(\d+)px/);
        if (match) native.borderWidth = parseInt(match[1]);
        native.borderColor = styles.backgroundColor || '#000000';
    }

    // 4. Typography
    if (styles.color) native.color = styles.color;
    if (styles.fontSize) native.fontSize = parseUnit(styles.fontSize);
    if (styles.fontWeight) native.fontWeight = String(styles.fontWeight);
    if (styles.textAlign) native.textAlign = styles.textAlign;

    return native;
};

export const NATIVE_PRIMITIVES = {
    container: 'View',
    text: 'Text',
    image: 'Image',
    button: 'TouchableOpacity',
    vector: 'Svg'
};
