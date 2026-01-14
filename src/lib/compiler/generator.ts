import { ReactNodeAST } from './ast';

/**
 * Generates a full .tsx component string from a Root ReactNodeAST
 */
export function generateComponentCode(componentName: string, ast: ReactNodeAST): string {
    const imports = collectImports(ast);
    const jsx = generateJSX(ast, 2); // Start with indentation

    return `
import React from 'react';
${imports.join('\n')}

export default function ${componentName}() {
  return (
${jsx}
  );
}
`.trim();
}

/**
 * Recursively generates JSX string from AST node
 */
function generateJSX(node: ReactNodeAST, depth: number): string {
    const indent = '  '.repeat(depth);

    // 1. Handle Text Nodes
    if (node.type === 'text') {
        return `${indent}${node.textContent}`;
    }

    // 2. Props String
    const propsParts: string[] = [];

    // Standard Props
    Object.entries(node.props).forEach(([key, value]) => {
        if (key === 'id') return; // Skip internal IDs usually? Or keep for debugging. Let's keep for now but maybe data-id
        if (value === undefined || value === null) return;

        if (typeof value === 'string') {
            propsParts.push(`${key}="${value}"`);
        } else if (typeof value === 'boolean') {
            if (value) propsParts.push(key); // e.g. disabled
            else propsParts.push(`${key}={false}`);
        } else {
            propsParts.push(`${key}={${JSON.stringify(value)}}`);
        }
    });

    // Style Prop
    if (node.style && Object.keys(node.style).length > 0) {
        // We need to pretty-print the style object so it's not one giant line if possible, 
        // but JSON.stringify is safest for now.
        // For production compiler, we would generate a CSS Module or Tailwind class here.
        // For Phase 6.1/6.2 MVP, we use inline styles.
        propsParts.push(`style={${JSON.stringify(node.style)}}`);
    }

    const propsStr = propsParts.length > 0 ? ' ' + propsParts.join(' ') : '';
    const Tag = node.tagName || node.componentName || 'div';

    // 3. Self Closing
    if (node.isSelfClosing || (!node.children && !node.textContent)) {
        return `${indent}<${Tag}${propsStr} />`;
    }

    // 4. Children
    if (node.children && node.children.length > 0) {
        const childrenStr = node.children
            .map(child => generateJSX(child, depth + 1))
            .join('\n');

        return `${indent}<${Tag}${propsStr}>\n${childrenStr}\n${indent}</${Tag}>`;
    }

    // 5. Fallback (empty non-self-closing?)
    return `${indent}<${Tag}${propsStr}></${Tag}>`;
}

/**
 * Scans AST for necessary imports (e.g. Next.js Image, Link)
 */
function collectImports(node: ReactNodeAST): string[] {
    const imports = new Set<string>();

    function traverse(n: ReactNodeAST) {
        if (n.componentName === 'Image') {
            imports.add(`import Image from 'next/image';`);
        }
        if (n.componentName === 'Link') {
            imports.add(`import Link from 'next/link';`);
        }

        n.children?.forEach(traverse);
    }

    traverse(node);
    return Array.from(imports);
}
