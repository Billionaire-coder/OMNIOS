
import { Project, SyntaxKind, JsxElement, JsxSelfClosingElement, JsxAttribute, JsxExpression } from 'ts-morph';
import { DesignerElement, ElementType, ElementStyles } from '../../types/designer';

export class GitSyncEngine {
    private project: Project;

    constructor() {
        this.project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: {
                jsx: 1 // React
            }
        });
    }

    async parseComponent(code: string): Promise<Record<string, DesignerElement>> {
        const sourceFile = this.project.createSourceFile('temp.tsx', code, { overwrite: true });
        const elements: Record<string, DesignerElement> = {};

        // Find the main component (for now, assume first function component)
        const func = sourceFile.getFunctions()[0] || sourceFile.getVariableDeclarations()[0]?.getInitializerIfKind(SyntaxKind.ArrowFunction);

        if (!func) throw new Error('No component found in code');

        // Find JSX in the return statement
        const jsx = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement)[0] ||
            sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)[0];

        if (!jsx) throw new Error('No JSX found in component');

        this.traverseJsx(jsx, null, elements);

        return elements;
    }

    private traverseJsx(node: JsxElement | JsxSelfClosingElement, parentId: string | null, elements: Record<string, DesignerElement>) {
        const id = `el-${Math.random().toString(36).substr(2, 9)}`;
        const tagName = node.getKind() === SyntaxKind.JsxElement
            ? (node as JsxElement).getOpeningElement().getTagNameNode().getText()
            : (node as JsxSelfClosingElement).getTagNameNode().getText();

        const element: DesignerElement = {
            id,
            type: this.mapTagNameToType(tagName),
            tagName: ['div', 'section', 'p', 'span'].includes(tagName.toLowerCase()) ? undefined : tagName.toLowerCase(),
            parentId,
            styles: {},
            props: {},
            children: []
        };

        // Extract Attributes
        const attributes = node.getKind() === SyntaxKind.JsxElement
            ? (node as JsxElement).getOpeningElement().getAttributes()
            : (node as JsxSelfClosingElement).getAttributes();

        attributes.forEach(attr => {
            if (attr.getKind() === SyntaxKind.JsxAttribute) {
                const jAttr = attr.asKindOrThrow(SyntaxKind.JsxAttribute);
                const name = jAttr.getNameNode().getText();
                const initializer = jAttr.getInitializer();

                if (name === 'className') {
                    // Simple Tailwind mapping (conceptually)
                    element.props!.className = initializer?.getText().replace(/['"]/g, '');
                } else if (name === 'style') {
                    // Extract inline styles
                    element.styles = this.parseStyleObject(initializer as JsxExpression);
                } else {
                    element.props![name] = initializer?.getText().replace(/['"]/g, '');
                }
            }
        });

        // Extract Content (for text elements)
        if (node.getKind() === SyntaxKind.JsxElement) {
            const jElement = node as JsxElement;
            const textContent = jElement.getJsxChildren()
                .filter(c => c.getKind() === SyntaxKind.JsxText)
                .map(c => c.getText().trim())
                .join(' ');

            if (textContent) element.content = textContent;

            // Recurse for children
            jElement.getJsxChildren().forEach(child => {
                if (child.getKind() === SyntaxKind.JsxElement || child.getKind() === SyntaxKind.JsxSelfClosingElement) {
                    const childId = this.traverseJsx(child as any, id, elements);
                    element.children!.push(childId);
                }
            });
        }

        elements[id] = element;
        return id;
    }

    private mapTagNameToType(tag: string): ElementType {
        const map: Record<string, ElementType> = {
            'div': 'box',
            'section': 'section',
            'button': 'button',
            'span': 'text',
            'p': 'text',
            'h1': 'text',
            'h2': 'text',
            'img': 'image',
            'input': 'input'
        };
        return map[tag.toLowerCase()] || 'box';
    }

    private parseStyleObject(expr: JsxExpression): ElementStyles {
        if (!expr) return {};
        const obj = expr.getExpressionIfKind(SyntaxKind.ObjectLiteralExpression);
        if (!obj) return {};

        const styles: Record<string, any> = {};
        obj.getProperties().forEach(prop => {
            if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                const pa = prop.asKindOrThrow(SyntaxKind.PropertyAssignment);
                const name = pa.getName();
                const value = pa.getInitializer()?.getText().replace(/['"]/g, '');
                if (value) styles[name] = value;
            }
        });
        return styles;
    }

    // --- FORWARD COMPILER: CANVAS TO CODE ---
    generateCode(rootId: string, elements: Record<string, DesignerElement>): string {
        const root = elements[rootId];
        if (!root) return '';

        const jsx = this.renderElement(root, elements, 2);

        return `
import React from 'react';

export const GeneratedComponent = () => {
    return (
${jsx}
    );
};
`.trim();
    }

    private renderElement(element: DesignerElement, elements: Record<string, DesignerElement>, indent: number): string {
        const spaces = ' '.repeat(indent);
        const tag = element.tagName || this.mapTypeToTagName(element.type);
        const attrs: string[] = [];

        if (element.props?.className) {
            attrs.push(`className="${element.props.className}"`);
        }

        // Add inline styles
        if (element.styles && Object.keys(element.styles).length > 0) {
            const styleString = Object.entries(element.styles)
                .filter(([k]) => k !== 'physics') // Filter internal physics
                .map(([k, v]) => `${k}: '${v}'`)
                .join(', ');
            attrs.push(`style={{ ${styleString} }}`);
        }

        // Add other props
        Object.entries(element.props || {}).forEach(([key, value]) => {
            if (key !== 'className' && typeof value === 'string') {
                attrs.push(`${key}="${value}"`);
            }
        });

        const attrString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

        if (!element.children || element.children.length === 0) {
            if (element.content) {
                return `${spaces}<${tag}${attrString}>${element.content}</${tag}>`;
            }
            return `${spaces}<${tag}${attrString} />`;
        }

        const childrenJsx = element.children
            .map(childId => elements[childId])
            .filter(Boolean)
            .map(child => this.renderElement(child, elements, indent + 4))
            .join('\n');

        return `${spaces}<${tag}${attrString}>\n${childrenJsx}\n${spaces}</${tag}>`;
    }

    private mapTypeToTagName(type: ElementType): string {
        const map: Partial<Record<ElementType, string>> = {
            'box': 'div',
            'section': 'section',
            'button': 'button',
            'text': 'p',
            'image': 'img',
            'input': 'input'
        };
        return map[type] || 'div';
    }
}

export const gitSyncEngine = new GitSyncEngine();
