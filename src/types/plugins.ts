import { DesignerElement, ElementStyles, ElementType } from './designer';

export type PluginType = 'panel' | 'element' | 'logic' | 'automation';

export type PluginPermission =
    | 'canvas:read'        // Can read the element tree
    | 'canvas:write'       // Can modify/add elements
    | 'secrets:read'       // Can read project secrets (DANGEROUS)
    | 'network:external'   // Can make fetch calls to outside domains
    | 'storage:write'      // Can save data to local storage
    | 'auth:read';         // Can see current user info


export interface PluginContext {
    // Project Metadata
    projectId: string;
    projectName: string;

    // Core Actions (Bridged from Store)
    addElement: (type: ElementType, parentId: string, props?: Partial<DesignerElement>) => string;
    updateElementStyles: (id: string, styles: Partial<ElementStyles>) => void;
    updateElementProp: (id: string, prop: string, value: any) => void;
    removeElement: (id: string) => void;

    // Design System Actions
    addToken: (token: { name: string; value: string; type: 'color' | 'spacing' | 'typography' | 'shadow' | 'size' | 'opacity' }) => void;

    // UI Helpers
    showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;

    // State Access
    getState: () => any;

    // Engine SDK (Phase 20)
    dispatchCommand: (action: string, targetId: string, payload: any) => void;
    registerEngine: (id: string, engine: any) => void;
    getEngine: (id: string) => any;
}

export interface OMNIOSPlugin {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    type: PluginType;
    icon?: string; // Lucide icon name or SVG string

    // Lifecycle
    init?: (context: PluginContext) => void;
    onEnable?: (context: PluginContext) => void;
    onDisable?: (context: PluginContext) => void;

    // Render (for 'panel' type)
    render?: (context: PluginContext) => React.ReactNode;
}

export interface PluginState {
    id: string;
    isEnabled: boolean;
    config: Record<string, any>;
}
