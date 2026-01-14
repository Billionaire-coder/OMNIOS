import { DesignerElement, DesignerPage, ProjectState, CollectionItem } from "@/types/designer";

/**
 * StaticCompiler transforms the ProjectState into raw HTML/CSS.
 */
export class StaticCompiler {
    /**
     * Compiles the entire project into a set of files.
     */
    static compileProject(project: ProjectState): Record<string, string> {
        const files: Record<string, string> = {};

        // 1. Generate Global CSS
        files['styles/global.css'] = this.generateCssForProject(project);

        // 2. Generate Static Pages
        Object.values(project.pages).forEach(page => {
            if (page.collectionId) {
                // This is a template page, generate one per item
                const items = project.data.items.filter(item => item.collectionId === page.collectionId);
                items.forEach(item => {
                    const html = this.generateHtmlForPage(page, project, item);
                    const slug = item.values[page.slugField || 'slug'] || item.id;
                    files[`${page.path.replace(':slug', slug)}.html`.replace(/^\//, '')] = html;
                });
            } else {
                // Standard static page
                files[`${page.path === '/' ? 'index' : page.path}.html`.replace(/^\//, '')] = this.generateHtmlForPage(page, project);
            }
        });

        return files;
    }

    /**
     * Generates semantic HTML for a single page.
     */
    static generateHtmlForPage(page: DesignerPage, project: ProjectState, contextItem?: CollectionItem): string {
        const rootElementId = page.rootElementId;
        if (!rootElementId) return '';

        const bodyContent = this.renderElement(rootElementId, project, contextItem);
        const title = page.meta?.title || project.name;
        const description = page.meta?.description || '';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="stylesheet" href="/styles/global.css">
</head>
<body>
    ${bodyContent}
</body>
</html>`;
    }

    /**
     * Recursively renders a DesignerElement to HTML.
     */
    private static renderElement(id: string, project: ProjectState, contextItem?: CollectionItem, depth: number = 0): string {
        const indent = '    '.repeat(depth + 1);
        const el = this.getMergedElement(id, project);
        if (!el) return '';

        // --- HANDLE CUSTOM CODE ---
        if (el.type === 'custom-code' && el.customCode?.code) {
            return `${indent}${el.customCode.code}`;
        }

        // --- HANDLE REPEATERS ---
        if (el.type === 'repeater' && el.collectionId) {
            const items = project.data.items.filter(item => item.collectionId === el.collectionId);
            return items.map(item => {
                return (el.children || [])
                    .map(childId => this.renderElement(childId, project, item, depth))
                    .join('\n');
            }).join('\n');
        }

        // Resolve Content/Props via Bindings
        const content = this.resolveValue(el, 'content', project, contextItem);

        // Determine Tag
        let tag = el.tagName || 'div';
        if (!el.tagName) {
            if (el.type === 'section') tag = 'section';
            if (el.type === 'button') tag = 'button';
            if (el.type === 'image') tag = 'img';
            if (el.type === 'text') tag = 'p';
        }

        // --- STYLES & CLASSES ---
        const classNames = [...(el.classNames || [])];
        const elementClass = `el-${el.id.substring(0, 8)}`;
        classNames.push(elementClass);

        let attributes = `class="${classNames.join(' ')}" data-id="${el.id}"`;

        if (el.type === 'image') {
            const src = contextItem && el.bindings?.['src']
                ? contextItem.values[el.bindings['src']]
                : el.content;
            attributes += ` src="${src}" alt="${el.altText || ''}"`;
            return `${indent}<${tag} ${attributes} />`;
        }

        const children = (el.children || [])
            .map(childId => this.renderElement(childId, project, contextItem, depth + 1))
            .join('\n');

        if (children) {
            return `${indent}<${tag} ${attributes}>\n${children}\n${indent}</${tag}>`;
        }

        return `${indent}<${tag} ${attributes}>${content || ''}</${tag}>`;
    }

    private static getMergedElement(id: string, project: ProjectState): DesignerElement | null {
        const el = project.elements[id];
        if (!el) return null;
        if (!el.masterComponentId) return el;

        const master = project.elements[el.masterComponentId];
        if (!master) return el;

        return {
            ...master,
            ...el,
            id: el.id,
            content: el.overrides?.content ?? master.content,
            styles: { ...master.styles, ...el.styles },
            tabletStyles: { ...master.tabletStyles, ...el.tabletStyles },
            mobileStyles: { ...master.mobileStyles, ...el.mobileStyles },
        };
    }

    /**
     * Resolves a value from bindings if they exist.
     */
    private static resolveValue(el: DesignerElement, prop: string, project: ProjectState, contextItem?: CollectionItem): any {
        if (contextItem && el.bindings?.[prop]) {
            return contextItem.values[el.bindings[prop]] || el.content;
        }
        return el.content;
    }

    /**
     * Compiles all classes and tokens into a minified CSS string.
     */
    static generateCssForProject(project: ProjectState): string {
        let css = '/* OMNIOS Generated CSS */\n';

        // 1. Tokens (CSS Variables)
        css += ':root {\n';
        project.designSystem.tokens.forEach(token => {
            css += `    --${token.name}: ${token.value};\n`;
        });
        css += '}\n\n';

        // 2. Base Reset/Global Styles
        css += 'body { margin: 0; padding: 0; font-family: sans-serif; }\n\n';

        // 3. User Defined Classes
        project.designSystem.classes.forEach(cls => {
            css += this.renderCssRule(`.${cls.name}`, cls.styles);
            if (cls.tabletStyles) css += `@media (max-width: 991px) {\n${this.renderCssRule(`.${cls.name}`, cls.tabletStyles, 1)}\n}\n`;
            if (cls.mobileStyles) css += `@media (max-width: 767px) {\n${this.renderCssRule(`.${cls.name}`, cls.mobileStyles, 1)}\n}\n`;
        });

        // 4. Per-Element Styles (Unique classes)
        Object.values(project.elements).forEach(el => {
            const selector = `.el-${el.id.substring(0, 8)}`;
            if (el.styles) css += this.renderCssRule(selector, el.styles);
            if (el.tabletStyles) css += `@media (max-width: 991px) {\n${this.renderCssRule(selector, el.tabletStyles, 1)}\n}\n`;
            if (el.mobileStyles) css += `@media (max-width: 767px) {\n${this.renderCssRule(selector, el.mobileStyles, 1)}\n}\n`;

            // Interactive States
            if (el.hoverStyles) css += this.renderCssRule(`${selector}:hover`, el.hoverStyles);
            if (el.activeStyles) css += this.renderCssRule(`${selector}:active`, el.activeStyles);
            if (el.focusStyles) css += this.renderCssRule(`${selector}:focus`, el.focusStyles);
        });

        return css;
    }

    private static renderCssRule(selector: string, styles: any, indentLevel: number = 0): string {
        const indent = '    '.repeat(indentLevel);
        const childIndent = '    '.repeat(indentLevel + 1);
        const styleBody = Object.entries(styles)
            .filter(([_, v]) => v !== undefined && v !== '')
            .map(([k, v]) => `${childIndent}${this.camelToKebab(k)}: ${v};`)
            .join('\n');

        if (!styleBody) return '';
        return `${indent}${selector} {\n${styleBody}\n${indent}}\n\n`;
    }

    private static camelToKebab(str: string): string {
        return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    }
}
