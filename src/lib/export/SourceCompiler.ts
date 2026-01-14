import { DesignerElement, ElementStyles, ProjectState } from "@/types/designer";

/**
 * SourceCompiler transforms ProjectState into Next.js React Code.
 */
export class SourceCompiler {
    /**
     * Translates an OMNIOS element tree into a JSX string with Tailwind classes.
     */
    static compileElementToJSX(id: string, project: ProjectState, depth: number = 0, eventBindings?: Record<string, string>): string {
        const el = project.elements[id];
        if (!el) return '';

        const indent = '  '.repeat(depth + 2);
        const childIndent = '  '.repeat(depth + 3);

        // 1. Determine Tag and Tailwind Classes
        let Tag = el.tagName || 'div';
        if (!el.tagName) {
            if (el.type === 'section') Tag = 'section';
            if (el.type === 'button') Tag = 'button';
            if (el.type === 'image') Tag = 'img';
            if (el.type === 'text') Tag = 'p';
        }

        const twClasses = this.mapStylesToTailwind(el);
        const classNames = [...(el.classNames || []), ...twClasses].join(' ');

        // 2. Handle Master Components
        if (el.masterComponentId) {
            // Find component name from designSystem
            const component = project.designSystem.components.find(c => c.id === el.masterComponentId);
            const componentName = component ? component.name.replace(/\s+/g, '') : 'Component';
            // Placeholder for component call - in 4.3 we will generate actual files
            return `${indent}<${componentName} className="${classNames}" />`;
        }

        // 3. Handle Children and Special Types
        if (el.type === 'repeater') {
            const collection = project.data.collections.find(c => c.id === el.collectionId);
            const varName = collection ? collection.slug : 'items';
            const childrenJSX = (el.children || [])
                .map(childId => this.compileElementToJSX(childId, project, depth + 1, eventBindings))
                .join('\n');

            return `${indent}{${varName}.map((item) => (\n${childrenJSX}\n${indent}))}`;
        }

        const props = [];
        if (classNames) props.push(`className="${classNames}"`);

        // --- ACTION MAPPING (Batch 4.3) ---
        // Priority: Native Binding > Generic Interpreter loop
        if (eventBindings && eventBindings[id]) {
            props.push(`onClick={${eventBindings[id]}}`);
        } else if (el.action && el.action.type !== 'none') {
            if (el.action.type === 'logic') {
                props.push(`onClick={() => executeBlueprint("${el.action.payload}")}`);
            } else if (el.action.type === 'url') {
                props.push(`onClick={() => window.open("${el.action.payload}", "${el.action.target || '_self'}")}`);
            } else if (el.action.type === 'page') {
                props.push(`onClick={() => window.location.href = "${el.action.payload}"}`);
            }
        }

        if (el.type === 'image') props.push(`src="${el.content}"`);
        if (el.altText) props.push(`alt="${el.altText}"`);

        const children = (el.children || [])
            .map(childId => this.compileElementToJSX(childId, project, depth + 1))
            .join('\n');

        if (children) {
            return `${indent}<${Tag} ${props.join(' ')}>\n${children}\n${indent}</${Tag}>`;
        } else {
            const content = el.content || '';
            // If it's a leaf node with content
            if (content && el.type !== 'image') {
                return `${indent}<${Tag} ${props.join(' ')}>${content}</${Tag}>`;
            }
            return `${indent}<${Tag} ${props.join(' ')} />`;
        }
    }

    /**
     * Maps Designer styles to Tailwind utility classes.
     */
    private static mapStylesToTailwind(el: DesignerElement): string[] {
        const classes: string[] = [];
        const styles = el.styles || {};

        // Layout
        if (styles.display === 'flex') classes.push('flex');
        if (styles.flexDirection === 'column') classes.push('flex-col');
        if (styles.alignItems) classes.push(`items-[${styles.alignItems}]`);
        if (styles.justifyContent) classes.push(`justify-[${styles.justifyContent}]`);
        if (styles.alignSelf) classes.push(`self-[${styles.alignSelf}]`);
        if (styles.flexWrap === 'wrap') classes.push('flex-wrap');

        // Sizing & Spacing
        if (styles.width) classes.push(`w-[${styles.width}]`);
        if (styles.height) classes.push(`h-[${styles.height}]`);
        if (styles.minWidth) classes.push(`min-w-[${styles.minWidth}]`);
        if (styles.maxWidth) classes.push(`max-w-[${styles.maxWidth}]`);
        if (styles.marginTop) classes.push(`mt-[${styles.marginTop}]`);
        if (styles.marginBottom) classes.push(`mb-[${styles.marginBottom}]`);
        if (styles.marginLeft) classes.push(`ml-[${styles.marginLeft}]`);
        if (styles.marginRight) classes.push(`mr-[${styles.marginRight}]`);
        if (styles.padding) classes.push(`p-[${styles.padding}]`);
        if (styles.gap) classes.push(`gap-[${styles.gap}]`);

        // Typography
        if (styles.fontSize) classes.push(`text-[${styles.fontSize}]`);
        if (styles.fontWeight) classes.push(`font-[${styles.fontWeight}]`);
        if (styles.color) classes.push(`text-[${styles.color}]`);
        if (styles.textAlign) classes.push(`text-${styles.textAlign}`);
        if (styles.lineHeight) classes.push(`leading-[${styles.lineHeight}]`);
        if (styles.letterSpacing) classes.push(`tracking-[${styles.letterSpacing}]`);

        // Backgrounds & Borders
        if (styles.backgroundColor) classes.push(`bg-[${styles.backgroundColor}]`);
        if (styles.borderRadius) classes.push(`rounded-[${styles.borderRadius}]`);
        if (styles.borderWidth) classes.push(`border-[${styles.borderWidth}]`);
        if (styles.borderColor) classes.push(`border-[${styles.borderColor}]`);

        // Effects
        if (styles.opacity) classes.push(`opacity-[${styles.opacity}]`);
        if (styles.boxShadow) classes.push(`shadow-[${styles.boxShadow}]`);

        // Responsive
        if (el.tabletStyles) {
            Object.entries(el.tabletStyles).forEach(([k, v]) => {
                if (v) classes.push(`md:custom-tablet-${k}`); // Placeholder for more complex mapping
            });
        }
        if (el.mobileStyles) {
            Object.entries(el.mobileStyles).forEach(([k, v]) => {
                if (v) classes.push(`sm:custom-mobile-${k}`);
            });
        }
        return classes;
    }

    /**
     * Generates a collection of Master Component files.
     */
    static compileMasterComponents(project: ProjectState): Record<string, string> {
        const files: Record<string, string> = {};

        project.designSystem.components.forEach(comp => {
            const componentName = comp.name.replace(/\s+/g, '');
            const body = this.compileElementToJSX(comp.rootElementId, project, 0);

            files[`components/ui/${componentName}.tsx`] = `
import React from 'react';

interface ${componentName}Props {
  className?: string;
  // Dynamic props would be injected here
}

export const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  return (
${body}
  );
};
`.trim();
        });

        return files;
    }
}
