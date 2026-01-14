import { DesignerElement, ProjectState } from '@/types/designer';

export interface ReactNodeAST {
    type: 'element' | 'text' | 'component' | 'fragment';
    tagName?: string; // e.g. 'div', 'h1', 'button'
    componentName?: string; // e.g. 'Link', 'Image' (Next.js)
    props: Record<string, any>;
    style?: React.CSSProperties;
    className?: string; // For Tailwind classes later
    children?: ReactNodeAST[];
    textContent?: string;
    isSelfClosing?: boolean;
    imports?: ImportDefinition[];
}

export interface ImportDefinition {
    module: string;
    defaultImport?: string;
    namedImports?: string[];
}

/**
 * Transforms a single DesignerElement (and its children) into a ReactNodeAST
 */
export function mapElementToAST(
    elementId: string,
    state: ProjectState,
    depth: number = 0
): ReactNodeAST | null {
    const element = state.elements[elementId];
    if (!element) return null;

    // Base Props
    const props: Record<string, any> = {
        id: element.id, // Good for debugging or key props
    };

    // Style Transformation (Basic Pass)
    const style: React.CSSProperties = { ...element.styles };

    // Safety Mode cleanup: Remove absolute positioning for clean export if in safety mode
    if (element.layoutMode === 'safety') {
        delete (style as any).position;
        delete (style as any).left;
        delete (style as any).top;
    }

    // Children Recursion
    const childrenAST: ReactNodeAST[] = (element.children || [])
        .map(childId => mapElementToAST(childId, state, depth + 1))
        .filter((child): child is ReactNodeAST => child !== null);

    // Initial AST Node
    const ast: ReactNodeAST = {
        type: 'element',
        tagName: 'div', // Default
        props,
        style,
        children: childrenAST
    };

    // Type Specific Mapping
    switch (element.type) {
        case 'box':
        case 'container':
        case 'section':
            ast.tagName = element.type === 'section' ? 'section' : 'div';
            break;

        case 'text':
            // Check heuristic for H1-H6 based on font size or specific props?
            // For now, default to p or h2
            ast.tagName = 'p';
            if (element.content) {
                // If it has content, it might be a text node, but we wrap it in a tag usually
                // Or we append a text child
                if (!ast.children) ast.children = [];
                ast.children.push({
                    type: 'text',
                    textContent: element.content,
                    props: {}
                });
            }
            break;

        case 'button':
            ast.tagName = 'button';
            if (element.content) {
                if (!ast.children) ast.children = [];
                ast.children.push({
                    type: 'text',
                    textContent: element.content,
                    props: {}
                });
            }
            break;

        case 'image':
            ast.type = 'component'; // Next.js Image
            ast.componentName = 'Image';
            ast.isSelfClosing = true;
            ast.props.src = element.content || element.media?.src || '/placeholder.png';
            ast.props.alt = element.media?.alt || 'Image';
            ast.props.width = parseInt(String(element.styles?.width || '500'));
            ast.props.height = parseInt(String(element.styles?.height || '300'));
            break;

        case 'video':
            ast.tagName = 'video';
            ast.props.src = element.media?.src;
            ast.props.controls = element.media?.controls !== false;
            ast.props.autoPlay = element.media?.autoPlay;
            ast.props.loop = element.media?.loop;
            ast.props.muted = element.media?.muted;
            break;

        case 'input':
            ast.tagName = 'input';
            ast.isSelfClosing = true;
            ast.props.placeholder = element.content || 'Enter text...';
            break;

        default:
            ast.tagName = 'div';
            break;
    }

    return ast;
}
