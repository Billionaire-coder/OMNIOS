import { DesignerElement, ProjectState } from "@/types/designer";

export const createPageRoot = (id: string, children: string[], styles: any = {}): DesignerElement => ({
    id,
    type: 'container',
    parentId: null,
    styles: { width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', ...styles },
    layoutMode: 'safety',
    children
});

export const createTheme = (
    id: string,
    name: string,
    category: any,
    description: string,
    thumbnail: string,
    pages: Record<string, { id: string; name: string; rootId: string; elements: Record<string, DesignerElement> }>
): any => {
    const allElements: Record<string, DesignerElement> = {};
    const pageRegistry: Record<string, { id: string; name: string; rootId: string }> = {};

    Object.values(pages).forEach(page => {
        Object.assign(allElements, page.elements);
        pageRegistry[page.id] = { id: page.id, name: page.name, rootId: page.rootId };
    });

    const firstPageId = Object.keys(pages)[0];

    return {
        id,
        name,
        category,
        description,
        thumbnail,
        state: {
            id,
            name,
            elements: allElements,
            rootElementId: pageRegistry[firstPageId].rootId,
            pages: pageRegistry,
            activePageId: firstPageId,
            selectedElementId: null,
            selectedElementIds: [],
            designSystem: { tokens: [], classes: [], components: [] },
            data: { collections: [], items: [] },
            assets: [],
            assetFolders: [],
            apiSources: [],
            blueprints: {},
            globalVariables: {},
            previewMode: false,
            viewMode: 'desktop',
            canvasScale: 1,
            activeState: 'none',
            editingClassId: null,
            editingElementId: null,
            hoveredElementId: null,
            dragState: { isDragging: false, type: null, id: null, targetId: null, position: null },
            highlightedControl: null,
            cart: { items: [], isOpen: false, total: 0 }
        }
    };
};
