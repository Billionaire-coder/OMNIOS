import { DesignerElement, ElementStyles } from '@/types/designer';

export interface ArchitectPattern {
    name: string;
    description: string;
    apply: (containerId: string, children: DesignerElement[]) => Record<string, Partial<DesignerElement>>;
}

export const architectPatterns: Record<string, ArchitectPattern> = {
    'bento-grid': {
        name: 'Bento Grid',
        description: 'Rebuilds the section using a modern, asymmetrical grid layout.',
        apply: (containerId, children) => {
            const updates: Record<string, Partial<DesignerElement>> = {};

            // Container update
            updates[containerId] = {
                styles: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gridAutoRows: 'minmax(200px, auto)',
                    gap: '16px',
                    padding: '40px'
                }
            };

            // Map children to bento spans
            // Simple rule: first child is large, others vary
            children.forEach((child, i) => {
                let gridSpan = { col: 'span 2', row: 'span 2' };
                if (i === 1) gridSpan = { col: 'span 2', row: 'span 1' };
                if (i === 2) gridSpan = { col: 'span 1', row: 'span 1' };
                if (i === 3) gridSpan = { col: 'span 1', row: 'span 1' };
                if (i >= 4) gridSpan = { col: 'span 1', row: 'span 1' };

                updates[child.id] = {
                    styles: {
                        ...child.styles,
                        gridColumn: gridSpan.col,
                        gridRow: gridSpan.row,
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        top: '0',
                        left: '0'
                    }
                };
            });

            return updates;
        }
    },
    'split-screen': {
        name: 'Split Screen',
        description: 'Dividers the section into two equal columns.',
        apply: (containerId, children) => {
            const updates: Record<string, Partial<DesignerElement>> = {};

            updates[containerId] = {
                styles: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0',
                    padding: '0',
                    minHeight: '80vh'
                }
            };

            // Group first half and second half? 
            // Simple: alternate children or just stack in two cols
            children.forEach((child, i) => {
                updates[child.id] = {
                    styles: {
                        ...child.styles,
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        top: '0',
                        left: '0',
                        padding: '40px'
                    }
                };
            });

            return updates;
        }
    }
};
