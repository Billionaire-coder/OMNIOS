import { DesignerElement, ElementStyles, ElementType } from "@/types/designer";
import { reconstructFromAbsolute } from "../intelligence/layoutEngine";

interface FigmaNode {
    id: string;
    name: string;
    type: string;
    children?: FigmaNode[];
    absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
    fills?: any[];
    strokes?: any[];
    effects?: any[];
    characters?: string;
    style?: any;
    layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
    itemSpacing?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    primaryAxisAlignItems?: string;
    counterAxisAlignItems?: string;
}

export class FigmaMapper {
    /**
     * Converts a Figma node tree into a flat record of DesignerElements
     */
    static mapFigmaToOmnios(
        figmaNodes: FigmaNode[],
        parentId: string | null = null
    ): Record<string, DesignerElement> {
        let elements: Record<string, DesignerElement> = {};

        figmaNodes.forEach(node => {
            const mapped = this.mapNode(node, parentId);
            if (mapped) {
                elements[mapped.id] = mapped;
                if (node.children) {
                    const childElements = this.mapFigmaToOmnios(node.children, mapped.id);
                    elements = { ...elements, ...childElements };
                    mapped.children = Object.keys(childElements).filter(id => childElements[id].parentId === mapped.id);

                    // Batch 18.2: Neural Reconstruction for absolute containers
                    if (mapped.layoutMode === 'freedom' && mapped.children.length > 0) {
                        const reconstructed = reconstructFromAbsolute(mapped.id, elements);
                        elements = { ...elements, ...reconstructed };
                    }
                }
            }
        });

        return elements;
    }

    private static mapNode(node: FigmaNode, parentId: string | null): DesignerElement | null {
        const type = this.mapType(node.type);
        if (!type) return null;

        const styles = this.mapStyles(node);

        const element: DesignerElement = {
            id: `figma-${node.id.replace(/:/g, '-')}`,
            type,
            name: node.name,
            parentId,
            styles,
            content: node.characters || '',
            layoutMode: node.layoutMode && node.layoutMode !== 'NONE' ? 'safety' : 'freedom',
            visible: true,
            locked: false
        };

        // Handle auto-layout conversion to Magnetic Flux properties
        if (node.layoutMode && node.layoutMode !== 'NONE') {
            element.styles = {
                ...element.styles,
                display: 'flex',
                flexDirection: node.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
                gap: `${node.itemSpacing || 0}px`,
                paddingLeft: `${node.paddingLeft || 0}px`,
                paddingRight: `${node.paddingRight || 0}px`,
                paddingTop: `${node.paddingTop || 0}px`,
                paddingBottom: `${node.paddingBottom || 0}px`,
                alignItems: this.mapAlign(node.counterAxisAlignItems),
                justifyContent: this.mapAlign(node.primaryAxisAlignItems)
            };
        }

        return element;
    }

    private static mapType(figmaType: string): ElementType | null {
        switch (figmaType) {
            // Mapping Logic: Frame/Group -> container/box, TEXT -> text, RECTANGLE -> box/image
            case 'FRAME':
            case 'GROUP':
            case 'SECTION':
            case 'COMPONENT':
            case 'INSTANCE':
                return 'container';
            case 'TEXT':
                return 'text';
            case 'RECTANGLE':
            case 'ELLIPSE':
                return 'box';
            case 'IMAGE':
                return 'image';
            case 'VECTOR':
                return 'vector';
            default:
                return 'box';
        }
    }

    private static mapStyles(node: FigmaNode): ElementStyles {
        const styles: ElementStyles = {};

        // 1. Positioning (Freedom Mode Default)
        if (node.absoluteBoundingBox) {
            styles.width = `${node.absoluteBoundingBox.width}px`;
            styles.height = `${node.absoluteBoundingBox.height}px`;
            // Note: Parent-relative positioning would be calculated elsewhere or handled by layout solver
            styles.left = `${node.absoluteBoundingBox.x}px`;
            styles.top = `${node.absoluteBoundingBox.y}px`;
        }

        // 2. Fills
        if (node.fills && node.fills.length > 0) {
            const primaryFill = node.fills.find(f => f.type === 'SOLID' && f.visible !== false);
            if (primaryFill) {
                const { r, g, b } = primaryFill.color;
                const a = primaryFill.opacity ?? 1;
                styles.backgroundColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
                if (node.type === 'TEXT') styles.color = styles.backgroundColor;
            }
        }

        // 3. Typography
        if (node.type === 'TEXT' && node.style) {
            styles.fontSize = `${node.style.fontSize}px`;
            styles.fontWeight = node.style.fontWeight;
            styles.fontFamily = node.style.fontFamily;
            styles.textAlign = node.style.textAlignHorizontal?.toLowerCase();
            styles.lineHeight = node.style.lineHeightPx ? `${node.style.lineHeightPx}px` : 'normal';
        }

        // 4. Effects (Shadows/Blurs)
        if (node.effects && node.effects.length > 0) {
            const shadow = node.effects.find(e => e.type === 'DROP_SHADOW' && e.visible !== false);
            if (shadow) {
                const { r, g, b, a } = shadow.color;
                styles.boxShadow = `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
            }

            const blur = node.effects.find(e => (e.type === 'LAYER_BLUR' || e.type === 'BACKGROUND_BLUR') && e.visible !== false);
            if (blur) {
                styles.filter = `blur(${blur.radius}px)`;
                if (blur.type === 'BACKGROUND_BLUR') styles.backdropFilter = styles.filter;
            }
        }

        return styles;
    }

    private static mapAlign(figmaAlign?: string): string {
        switch (figmaAlign) {
            case 'CENTER': return 'center';
            case 'MIN': return 'flex-start';
            case 'MAX': return 'flex-end';
            case 'SPACE_BETWEEN': return 'space-between';
            default: return 'flex-start';
        }
    }
}
