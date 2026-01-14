import { ElementStyles } from '@/types/designer';

export const RTLEngine = {
    /**
     * Flips CSS properties for RTL layout.
     * @param styles Original LTR styles
     * @param isRTL Whether to apply RTL transformation
     */
    transformStyles: (styles: ElementStyles, isRTL: boolean): ElementStyles => {
        if (!isRTL) return styles;

        const rtlStyles: ElementStyles = { ...styles };

        // 1. Flip Text Align
        if (styles.textAlign === 'left') rtlStyles.textAlign = 'right';
        else if (styles.textAlign === 'right') rtlStyles.textAlign = 'left';

        // 2. Flip Float / Clear
        if (styles.float === 'left') rtlStyles.float = 'right';
        else if (styles.float === 'right') rtlStyles.float = 'left';

        // 3. Flip PADDINGS
        if (styles.paddingLeft !== undefined) {
            rtlStyles.paddingRight = styles.paddingLeft;
            delete rtlStyles.paddingLeft;
        }
        if (styles.paddingRight !== undefined) {
            rtlStyles.paddingLeft = styles.paddingRight;
            delete rtlStyles.paddingRight;
        }

        // 4. Flip MARGINS
        if (styles.marginLeft !== undefined) {
            rtlStyles.marginRight = styles.marginLeft;
            delete rtlStyles.marginLeft;
        }
        if (styles.marginRight !== undefined) {
            rtlStyles.marginLeft = styles.marginRight;
            delete rtlStyles.marginRight;
        }

        // 5. Flip BORDERS
        if (styles.borderLeft !== undefined) {
            rtlStyles.borderRight = styles.borderLeft;
            delete rtlStyles.borderLeft;
        }
        if (styles.borderRight !== undefined) {
            rtlStyles.borderLeft = styles.borderRight;
            delete rtlStyles.borderRight;
        }

        // 6. Flip POSITION (Left/Right)
        // Only if not centered or specific Layout Mode intent? 
        // For 'absolute' positioning, this might break things unless we flip the coordinate system entirely (width - left - elementWidth).
        // Safest approach for MVP: Flip 'left' to 'right' IF 'right' is not set.
        if (styles.position === 'absolute' || styles.position === 'fixed') {
            if (styles.left !== undefined && styles.right === undefined) {
                rtlStyles.right = styles.left;
                delete rtlStyles.left;
            }
            else if (styles.right !== undefined && styles.left === undefined) {
                rtlStyles.left = styles.right;
                delete rtlStyles.right;
            }
        }

        // 7. Flexbox Direction (Handled mostly by 'dir=rtl' on container, but if explicitly set)
        if (styles.flexDirection === 'row') rtlStyles.flexDirection = 'row-reverse';
        else if (styles.flexDirection === 'row-reverse') rtlStyles.flexDirection = 'row';

        return rtlStyles;
    }
};
