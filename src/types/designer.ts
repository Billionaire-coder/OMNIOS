import React from 'react';
import { UnifiedBlueprint, UnifiedNode, UnifiedConnection, LogicNodeType } from './logic';
export type { LogicNodeType, UnifiedNode as LogicNode, UnifiedConnection as LogicConnection, UnifiedBlueprint as LogicBlueprint };

// --- CORE IDENTITY & THEME ---
export type ThemeCategory = 'Ecommerce' | 'Portfolio' | 'SaaS' | 'Blog';
export type LayoutMode = 'freedom' | 'safety';
export type TokenType = 'color' | 'size' | 'font' | 'fontSize' | 'spacing' | 'radius' | 'shadow';

export interface ThemeTemplate {
    id: string;
    name: string;
    category: ThemeCategory;
    preview: string;
    tokens: DesignToken[];
}

export type ElementType =
    | 'box' | 'text' | 'image' | 'button' | 'input' | 'label' | 'icon' | 'divider' | 'spacer'
    | 'container' | 'section' | 'grid' | '2-col' | '3-col' | 'repeater' | 'form' | 'instance'
    | 'slot' | 'video' | 'embed' | 'lottie' | 'pay-button' | 'navbar' | 'header' | 'footer'
    | 'auth-wall' | 'avatar' | 'card' | 'badge' | 'textarea' | 'checkbox' | 'select'
    | 'login-form' | 'signup-form' | 'logout-button'
    | 'accordion' | 'tabs' | 'tab' | 'radio' | 'audio' | 'custom-code' | 'vector';

// --- STYLES & ANIMATION ---
export interface ElementStyles extends React.CSSProperties {
    [key: string]: any;
    physics?: {
        type: 'spring' | 'tween' | 'inertia';
        stiffness?: number;
        damping?: number;
        mass?: number;
        velocity?: number;
        power?: number;
        friction?: number;
    };
}

export interface AnimationKeyframe {
    id: string;
    time: number; // 0 to 1
    styles: Partial<ElementStyles>;
    easing?: string;
}

export interface AnimationSequence {
    id: string;
    name: string;
    keyframes: AnimationKeyframe[];
    duration: number;
    delay: number;
    repeat: boolean;
    easing: string;
}

// --- DESIGN SYSTEM ---
export interface DesignToken {
    id: string;
    name: string;
    type: TokenType;
    value: string;
    modes?: Record<string, string>;
}

export interface DesignClass {
    id: string;
    name: string;
    styles: ElementStyles;
    tabletStyles?: ElementStyles;
    mobileStyles?: ElementStyles;
    hoverStyles?: ElementStyles;
    activeStyles?: ElementStyles;
    focusStyles?: ElementStyles;
}

export interface MasterComponent {
    id: string;
    name: string;
    rootElementId: string;
    elements: Record<string, DesignerElement>;
    props: { id: string; name: string; type: string; defaultValue: any }[];
}

// --- SERVERLESS & DATA ---
export interface ServerlessFunction {
    id: string;
    name: string;
    route: string; // e.g., '/hello'
    code: string;
    runtime: 'nodejs' | 'python' | 'go' | 'rust';
    lastDeployedAt?: number;
    secrets?: string[];
}

// --- ELEMENTS & PAGES ---
export interface DesignerElement {
    id: string;
    type: ElementType;
    parentId: string | null;
    children?: string[];
    styles?: ElementStyles;
    content?: string;
    name?: string;
    altText?: string;
    tagName?: string;
    classNames?: string[];
    visible?: boolean;
    locked?: boolean;
    overrides?: Record<string, any>;
    collectionId?: string;
    iconName?: string; // For icon elements
    componentId?: string; // If instance (Legacy)
    masterComponentId?: string; // If instance of a component
    tabletStyles?: ElementStyles;
    mobileStyles?: ElementStyles;
    hoverStyles?: ElementStyles;
    activeStyles?: ElementStyles;
    focusStyles?: ElementStyles;
    filter?: any;
    limit?: number;
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    pagination?: {
        enabled?: boolean;
        type: 'none' | 'load-more' | 'numeric' | 'infinite-scroll';
        pageSize?: number;
    };
    props?: Record<string, any>;
    bindings?: Record<string, string>;
    variableBindings?: Record<string, string>;
    layoutMode?: LayoutMode;
    interaction?: 'none' | 'tilt' | 'scroll' | string;
    localeOverrides?: Record<string, any>;
    slotName?: string;
    effects?: any;
    animationSequences?: Record<string, AnimationSequence>;
    animationRepeat?: boolean;
    animationTransition?: {
        type?: 'spring' | 'tween' | 'inertia';
        preset?: 'natural' | 'snappy' | 'soft' | string;
        stiffness?: number;
        damping?: number;
        mass?: number;
        duration?: number;
        delay?: number;
        ease?: string;
    };
    splitText?: 'none' | 'chars' | 'words' | 'lines';
    staggerDelay?: number;
    action?: {
        type: 'none' | 'url' | 'page' | 'scroll' | 'logic' | string;
        payload: string;
        target?: string;
    };
    commerce?: {
        provider: 'stripe' | 'lemon-squeezy' | string;
        productId: string;
        price?: number;
        currency?: string;
    };
    blueprintId?: string;
    scrollTimeline?: {
        prop: string;
        from: any;
        to: any;
        start?: number;
        end?: number;
    }[];
    media?: {
        src?: string;
        alt?: string;
        poster?: string;
        loop?: boolean;
        muted?: boolean;
        autoPlay?: boolean;
        autoplay?: boolean;
        controls?: boolean;
        blurDataURL?: string;
    };
    slotContent?: Record<string, string[]>;
    variants?: Record<string, Partial<ElementStyles>>;
    customCode?: {
        code: string;
        componentName?: string;
        onClick?: string;
        onMount?: string;
        onHover?: string;
        exposedProps?: Record<string, any>;
    };
    inputType?: string;
    placeholder?: string;
    required?: boolean;
    checked?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    options?: {
        label: string;
        value: string;
    }[];
}

export interface DesignerPage {
    id: string;
    name: string;
    rootElementId: string;
    path: string;
    slug: string; // Batch 8.1: DB Compatibility
    collectionId?: string;
    isTemplate?: boolean;
    slugField?: string;
    meta?: { title: string; description: string; ogImage?: string };
}

// --- CMS & DATA ---
export interface RLSPolicy {
    name: string;
    action: string;
    definition: string;
}

export interface CollectionField {
    id: string;
    name: string;
    type: string;
    required?: boolean;
    unique?: boolean;
    referenceCollectionId?: string;
    relationType?: 'one-to-many' | 'many-to-many';
}

export interface Collection {
    id: string;
    name: string;
    slug: string;
    type: 'flat' | 'relational';
    fields: CollectionField[];
    policies?: RLSPolicy[];
    isMultiTenant?: boolean; // Phase 12: Multi-Tenancy
}

export interface CollectionItem {
    id: string;
    collectionId: string;
    tenantId?: string; // Phase 12: Multi-Tenancy
    values: Record<string, any>;
    createdAt: number;
    updatedAt: number;
    status?: 'draft' | 'published' | 'archived' | string;
}

// --- PHASE 12: TENANT SYSTEM ---
export interface Tenant {
    id: string;
    name: string;
    slug: string;
    ownerId: string;
    status: 'active' | 'suspended' | 'trialing';
    createdAt: number;
    usage: {
        users: number;
        records: number;
        apiCalls: number;
    };
    billing?: {
        planId: string;
        subscriptionId?: string;
        limits: {
            records: number;
            users: number;
        };
        usage: {
            records: number;
            users: number;
        };
    };
}

// --- PHASE 3: API & CONNECTIVITY ---
export interface ApiRequest {
    id: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers: { id: string; key: string; value: string }[];
    params: { id: string; key: string; value: string }[];
    bodyType: 'json' | 'form-data' | 'none';
    body: string;
    mockResponse?: string;
    outputs?: {
        id: string;
        path: string;
        variableName: string;
        type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    }[];
}



export interface Secret {
    id: string;
    envId: string;
    keyName: string;
    createdAt: number;
}

export interface Environment {
    id: string;
    name: string;
    slug: string;
}

export interface DragState {
    id: string;
    name: string;
    method: 'POST' | 'GET';
    enabled: boolean;
    recentEvents: { id: string; payload: any; timestamp: number }[];
}

export interface Webhook {
    id: string;
    name: string;
    method: 'POST' | 'GET';
    enabled: boolean;
    recentEvents: { id: string; payload: any; timestamp: number }[];
}

export interface User {
    id: string;
    email: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    metadata: Record<string, any>;
    avatar_url?: string;
    isAuthenticated?: boolean;
    name?: string;
    createdAt?: number;
}

// --- LOGIC SYSTEM ---



// --- PROJECT STATE ---
export interface ProjectData {
    collections: Collection[];
    items: CollectionItem[];
    apiRequests: ApiRequest[];
    functions: ServerlessFunction[];
    secrets: Secret[];
    webhooks: Webhook[];
    users: User[];
}

// --- LOGIC ---
export interface LogicVariable {
    id: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    value: any;
    serverOnly?: boolean; // Batch 7.3: Secrets
    envVarName?: string; // Batch 7.3: Secrets
}

export interface DebuggerState {
    mode: 'running' | 'paused' | 'stepping';
    activeNodeId: string | null;
    breakpoints: string[]; // Node IDs
    executionSpeed: number; // ms delay
    callStack: string[]; // Blueprint/Node IDs
    logs: DebugLog[]; // Local logs for the session
    eventQueue: { id: string; type: string; payload: any; timestamp: number }[]; // Batch 16.1
    history: { id: string; type: string; payload: any; timestamp: number; status: 'success' | 'error'; error?: string }[]; // Batch 16.3
}

export interface ProjectState {
    id: string;
    name: string;
    activePageId: string;
    rootElementId: string;
    selectedElementId: string | null;
    selectedElementIds: string[];
    editingElementId: string | null;
    editingClassId: string | null;
    hoveredElementId: string | null;
    activeItemId: string | null;

    pages: Record<string, DesignerPage>;
    elements: Record<string, DesignerElement>;
    data: ProjectData;
    activeTenantId: string | null; // Phase 12: Multi-Tenancy
    tenants: Tenant[]; // Batch 12.2: SaaS Admin Dashboard

    // --- LOGIC ---
    // Batch 4.5.2: Logic System
    blueprints: Record<string, UnifiedBlueprint>;
    logicNodes: any[]; // Batch 8.4: Live Logic Graph
    logicEdges: any[]; // Batch 8.4: Live Logic Graph
    variables: Record<string, LogicVariable>;
    globalVariables: Record<string, LogicVariable>;

    debugger: DebuggerState;

    designSystem: {
        tokens: DesignToken[];
        classes: DesignClass[];
        components: MasterComponent[];
    };

    auth: {
        currentUser: User | null;
        isPreviewMode: boolean;
    };

    dragState: {
        isDragging: boolean;
        type: 'element' | 'asset' | 'component' | null;
        id: string | null;
        targetId: string | null;
        position: 'before' | 'after' | 'inside' | null;
    };

    theme: 'dark' | 'light';
    activeMode: 'dark' | 'light';
    canvasScale: number;
    canvasPosition: { x: number; y: number };
    previewMode: boolean;
    viewMode: 'desktop' | 'tablet' | 'mobile'; // Device Mode
    workspaceMode: 'design' | 'logic'; // Batch 8.1: Service Blueprint Mode

    // Feature Placeholders
    seo: { title: string; description: string; socialImage?: string; schemaType: string };
    localization: { locales: any[]; activeLocale: string };
    translations: Record<string, Record<string, string>>; // Batch 5.3: locale -> key -> value
    deployment: {
        provider: 'vercel' | 'netlify' | null;
        token: string | null;
        isConnected: boolean;
        accountName?: string;
        history: { id: string; url: string; status: string; timestamp: number }[];
    };
    cart: { items: any[]; isOpen: boolean; shippingTotal: number; taxTotal: number; currency: string };
    assets: Asset[];
    assetFolders: AssetFolder[];
    teamLibraries: AssetLibrary[];
    debugLogs: DebugLog[];
    currTheme: string;
    isCommandBarOpen: boolean;
    osSettings: any;
    platform: string;
    nativeWindows: any[];
    isPenToolActive: boolean;
    isUIVisible: boolean;
    isSpacePressed: boolean;
    activeCursor: string | null; // Batch 6.1
    currentUser: User | null;
    serverlessFunctions: Record<string, ServerlessFunction>;
    aiChatHistory: any[];
    analytics: AnalyticsData;
    apiSources: any[];
    mappedData: any;
    staticMode?: boolean;
    subscriptionStatus?: any;
    userTier: string;
    activeState: string;
    highlightedControl: string | null;
    engineMode: 'standard' | 'hyper';
    // Phase 12: Git Sync
    gitConfig?: {
        provider: 'github' | 'gitlab';
        token?: string;
        repo?: { id: string, name: string, owner: string };
        branch: string;
    };
    gitStatus: 'idle' | 'pulling' | 'pushing' | 'error';
    lastSyncAt?: number;
    // Batch 11.2
    workflows: Record<string, UnifiedBlueprint>;
    installedPlugins: any[]; // Batch 11.3
    environments: Environment[];
}

export interface DebugLog {
    id: string;
    timestamp: number;
    type: 'logic' | 'style' | 'performance' | 'audit';
    message: string;
    elementId?: string;
    payload?: any;
}

// --- ANALYTICS ---
export interface AnalyticsEvent {
    id?: string;
    type: string;
    timestamp: number;
    pageId: string;
    elementId?: string;
    metadata?: Record<string, any>;
}

export interface HeatmapPoint {
    x: number;
    y: number;
    intensity: number;
    elementId?: string;
}

export interface FunnelStep {
    id: string;
    name: string;
    targetId: string;
    type: 'page' | 'click' | 'form';
}

export interface AnalyticsFunnel {
    id: string;
    name: string;
    steps: FunnelStep[];
}

export interface AnalyticsData {
    events: AnalyticsEvent[];
    funnels: AnalyticsFunnel[];
    heatmap: HeatmapPoint[];
    isHeatmapEnabled: boolean;
}

// --- ASSETS ---
export interface Asset {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'video' | 'other' | string;
    size: number;
    tags?: string[];
    usage?: 'ui' | 'icon' | 'background' | string;
    folderId?: string;
    altText?: string;
    optimizedUrl?: string;
    optimizedSize?: number;
    isOptimized?: boolean;
    filterPreset?: string;
    createdAt?: number;
}

export interface AssetFolder {
    id: string;
    name: string;
    parentId?: string;
}

export interface AssetLibrary {
    id: string;
    name: string;
    description?: string;
    assetIds: string[];
}

// --- CONTEXT TYPE ---
export interface ProjectContextType {
    state: ProjectState;
    setState: React.Dispatch<React.SetStateAction<ProjectState>>;
    isInitialized: boolean;

    switchPage: (pageId: string) => void;
    setSelectedElement: (id: string | null) => void;
    setSelectedElements: (ids: string[]) => void;
    selectArea: (x: number, y: number, width: number, height: number) => void;

    addElement: (type: ElementType, parentId: string, initialProps?: Partial<DesignerElement>) => string;
    removeElement: (id: string) => void;
    updateElementStyles: (id: string, styles: Partial<ElementStyles>) => void;
    updateElementProp: (id: string, prop: string, value: any) => void;
    connectProvider: (provider: 'vercel' | 'netlify') => Promise<void>;
    disconnectProvider: () => void;
    deployProject: (provider: 'vercel' | 'netlify', envId?: string, token?: string) => Promise<any>;
    setEngineMode: (mode: 'standard' | 'hyper') => void;
    dispatchCommand: (command: HyperCommand, isRemote?: boolean) => void;

    // Phase 12: Git Sync
    connectGit: (provider: 'github' | 'gitlab') => Promise<void>;
    selectRepo: (repo: { id: string, name: string, owner: string }) => void;
    setBranch: (branch: string) => void;
    createBranch: (name: string) => Promise<void>;
    mergeBranch: (head: string) => Promise<void>;
    syncWithGit: (type: 'pull' | 'push') => Promise<void>;
    setCanvasTransform: (transform: { x: number, y: number, scale: number } | ((prev: { x: number, y: number, scale: number }) => { x: number, y: number, scale: number })) => void;
    setIsUIVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
    setIsSpacePressed: (pressed: boolean) => void;
    // Batch 6.1
    setGlobalCursor: (cursor: string | null) => void;
    isUIVisible: boolean;
    isSpacePressed: boolean;

    // Batch 16.1: Logic Debugger Actions
    setDebuggerMode: (mode: 'running' | 'paused' | 'stepping') => void;
    toggleBreakpoint: (nodeId: string) => void;
    stepDebugger: () => void;
    setExecutionSpeed: (ms: number) => void;
    replayEvent: (eventId: string) => void;

    setLogicGraph: (nodes: any[], edges: any[]) => void;

    // Batch 11.2
    addWorkflow: (name: string) => string;
    updateWorkflow: (id: string, workflow: Partial<UnifiedBlueprint>) => void;
    removeWorkflow: (id: string) => void;

    // Batch 11.3
    installPlugin: (plugin: any) => void;
    uninstallPlugin: (id: string) => void;

    // Phase 12: Multi-Tenancy
    setActiveTenantId: (id: string | null) => void;

    [key: string]: any;
}

// Helpers
export interface APISource { id: string; name: string; url: string; method: string; }
// --- PHASE 10: HYPER COMMAND PROTOCOL ---

export type CommandAction =
    | 'UPDATE_STYLE'
    | 'UPDATE_CONTENT'
    | 'UPDATE_PROP'
    | 'ADD_ELEMENT'
    | 'REMOVE_ELEMENT'
    | 'REORDER_ELEMENT'
    | 'ADD_LOGIC_NODE'
    | 'MOVE_LOGIC_NODE'
    | 'REMOVE_LOGIC_NODE'
    | 'ADD_LOGIC_CONNECTION'
    | 'REMOVE_LOGIC_CONNECTION'
    | 'UPDATE_SCHEMA'
    | 'UPDATE_TOKEN'
    | 'UPDATE_CLASS'
    | 'MANAGE_COMPONENT'
    | 'MANAGE_ANIMATION'
    | 'SYNC_FULL_STATE';

export interface HyperCommand {
    id: string; // Unique command ID for tracking/deduplication
    action: CommandAction;
    targetId: string; // Element ID or Blueprint ID
    payload: any;
    timestamp: number;
    userId?: string; // Batch 11.1
}
