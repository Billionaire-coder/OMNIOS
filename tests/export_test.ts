import { exportProjectToZip } from '../src/lib/compiler/export';
import { ProjectState, DesignerElement } from '../src/types/designer';
import fs from 'fs';
import path from 'path';

// Mock State (Reusable or redefined)
const mockState: ProjectState = {
    id: 'test-project',
    name: 'Test Project',
    elements: {
        'root': {
            id: 'root',
            type: 'section',
            parentId: null,
            children: ['container-1'],
            styles: {}
        },
        'container-1': {
            id: 'container-1',
            type: 'container',
            parentId: 'root',
            children: ['text-1'],
            styles: {}
        },
        'text-1': {
            id: 'text-1',
            type: 'text',
            parentId: 'container-1',
            content: 'Hello Export',
            styles: {}
        }
    } as Record<string, DesignerElement>,
    pages: {},
    activePageId: 'home',
    rootElementId: 'root',
    selectedElementId: null,
    selectedElementIds: [],
    editingElementId: null,
    editingClassId: null,
    hoveredElementId: null,
    activeItemId: null,
    variables: {},
    globalVariables: {},
    canvasScale: 1,
    canvasPosition: { x: 0, y: 0 },
    // canvasSize: { width: 1920, height: 1080 }, // Removed to avoid error
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
    translations: {},
    // Minimal mock for other required props
    auth: { currentUser: null, isPreviewMode: false },
    dragState: { isDragging: false, type: null, id: null, targetId: null, position: null },
    theme: 'dark',
    activeMode: 'dark',
    seo: { title: '', description: '', schemaType: '' },
    deployment: { provider: null, token: null, isConnected: false, history: [] },
    cart: { items: [], isOpen: false, shippingTotal: 0, taxTotal: 0, currency: 'USD' },
    assets: [],
    assetFolders: [],
    teamLibraries: [],
    debugLogs: [],
    currTheme: 'default',
    isCommandBarOpen: false,
    osSettings: {},
    platform: 'web',
    nativeWindows: [],
    isPenToolActive: false,
    currentUser: null,
    serverlessFunctions: {},
    aiChatHistory: [],
    analytics: { pageViews: 0, uniqueVisitors: 0, bounceRate: 0, avgSessionDuration: 0 },
    apiSources: [],
    mappedData: {},
    userTier: 'free',
    highlightedControl: null,
    engineMode: 'standard'
} as unknown as ProjectState; // Casting via unknown to bypass strict checks

console.log("Generating Zip...");
exportProjectToZip(mockState).then(async (blob) => {
    console.log("Zip Generated. Size:", blob.size);

    // Convert Blob to Buffer to write to disk
    const buffer = Buffer.from(await blob.arrayBuffer());

    const outputPath = path.resolve(__dirname, 'test_export.zip');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Zip saved to ${outputPath}`);

}).catch(err => {
    console.error("❌ Export Failed:", err);
    process.exit(1);
});
