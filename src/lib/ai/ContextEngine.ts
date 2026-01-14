import { ProjectState, DesignerElement } from "@/types/designer";

export interface AIContext {
    project: {
        id: string;
        name: string;
        theme: string;
        activePageId: string;
    };
    page: {
        id: string;
        name: string;
        path: string;
        tree: string; // Compressed AST representation
    };
    selection: {
        id: string;
        type: string;
        name?: string;
        content?: string;
        styles: any;
        props: any;
    }[];
}

export class ContextEngine {
    /**
     * Gathers the optimal context for the AI based on the current project state.
     * Uses a tiered approach: Global Summary -> Compressed Page Tree -> Deep Selection Details.
     */
    static gather(project: ProjectState): AIContext {
        const activePageId = project.activePageId;
        const activePage = project.pages[activePageId];

        return {
            project: {
                id: project.id,
                name: project.name,
                theme: project.currTheme,
                activePageId: activePageId,
            },
            page: {
                id: activePageId,
                name: activePage?.name || 'Unknown',
                path: activePage?.path || '/',
                tree: this.compressPageTree(project, activePageId)
            },
            selection: this.gatherSelection(project)
        };
    }

    /**
     * Generates a compressed, indented text representation of the element tree.
     * Optimizes token usage by removing default styles and extraneous data.
     * Format:
     * Container (id: 123)
     *   Button (id: 456) "Click Me"
     */
    private static compressPageTree(project: ProjectState, pageId: string): string {
        const page = project.pages[pageId];
        if (!page) return "Page not found";

        return this.traverseNode(project, page.rootElementId, 0);
    }

    private static traverseNode(project: ProjectState, elementId: string, depth: number): string {
        const el = project.elements[elementId];
        if (!el) return "";

        const indent = "  ".repeat(depth);
        const type = el.masterComponentId ? `ComponentInstance:${this.getComponentName(project, el.masterComponentId)}` : el.type;
        const name = el.name ? ` "${el.name}"` : "";
        const content = el.content ? ` text="${el.content.substring(0, 20)}${el.content.length > 20 ? '...' : ''}"` : "";

        let line = `${indent}${type} (id: ${el.id.substring(0, 5)}...)${name}${content}`;

        if (el.children && el.children.length > 0) {
            const childrenOutput = el.children
                .map(childId => this.traverseNode(project, childId, depth + 1))
                .join("\n");
            return `${line}\n${childrenOutput}`;
        }

        return line;
    }

    /**
     * Gathers deep details for the currently selected elements.
     */
    private static gatherSelection(project: ProjectState): AIContext['selection'] {
        const selection = project.selectedElementIds || (project.selectedElementId ? [project.selectedElementId] : []);

        return selection.map(id => {
            const el = project.elements[id];
            if (!el) return null;

            return {
                id: el.id,
                type: el.type,
                name: el.name,
                content: el.content,
                styles: el.styles || {},
                props: {
                    ...el.props,
                    action: el.action,
                    masterComponentId: el.masterComponentId
                }
            };
        }).filter(item => item !== null) as AIContext['selection'];
    }

    private static getComponentName(project: ProjectState, componentId: string): string {
        const comp = project.designSystem.components.find(c => c.id === componentId);
        return comp ? comp.name : componentId;
    }
}
