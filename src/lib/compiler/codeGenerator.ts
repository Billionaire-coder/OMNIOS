import { DesignerElement, ElementType } from '../../types/designer';

function mapTypeToTagName(type: ElementType): string {
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

function renderElement(element: DesignerElement, elements: Record<string, DesignerElement>, indent: number): string {
    const spaces = ' '.repeat(indent);
    const tag = element.tagName || mapTypeToTagName(element.type);
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
        .map(child => renderElement(child, elements, indent + 4))
        .join('\n');

    return `${spaces}<${tag}${attrString}>\n${childrenJsx}\n${spaces}</${tag}>`;
}

export function generateCode(rootId: string, elements: Record<string, DesignerElement>): string {
    const root = elements[rootId];
    if (!root) return '';

    const jsx = renderElement(root, elements, 2);

    return `
import React from 'react';

export const GeneratedComponent = () => {
    return (
${jsx}
    );
};
`.trim();
}
