import { DesignerElement, ElementStyles } from '@/types/designer';
import { ReactNodeAST, ImportDefinition } from './ast';
import { ProjectState } from '@/types/designer';
import { StyleTranslator } from './styleTranslator';

/**
 * The Transformer
 * Converts OMNIOS "Designer Elements" into Generic React AST.
 * This is the bridge between "No-Code" and "Code".
 */
export class ASTTransformer {
    private state: ProjectState;
    private elementMap: Record<string, DesignerElement>;

    constructor(state: ProjectState) {
        this.state = state;
        this.elementMap = state.elements;
    }

    public generatePageAST(rootId: string): ReactNodeAST {
        const root = this.elementMap[rootId];
        if (!root) throw new Error(`Root element ${rootId} not found`);

        return this.mapElementToAST(root);
    }

    private mapElementToAST(element: DesignerElement): ReactNodeAST {
        // 1. Determine Tag Name
        const tagName = this.getTagName(element);

        // 2. Resolve Styles (Taffy/Inline -> Tailwind/Style Object)
        const translator = new StyleTranslator();
        const { className, inline } = translator.translate(
            element.styles || {},
            {
                mobile: element.mobileStyles,
                tablet: element.tabletStyles,
                hover: element.hoverStyles,
                active: element.activeStyles
            }
        );

        // 3. Map Children recursively
        const children = (element.children || [])
            .map(childId => this.elementMap[childId])
            .filter(Boolean) // Filter nulls
            .map(child => this.mapElementToAST(child));

        // 4. Handle Text Content
        if (element.content && typeof element.content === 'string') {
            children.push({
                type: 'text',
                props: { value: element.content },
                children: []
            });
        }

        // 5. Construct AST Node
        return {
            type: 'element',
            tagName: tagName,
            props: {
                ...this.extractProps(element),
                id: element.id // Keep ID for debugging, maybe remove for prod
            },
            className: className,
            style: inline,
            children: children,
            imports: this.getImportsForElement(element)
        };
    }

    private getTagName(element: DesignerElement): string {
        switch (element.type) {
            case 'container': return 'div';
            case 'text': return 'p';
            case 'button': return 'button';
            case 'image': return 'img';
            case 'video': return 'video';
            case 'input': return 'input';
            // Add component mappings here
            default: return 'div';
        }
    }

    private extractProps(element: DesignerElement): Record<string, any> {
        const props: Record<string, any> = {};

        // Image Special
        if (element.type === 'image') {
            if (element.media?.src) props.src = element.media.src;
            props.alt = element.altText || 'Image';
        }

        // Links
        if (element.action?.type === 'url') {
            props.onClick = `() => router.push('${element.action.payload}')`;
        }

        return props;
    }

    private getImportsForElement(element: DesignerElement): ImportDefinition[] {
        const imports: ImportDefinition[] = [];

        // If we use Lucide icons, add them
        if (element.type === 'icon' && element.iconName) {
            imports.push({
                module: 'lucide-react',
                namedImports: [element.iconName]
            });
        }

        return imports;
    }

    private cleanupStyles(styles: ElementStyles): Record<string, any> {
        // Remove internal editor keys if any
        const clean = { ...styles };
        return clean;
    }
}
