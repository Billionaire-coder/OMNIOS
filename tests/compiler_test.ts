import { mapElementToAST } from '../src/lib/compiler/ast';
import { ProjectState, DesignerElement } from '../src/types/designer';

// Mock State
const mockState = {
    elements: {
        'root': {
            id: 'root',
            type: 'section',
            parentId: null,
            children: ['container-1'],
            styles: {
                width: '100%',
                height: '100vh',
                backgroundColor: '#fff'
            }
        },
        'container-1': {
            id: 'container-1',
            type: 'container',
            parentId: 'root',
            children: ['text-1', 'button-1'],
            styles: {
                width: '800px',
                margin: '0 auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }
        },
        'text-1': {
            id: 'text-1',
            type: 'text',
            parentId: 'container-1',
            content: 'Hello World',
            styles: {
                fontSize: '32px',
                color: '#333'
            }
        },
        'button-1': {
            id: 'button-1',
            type: 'button',
            parentId: 'container-1',
            content: 'Click Me',
            styles: {
                backgroundColor: 'blue',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px'
            }
        }
    } as Record<string, DesignerElement>,
    pages: {},
    activePageId: 'home',
    rootElementId: 'root',
    // history: [], 
    // historyIndex: -1,
    selectedElementId: null,
    selectedElementIds: [],
    hoveredElementId: null,
    // isDragging: false,
    canvasScale: 1,
    canvasPosition: { x: 0, y: 0 },
    // canvasSize: { width: 1920, height: 1080 },
    previewMode: false,
    viewMode: 'desktop',
    leftPanelOpen: true,
    rightPanelOpen: true,
    activeState: 'default',
    designSystem: {
        tokens: [],
        classes: [],
        components: []
    },
    data: {
        collections: [],
        items: [],
        apiRequests: [],
        functions: [],
        secrets: [],
        webhooks: [],
        users: []
    },
    blueprints: {},
    localization: {
        locales: [],
        activeLocale: 'en'
    },
    translations: {}
};

// Run Transformation
console.log("Running AST Transformation...");
const ast = mapElementToAST('root', mockState as unknown as ProjectState);

// Output Result
console.log(JSON.stringify(ast, null, 2));

// Assertions (Simple checks)
if (ast?.tagName === 'section') {
    console.log("✅ Root is section");
} else {
    console.error("❌ Root is not section");
}

if (ast?.children?.length === 1 && ast.children[0].tagName === 'div') {
    console.log("✅ Child structure correct (Section -> Div)");
} else {
    console.error("❌ Child structure incorrect");
}

const container = ast?.children?.[0];
if (container?.children?.length === 2) {
    console.log("✅ Container has 2 children");
} else {
    console.error("❌ Container children count wrong");
}

console.log("Verification Complete.");
