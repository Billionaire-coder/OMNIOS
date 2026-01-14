# OMNIOS Type System Analysis

## Overview
OMNIOS uses a comprehensive TypeScript type system with 6 main type definition files covering all aspects of the platform. This document provides a complete analysis of all types, interfaces, and their relationships.

## Type Definition Files

1. **`designer.ts`**: Core designer types (650+ lines)
2. **`logic.ts`**: Logic system types
3. **`plugins.ts`**: Plugin system types
4. **`aiActions.ts`**: AI action types
5. **`rbac.ts`**: Role-based access control types
6. **`intelligence.ts`**: Design intelligence types

## Core Type Hierarchy

### 1. Designer Types (`src/types/designer.ts`)

#### 1.1 Theme & Category Types

```typescript
type ThemeCategory = 'Ecommerce' | 'Portfolio' | 'SaaS' | 'Blog';
type LayoutMode = 'freedom' | 'safety';
type TokenType = 'color' | 'size' | 'font' | 'fontSize' | 'spacing' | 'radius' | 'shadow';
```

**ThemeTemplate Interface**:
```typescript
interface ThemeTemplate {
    id: string;
    name: string;
    category: ThemeCategory;
    preview: string;
    tokens: DesignToken[];
}
```

#### 1.2 Element Types

**ElementType Union** (30+ types):
```typescript
type ElementType =
    | 'box' | 'text' | 'image' | 'button' | 'input' | 'label' | 'icon' | 'divider' | 'spacer'
    | 'container' | 'section' | 'grid' | '2-col' | '3-col' | 'repeater' | 'form' | 'instance'
    | 'slot' | 'video' | 'embed' | 'lottie' | 'pay-button' | 'navbar' | 'header' | 'footer'
    | 'auth-wall' | 'avatar' | 'card' | 'badge' | 'textarea' | 'checkbox' | 'select'
    | 'login-form' | 'signup-form' | 'logout-button'
    | 'accordion' | 'tabs' | 'tab' | 'radio' | 'audio' | 'custom-code' | 'vector';
```

#### 1.3 ElementStyles Interface

```typescript
interface ElementStyles extends React.CSSProperties {
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
```

**Features**:
- Extends React.CSSProperties
- Supports physics properties
- Index signature for flexibility

#### 1.4 DesignerElement Interface

**Core Properties**:
```typescript
interface DesignerElement {
    // Identity
    id: string;
    type: ElementType;
    parentId: string | null;
    children?: string[];
    
    // Styling
    styles?: ElementStyles;
    tabletStyles?: ElementStyles;
    mobileStyles?: ElementStyles;
    hoverStyles?: ElementStyles;
    activeStyles?: ElementStyles;
    focusStyles?: ElementStyles;
    
    // Content
    content?: string;
    name?: string;
    altText?: string;
    
    // Structure
    tagName?: string;
    classNames?: string[];
    
    // State
    visible?: boolean;
    locked?: boolean;
    
    // Component System
    componentId?: string; // Legacy
    masterComponentId?: string; // Instance reference
    overrides?: Record<string, any>; // Instance overrides
    slotContent?: Record<string, string[]>; // Slot children
    
    // Data Binding
    collectionId?: string;
    bindings?: Record<string, string>; // Data bindings
    variableBindings?: Record<string, string>; // Variable bindings
    
    // Layout
    layoutMode?: LayoutMode;
    
    // Interactions
    interaction?: 'none' | 'tilt' | 'scroll' | string;
    action?: {
        type: 'none' | 'url' | 'page' | 'scroll' | 'logic' | string;
        payload: string;
        target?: string;
    };
    
    // Animation
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
    scrollTimeline?: {
        prop: string;
        from: any;
        to: any;
        start?: number;
        end?: number;
    }[];
    
    // Logic
    blueprintId?: string;
    
    // Media
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
    
    // Form
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
    
    // Commerce
    commerce?: {
        provider: 'stripe' | 'lemon-squeezy' | string;
        productId: string;
        price?: number;
        currency?: string;
    };
    
    // Custom Code
    customCode?: {
        code: string;
        componentName?: string;
        onClick?: string;
        onMount?: string;
        onHover?: string;
        exposedProps?: Record<string, any>;
    };
    
    // Repeater
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
    
    // Localization
    localeOverrides?: Record<string, any>;
    
    // Effects
    effects?: any;
    filter?: any;
    variants?: Record<string, Partial<ElementStyles>>;
    
    // Misc
    iconName?: string;
    slotName?: string;
    props?: Record<string, any>;
}
```

**Key Relationships**:
- `parentId` → References another `DesignerElement.id`
- `children` → Array of `DesignerElement.id[]`
- `masterComponentId` → References `MasterComponent.id`
- `collectionId` → References `Collection.id`
- `blueprintId` → References `UnifiedBlueprint.id`

#### 1.5 DesignerPage Interface

```typescript
interface DesignerPage {
    id: string;
    name: string;
    rootElementId: string;
    path: string;
    slug: string;
    collectionId?: string;
    isTemplate?: boolean;
    slugField?: string;
    meta?: {
        title: string;
        description: string;
        ogImage?: string;
    };
}
```

**Relationships**:
- `rootElementId` → References `DesignerElement.id`
- `collectionId` → References `Collection.id` (for dynamic pages)

#### 1.6 Design System Types

**DesignToken Interface**:
```typescript
interface DesignToken {
    id: string;
    name: string;
    type: TokenType;
    value: string;
    modes?: Record<string, string>; // Light/dark mode support
}
```

**DesignClass Interface**:
```typescript
interface DesignClass {
    id: string;
    name: string;
    styles: ElementStyles;
    tabletStyles?: ElementStyles;
    mobileStyles?: ElementStyles;
    hoverStyles?: ElementStyles;
    activeStyles?: ElementStyles;
    focusStyles?: ElementStyles;
}
```

**MasterComponent Interface**:
```typescript
interface MasterComponent {
    id: string;
    name: string;
    rootElementId: string;
    elements: Record<string, DesignerElement>;
    props: {
        id: string;
        name: string;
        type: string;
        defaultValue: any;
    }[];
}
```

**Relationships**:
- `MasterComponent.rootElementId` → References `DesignerElement.id`
- `MasterComponent.elements` → Contains full element tree
- `DesignerElement.masterComponentId` → References `MasterComponent.id`

#### 1.7 Animation Types

**AnimationKeyframe Interface**:
```typescript
interface AnimationKeyframe {
    id: string;
    time: number; // 0 to 1
    styles: Partial<ElementStyles>;
    easing?: string;
}
```

**AnimationSequence Interface**:
```typescript
interface AnimationSequence {
    id: string;
    name: string;
    keyframes: AnimationKeyframe[];
    duration: number;
    delay: number;
    repeat: boolean;
    easing: string;
}
```

#### 1.8 Data & CMS Types

**CollectionField Interface**:
```typescript
interface CollectionField {
    id: string;
    name: string;
    type: string;
    required?: boolean;
    unique?: boolean;
    referenceCollectionId?: string;
    relationType?: 'one-to-many' | 'many-to-many';
}
```

**Collection Interface**:
```typescript
interface Collection {
    id: string;
    name: string;
    slug: string;
    type: 'flat' | 'relational';
    fields: CollectionField[];
    policies?: RLSPolicy[];
    isMultiTenant?: boolean;
}
```

**CollectionItem Interface**:
```typescript
interface CollectionItem {
    id: string;
    collectionId: string;
    tenantId?: string;
    values: Record<string, any>;
    createdAt: number;
    updatedAt: number;
    status?: 'draft' | 'published' | 'archived' | string;
}
```

**RLSPolicy Interface**:
```typescript
interface RLSPolicy {
    name: string;
    action: string;
    definition: string;
}
```

**Relationships**:
- `CollectionItem.collectionId` → References `Collection.id`
- `CollectionItem.tenantId` → References `Tenant.id`
- `CollectionField.referenceCollectionId` → References `Collection.id`

#### 1.9 Serverless Function Types

**ServerlessFunction Interface**:
```typescript
interface ServerlessFunction {
    id: string;
    name: string;
    route: string;
    code: string;
    runtime: 'nodejs' | 'python' | 'go' | 'rust';
    lastDeployedAt?: number;
    secrets?: string[];
}
```

#### 1.10 API Request Types

**ApiRequest Interface**:
```typescript
interface ApiRequest {
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
```

#### 1.11 Secret & Environment Types

**Secret Interface**:
```typescript
interface Secret {
    id: string;
    envId: string;
    keyName: string;
    createdAt: number;
}
```

**Environment Interface**:
```typescript
interface Environment {
    id: string;
    name: string;
    slug: string;
}
```

**Relationships**:
- `Secret.envId` → References `Environment.id`

#### 1.12 Webhook Types

**Webhook Interface**:
```typescript
interface Webhook {
    id: string;
    name: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    events: string[];
    active: boolean;
}
```

#### 1.13 User & Auth Types

**User Interface**:
```typescript
interface User {
    id: string;
    email: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    isAuthenticated: boolean;
    metadata: Record<string, any>;
    createdAt?: number;
}
```

#### 1.14 Tenant Types (Multi-Tenancy)

**Tenant Interface**:
```typescript
interface Tenant {
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
```

**Relationships**:
- `Tenant.ownerId` → References `User.id`

#### 1.15 Project State Types

**ProjectState Interface** (Main State):
```typescript
interface ProjectState {
    // Identity
    id: string;
    name: string;
    
    // Pages
    activePageId: string;
    pages: Record<string, DesignerPage>;
    
    // Elements
    rootElementId: string;
    elements: Record<string, DesignerElement>;
    
    // Selection
    selectedElementId: string | null;
    selectedElementIds: string[];
    editingElementId: string | null;
    editingClassId: string | null;
    hoveredElementId: string | null;
    activeItemId: string | null;
    
    // Data
    data: ProjectData;
    
    // Logic
    blueprints: Record<string, UnifiedBlueprint>;
    logicNodes: any[]; // Legacy
    logicEdges: any[]; // Legacy
    variables: Record<string, LogicVariable>;
    globalVariables: Record<string, LogicVariable>;
    
    // Design System
    designSystem: {
        tokens: DesignToken[];
        classes: DesignClass[];
        components: MasterComponent[];
    };
    
    // Auth
    auth: {
        currentUser: User | null;
        isPreviewMode: boolean;
    };
    
    // Drag State
    dragState: {
        isDragging: boolean;
        type: 'element' | 'asset' | 'component' | null;
        id: string | null;
        targetId: string | null;
        position: 'before' | 'after' | 'inside' | null;
    };
    
    // UI State
    theme: 'dark' | 'light';
    activeMode: 'dark' | 'light';
    canvasScale: number;
    canvasPosition: { x: number; y: number };
    previewMode: boolean;
    viewMode: 'desktop' | 'tablet' | 'mobile';
    workspaceMode: 'design' | 'logic';
    
    // SEO
    seo: {
        title: string;
        description: string;
        socialImage?: string;
        schemaType: string;
    };
    
    // Localization
    localization: {
        locales: any[];
        activeLocale: string;
    };
    translations: Record<string, Record<string, string>>;
    
    // Deployment
    deployment: {
        provider: 'vercel' | 'netlify' | null;
        token: string | null;
        isConnected: boolean;
        accountName?: string;
        history: {
            id: string;
            url: string;
            status: string;
            timestamp: number;
        }[];
    };
    
    // Git
    gitConfig?: {
        provider: 'github' | 'gitlab';
        token?: string;
        repo?: { id: string; name: string; owner: string };
        branch: string;
    };
    gitStatus: 'idle' | 'pulling' | 'pushing' | 'error';
    lastSyncAt?: number;
    
    // Commerce
    cart: {
        items: any[];
        isOpen: boolean;
        shippingTotal: number;
        taxTotal: number;
        currency: string;
    };
    
    // Assets
    assets: Asset[];
    assetFolders: AssetFolder[];
    teamLibraries: AssetLibrary[];
    
    // Debug
    debugger: DebuggerState;
    debugLogs: DebugLog[];
    
    // Analytics
    analytics: AnalyticsData;
    
    // Multi-Tenancy
    activeTenantId: string | null;
    tenants: Tenant[];
    
    // Serverless
    serverlessFunctions: Record<string, ServerlessFunction>;
    
    // AI
    aiChatHistory: any[];
    
    // API
    apiSources: any[];
    mappedData: any;
    
    // Misc
    currTheme: string;
    isCommandBarOpen: boolean;
    osSettings: any;
    platform: string;
    nativeWindows: any[];
    isPenToolActive: boolean;
    isUIVisible: boolean;
    isSpacePressed: boolean;
    activeCursor: string | null;
    currentUser: User | null;
    staticMode?: boolean;
    subscriptionStatus?: any;
    userTier: string;
    activeState: string;
    highlightedControl: string | null;
    engineMode: 'standard' | 'hyper';
    workflows: Record<string, UnifiedBlueprint>;
    installedPlugins: any[];
    environments: Environment[];
}
```

**ProjectData Interface**:
```typescript
interface ProjectData {
    collections: Collection[];
    items: CollectionItem[];
    apiRequests: ApiRequest[];
    functions: ServerlessFunction[];
    secrets: Secret[];
    webhooks: Webhook[];
    users: User[];
}
```

**LogicVariable Interface**:
```typescript
interface LogicVariable {
    id: string;
    name: string;
    type: string;
    value: any;
}
```

**DebuggerState Interface**:
```typescript
interface DebuggerState {
    mode: 'running' | 'paused' | 'stepping';
    activeNodeId: string | null;
    breakpoints: string[];
    executionSpeed: number;
    callStack: any[];
    logs: DebugLog[];
    eventQueue: any[];
    history: any[];
}
```

**DebugLog Interface**:
```typescript
interface DebugLog {
    id: string;
    timestamp: number;
    level: 'log' | 'warn' | 'error';
    message: string;
    data?: any;
}
```

**AnalyticsData Interface**:
```typescript
interface AnalyticsData {
    events: AnalyticsEvent[];
    funnels: AnalyticsFunnel[];
    heatmap: HeatmapPoint[];
    isHeatmapEnabled: boolean;
}
```

**AnalyticsEvent Interface**:
```typescript
interface AnalyticsEvent {
    id: string;
    type: string;
    elementId?: string;
    timestamp: number;
    metadata?: Record<string, any>;
}
```

**AnalyticsFunnel Interface**:
```typescript
interface AnalyticsFunnel {
    id: string;
    name: string;
    steps: {
        id: string;
        name: string;
        targetId: string;
        type: 'page' | 'click' | 'form';
    }[];
}
```

**HeatmapPoint Interface**:
```typescript
interface HeatmapPoint {
    x: number;
    y: number;
    intensity: number;
    elementId: string;
}
```

**Asset Interface**:
```typescript
interface Asset {
    id: string;
    name: string;
    type: 'image' | 'video' | 'font' | 'file';
    url: string;
    size: number;
    width?: number;
    height?: number;
    createdAt: number;
    folderId?: string;
}
```

**AssetFolder Interface**:
```typescript
interface AssetFolder {
    id: string;
    name: string;
    parentId: string | null;
    createdAt: number;
}
```

**AssetLibrary Interface**:
```typescript
interface AssetLibrary {
    id: string;
    name: string;
    description?: string;
    assetIds: string[];
    isTeamLibrary?: boolean;
}
```

#### 1.16 HyperCommand Type

**HyperCommand Interface**:
```typescript
interface HyperCommand {
    id: string;
    action: string;
    targetId: string;
    payload: any;
    timestamp: number;
}
```

**Action Types**:
- `UPDATE_STYLE`: Update element styles
- `UPDATE_PROP`: Update element property
- `ADD_ELEMENT`: Add new element
- `REMOVE_ELEMENT`: Remove element
- `REORDER_ELEMENT`: Reorder element
- `ADD_LOGIC_NODE`: Add logic node
- `MOVE_LOGIC_NODE`: Move logic node
- `REMOVE_LOGIC_NODE`: Remove logic node
- `ADD_LOGIC_CONNECTION`: Add logic connection
- `REMOVE_LOGIC_CONNECTION`: Remove logic connection

### 2. Logic Types (`src/types/logic.ts`)

#### 2.1 LogicNodeType Union

```typescript
type LogicNodeType =
    // Event Nodes
    | 'on_click' | 'on_load' | 'on_change' | 'on_scroll' | 'on_data' | 'on_mount'
    // Action Nodes
    | 'navigate' | 'set_var' | 'alert' | 'wait' | 'condition' | 'loop'
    // API Nodes
    | 'api_request' | 'server_function'
    // Auth Nodes
    | 'auth_login' | 'auth_logout' | 'auth_guard'
    // Data Nodes
    | 'json_parse' | 'script' | 'native_api'
    // Server-Side Nodes
    | 'db_trigger' | 'cron_trigger' | 'webhook_trigger'
    | 'send_email' | 'send_sms'
    | 'stripe_charge' | 'openai_completion'
    | 'db_query' | 'db_insert'
    // Billing Nodes
    | 'billing_report_usage' | 'billing_check_limit';
```

#### 2.2 UnifiedNode Interface

```typescript
interface UnifiedNode {
    id: string;
    type: LogicNodeType | string;
    name: string;
    position: { x: number; y: number };
    data: Record<string, any>;
    inputs: string[];
    outputs: string[];
}
```

#### 2.3 UnifiedConnection Interface

```typescript
interface UnifiedConnection {
    id: string;
    fromId: string;
    toId: string;
    port?: 'default' | 'true' | 'false' | string;
}
```

#### 2.4 UnifiedBlueprint Interface

```typescript
interface UnifiedBlueprint {
    id: string;
    name?: string;
    nodes: Record<string, UnifiedNode>;
    connections: UnifiedConnection[];
    variables: Record<string, { type: string; initialValue: any }>;
}
```

**Relationships**:
- `UnifiedConnection.fromId` → References `UnifiedNode.id`
- `UnifiedConnection.toId` → References `UnifiedNode.id`
- `DesignerElement.blueprintId` → References `UnifiedBlueprint.id`

### 3. Plugin Types (`src/types/plugins.ts`)

#### 3.1 PluginType Union

```typescript
type PluginType = 'panel' | 'element' | 'logic' | 'automation';
```

#### 3.2 PluginContext Interface

```typescript
interface PluginContext {
    projectId: string;
    projectName: string;
    addElement: (type: ElementType, parentId: string, props?: Partial<DesignerElement>) => string;
    updateElementStyles: (id: string, styles: Partial<ElementStyles>) => void;
    updateElementProp: (id: string, prop: string, value: any) => void;
    removeElement: (id: string) => void;
    addToken: (token: { name: string; value: string; type: 'color' | 'spacing' | 'typography' | 'shadow' | 'size' | 'opacity' }) => void;
    showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
    getState: () => any;
    dispatchCommand: (action: string, targetId: string, payload: any) => void;
    registerEngine: (id: string, engine: any) => void;
    getEngine: (id: string) => any;
}
```

#### 3.3 OMNIOSPlugin Interface

```typescript
interface OMNIOSPlugin {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    type: PluginType;
    icon?: string;
    init?: (context: PluginContext) => void;
    onEnable?: (context: PluginContext) => void;
    onDisable?: (context: PluginContext) => void;
    render?: (context: PluginContext) => React.ReactNode;
}
```

#### 3.4 PluginState Interface

```typescript
interface PluginState {
    id: string;
    isEnabled: boolean;
    config: Record<string, any>;
}
```

### 4. AI Action Types (`src/types/aiActions.ts`)

#### 4.1 AIActionType Union

```typescript
type AIActionType = 'create_element' | 'update_style' | 'update_content' | 'delete_element';
```

#### 4.2 AIAction Union Type

```typescript
type AIAction =
    | { type: 'create_element', payload: AIActionCreatePayload }
    | { type: 'update_style', payload: AIActionUpdateStylePayload }
    | { type: 'update_content', payload: AIActionUpdateContentPayload }
    | { type: 'delete_element', payload: AIActionDeletePayload };
```

#### 4.3 Payload Interfaces

**AIActionCreatePayload**:
```typescript
interface AIActionCreatePayload {
    type: ElementType;
    parentId: string;
    styles?: Record<string, string | number>;
    content?: string;
    props?: Record<string, any>;
}
```

**AIActionUpdateStylePayload**:
```typescript
interface AIActionUpdateStylePayload {
    elementId: string;
    styles: Record<string, string | number>;
}
```

**AIActionUpdateContentPayload**:
```typescript
interface AIActionUpdateContentPayload {
    elementId: string;
    content: string;
}
```

**AIActionDeletePayload**:
```typescript
interface AIActionDeletePayload {
    elementId: string;
}
```

#### 4.4 AIExecutionResult Interface

```typescript
interface AIExecutionResult {
    success: boolean;
    message?: string;
    actionType: AIActionType;
}
```

### 5. RBAC Types (`src/types/rbac.ts`)

#### 5.1 Role Union

```typescript
type Role = 'owner' | 'admin' | 'editor' | 'viewer';
```

#### 5.2 Permission Union

```typescript
type Permission =
    | 'project:read'
    | 'project:write'
    | 'project:delete'
    | 'secrets:read'
    | 'secrets:write'
    | 'ent:deploy'
    | 'users:read'
    | 'users:write';
```

#### 5.3 ROLE_PERMISSIONS Mapping

```typescript
const ROLE_PERMISSIONS: Record<Role, Permission[] | ['*']> = {
    owner: ['*'], // All permissions
    admin: [
        'project:read', 'project:write', 'project:delete',
        'secrets:read', 'secrets:write',
        'ent:deploy',
        'users:read', 'users:write'
    ],
    editor: [
        'project:read', 'project:write',
        'ent:deploy'
    ],
    viewer: [
        'project:read'
    ]
};
```

### 6. Intelligence Types (`src/types/intelligence.ts`)

#### 6.1 IssueSeverity Union

```typescript
type IssueSeverity = 'critical' | 'warning' | 'suggestion';
```

#### 6.2 IssueType Union

```typescript
type IssueType = 'accessibility' | 'layout' | 'responsive' | 'consistency';
```

#### 6.3 DesignContext Interface

```typescript
interface DesignContext {
    tokens: DesignToken[];
}
```

#### 6.4 DesignIssue Interface

```typescript
interface DesignIssue {
    id: string;
    type: IssueType;
    severity: IssueSeverity;
    message: string;
    elementId: string;
    description?: string;
    metadata?: Record<string, any>;
}
```

**Relationships**:
- `DesignIssue.elementId` → References `DesignerElement.id`

#### 6.5 DesignRule Interface

```typescript
interface DesignRule {
    id: string;
    name: string;
    check: (element: any, context: any) => DesignIssue | null;
}
```

## Type Relationships Diagram

### Core Hierarchy

```
ProjectState
├── pages: Record<string, DesignerPage>
│   └── rootElementId → DesignerElement
├── elements: Record<string, DesignerElement>
│   ├── parentId → DesignerElement
│   ├── children: DesignerElement.id[]
│   ├── masterComponentId → MasterComponent
│   ├── collectionId → Collection
│   └── blueprintId → UnifiedBlueprint
├── designSystem
│   ├── tokens: DesignToken[]
│   ├── classes: DesignClass[]
│   └── components: MasterComponent[]
│       └── elements: Record<string, DesignerElement>
├── blueprints: Record<string, UnifiedBlueprint>
│   ├── nodes: Record<string, UnifiedNode>
│   └── connections: UnifiedConnection[]
│       ├── fromId → UnifiedNode
│       └── toId → UnifiedNode
├── data: ProjectData
│   ├── collections: Collection[]
│   │   └── fields: CollectionField[]
│   ├── items: CollectionItem[]
│   │   ├── collectionId → Collection
│   │   └── tenantId → Tenant
│   ├── apiRequests: ApiRequest[]
│   ├── functions: ServerlessFunction[]
│   ├── secrets: Secret[]
│   │   └── envId → Environment
│   ├── webhooks: Webhook[]
│   └── users: User[]
├── tenants: Tenant[]
│   └── ownerId → User
└── environments: Environment[]
```

### Element Tree Structure

```
DesignerElement (root)
├── children: [DesignerElement.id, ...]
│   ├── DesignerElement (child 1)
│   │   ├── children: [...]
│   │   └── masterComponentId → MasterComponent
│   │       └── MasterComponent.elements: Record<string, DesignerElement>
│   └── DesignerElement (child 2)
│       └── collectionId → Collection
│           └── CollectionItem[] (data binding)
```

### Logic Blueprint Structure

```
UnifiedBlueprint
├── nodes: Record<string, UnifiedNode>
│   ├── UnifiedNode (event)
│   ├── UnifiedNode (action)
│   └── UnifiedNode (condition)
└── connections: UnifiedConnection[]
    ├── fromId → UnifiedNode
    └── toId → UnifiedNode
```

## Type Safety Features

### 1. Discriminated Unions
- `AIAction`: Type-safe action payloads
- `ElementType`: Type-safe element types
- `LogicNodeType`: Type-safe node types

### 2. Index Signatures
- `Record<string, T>`: Key-value mappings
- `[key: string]: any`: Flexible properties

### 3. Optional Properties
- Extensive use of `?` for optional fields
- Allows partial updates
- Supports progressive enhancement

### 4. Generic Constraints
- `Record<K, V>`: Type-safe records
- `Partial<T>`: Partial type support
- `Omit<T, K>`: Type exclusion

## Type Patterns

### 1. Reference Pattern
- IDs reference other entities
- Enables graph-like structures
- Supports lazy loading

### 2. Record Pattern
- `Record<string, T>` for maps
- Fast lookups
- Type-safe access

### 3. Union Pattern
- Multiple possible types
- Type narrowing
- Discriminated unions

### 4. Optional Pattern
- `T | null | undefined`
- Progressive enhancement
- Backward compatibility

## Type Coverage

### Complete Coverage
- ✅ All core entities
- ✅ All relationships
- ✅ All state structures
- ✅ All API contracts
- ✅ All plugin interfaces

### Partial Coverage
- ⚠️ Some `any` types (for flexibility)
- ⚠️ Some legacy types (logicNodes, logicEdges)
- ⚠️ Some metadata fields (Record<string, any>)

## Type Improvements Needed

1. **Stricter Types**:
   - Replace `any` with specific types
   - Add more discriminated unions
   - Better generic constraints

2. **Legacy Cleanup**:
   - Remove `logicNodes`/`logicEdges` arrays
   - Migrate to `blueprints` only
   - Update all references

3. **Validation**:
   - Add runtime type guards
   - Schema validation
   - Type narrowing helpers

4. **Documentation**:
   - JSDoc comments
   - Type examples
   - Usage patterns

## Type System Strengths

1. **Comprehensive**: Covers all aspects
2. **Hierarchical**: Clear relationships
3. **Extensible**: Easy to add new types
4. **Type-Safe**: Strong typing throughout
5. **Flexible**: Optional properties, unions

## Type System Weaknesses

1. **Some `any` Types**: Reduces type safety
2. **Legacy Types**: Old logic system types
3. **Large Interfaces**: Some interfaces are very large
4. **Missing Validation**: No runtime type checking
5. **Documentation**: Limited inline docs
