'use server';

import { Project, SyntaxKind, JsxElement, JsxSelfClosingElement, JsxAttribute, JsxExpression } from 'ts-morph';
import { DesignerElement, ElementType, ElementStyles } from '../../types/designer';

// Helper to map tags
function mapTagNameToType(tag: string): ElementType {
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

function parseStyleObject(expr: JsxExpression): ElementStyles {
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

function traverseJsx(node: JsxElement | JsxSelfClosingElement, parentId: string | null, elements: Record<string, DesignerElement>): string {
    const id = `el-${Math.random().toString(36).substr(2, 9)}`;
    const tagName = node.getKind() === SyntaxKind.JsxElement
        ? (node as JsxElement).getOpeningElement().getTagNameNode().getText()
        : (node as JsxSelfClosingElement).getTagNameNode().getText();

    const element: DesignerElement = {
        id,
        type: mapTagNameToType(tagName),
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
                element.props!.className = initializer?.getText().replace(/['"]/g, '');
            } else if (name === 'style') {
                element.styles = parseStyleObject(initializer as JsxExpression);
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
                const childId = traverseJsx(child as any, id, elements);
                element.children!.push(childId);
            }
        });
    }

    elements[id] = element;
    return id;
}

export async function parseComponentAction(code: string): Promise<Record<string, DesignerElement>> {
    const project = new Project({
        useInMemoryFileSystem: true,
        compilerOptions: {
            jsx: 1 // React
        }
    });

    const sourceFile = project.createSourceFile('temp.tsx', code, { overwrite: true });
    const elements: Record<string, DesignerElement> = {};

    // Find the main component
    const func = sourceFile.getFunctions()[0] || sourceFile.getVariableDeclarations()[0]?.getInitializerIfKind(SyntaxKind.ArrowFunction);

    if (!func) throw new Error('No component found in code');

    // Find JSX in the return statement
    const jsx = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement)[0] ||
        sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)[0];

    if (!jsx) throw new Error('No JSX found in component');

    traverseJsx(jsx, null, elements);

    return elements;
}
