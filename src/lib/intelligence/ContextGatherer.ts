
import { ProjectState, DesignerElement } from '@/types/designer';

export class ContextGatherer {
    /**
     * Minimizes the project state for LLM consumption.
     * Removes purely visual fluff, keeps structure and semantic content.
     */
    static gatherContext(state: ProjectState): any {
        return {
            pageName: state.pages[state.activePageId]?.name || 'Unknown Page',
            tree: this.buildLightweightTree(state.rootElementId, state.elements)
        };
    }

    private static buildLightweightTree(elementId: string, elements: Record<string, DesignerElement>): any {
        const element = elements[elementId];
        if (!element) return null;

        const node: any = {
            type: element.type,
            name: element.name,
            text: element.content || undefined, // Only textual content matters for context
        };

        // Only include "semantic" styles that affect layout structure or theme intent
        if (element.styles) {
            const relevantStyles: any = {};
            if (element.styles.display) relevantStyles.display = element.styles.display;
            if (element.styles.flexDirection) relevantStyles.direction = element.styles.flexDirection;
            if (element.styles.backgroundColor) relevantStyles.bg = element.styles.backgroundColor;
            if (Object.keys(relevantStyles).length > 0) node.styles = relevantStyles;
        }

        if (element.children && element.children.length > 0) {
            node.children = element.children
                .map(childId => this.buildLightweightTree(childId, elements))
                .filter(Boolean);
        }

        return node;
    }
}
