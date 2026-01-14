import { DesignerElement, ProjectState } from "@/types/designer";

export const ejectElementToCode = (elementId: string, elements: Record<string, DesignerElement>): string => {
    const renderNode = (id: string, depth: number = 0): string => {
        const el = elements[id];
        if (!el) return '';

        const indent = '    '.repeat(depth + 2); // Base indentation inside component body
        const childIndent = '    '.repeat(depth + 3);

        // Prepare styles
        const styles = { ...el.styles };
        // Remove absolute positioning wrapper logic if necessary, but "custom-code" usually takes over layout.
        // For now, keep styles as is, but maybe strip some internal editor flags.

        const styleString = JSON.stringify(styles).replace(/"([^"]+)":/g, '$1:');

        // Determine Tag
        let Tag = el.tagName || 'div';
        if (!el.tagName) {
            if (el.type === 'section') Tag = 'section';
            if (el.type === 'button') Tag = 'button';
            if (el.type === 'image') Tag = 'img';
            if (el.type === 'text') Tag = 'p'; // Default to p or h2 based on size? simplified for now
        }

        const propsString = `style={${styleString}}`;

        // Handle Children
        const children = el.children || [];
        const childrenCode = children.map(childId => renderNode(childId, depth + 1)).join('\n');

        // Content
        if (el.type === 'text') {
            return `${indent}<${Tag} ${propsString}>${el.content}</${Tag}>`;
        }
        if (el.type === 'image') {
            return `${indent}<${Tag} src="${el.content}" ${propsString} />`;
        }

        // Handling nested 'custom-code' elements?? 
        // If we eject a tree that ALREADY has custom code, we should preserve it?
        // That's tricky. For now, we assume we are ejecting standard elements.

        if (children.length > 0) {
            return `${indent}<${Tag} ${propsString}>\n${childrenCode}\n${indent}</${Tag}>`;
        } else {
            return `${indent}<${Tag} ${propsString} />`;
        }
    };

    // Generate the full Component String
    const componentBody = renderNode(elementId);

    // We wrap it in a standard functional component structure
    // that the CustomCodeBox expects (or is compatible with our default template)
    return `
// Ejected from OMNIOS Visual Element
// You can now edit this code freely.

return (props) => {
    return (
${componentBody}
    );
};
    `.trim();
};
