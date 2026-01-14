"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DesignerElement, ElementStyles, DesignClass, LogicConnection, LogicNode, DebugLog, ProjectState, ProjectContextType, Asset, APISource, LogicBlueprint, TokenType, ElementType, AssetLibrary, AnalyticsEvent, HeatmapPoint, FunnelStep, AnalyticsFunnel, Collection, AnimationSequence, ServerlessFunction, Tenant } from '../types/designer';
import * as Icons from 'lucide-react';
import { convertFreedomToSafety, smartStackElements } from '../lib/layout/layoutEngine';
import { aiBridgeSource } from '../lib/ai/aiBridge';
import { nativeBridge } from '../lib/native/nativeBridge';
import { generateComponent } from '../lib/ai/mockGenerator';
import { localizationAgent } from '../lib/ai/LocalizationAgent';
import { deployToVercel, deployToNetlify, pollDeploymentStatus, DeploymentResult } from '../lib/deployment/DeploymentService';
import { useEffect } from 'react';
import { dataLoader } from '@/lib/db/loader';
import { hyperBridge } from '../lib/engine/HyperBridge';
import { collabService } from '../lib/collab/CollabService';
import { gitService } from '../lib/git/GitService';
import { generateCode } from '../lib/compiler/codeGenerator';
import { parseComponentAction } from '../lib/compiler/parserAction';
import { authService } from '../lib/auth/AuthService';
import { secretService } from '../lib/secrets/SecretService';
import { HyperCommand } from '../types/designer';



const initialState: ProjectState = {
    id: 'project-1',
    name: 'Untitled Project',
    activePageId: 'page-home',
    elements: {},
    rootElementId: 'root',
    pages: { 'index': { id: 'index', name: 'Home', rootElementId: 'root', path: '/', slug: '/' } },

    // Batch 16.1: Logic Debugger
    debugger: {
        mode: 'running',
        activeNodeId: null,
        breakpoints: [],
        executionSpeed: 500,
        callStack: [],
        logs: [],
        eventQueue: [],
        history: []
    },

    teamLibraries: [], // Framer18: Initialization
    designSystem: { tokens: [], classes: [], components: [] }, // Initialize Design System

    previewMode: false,
    viewMode: 'desktop',
    workspaceMode: 'design',
    activeState: 'none',
    highlightedControl: null,
    blueprints: {},
    logicNodes: [], // Batch 8.4
    logicEdges: [], // Batch 8.4
    globalVariables: {},
    selectedElementId: null,
    selectedElementIds: [],
    canvasScale: 1,
    data: {
        collections: [
            {
                id: 'posts',
                name: 'Blog Posts',
                slug: 'posts',
                type: 'relational', // Added missing type
                fields: [
                    { id: 'f1', name: 'Title', type: 'text' },
                    { id: 'f2', name: 'Cover Image', type: 'image' },
                    { id: 'f3', name: 'Publish Date', type: 'date' },
                    { id: 'f4', name: 'Content', type: 'rich-text' }
                ]
            }
        ],
        items: [
            { id: 'i1', collectionId: 'posts', values: { id: 'p1', title: 'Hello World', slug: 'hello-world' }, createdAt: Date.now(), updatedAt: Date.now() },
            { id: 'i2', collectionId: 'posts', values: { id: 'p2', title: 'Second Post', slug: 'second-post' }, createdAt: Date.now(), updatedAt: Date.now() }
        ],
        apiRequests: [],
        functions: [], // Batch 3.3
        secrets: [],    // Batch 3.3
        webhooks: [],   // Batch 3.4
        users: [        // Batch 3.5
            { id: 'u1', email: 'test@example.com', role: 'editor', metadata: { name: 'Test User' } }
        ]
    },
    editingElementId: null,
    editingClassId: null,
    hoveredElementId: null,
    activeItemId: null,
    auth: {
        currentUser: null,
        isPreviewMode: false,
    },
    theme: 'dark',
    canvasPosition: { x: 0, y: 0 },
    dragState: { isDragging: false, type: null, id: null, targetId: null, position: null },
    cart: {
        items: [],
        isOpen: false,
        shippingTotal: 0,
        taxTotal: 0,
        currency: 'USD'
    },
    assets: [],
    assetFolders: [],
    userTier: 'pro', // Default for dev
    activeMode: 'dark',
    variables: {},
    apiSources: [],
    mappedData: {},
    staticMode: false,
    subscriptionStatus: null,
    seo: {
        title: 'Untitled Project',
        description: 'Created with OMNIOS',
        schemaType: 'Website'
    },
    deployment: {
        provider: null,
        token: null,
        isConnected: false,
        history: []
    },
    gitStatus: 'idle',
    debugLogs: [],
    localization: {
        locales: [{ code: 'en', name: 'English', isRTL: false }],
        activeLocale: 'en'
    },
    translations: {}, // Batch 5.3
    analytics: {
        events: [],
        funnels: [
            {
                id: 'mock-funnel-1',
                name: 'Main Conversion Path',
                steps: [
                    { id: 's1', name: 'Landing', targetId: 'home', type: 'page' },
                    { id: 's2', name: 'Product Click', targetId: 'btn-shop', type: 'click' },
                    { id: 's3', name: 'Checkout', targetId: 'checkout-page', type: 'page' }
                ]
            }
        ],
        heatmap: [
            { x: 400, y: 300, intensity: 0.8, elementId: 'hero' },
            { x: 120, y: 450, intensity: 0.5, elementId: 'cta' },
            { x: 600, y: 200, intensity: 0.9, elementId: 'nav-logo' }
        ],
        isHeatmapEnabled: false
    },
    // Framer20: OS Architecture
    platform: 'web',
    isCommandBarOpen: false,
    osSettings: {
        showTitleBar: true,
        isMaximized: false,
        theme: 'system'
    },
    currTheme: 'theme-default',
    nativeWindows: [
        { id: 'win-layers', type: 'layers', isOpen: true, isDetached: false },
        { id: 'win-props', type: 'properties', isOpen: true, isDetached: false },
        { id: 'win-logic', type: 'logic', isOpen: false, isDetached: false },
        { id: 'win-preview', type: 'preview', isOpen: false, isDetached: false }
    ],
    isPenToolActive: false,
    isUIVisible: true,
    isSpacePressed: false,
    activeCursor: null, // Batch 6.1


    currentUser: {
        id: 'guest',
        email: '',
        role: 'viewer',
        isAuthenticated: false,
        metadata: {}
    },
    serverlessFunctions: {}, // Batch 5.3
    aiChatHistory: [], // Batch 6.1
    engineMode: 'standard',
    workflows: {}, // Batch 11.2
    installedPlugins: [], // Batch 11.3
    activeTenantId: null, // Phase 12: Multi-Tenancy
    tenants: [], // Batch 12.2: SaaS Admin Dashboard
    environments: [] // Batch 13.2
};




const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ProjectState>(initialState);
    const [isInitialized, setIsInitialized] = useState(false);

    const [history, setHistory] = useState<{ past: ProjectState[], future: ProjectState[] }>({ past: [], future: [] });

    // Batch 23.3: Register Cyber-Nexus State Provider
    useEffect(() => {
        import('@/lib/intelligence/CyberNexus').then(mod => {
            mod.cyberNexus.registerProvider(() => state);
        });
    }, [state]);

    // --- Batch 9.2: The Hive Persistence ---
    const hasLoaded = React.useRef(false);
    useEffect(() => {
        if (!hasLoaded.current) {
            hasLoaded.current = true;
            dataLoader.loadProject('project-1').then(loadedState => {
                if (loadedState) {
                    console.log("[Hive] Restoring project state from PGlite...");
                    setState(prev => ({ ...prev, ...loadedState }));
                }
            });
        }
    }, []);

    // Debounced Auto-Save
    useEffect(() => {
        const timer = setTimeout(() => {
            if (hasLoaded.current) {
                console.log("[Hive] Syncing to local database...");
                dataLoader.saveProject(state);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [state.elements, state.logicNodes, state.logicEdges, state.designSystem, state.serverlessFunctions]);

    useEffect(() => {
        if (!isInitialized) {
            setState(prev => ({ ...prev, platform: nativeBridge.platform }));
        }
    }, [isInitialized]);

    // Batch 10.2: Optimized Delta Initializer (One-shot sync)
    useEffect(() => {
        const initEngine = async () => {
            if (!isInitialized) {
                try {
                    // 1. Sync State (Potential WASM Failure Point)
                    await hyperBridge.syncState(state);

                    // 2. Batch 6.2: Anti-Flicker - Pull computed layout
                    const deltas = hyperBridge.getStateDeltas();
                    if (deltas.length > 0) {
                        setState(prev => {
                            const nextElements = { ...prev.elements };
                            deltas.forEach(el => {
                                nextElements[el.id] = { ...prev.elements[el.id], ...el };
                            });
                            return { ...prev, elements: nextElements };
                        });
                    }
                } catch (err) {
                    console.error("[CRITICAL] HyperEngine Sync Failed during Init:", err);
                    // Fallback to React layout if Rust fails
                } finally {
                    setIsInitialized(true);
                }
            }
        };
        initEngine();
    }, [isInitialized]);

    // Batch 10.2: Delta Poller (Pull engine-driven updates)
    useEffect(() => {
        const interval = setInterval(() => {
            const deltas = hyperBridge.getStateDeltas();
            if (deltas.length > 0) {
                setState(prev => {
                    const nextElements = { ...prev.elements };
                    deltas.forEach(el => {
                        // Merge delta into local state
                        nextElements[el.id] = { ...prev.elements[el.id], ...el };
                    });
                    return { ...prev, elements: nextElements };
                });
            }
        }, 100);
        return () => clearInterval(interval);
    }, [isInitialized]);

    // Logic Kernel Handlers: Batch 5.3.1
    useEffect(() => {
        const unsubs = [
            hyperBridge.registerHandler('update_variable', (payload: any) => {
                try {
                    const { id, value } = JSON.parse(payload);
                    const varEntry = Object.entries(state.globalVariables).find(([_, v]) => v.id === id);
                    const varName = varEntry ? varEntry[0] : id;
                    setVariable(varName, value);
                } catch (e) { console.error("Logic Engine Variable Sync Error:", e); }
            }),
            hyperBridge.registerHandler('navigate', (path: string) => {
                const pageId = Object.keys(state.pages).find(id => state.pages[id].path === path);
                if (pageId) switchPage(pageId);
                else if (path.startsWith('http')) window.open(path, '_blank');
            })
        ];
        // Cleanup not strictly necessary for this singleton bridge but good practice
        // return () => unsubs.forEach(u => u?.()); 
    }, [state.globalVariables, state.pages]);

    const pushToHistory = useCallback((currentState: ProjectState) => {
        setHistory(prev => ({
            past: [...prev.past, currentState],
            future: []
        }));
    }, []);

    const dispatchCommand = useCallback((command: HyperCommand, isRemote: boolean = false) => {
        // 1. Sync to Rust Engine (Always)
        hyperBridge.commit(command);

        // 2. Broadcast to Peers (Only if local)
        if (!isRemote) {
            collabService.broadcastCommand(command);
            // Only push to history for local user actions
            pushToHistory(state);
        }

        // 3. Apply to React State
        setState(prev => {
            const nextElements = { ...prev.elements };
            const nextBlueprints = { ...prev.blueprints };

            switch (command.action) {
                case 'UPDATE_STYLE': {
                    const { targetId, payload } = command;
                    const { updates, variant, viewMode } = payload;
                    const element = nextElements[targetId];
                    if (!element) return prev;

                    let targetKey: keyof DesignerElement = 'styles';
                    if (viewMode === 'mobile') targetKey = 'mobileStyles';
                    else if (viewMode === 'tablet') targetKey = 'tabletStyles';

                    if (variant) {
                        nextElements[targetId] = {
                            ...element,
                            variants: {
                                ...(element.variants || {}),
                                [variant]: { ...(element.variants?.[variant] || {}), ...updates }
                            }
                        };
                    } else {
                        nextElements[targetId] = {
                            ...element,
                            [targetKey]: { ...(element[targetKey] as any || {}), ...updates }
                        };
                    }
                    break;
                }
                case 'UPDATE_PROP': {
                    const { targetId, payload } = command;
                    const { prop, value } = payload;
                    if (!nextElements[targetId]) return prev;
                    nextElements[targetId] = { ...nextElements[targetId], [prop]: value };
                    break;
                }
                case 'ADD_ELEMENT': {
                    const { targetId, payload } = command;
                    const { element, parentId, index } = payload;
                    nextElements[targetId] = element;

                    const parent = nextElements[parentId];
                    if (parent) {
                        const nextChildren = [...(parent.children || [])];
                        if (typeof index === 'number') {
                            nextChildren.splice(index, 0, targetId);
                        } else {
                            nextChildren.push(targetId);
                        }
                        nextElements[parentId] = { ...parent, children: nextChildren };
                    }
                    break;
                }
                case 'REMOVE_ELEMENT': {
                    const { targetId } = command;
                    const element = nextElements[targetId];
                    if (!element) return prev;

                    delete nextElements[targetId];
                    const parentId = element.parentId;
                    if (parentId && nextElements[parentId]) {
                        const parent = nextElements[parentId];
                        // Remove from children
                        if (parent.children?.includes(targetId)) {
                            nextElements[parentId] = {
                                ...parent,
                                children: parent.children.filter(cid => cid !== targetId)
                            };
                        }
                        // Remove from slotContent
                        else if (parent.slotContent) {
                            const slots = { ...parent.slotContent };
                            let changed = false;
                            Object.keys(slots).forEach(slotName => {
                                if (slots[slotName].includes(targetId)) {
                                    slots[slotName] = slots[slotName].filter(cid => cid !== targetId);
                                    changed = true;
                                }
                            });
                            if (changed) {
                                nextElements[parentId] = { ...parent, slotContent: slots };
                            }
                        }
                    }
                    break;
                }
                case 'REORDER_ELEMENT': {
                    const { targetId, payload } = command;
                    const { parentId, newIndex } = payload;
                    const element = nextElements[targetId];
                    if (!element) return prev;

                    // Remove from old parent
                    const oldParentId = element.parentId;
                    if (oldParentId && nextElements[oldParentId]) {
                        const oldParent = nextElements[oldParentId];
                        nextElements[oldParentId] = {
                            ...oldParent,
                            children: oldParent.children?.filter(id => id !== targetId)
                        };
                    }

                    // Add to new parent
                    const parent = nextElements[parentId];
                    if (parent) {
                        const nextChildren = (parent.children || []).filter(id => id !== targetId);
                        nextChildren.splice(newIndex, 0, targetId);
                        nextElements[parentId] = { ...parent, children: nextChildren };
                    }
                    nextElements[targetId] = { ...element, parentId };
                    break;
                }
                case 'ADD_LOGIC_NODE': {
                    const { targetId, payload } = command; // targetId is blueprintId
                    const { node } = payload;
                    const blueprint = nextBlueprints[targetId];
                    if (blueprint) {
                        nextBlueprints[targetId] = {
                            ...blueprint,
                            nodes: { ...blueprint.nodes, [node.id]: node }
                        };
                    }
                    break;
                }
                case 'MOVE_LOGIC_NODE': {
                    const { targetId, payload } = command; // targetId is blueprintId
                    const { nodeId, x, y } = payload;
                    const blueprint = nextBlueprints[targetId];
                    if (blueprint && blueprint.nodes[nodeId]) {
                        nextBlueprints[targetId] = {
                            ...blueprint,
                            nodes: {
                                ...blueprint.nodes,
                                [nodeId]: { ...blueprint.nodes[nodeId], position: { x, y } }
                            }
                        };
                    }
                    break;
                }
                case 'REMOVE_LOGIC_NODE': {
                    const { targetId, payload } = command;
                    const { nodeId } = payload;
                    const blueprint = nextBlueprints[targetId];
                    if (blueprint) {
                        const nextNodes = { ...blueprint.nodes };
                        delete nextNodes[nodeId];
                        nextBlueprints[targetId] = {
                            ...blueprint,
                            nodes: nextNodes,
                            connections: blueprint.connections.filter(c => c.fromId !== nodeId && c.toId !== nodeId)
                        };
                    }
                    break;
                }
                case 'ADD_LOGIC_CONNECTION': {
                    const { targetId, payload } = command;
                    const { connection } = payload;
                    const blueprint = nextBlueprints[targetId];
                    if (blueprint) {
                        nextBlueprints[targetId] = {
                            ...blueprint,
                            connections: [...blueprint.connections, connection]
                        };
                    }
                    break;
                }
                case 'REMOVE_LOGIC_CONNECTION': {
                    const { targetId, payload } = command;
                    const { connectionId } = payload;
                    const blueprint = nextBlueprints[targetId];
                    if (blueprint) {
                        nextBlueprints[targetId] = {
                            ...blueprint,
                            connections: blueprint.connections.filter(c => c.id !== connectionId)
                        };
                    }
                    break;
                }
                case 'UPDATE_SCHEMA': {
                    const { payload } = command;
                    const { collections } = payload;
                    // For now, full collections sync for complexity-prone schema changes
                    return { ...prev, data: { ...prev.data, collections } };
                }
                case 'UPDATE_TOKEN': {
                    const { payload } = command;
                    const ds = { ...prev.designSystem };
                    if (payload.token) {
                        const tokens = ds.tokens.map(t => t.id === payload.token.id ? payload.token : t);
                        if (!tokens.find(t => t.id === payload.token.id)) tokens.push(payload.token);
                        ds.tokens = tokens;
                    } else if (payload.id && payload.type === 'delete') {
                        ds.tokens = ds.tokens.filter(t => t.id !== payload.id);
                    }
                    return { ...prev, designSystem: ds };
                }
                case 'UPDATE_CLASS': {
                    const { payload } = command;
                    const ds = { ...prev.designSystem };
                    if (payload.class) {
                        const classes = ds.classes.map(c => c.id === payload.class.id ? payload.class : c);
                        if (!classes.find(c => c.id === payload.class.id)) classes.push(payload.class);
                        ds.classes = classes;
                    } else if (payload.id && payload.type === 'delete') {
                        ds.classes = ds.classes.filter(c => c.id !== payload.id);
                    }
                    return { ...prev, designSystem: ds };
                }
                case 'MANAGE_COMPONENT': {
                    const { payload } = command;
                    const ds = { ...prev.designSystem };
                    if (payload.component) {
                        const components = ds.components.map(c => c.id === payload.component.id ? payload.component : c);
                        if (!components.find(c => c.id === payload.component.id)) ds.components.push(payload.component);
                        else ds.components = components;
                    }
                    return { ...prev, designSystem: ds };
                }
                case 'MANAGE_ANIMATION': {
                    const { targetId, payload } = command; // targetId is elementId
                    const { sequenceId, sequence, type } = payload;
                    const el = nextElements[targetId];
                    if (el) {
                        const sequences = { ...(el.animationSequences || {}) };
                        if (type === 'delete') delete sequences[sequenceId];
                        else sequences[sequenceId] = sequence;
                        nextElements[targetId] = { ...el, animationSequences: sequences };
                    }
                    break;
                }
                case 'SYNC_FULL_STATE': {
                    return { ...prev, ...command.payload }; // Sync anything in payload
                }
            }

            return { ...prev, elements: nextElements, blueprints: nextBlueprints };
        });
    }, [pushToHistory, state]);

    // ... (Existing Functions: switchPage, setSelectedElement, initializeProject) ... 
    // I need to be careful not to overwrite them since I am splicing.
    // I'll assume the surrounding code remains, just injecting the actions.


    const applyClass = useCallback((elementId: string, classId: string | undefined) => {
        pushToHistory(state);
        setState(prev => ({
            ...prev,
            elements: { ...prev.elements, [elementId]: { ...prev.elements[elementId], classNames: classId ? [classId] : [] } }
        }));
    }, [state, pushToHistory]);

    const addClass = useCallback((elementId: string, classId: string) => {
        pushToHistory(state);
        setState(prev => {
            const el = prev.elements[elementId];
            if (!el) return prev;
            const currentClasses = el.classNames || [];
            if (currentClasses.includes(classId)) return prev;

            return {
                ...prev,
                elements: {
                    ...prev.elements,
                    [elementId]: {
                        ...el,
                        classNames: [...currentClasses, classId]
                    }
                }
            };
        });
    }, [state, pushToHistory]);

    const removeClass = useCallback((elementId: string, classId: string) => {
        pushToHistory(state);
        setState(prev => {
            const el = prev.elements[elementId];
            if (!el) return prev;
            const currentClasses = el.classNames || [];
            const newClasses = currentClasses.filter(c => c !== classId);

            return {
                ...prev,
                elements: {
                    ...prev.elements,
                    [elementId]: {
                        ...el,
                        classNames: newClasses
                    }
                }
            };
        });
    }, [state, pushToHistory]);

    // --- Component Logic ---



    // Component Prop Actions
    const addComponentProp = useCallback((componentId: string, prop: any) => {
        pushToHistory(state);
        setState(prev => ({
            ...prev,
            designSystem: {
                ...prev.designSystem,
                components: prev.designSystem.components.map(c =>
                    c.id === componentId
                        ? { ...c, props: [...(c.props || []), { ...prop, id: Math.random().toString(36).substr(2, 9) }] }
                        : c
                )
            },
            debugLogs: [
                {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: Date.now(),
                    type: 'audit',
                    message: `Added prop '${prop.name}' to component`
                },
                ...prev.debugLogs.slice(0, 49)
            ]
        }));
    }, [state, pushToHistory]);

    const deleteComponentProp = useCallback((componentId: string, propId: string) => {
        pushToHistory(state);
        setState(prev => ({
            ...prev,
            designSystem: {
                ...prev.designSystem,
                components: prev.designSystem.components.map(c =>
                    c.id === componentId
                        ? { ...c, props: c.props?.filter(p => p.id !== propId) }
                        : c
                )
            }
        }));
    }, [state, pushToHistory]);




    const updateElementStateStyle = useCallback((elementId: string, stateName: string, styles: any) => {
        setState(prev => {
            const element = prev.elements[elementId];
            if (!element) return prev;

            const currentVariants = element.variants || {};
            const currentVariantStyles = currentVariants[stateName] || {};
            const newStyles = { ...currentVariantStyles, ...styles };

            const newState = {
                ...prev,
                elements: {
                    ...prev.elements,
                    [elementId]: {
                        ...element,
                        variants: {
                            ...currentVariants,
                            [stateName]: newStyles
                        }
                    }
                }
            };

            // Batch 10.1: Command-Sourced Mutation
            hyperBridge.commit({
                id: Math.random().toString(36).substr(2, 9),
                action: 'UPDATE_STYLE',
                targetId: elementId,
                payload: { updates: styles, variant: stateName },
                timestamp: Date.now()
            });

            return newState;
        });
    }, [state, pushToHistory]);

    const setVariableBinding = useCallback((elementId: string, propName: string, value: string | null, bindingType: 'variable' | 'collection' = 'variable') => {
        pushToHistory(state);
        setState(prev => {
            const element = prev.elements[elementId];
            if (!element) return prev;

            if (bindingType === 'collection') {
                // Update Data Bindings
                const newBindings = { ...(element.bindings || {}) };
                if (value) {
                    newBindings[propName] = value;
                } else {
                    delete newBindings[propName];
                }
                return {
                    ...prev,
                    elements: {
                        ...prev.elements,
                        [elementId]: { ...element, bindings: newBindings }
                    }
                };
            } else {
                // Update Global Variable Bindings
                const newBindings = { ...(element.variableBindings || {}) };
                if (value) {
                    newBindings[propName] = value;
                } else {
                    delete newBindings[propName];
                }
                return {
                    ...prev,
                    elements: {
                        ...prev.elements,
                        [elementId]: { ...element, variableBindings: newBindings }
                    }
                };
            }
        });
    }, [state, pushToHistory]);

    const addVariant = useCallback((elementId: string, name: string) => {
        pushToHistory(state);
        setState(prev => {
            const el = prev.elements[elementId];
            if (!el) return prev;
            return {
                ...prev,
                elements: {
                    ...prev.elements,
                    [elementId]: {
                        ...el,
                        variants: { ...(el.variants || {}), [name]: {} }
                    }
                }
            };
        });
    }, [state, pushToHistory]);

    const removeVariant = useCallback((elementId: string, name: string) => {
        pushToHistory(state);
        setState(prev => {
            const el = prev.elements[elementId];
            if (!el) return prev;
            const newVariants = { ...(el.variants || {}) };
            delete newVariants[name];
            return {
                ...prev,
                elements: {
                    ...prev.elements,
                    [elementId]: {
                        ...el,
                        variants: newVariants
                    }
                }
            };
        });
    }, [state, pushToHistory]);

    const setInstancePropValue = useCallback((elementId: string, propId: string, value: string) => {
        pushToHistory(state);
        setState(prev => ({
            ...prev,
            elements: {
                ...prev.elements,
                [elementId]: {
                    ...prev.elements[elementId],
                    props: { ...prev.elements[elementId].props, [propId]: value }
                }
            }
        }));
    }, [state, pushToHistory]);

    const setPageCollection = useCallback((pageId: string, collectionId?: string) => {
        pushToHistory(state);
        setState(prev => ({
            ...prev,
            pages: {
                ...prev.pages,
                [pageId]: { ...prev.pages[pageId], collectionId }
            }
        }));
    }, [state, pushToHistory]);

    const setActiveItemId = useCallback((itemId: string | null) => {
        setState(prev => ({ ...prev, activeItemId: itemId }));
    }, []);

    const setGlobalCursor = useCallback((cursor: string | null) => {
        setState(prev => ({ ...prev, activeCursor: cursor }));
    }, []);

    const addToCart = useCallback((item: { productId: string, name: string, price: number, image?: string, type?: 'physical' | 'digital' | 'subscription', taxRate?: number, shippingClass?: 'digital' | 'standard' | 'heavy' }) => {
        setState(prev => {
            const existing = prev.cart.items.find(i => i.productId === item.productId);
            let newItems;

            if (existing) {
                newItems = prev.cart.items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i);
            } else {
                newItems = [...prev.cart.items, {
                    ...item,
                    id: Math.random().toString(36).substr(2, 9),
                    quantity: 1,
                    type: item.type || 'physical',
                    taxRate: item.taxRate || 0.0,
                    shippingClass: item.shippingClass || 'standard'
                }];
            }

            // Calculate Totals
            const subtotal = newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            const taxTotal = newItems.reduce((acc, i) => acc + ((i.price * (i.taxRate || 0)) * i.quantity), 0);

            const shippingTotal = newItems.reduce((acc, i) => {
                if (i.type === 'digital' || i.shippingClass === 'digital') return acc;
                const rate = i.shippingClass === 'heavy' ? 25 : 10;
                return acc + (rate * i.quantity);
            }, 0);

            return {
                ...prev,
                cart: {
                    ...prev.cart,
                    items: newItems,
                    isOpen: true,
                    taxTotal: parseFloat(taxTotal.toFixed(2)),
                    shippingTotal: parseFloat(shippingTotal.toFixed(2))
                }
            };
        });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setState(prev => {
            const newItems = prev.cart.items.filter(i => i.id !== itemId);

            // Recalculate Totals
            const taxTotal = newItems.reduce((acc, i) => acc + ((i.price * (i.taxRate || 0)) * i.quantity), 0);

            const shippingTotal = newItems.reduce((acc, i) => {
                if (i.type === 'digital' || i.shippingClass === 'digital') return acc;
                const rate = i.shippingClass === 'heavy' ? 25 : 10;
                return acc + (rate * i.quantity);
            }, 0);

            return {
                ...prev,
                cart: {
                    ...prev.cart,
                    items: newItems,
                    taxTotal: parseFloat(taxTotal.toFixed(2)),
                    shippingTotal: parseFloat(shippingTotal.toFixed(2))
                }
            };
        });
    }, []);

    const toggleCart = useCallback((isOpen?: boolean) => {
        setState(prev => ({
            ...prev,
            cart: {
                ...prev.cart,
                isOpen: isOpen !== undefined ? isOpen : !prev.cart.isOpen
            }
        }));
    }, []);

    const setHighlightedControl = useCallback((control: string | null) => {
        setState(prev => ({ ...prev, highlightedControl: control }));
    }, []);

    const setViewMode = useCallback((mode: ProjectState['viewMode']) => {
        setState(prev => ({ ...prev, viewMode: mode }));
    }, []);

    const setActiveState = useCallback((activeState: ProjectState['activeState']) => {
        setState(prev => ({ ...prev, activeState }));
    }, []);


    const setElementCode = useCallback((elementId: string, type: 'onMount' | 'onHover' | 'onClick', code: string) => {
        pushToHistory(state);
        setState(prev => ({
            ...prev,
            elements: {
                ...prev.elements,
                [elementId]: {
                    ...prev.elements[elementId],
                    customCode: {
                        code: '', // Ensure code default 
                        ...prev.elements[elementId].customCode,
                        [type]: code
                    }
                }
            }
        }));
    }, [state, pushToHistory]);

    const createMasterComponent = useCallback((elementId: string, name: string) => {
        const rootElement = state.elements[elementId];
        if (!rootElement) return;

        const componentId = Math.random().toString(36).substr(2, 9);
        const componentElements: Record<string, DesignerElement> = {};

        const traverseAndCollect = (currentId: string) => {
            const el = state.elements[currentId];
            if (!el) return;
            componentElements[currentId] = { ...el, parentId: el.id === elementId ? null : el.parentId };
            el.children?.forEach(traverseAndCollect);
        };
        traverseAndCollect(elementId);

        const newComponent = {
            id: componentId,
            name: name,
            rootElementId: elementId,
            elements: componentElements,
            props: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        const nextElements = { ...state.elements };
        const deleteChildren = (pid: string) => {
            const children = state.elements[pid]?.children || [];
            children.forEach(cid => {
                deleteChildren(cid);
                delete nextElements[cid];
            });
        };
        deleteChildren(elementId);

        nextElements[elementId] = {
            ...rootElement,
            type: 'instance',
            componentId: componentId,
            children: [],
            slotContent: {}
        } as any;

        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'MANAGE_COMPONENT',
            targetId: 'designSystem',
            payload: { component: newComponent, elements: nextElements },
            timestamp: Date.now()
        });
    }, [state.elements, dispatchCommand]);

    const instantiateComponent = useCallback((componentId: string, parentId: string) => {
        const component = state.designSystem.components?.find(c => c.id === componentId);
        if (!component) return;

        const instanceId = Math.random().toString(36).substr(2, 9);
        const defaultProps: Record<string, string> = {};
        if (component.props) {
            component.props.forEach(p => {
                defaultProps[p.id] = p.defaultValue;
            });
        }

        const instanceElement: DesignerElement = {
            id: instanceId,
            type: 'instance',
            componentId: componentId,
            parentId: parentId,
            layoutMode: 'freedom',
            styles: { width: '100%', height: 'auto', display: 'block' },
            slotContent: {},
            props: defaultProps as any,
            children: []
        };

        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'ADD_ELEMENT',
            targetId: instanceId,
            payload: { element: instanceElement, parentId, index: state.elements[parentId]?.children?.length },
            timestamp: Date.now()
        });
    }, [state.designSystem.components, state.elements, dispatchCommand]);



    const switchPage = useCallback((pageId: string) => {
        setState(prev => {
            if (!prev.pages[pageId]) {
                console.error(`Page ${pageId} not found in state.pages`, prev.pages);
                return prev;
            }
            return {
                ...prev,
                activePageId: pageId,
                rootElementId: prev.pages[pageId].rootElementId,
                selectedElementId: null,
                selectedElementIds: []
            };
        });
    }, []);

    const setSelectedElement = useCallback((id: string | null) => {
        setState(prev => ({
            ...prev,
            selectedElementId: id,
            selectedElementIds: id ? [id] : []
        }));
    }, []);

    const setSelectedElements = useCallback((ids: string[]) => {
        setState(prev => ({
            ...prev,
            selectedElementId: ids.length > 0 ? ids[0] : null,
            selectedElementIds: ids
        }));
    }, []);

    const selectArea = useCallback((x: number, y: number, width: number, height: number) => {
        // High-performance spatial query via Rust engine
        const ids = hyperBridge.queryArea(x, y, width, height);
        setSelectedElements(ids);
    }, [setSelectedElements]);

    const toggleSelection = useCallback((id: string) => {
        setState(prev => {
            const isSelected = prev.selectedElementIds.includes(id);
            const newIds = isSelected
                ? prev.selectedElementIds.filter(idx => idx !== id)
                : [...prev.selectedElementIds, id];

            return {
                ...prev,
                selectedElementId: newIds.length > 0 ? newIds[0] : null,
                selectedElementIds: newIds
            };
        });
    }, []);

    const clearSelection = useCallback(() => {
        setState(prev => ({
            ...prev,
            selectedElementId: null,
            selectedElementIds: []
        }));
    }, []);

    const initializeProject = useCallback((theme: any) => {
        console.log('[Store] Initializing Project starting...', theme);
        try {
            if (theme.id === 'blank') {
                console.log('[Store] Setting blank state');
                setState({
                    ...initialState,
                    designSystem: { tokens: [], classes: [], components: [] },
                    elements: {
                        'root': {
                            id: 'root',
                            type: 'container',
                            parentId: null,
                            styles: { width: '100%', minHeight: '100vh', backgroundColor: '#050505', display: 'flex', flexDirection: 'column' },
                            layoutMode: 'safety',
                            children: [],
                        }
                    },
                    rootElementId: 'root',
                    activePageId: 'index',
                    pages: { 'index': { id: 'index', name: 'Home', rootElementId: 'root', path: '/', slug: '/' } }
                });
            } else if (theme.state) {
                const newState = theme.state;
                console.log('[Store] Setting theme state:', newState);
                setState({
                    ...initialState,
                    ...newState,
                    designSystem: newState.designSystem || { tokens: [], classes: [], components: [] },
                    activePageId: newState.activePageId || Object.keys(newState.pages)[0],
                    rootElementId: newState.pages[newState.activePageId || Object.keys(newState.pages)[0]].rootId
                });
            }
            console.log('[Store] Calling setIsInitialized(true)');
            setIsInitialized(true);
            console.log('[Store] Initialization complete');
        } catch (error) {
            console.error('[Store] Initialization CRASHED:', error);
        }
    }, []);

    // History and Undo/Redo...

    // ... (Use existing history logic, just need to bridge it) ...



    // ... (Existing undo/redo actions) ...

    const undoCommand = useCallback(() => {
        if (history.past.length === 0) return;

        const previousState = history.past[history.past.length - 1];
        const newPast = history.past.slice(0, -1);

        setHistory({
            past: newPast,
            future: [state, ...history.future]
        });
        setState(previousState);
    }, [history, state]);

    const redoCommand = useCallback(() => {
        if (history.future.length === 0) return;

        const nextState = history.future[0];
        const newFuture = history.future.slice(1);

        setHistory({
            past: [...history.past, state],
            future: newFuture
        });
        setState(nextState);
    }, [history, state]);

    // ... (Existing wrappers) ...

    const addElement = useCallback((type: ElementType, parentId: string, initialProps?: Partial<DesignerElement>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newElement: DesignerElement = {
            id,
            type,
            parentId,
            styles: {},
            ...initialProps
        };

        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'ADD_ELEMENT',
            targetId: id,
            payload: { element: newElement, parentId, index: state.elements[parentId]?.children?.length },
            timestamp: Date.now()
        });

        return id;
    }, [state, dispatchCommand]);

    const setEditingClassId = useCallback((id: string | null) => {
        setState(prev => ({ ...prev, editingClassId: id }));
    }, []);

    // Framer17: Localization Actions
    const addLocale = useCallback((code: string, name: string, isRTL: boolean) => {
        pushToHistory(state);
        setState(prev => ({
            ...prev,
            localization: {
                ...prev.localization,
                locales: [...prev.localization.locales, { code, name, isRTL }]
            }
        }));
    }, [state, pushToHistory]);

    const removeLocale = useCallback((code: string) => {
        if (code === 'en') return; // Protect default
        pushToHistory(state);
        setState(prev => ({
            ...prev,
            localization: {
                ...prev.localization,
                locales: prev.localization.locales.filter(l => l.code !== code),
                activeLocale: prev.localization.activeLocale === code ? 'en' : prev.localization.activeLocale
            }
        }));
    }, [state, pushToHistory]);

    const setCanvasTransform = useCallback((transform: { x: number; y: number; scale: number } | ((prev: { x: number; y: number; scale: number }) => { x: number; y: number; scale: number })) => {
        setState(prev => {
            const current = { x: prev.canvasPosition.x, y: prev.canvasPosition.y, scale: prev.canvasScale };
            const next = typeof transform === 'function' ? transform(current) : transform;
            return {
                ...prev,
                canvasPosition: { x: next.x, y: next.y },
                canvasScale: next.scale
            };
        });
    }, []);

    const setIsUIVisible = useCallback((visible: boolean | ((prev: boolean) => boolean)) => {
        setState(prev => ({
            ...prev,
            isUIVisible: typeof visible === 'function' ? visible(prev.isUIVisible ?? true) : visible
        }));
    }, []);

    const setIsSpacePressed = useCallback((pressed: boolean) => {
        setState(prev => ({ ...prev, isSpacePressed: pressed }));
    }, []);

    const setActiveLocale = useCallback((code: string) => {
        setState(prev => ({
            ...prev,
            localization: {
                ...prev.localization,
                activeLocale: code
            }
        }));
    }, []);

    const setLocaleOverride = useCallback((elementId: string, localeCode: string, overrides: any) => {
        pushToHistory(state);
        setState(prev => {
            const el = prev.elements[elementId];
            if (!el) return prev;
            return {
                ...prev,
                elements: {
                    ...prev.elements,
                    [elementId]: {
                        ...el,
                        localeOverrides: {
                            ...(el.localeOverrides || {}),
                            [localeCode]: {
                                ...(el.localeOverrides?.[localeCode] || {}),
                                ...overrides
                            }
                        }
                    }
                }
            };
        });
    }, [state, pushToHistory]);

    const autoTranslateProject = useCallback(async (targetLocale: string) => {
        pushToHistory(state);
        try {
            const translationOverrides = await localizationAgent.translateProject(state.elements, targetLocale);

            if (!translationOverrides) return;

            setState(prev => {
                const nextElements = { ...prev.elements };
                Object.entries(translationOverrides).forEach(([id, override]) => {
                    if (nextElements[id]) {
                        nextElements[id] = {
                            ...nextElements[id],
                            localeOverrides: {
                                ...(nextElements[id].localeOverrides || {}),
                                [targetLocale]: {
                                    ...(nextElements[id].localeOverrides?.[targetLocale] || {}),
                                    ...override
                                }
                            }
                        };
                    }
                });
                return { ...prev, elements: nextElements };
            });
        } catch (error) {
            console.error("AI Translation Error:", error);
        }
    }, [state, pushToHistory]);

    const updateElementStyles = useCallback((id: string, updates: Partial<ElementStyles>, skipHistory: boolean = false) => {
        // --- BATCH 4.3: CLASS EDITING ---
        if (state.editingClassId) {
            if (!skipHistory) pushToHistory(state);
            setState(prev => ({
                ...prev,
                designSystem: {
                    ...prev.designSystem,
                    classes: prev.designSystem.classes.map(c =>
                        c.id === prev.editingClassId ? { ...c, styles: { ...c.styles, ...updates } } : c
                    )
                }
            }));
            return;
        }

        const activeLocale = state.localization.activeLocale;

        if (activeLocale !== 'en') {
            setLocaleOverride(id, activeLocale, { styles: updates });
            return;
        }

        // Batch 11.1: Collaborative Command Dispatch
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_STYLE',
            targetId: id,
            payload: {
                updates,
                variant: state.activeState !== 'none' ? state.activeState : undefined,
                viewMode: state.viewMode
            },
            timestamp: Date.now()
        });
    }, [state.editingClassId, state.localization.activeLocale, state.activeState, state.viewMode, dispatchCommand, pushToHistory, setLocaleOverride]);

    const updateElementProp = useCallback((id: string, prop: string, value: any) => {
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_PROP',
            targetId: id,
            payload: { prop, value },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);

    const toggleLayoutMode = useCallback((id: string) => {
        const element = state.elements[id];
        if (!element) return;
        const newMode = element.layoutMode === 'safety' ? 'freedom' : 'safety';
        const updates: Partial<ElementStyles> = {
            position: newMode === 'freedom' ? 'absolute' : 'relative',
        };
        if (newMode === 'freedom') {
            updates.top = element.styles?.top || '100px';
            updates.left = element.styles?.left || '100px';
        }

        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_STYLE',
            targetId: id,
            payload: {
                updates,
                layoutMode: newMode,
                viewMode: state.viewMode
            },
            timestamp: Date.now()
        });
    }, [state.elements, state.viewMode, dispatchCommand]);

    const convertToSafety = useCallback((containerId: string) => {
        const { updatedElements } = convertFreedomToSafety(containerId, state.elements);
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'SYNC_FULL_STATE',
            targetId: 'project',
            payload: { elements: updatedElements },
            timestamp: Date.now()
        });
    }, [state.elements, dispatchCommand]);

    const updateGap = useCallback((containerId: string, gap: string | number) => {
        pushToHistory(state);
        const finalGap = typeof gap === 'number' ? `${gap}px` : gap;
        setState(prev => {
            const container = prev.elements[containerId];
            if (!container) return prev;
            return {
                ...prev,
                elements: {
                    ...prev.elements,
                    [containerId]: {
                        ...container,
                        styles: { ...container.styles, gap: finalGap }
                    }
                }
            };
        });
    }, [state, pushToHistory]);

    const bulkAddElements = useCallback((parentId: string, elements: Record<string, Partial<any>>, rootId: string) => {
        pushToHistory(state);
        setState(prev => {
            const newElements = { ...prev.elements };

            // Map the partial elements to full DesignerElements
            Object.entries(elements).forEach(([id, el]) => {
                newElements[id] = {
                    id,
                    type: el.type || 'box',
                    styles: el.styles || {},
                    layoutMode: el.layoutMode || 'safety',
                    parentId: el.parentId || parentId,
                    children: el.children || [],
                    ...el
                } as any;
            });

            // Update parent's children list
            const parent = newElements[parentId];
            if (parent) {
                newElements[parentId] = {
                    ...parent,
                    children: [...(parent.children || []), rootId]
                };
            }

            return {
                ...prev,
                elements: newElements,
                selectedElementId: rootId,
                selectedElementIds: [rootId]
            };
        });
    }, [state, pushToHistory]);

    const bulkUpdateElements = useCallback((updates: Record<string, Partial<any>>, skipHistory: boolean = false) => {
        if (!skipHistory) pushToHistory(state);
        setState(prev => {
            const newElements = { ...prev.elements };
            Object.entries(updates).forEach(([id, elementUpdates]) => {
                if (newElements[id]) {
                    newElements[id] = {
                        ...newElements[id],
                        ...elementUpdates,
                        styles: { ...(newElements[id].styles || {}), ...(elementUpdates.styles || {}) }
                    };
                }
            });
            return { ...prev, elements: newElements };
        });
    }, [state, pushToHistory]);

    // Batch 10.2: Fast delta update from engine
    const bulkUpdateDeltas = useCallback((deltas: any[]) => {
        setState(prev => {
            const newElements = { ...prev.elements };
            let changed = false;
            deltas.forEach(delta => {
                const element = newElements[delta.id];
                if (element) {
                    newElements[delta.id] = { ...element, ...delta };
                    changed = true;
                }
            });
            return changed ? { ...prev, elements: newElements } : prev;
        });
    }, []);

    const togglePreviewMode = useCallback(() => {
        pushToHistory(state);
        setState(prev => ({ ...prev, previewMode: !prev.previewMode, selectedElementId: null, selectedElementIds: [] }));
    }, [state, pushToHistory]);

    const toggleStaticMode = useCallback(() => {
        setState(prev => ({ ...prev, staticMode: !prev.staticMode }));
    }, []);

    // Framer6
    const setActiveMode = useCallback((mode: 'light' | 'dark') => {
        setState(prev => ({ ...prev, activeMode: mode }));
    }, []);


    const moveElement = useCallback((id: string, x: number, y: number) => {
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_STYLE',
            targetId: id,
            payload: { updates: { left: `${x}px`, top: `${y}px` }, viewMode: state.viewMode },
            timestamp: Date.now()
        });
    }, [state.viewMode, dispatchCommand]);

    const reorderElement = useCallback((elementId: string, newParentId: string, newIndex: number) => {
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'REORDER_ELEMENT',
            targetId: elementId,
            payload: { parentId: newParentId, newIndex },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);

    const duplicateElement = useCallback((id: string) => {
        pushToHistory(state);
        setState(prev => {
            const original = prev.elements[id];
            if (!original) return prev;

            const newElements = { ...prev.elements };
            const idMap: Record<string, string> = {};

            const cloneRecursive = (oldId: string, parentId?: string): string => {
                const source = prev.elements[oldId];
                if (!source) return '';

                const newId = Math.random().toString(36).substr(2, 9);
                idMap[oldId] = newId;

                const clone: DesignerElement = {
                    ...JSON.parse(JSON.stringify(source)), // Deep copy styles/data
                    id: newId,
                    parentId: parentId || source.parentId,
                    children: []
                };

                newElements[newId] = clone;

                if (source.children) {
                    clone.children = source.children.map(cid => cloneRecursive(cid, newId)).filter(Boolean);
                }

                return newId;
            };

            const newRootId = cloneRecursive(id);
            if (!newRootId) return prev;

            // Offset the new element if it's freedom mode
            if (newElements[newRootId].layoutMode === 'freedom') {
                const styles = newElements[newRootId].styles || {};
                const top = parseInt(String(styles.top || '0')) + 20;
                const left = parseInt(String(styles.left || '0')) + 20;
                newElements[newRootId].styles = { ...styles, top: `${top}px`, left: `${left}px` };
            }

            // Insert into parent's children array
            const parentId = original.parentId;
            if (parentId && newElements[parentId]) {
                const parent = newElements[parentId];
                const oldIndex = parent.children?.indexOf(id) ?? -1;
                const newChildren = [...(parent.children || [])];
                if (oldIndex !== -1) {
                    newChildren.splice(oldIndex + 1, 0, newRootId);
                } else {
                    newChildren.push(newRootId);
                }
                newElements[parentId] = { ...parent, children: newChildren };
            }

            // Batch 10.1: Duplicate is a structural change, we use SYNC_FULL_STATE for safety
            // in this batch, or we could emit multiple ADD_ELEMENTS.
            hyperBridge.commit({
                id: Math.random().toString(36).substr(2, 9),
                action: 'SYNC_FULL_STATE',
                targetId: 'project',
                payload: { elements: newElements },
                timestamp: Date.now()
            });

            return {
                ...prev,
                elements: newElements,
                selectedElementId: newRootId,
                selectedElementIds: [newRootId]
            };
        });
    }, [state, pushToHistory]);

    // Framer12: Layout Actions
    const smartStack = useCallback((elementId: string, targetId: string, intent: 'wrap-col' | 'wrap-row') => {
        pushToHistory(state);
        setState(prev => {
            const result = smartStackElements(elementId, targetId, prev.elements, intent);
            if (!result || !result.updatedElements) return prev;
            return { ...prev, elements: result.updatedElements };
        });
    }, [state, pushToHistory]);


    const duplicateElements = useCallback((ids: string[]) => {
        // For now, just duplicate each sequentially (not super efficient in React state terms but works)
        // Correct way is to do one state update
        pushToHistory(state);
        setState(prev => {
            let nextElements = { ...prev.elements };
            let lastNewId = null;
            let allNewIds: string[] = [];

            ids.forEach(id => {
                const original = prev.elements[id];
                if (!original) return;

                const idMap: Record<string, string> = {};
                const cloneRecursiveInner = (oldId: string, parentId?: string): string => {
                    const source = prev.elements[oldId];
                    if (!source) return '';
                    const newId = Math.random().toString(36).substr(2, 9);
                    idMap[oldId] = newId;
                    const clone: DesignerElement = {
                        ...JSON.parse(JSON.stringify(source)),
                        id: newId,
                        parentId: parentId || source.parentId,
                        children: []
                    };
                    nextElements[newId] = clone;
                    if (source.children) {
                        clone.children = source.children.map(cid => cloneRecursiveInner(cid, newId)).filter(Boolean);
                    }
                    return newId;
                };

                const newRootId = cloneRecursiveInner(id);
                if (newRootId) {
                    allNewIds.push(newRootId);
                    lastNewId = newRootId;

                    if (nextElements[newRootId].layoutMode === 'freedom') {
                        const styles = nextElements[newRootId].styles || {};
                        nextElements[newRootId].styles = {
                            ...styles,
                            top: `${parseInt(String(styles.top || '0')) + 20}px`,
                            left: `${parseInt(String(styles.left || '0')) + 20}px`
                        };
                    }

                    const parentId = original.parentId;
                    if (parentId && nextElements[parentId]) {
                        const parent = nextElements[parentId];
                        const oldIndex = parent.children?.indexOf(id) ?? -1;
                        const newChildren = [...(parent.children || [])];
                        newChildren.splice(oldIndex + 1, 0, newRootId);
                        nextElements[parentId] = { ...parent, children: newChildren };
                    }
                }
            });

            const nextState = {
                ...prev,
                elements: nextElements,
                selectedElementId: lastNewId,
                selectedElementIds: allNewIds
            };

            // Batch 11.1: Multi-element duplication via SYNC_FULL_STATE
            dispatchCommand({
                id: Math.random().toString(36).substr(2, 9),
                action: 'SYNC_FULL_STATE',
                targetId: 'project',
                payload: { elements: nextElements },
                timestamp: Date.now()
            });

            return nextState;
        });
    }, [state, pushToHistory, dispatchCommand]);

    const removeElement = useCallback((id: string) => {
        if (id === state.rootElementId) return;

        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'REMOVE_ELEMENT',
            targetId: id,
            payload: {},
            timestamp: Date.now()
        });
    }, [state.rootElementId, dispatchCommand]);

    // --- Data Layer Actions ---
    const createCollection = useCallback((name: string, type: 'flat' | 'relational' = 'flat') => {
        pushToHistory(state);
        const newCollection: any = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            type, // Batch 5.1
            fields: [{ id: 'name', name: 'Name', type: 'text', unique: true, required: true }]
        };
        setState(prev => ({
            ...prev,
            data: { ...prev.data, collections: [...prev.data.collections, newCollection] }
        }));
    }, [state, pushToHistory]);

    const addField = useCallback((collectionId: string, field: { name: string, type: any, referenceCollectionId?: string, required?: boolean }) => {
        pushToHistory(state);
        setState(prev => ({
            ...prev,
            data: {
                ...prev.data,
                collections: prev.data.collections.map(c =>
                    c.id === collectionId
                        ? { ...c, fields: [...c.fields, { ...field, id: Math.random().toString(36).substr(2, 9) }] }
                        : c
                )
            }
        }));
    }, [state, pushToHistory]);

    const addItem = useCallback((collectionId: string, values: Record<string, any>) => {
        pushToHistory(state);

        const collection = state.data.collections.find((c: any) => c.id === collectionId);
        const tenantId = collection?.isMultiTenant ? state.activeTenantId : undefined;

        const newItem: any = {
            id: Math.random().toString(36).substr(2, 9),
            collectionId,
            tenantId, // Phase 12: Multi-Tenancy
            values,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'published'
        };
        setState(prev => ({
            ...prev,
            data: { ...prev.data, items: [...prev.data.items, newItem] }
        }));
    }, [state, pushToHistory]);

    const updateItem = useCallback((itemId: string, values: Record<string, any>) => {
        pushToHistory(state);
        setState(prev => ({
            ...prev,
            data: {
                ...prev.data,
                items: prev.data.items.map(item =>
                    item.id === itemId ? { ...item, values: { ...item.values, ...values } } : item
                )
            }
        }));
    }, [state, pushToHistory]);

    const deleteItem = useCallback((itemId: string) => {
        pushToHistory(state);
        setState(prev => ({
            ...prev,
            data: { ...prev.data, items: prev.data.items.filter(i => i.id !== itemId) }
        }));
    }, [state, pushToHistory]);

    const addWorkflow = useCallback((name: string) => {
        const id = `wf-${Date.now()}`;
        setState(prev => ({
            ...prev,
            workflows: {
                ...prev.workflows,
                [id]: {
                    id,
                    name,
                    nodes: {},
                    connections: [],
                    variables: {}
                }
            }
        }));
        return id;
    }, []);

    const updateWorkflow = useCallback((id: string, updates: Partial<LogicBlueprint>) => {
        setState(prev => ({
            ...prev,
            workflows: {
                ...prev.workflows,
                [id]: { ...prev.workflows[id], ...updates }
            }
        }));
    }, []);

    const removeWorkflow = useCallback((id: string) => {
        setState(prev => {
            const nextWorkflows = { ...prev.workflows };
            delete nextWorkflows[id];
            return { ...prev, workflows: nextWorkflows };
        });
    }, []);

    const installPlugin = useCallback((plugin: any) => {
        setState(s => {
            if (s.installedPlugins.find((p: any) => p.id === plugin.id)) return s;
            return {
                ...s,
                installedPlugins: [...s.installedPlugins, plugin]
            };
        });
    }, []);

    const uninstallPlugin = useCallback((id: string) => {
        setState(s => ({
            ...s,
            installedPlugins: s.installedPlugins.filter((p: any) => p.id !== id)
        }));
    }, []);

    // Phase 12: Multi-Tenancy
    const setActiveTenantId = useCallback((id: string | null) => {
        setState(prev => ({ ...prev, activeTenantId: id }));
    }, []);

    const updateTenant = useCallback((tenantId: string, updates: Partial<Tenant>) => {
        setState(prev => ({
            ...prev,
            tenants: prev.tenants.map(t => t.id === tenantId ? { ...t, ...updates } : t)
        }));
    }, []);

    const addTenant = useCallback((tenant: Tenant) => {
        setState(prev => ({
            ...prev,
            tenants: [...prev.tenants, tenant]
        }));
    }, []);

    const reportUsage = useCallback((tenantId: string, metric: string, amount: number) => {
        setState(prev => ({
            ...prev,
            tenants: prev.tenants.map(t => {
                if (t.id !== tenantId) return t;
                const newUsage = { ...t.usage };
                if (metric === 'records') newUsage.records = (newUsage.records || 0) + amount;
                if (metric === 'users') newUsage.users = (newUsage.users || 0) + amount;
                return { ...t, usage: newUsage };
            })
        }));
    }, []);

    const addAPISource = useCallback((source: any) => {
        const newSource = { ...source, id: Math.random().toString(36).substr(2, 9), updatedAt: new Date().toISOString() };
        setState(prev => ({ ...prev, apiSources: [...prev.apiSources, newSource] }));
    }, [state]); // No pushToHistory for API source management, as it's more config-like

    const removeAPISource = useCallback((id: string) => {
        setState(prev => ({ ...prev, apiSources: prev.apiSources.filter(s => s.id !== id) }));
    }, [state]); // No pushToHistory

    // --- BATCH 5.2: USER AUTHENTICATION ---
    // Moved to Batch 13.1 (Native Auth) at end of file


    // --- BATCH 10.1: SERVERLESS WORKSPACE ---
    const addFunction = useCallback((name: string, route: string) => {
        const id = `fn-${Math.random().toString(36).substr(2, 9)}`;
        const newFunc: ServerlessFunction = {
            id,
            name,
            route,
            code: `import { NextResponse } from 'next/server';\n\nexport async function GET() {\n  return NextResponse.json({ \n    message: 'Hello from ${name}!',\n    timestamp: new Date().toISOString()\n  });\n}`,
            runtime: 'nodejs'
        };
        setState(prev => ({
            ...prev,
            serverlessFunctions: { ...prev.serverlessFunctions, [id]: newFunc }
        }));
        return id;
    }, []);

    const updateFunction = useCallback((id: string, updates: Partial<ServerlessFunction>) => {
        setState(prev => {
            const func = prev.serverlessFunctions[id];
            if (!func) return prev;
            return {
                ...prev,
                serverlessFunctions: {
                    ...prev.serverlessFunctions,
                    [id]: { ...func, ...updates }
                }
            };
        });
    }, []);

    const removeFunction = useCallback((id: string) => {
        setState(prev => {
            const next = { ...prev.serverlessFunctions };
            delete next[id];
            return { ...prev, serverlessFunctions: next };
        });
    }, []);

    const deployFunction = useCallback(async (id: string) => {
        setState(prev => ({
            ...prev,
            debugLogs: [
                { id: Math.random().toString(36), timestamp: Date.now(), type: 'performance', message: `🚀 Deploying Function: ${prev.serverlessFunctions[id]?.name || id}...` },
                ...prev.debugLogs
            ]
        }));

        // Simulation
        await new Promise(r => setTimeout(r, 1500));

        setState(prev => ({
            ...prev,
            serverlessFunctions: {
                ...prev.serverlessFunctions,
                [id]: { ...prev.serverlessFunctions[id], lastDeployedAt: Date.now() }
            },
            debugLogs: [
                { id: Math.random().toString(36), timestamp: Date.now(), type: 'audit', message: `✅ Function ${prev.serverlessFunctions[id]?.name} is now LIVE.` },
                ...prev.debugLogs
            ]
        }));
    }, []);

    const runFunction = useCallback((functionId: string, payload?: any) => {
        const fn = state.serverlessFunctions[functionId];
        if (!fn) return;

        setState(prev => ({
            ...prev,
            debugLogs: [
                { id: Math.random().toString(36), timestamp: Date.now(), type: 'logic', message: `▶ Running ${fn.name}...`, payload },
                ...prev.debugLogs
            ]
        }));

        setTimeout(() => {
            setState(prev => ({
                ...prev,
                debugLogs: [
                    { id: Math.random().toString(36), timestamp: Date.now(), type: 'logic', message: `RESULT [${fn.name}]: Success`, payload: { status: 200, data: { status: 'ok' } } },
                    ...prev.debugLogs
                ]
            }));
        }, 500);
    }, [state.serverlessFunctions]);

    const connectProvider = useCallback(async (provider: 'vercel' | 'netlify') => {
        // Mock OAuth Simulation
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    deployment: {
                        ...prev.deployment,
                        provider,
                        isConnected: true,
                        token: 'mock-vercel-token-12345',
                        accountName: 'OMNIOS Developer'
                    }
                }));
                resolve();
            }, 2000);
        });
    }, []);

    const disconnectProvider = useCallback(() => {
        setState(prev => ({
            ...prev,
            deployment: {
                ...prev.deployment,
                provider: null,
                isConnected: false,
                token: null,
                accountName: undefined
            }
        }));
    }, []);

    const deployProject = useCallback(async (provider: 'vercel' | 'netlify', envId?: string, token?: string) => {
        // Use provided token or the one in state
        const activeToken = token || state.deployment.token;

        if (!activeToken) {
            return { success: false, error: "No API token found. Please connect your account." };
        }

        // Save Settings (if new token provided)
        if (token) {
            setState(prev => ({
                ...prev,
                deployment: { ...prev.deployment, provider, token }
            }));
        }

        const log = (message: string, type: DebugLog['type'] = 'performance') => {
            setState(prev => ({
                ...prev,
                debugLogs: [{
                    id: Math.random().toString(36),
                    timestamp: Date.now(),
                    type,
                    message
                }, ...prev.debugLogs.slice(0, 49)]
            }));
        };

        log(`🚀 Starting deployment to ${provider}...`);

        let result: DeploymentResult;
        try {
            // 1. Fetch Secrets if envId is provided
            let secrets: { keyName: string, value: string }[] = [];
            if (envId) {
                log(`🔐 Fetching secrets for environment: ${envId}...`);
                const secretList = await secretService.listSecrets(envId);
                for (const s of secretList) {
                    const decrypted = await secretService.getSecret(envId, s.keyName);
                    if (decrypted) {
                        secrets.push({ keyName: s.keyName, value: decrypted });
                    }
                }
            }

            if (provider === 'vercel') {
                result = await deployToVercel(state, activeToken, (msg: string) => log(msg), secrets);

                if (result.success && result.deploymentId) {
                    log("⌛ Waiting for Vercel build to complete...");
                    result = await pollDeploymentStatus(result.deploymentId, activeToken, (msg: string) => log(msg));
                }
            } else {
                result = await deployToNetlify(state, activeToken, (msg: string) => log(msg));
            }

            if (result.success && result.url) {
                log(`🚀 Site is LIVE at ${result.url}`, 'audit');
                setState(prev => ({
                    ...prev,
                    deployment: {
                        ...prev.deployment,
                        history: [{
                            id: Math.random().toString(36),
                            url: result.url!,
                            status: 'success',
                            timestamp: Date.now()
                        }, ...prev.deployment.history]
                    }
                }));
            } else {
                log(`❌ Deployment Failed: ${result.error}`, 'logic');
            }

            return result;
        } catch (e: any) {
            log(`❌ Critical Error: ${e.message}`, 'logic');
            return { success: false, error: e.message };
        }
    }, [state]);

    // Phase 12: Git Actions
    const connectGit = useCallback(async (provider: 'github' | 'gitlab') => {
        setState(prev => ({ ...prev, gitStatus: 'pulling' }));
        // Simulate OAuth flow for now
        await new Promise(r => setTimeout(r, 1000));
        const mockToken = 'ghp_mock_token_123';
        gitService.setToken(mockToken);

        setState(prev => ({
            ...prev,
            gitConfig: {
                provider,
                token: mockToken,
                branch: 'main'
            },
            gitStatus: 'idle'
        }));
    }, []);

    const selectRepo = useCallback((repo: { id: string, name: string, owner: string }) => {
        setState(prev => ({
            ...prev,
            gitConfig: prev.gitConfig ? { ...prev.gitConfig, repo } : undefined
        }));
    }, []);

    const setBranch = useCallback((branch: string) => {
        setState(prev => ({
            ...prev,
            gitConfig: prev.gitConfig ? { ...prev.gitConfig, branch } : undefined
        }));
    }, []);

    const syncWithGit = useCallback(async (type: 'pull' | 'push') => {
        if (!state.gitConfig?.repo) return;
        setState(prev => ({ ...prev, gitStatus: type === 'pull' ? 'pulling' : 'pushing' }));

        try {
            const { owner, name: repoName } = state.gitConfig.repo;
            const branch = state.gitConfig.branch;

            if (type === 'push') {
                // 1. Generate regular code for legacy interop
                if (state.rootElementId) {
                    const code = generateCode(state.rootElementId, state.elements);
                    await gitService.updateFileContent(owner, repoName, 'src/components/Generated.tsx', code, 'Update generated code', branch);
                }

                // 2. Commit the OMNIOS Blueprint (Full Engine State)
                const blueprint = JSON.stringify(state, null, 2);
                await gitService.updateFileContent(owner, repoName, '.omnios/blueprint.json', blueprint, 'OMNIOS: Project Workspace Sync', branch);
            } else {
                // Pulling
                const result = await gitService.getFileContent(owner, repoName, '.omnios/blueprint.json', branch);
                if (result?.content) {
                    const projectState = JSON.parse(result.content);
                    setState(projectState); // Rehydrate entire project
                }
            }

            setState(prev => ({
                ...prev,
                gitStatus: 'idle',
                lastSyncAt: Date.now()
            }));
        } catch (e) {
            console.error('Git Sync Failed:', e);
            setState(prev => ({ ...prev, gitStatus: 'error' }));
        }
    }, [state, state.gitConfig, state.elements, state.rootElementId]);

    const importFromCode = useCallback(async (code: string) => {
        setState(prev => ({ ...prev, gitStatus: 'pulling' }));
        try {
            const elements = await parseComponentAction(code);
            const root = Object.values(elements).find((el: any) => el.parentId === null);

            if (root) {
                setState(prev => ({
                    ...prev,
                    elements: { ...prev.elements, ...elements },
                    rootElementId: root.id,
                    activePageId: 'index', // Standardize
                    gitStatus: 'idle',
                    lastSyncAt: Date.now()
                }));
            }
        } catch (error) {
            console.error('Import Error:', error);
            setState(prev => ({ ...prev, gitStatus: 'error' }));
        }
    }, []);

    const createBranch = useCallback(async (name: string) => {
        if (!state.gitConfig?.repo) return;
        setState(prev => ({ ...prev, gitStatus: 'pulling' }));

        try {
            const { owner, name: repoName } = state.gitConfig.repo;
            const success = await gitService.createBranch(owner, repoName, name, state.gitConfig.branch);

            if (success) {
                setState(prev => ({
                    ...prev,
                    gitConfig: prev.gitConfig ? { ...prev.gitConfig, branch: name } : undefined,
                    gitStatus: 'idle'
                }));
            } else {
                setState(prev => ({ ...prev, gitStatus: 'error' }));
            }
        } catch (error) {
            console.error('Create Branch Error:', error);
            setState(prev => ({ ...prev, gitStatus: 'error' }));
        }
    }, [state.gitConfig]);

    const mergeBranch = useCallback(async (head: string) => {
        if (!state.gitConfig?.repo) return;
        setState(prev => ({ ...prev, gitStatus: 'pulling' }));

        try {
            const { owner, name: repoName } = state.gitConfig.repo;
            const base = state.gitConfig.branch;

            const result = await gitService.mergeBranches(owner, repoName, base, head);

            if (result.success) {
                // After successful merge, pull the latest blueprint
                await syncWithGit('pull');
                setState(prev => ({ ...prev, gitStatus: 'idle' }));
            } else if (result.conflict) {
                setState(prev => ({ ...prev, gitStatus: 'error' }));
                // In a real app, we would show a conflict resolution UI here
            } else {
                setState(prev => ({ ...prev, gitStatus: 'error' }));
            }
        } catch (error) {
            console.error('Merge Error:', error);
            setState(prev => ({ ...prev, gitStatus: 'error' }));
        }
    }, [state.gitConfig, syncWithGit]);

    // --- BATCH 6.1: AI COPILOT ---
    const sendAIMessage = useCallback((content: string) => {
        // 1. Add User Message
        const userMsg = {
            id: Math.random().toString(36),
            sender: 'user' as const,
            content,
            timestamp: Date.now()
        };

        setState(prev => ({
            ...prev,
            aiChatHistory: [...prev.aiChatHistory, userMsg]
        }));

        // 2. Simulate AI Response (Mock)
        setTimeout(() => {
            let aiContent = "I can help with that design task.";
            let action = undefined;

            // Batch 6.2: Generative UI
            const generatedElement = generateComponent(content);

            if (generatedElement) {
                aiContent = `I've generated a ${generatedElement.name} for you.`;
                action = { type: 'create_element' as const, payload: { type: 'section' } };

                setState(prev => ({
                    ...prev,
                    elements: { ...prev.elements, [generatedElement.id]: generatedElement },
                    selectedElementIds: [generatedElement.id]
                }));
            } else if (content === "Make Pill Shape" && state.selectedElementIds.length > 0) {
                // Smart Action: Pill Shape
                aiContent = "Applied pill shape to selection.";
                action = { type: 'update_style' as const, payload: { borderRadius: '999px' } };
                const targetId = state.selectedElementIds[0];
                setState(prev => ({
                    ...prev,
                    elements: Object.fromEntries(Object.entries(prev.elements).map(([id, el]) => id === targetId ? [id, { ...el, styles: { ...el.styles, borderRadius: '999px' } }] : [id, el]))
                }));
            } else if (content === "Add Shadow" && state.selectedElementIds.length > 0) {
                // Smart Action: Add Shadow
                aiContent = "Added shadow to selection.";
                action = { type: 'update_style' as const, payload: { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } };
                const targetId = state.selectedElementIds[0];
                setState(prev => ({
                    ...prev,
                    elements: Object.fromEntries(Object.entries(prev.elements).map(([id, el]) => id === targetId ? [id, { ...el, styles: { ...el.styles, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } }] : [id, el]))
                }));
            } else if (content.toLowerCase().includes('button')) {
                aiContent = "I've created a new primary button for you.";
                action = { type: 'create_element' as const, payload: { type: 'button', label: 'AI Button' } };
                // Actual Mock Side Effect: Create the button
                const newId = Math.random().toString(36).substr(2, 9);
                const newEl: DesignerElement = {
                    id: newId,
                    type: 'button',
                    name: 'AI Generated Button',
                    styles: {
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        position: 'absolute',
                        left: 400,
                        top: 300
                    },
                    children: [],
                    content: 'AI Button',
                    parentId: 'root'
                };
                setState(prev => ({
                    ...prev,
                    elements: { ...prev.elements, [newId]: newEl },
                    // Also select it to show it happened
                    selectedElementIds: [newId]
                }));
            } else if (content.toLowerCase().includes('nav')) {
                aiContent = "I'm generating a navigation bar layout based on best practices.";
            }

            const aiMsg = {
                id: Math.random().toString(36),
                sender: 'ai' as const,
                content: aiContent,
                timestamp: Date.now(),
                action
            };

            setState(prev => ({
                ...prev,
                aiChatHistory: [...prev.aiChatHistory, aiMsg]
            }));
        }, 1000);
    }, []);

    const fetchAPIData = useCallback(async (id: string) => {
        const source = state.apiSources.find(s => s.id === id);
        if (!source) return;

        try {
            const response = await fetch(source.url, {
                method: source.method,
                headers: source.headers
            });
            const data = await response.json();
            setState(prev => ({
                ...prev,
                apiSources: prev.apiSources.map(s => s.id === id ? { ...s, lastResponse: data, updatedAt: new Date().toISOString() } : s)
            }));
        } catch (err) {
            console.error("Failed to fetch API data:", err);
        }
    }, [state]); // No pushToHistory for fetching data

    const mapAPIDataToElement = useCallback((elementId: string, path: string, sourceId: string) => {
        pushToHistory(state); // Mapping data is a design change
        setState(prev => {
            const source = prev.apiSources.find(s => s.id === sourceId);
            if (!source || !source.lastResponse) return prev;

            const resolvePath = (obj: any, p: string) => p.split('.').reduce((acc, part) => acc && acc[part], obj);
            const value = resolvePath(source.lastResponse, path);

            return {
                ...prev,
                mappedData: { ...prev.mappedData, [elementId]: value },
                elements: {
                    ...prev.elements,
                    [elementId]: { ...prev.elements[elementId], content: String(value) }
                }
            };
        });
    }, [state, pushToHistory]);




    const addAnimationSequence = useCallback((elementId: string, name: string) => {
        const sequenceId = Math.random().toString(36).substr(2, 9);
        const sequence: AnimationSequence = {
            id: sequenceId,
            name,
            keyframes: [],
            duration: 1,
            delay: 0,
            repeat: false,
            easing: 'easeInOut'
        };
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'MANAGE_ANIMATION',
            targetId: elementId,
            payload: { sequenceId, sequence },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);

    const addKeyframe = useCallback((elementId: string, sequenceId: string, time: number, styles: Partial<ElementStyles>) => {
        const el = state.elements[elementId];
        if (!el || !el.animationSequences?.[sequenceId]) return;

        const sequence = { ...el.animationSequences[sequenceId] };
        const newKeyframe = {
            id: Math.random().toString(36).substr(2, 9),
            time,
            styles
        };
        sequence.keyframes = [...sequence.keyframes, newKeyframe].sort((a, b) => a.time - b.time);

        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'MANAGE_ANIMATION',
            targetId: elementId,
            payload: { sequenceId, sequence },
            timestamp: Date.now()
        });
    }, [state.elements, dispatchCommand]);

    // Design System Actions
    const addToken = useCallback((token: Omit<TokenType, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToken: TokenType = { ...token, id } as any;
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_TOKEN',
            targetId: 'designSystem',
            payload: { token: newToken },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);

    const updateToken = useCallback((token: TokenType) => {
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_TOKEN',
            targetId: 'designSystem',
            payload: { token },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);

    const deleteToken = useCallback((id: string) => {
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_TOKEN',
            targetId: 'designSystem',
            payload: { id, type: 'delete' },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);

    const removeKeyframe = useCallback((elementId: string, sequenceId: string, keyframeId: string) => {
        const el = state.elements[elementId];
        if (!el || !el.animationSequences?.[sequenceId]) return;

        const sequence = { ...el.animationSequences[sequenceId] };
        sequence.keyframes = sequence.keyframes.filter(k => k.id !== keyframeId);

        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'MANAGE_ANIMATION',
            targetId: elementId,
            payload: { sequenceId, sequence },
            timestamp: Date.now()
        });
    }, [state.elements, dispatchCommand]);

    const updateKeyframe = useCallback((elementId: string, sequenceId: string, keyframeId: string, updates: Partial<any>) => {
        const el = state.elements[elementId];
        if (!el || !el.animationSequences?.[sequenceId]) return;

        const sequence = { ...el.animationSequences[sequenceId] };
        sequence.keyframes = sequence.keyframes.map(k => k.id === keyframeId ? { ...k, ...updates } : k).sort((a, b) => a.time - b.time);

        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'MANAGE_ANIMATION',
            targetId: elementId,
            payload: { sequenceId, sequence },
            timestamp: Date.now()
        });
    }, [state.elements, dispatchCommand]);

    const createBlueprint = useCallback((elementId: string) => {
        pushToHistory(state);
        const blueprintId = Math.random().toString(36).substr(2, 9);
        setState(prev => ({
            ...prev,
            elements: {
                ...prev.elements,
                [elementId]: { ...prev.elements[elementId], blueprintId }
            },
            blueprints: {
                ...prev.blueprints,
                [blueprintId]: {
                    id: blueprintId,
                    nodes: {},
                    connections: [],
                    variables: {}
                }
            }
        }));
    }, [state, pushToHistory]);

    const addLogicNode = useCallback((blueprintId: string, type: string, position: { x: number, y: number }) => {
        const nodeId = Math.random().toString(36).substr(2, 9);
        const node: LogicNode = {
            id: nodeId,
            type: type as any,
            name: type.charAt(0).toUpperCase() + type.slice(1),
            position,
            data: {},
            inputs: ['in_0'],
            outputs: ['out_0']
        };

        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'ADD_LOGIC_NODE',
            targetId: blueprintId,
            payload: { node },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);

    const moveLogicNode = useCallback((blueprintId: string, nodeId: string, x: number, y: number) => {
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'MOVE_LOGIC_NODE',
            targetId: blueprintId,
            payload: { nodeId, x, y },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);

    const removeLogicNode = useCallback((blueprintId: string, nodeId: string) => {
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'REMOVE_LOGIC_NODE',
            targetId: blueprintId,
            payload: { nodeId },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);

    const addLogicConnection = useCallback((blueprintId: string, connection: Omit<LogicConnection, 'id'>) => {
        const connId = Math.random().toString(36).substr(2, 9);
        const fullConnection: LogicConnection = { ...connection, id: connId };

        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'ADD_LOGIC_CONNECTION',
            targetId: blueprintId,
            payload: { connection: fullConnection },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);

    const removeLogicConnection = useCallback((blueprintId: string, connectionId: string) => {
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'REMOVE_LOGIC_CONNECTION',
            targetId: blueprintId,
            payload: { connectionId },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);



    const pushDebugLog = useCallback((logData: any) => {
        setState(prev => ({
            ...prev,
            debugLogs: [
                {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: Date.now(),
                    ...logData
                },
                ...prev.debugLogs.slice(0, 49)
            ]
        }));
    }, []);

    const uploadAsset = useCallback((asset: any) => {
        pushToHistory(state); // Asset changes should be undoable
        const newAsset = { ...asset, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
        setState(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
    }, [state, pushToHistory]);

    const deleteAsset = useCallback((id: string) => {
        pushToHistory(state); // Asset changes should be undoable
        setState(prev => ({ ...prev, assets: prev.assets.filter(a => a.id !== id) }));
    }, [state, pushToHistory]);

    const createFolder = useCallback((name: string, parentId?: string) => {
        pushToHistory(state); // Folder changes should be undoable
        const newFolder = { id: Math.random().toString(36).substr(2, 9), name, parentId, createdAt: new Date().toISOString() };
        setState(prev => ({ ...prev, assetFolders: [...prev.assetFolders, newFolder] }));
    }, [state, pushToHistory]);

    const updateAssetMetadata = useCallback((id: string, metadata: Partial<Asset>) => {
        setState(prev => ({
            ...prev,
            assets: prev.assets.map(a => a.id === id ? { ...a, ...metadata } : a)
        }));
    }, []);

    // Framer18: Asset Management Actions
    const createTeamLibrary = useCallback((name: string, description?: string) => {
        const newLib: AssetLibrary = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            description,
            assetIds: []
        };
        setState(prev => ({ ...prev, teamLibraries: [...(prev.teamLibraries || []), newLib] }));
    }, []);

    const addAssetToLibrary = useCallback((assetId: string, libraryId: string) => {
        setState(prev => ({
            ...prev,
            teamLibraries: (prev.teamLibraries || []).map(lib =>
                lib.id === libraryId
                    ? { ...lib, assetIds: [...new Set([...lib.assetIds, assetId])] } // Prevent duplicates
                    : lib
            )
        }));
    }, []);

    const createAssetTag = useCallback((assetId: string, tag: string) => {
        setState(prev => ({
            ...prev,
            assets: prev.assets.map(a =>
                a.id === assetId
                    ? { ...a, tags: [...(a.tags || []), tag] }
                    : a
            )
        }));
    }, []);

    const getDuplicateStyles = useCallback(() => {
        const groups: Record<string, string[]> = {};
        Object.values(state.elements).forEach(el => {
            const styleStr = JSON.stringify(el.styles);
            if (!groups[styleStr]) groups[styleStr] = [];
            groups[styleStr].push(el.id);
        });
        return Object.entries(groups)
            .filter(([_, ids]) => ids.length > 1)
            .map(([styleStr, ids]) => ({
                styles: JSON.parse(styleStr),
                elementIds: ids,
                count: ids.length
            }));
    }, [state.elements]);

    const createClass = useCallback((name: string, styles: ElementStyles) => {
        const classId = Math.random().toString(36).substr(2, 9);
        const newClass = { id: classId, name, styles };
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_CLASS',
            targetId: 'designSystem',
            payload: { class: newClass },
            timestamp: Date.now()
        });
        return classId;
    }, [dispatchCommand]);

    const updateClass = useCallback((id: string, updates: Partial<DesignClass>) => {
        const currentClass = state.designSystem.classes.find(c => c.id === id);
        if (!currentClass) return;
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_CLASS',
            targetId: 'designSystem',
            payload: { class: { ...currentClass, ...updates } },
            timestamp: Date.now()
        });
    }, [state.designSystem.classes, dispatchCommand]);

    const deleteClass = useCallback((id: string) => {
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_CLASS',
            targetId: 'designSystem',
            payload: { id, type: 'delete' },
            timestamp: Date.now()
        });
    }, [dispatchCommand]);


    // Framer19: Analytics Actions
    const logAnalyticsEvent = useCallback((event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => {
        setState(prev => {
            const newEvent: AnalyticsEvent = {
                ...event,
                id: `evt-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now()
            };
            return {
                ...prev,
                analytics: {
                    ...(prev.analytics || { events: [], funnels: [], heatmap: [], isHeatmapEnabled: false }),
                    events: [...(prev.analytics?.events || []), newEvent]
                }
            };
        });
    }, []);

    // Batch 8.2: Data Schema Actions
    const renameClass = useCallback((id: string, name: string) => {
        const currentClass = state.designSystem.classes.find(c => c.id === id);
        if (!currentClass) return;
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_CLASS',
            targetId: 'designSystem',
            payload: { class: { ...currentClass, name } },
            timestamp: Date.now()
        });
    }, [state.designSystem.classes, dispatchCommand]);

    const addCollection = useCallback((collection: Collection) => {
        const nextCollections = [...state.data.collections, collection];
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_SCHEMA',
            targetId: 'data',
            payload: { collections: nextCollections },
            timestamp: Date.now()
        });
    }, [state.data.collections, dispatchCommand]);

    const updateCollection = useCallback((id: string, updates: Partial<Collection>) => {
        const nextCollections = state.data.collections.map(c =>
            c.id === id ? { ...c, ...updates } : c
        );
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_SCHEMA',
            targetId: 'data',
            payload: { collections: nextCollections },
            timestamp: Date.now()
        });
    }, [state.data.collections, dispatchCommand]);

    const removeCollection = useCallback((id: string) => {
        const nextCollections = state.data.collections.filter(c => c.id !== id);
        dispatchCommand({
            id: Math.random().toString(36).substr(2, 9),
            action: 'UPDATE_SCHEMA',
            targetId: 'data',
            payload: { collections: nextCollections },
            timestamp: Date.now()
        });
    }, [state.data.collections, dispatchCommand]);

    const toggleHeatmap = useCallback(() => {
        setState(prev => ({
            ...prev,
            analytics: {
                ...(prev.analytics || { events: [], funnels: [], heatmap: [], isHeatmapEnabled: false }),
                isHeatmapEnabled: !prev.analytics?.isHeatmapEnabled
            }
        }));
    }, []);

    const createAnalyticsFunnel = useCallback((name: string, steps: FunnelStep[]) => {
        const id = `funnel-${Math.random().toString(36).substr(2, 9)}`;
        setState(prev => ({
            ...prev,
            analytics: {
                ...(prev.analytics || { events: [], funnels: [], heatmap: [], isHeatmapEnabled: false }),
                funnels: [...(prev.analytics?.funnels || []), { id, name, steps }]
            }
        }));
    }, []);

    const importExternalStructure = useCallback((data: any, parentId: string = 'root') => {
        const newElements: Record<string, DesignerElement> = {};
        const stateUpdates: { pId: string, childId: string }[] = [];

        const processNode = (node: any, pId: string) => {
            const id = `ext-${Math.random().toString(36).substr(2, 9)}`;
            const element: DesignerElement = {
                id,
                type: node.type || 'box',
                styles: {
                    ...node.styles,
                    position: node.styles?.position || 'relative',
                },
                content: node.content,
                props: node.props || {},

                children: [],
                parentId: pId // Fix: Add parentId
            };
            newElements[id] = element;
            stateUpdates.push({ pId, childId: id });

            if (node.children && node.children.length > 0) {
                node.children.forEach((child: any) => processNode(child, id));
            }
        };

        if (Array.isArray(data)) {
            data.forEach(item => processNode(item, parentId));
        } else {
            processNode(data, parentId);
        }

        setState(prev => {
            const updatedElements = { ...prev.elements, ...newElements };

            // Apply parent assignments
            stateUpdates.forEach(({ pId, childId }) => {
                const parent = updatedElements[pId];
                if (parent) {
                    updatedElements[pId] = {
                        ...parent,
                        children: [...(parent.children || []), childId] // Fix: Safety check for children
                    };
                }
            });

            return {
                ...prev,
                elements: updatedElements
            };
        });

        logAnalyticsEvent({ type: 'click', pageId: 'import', metadata: { action: 'external_import', source: 'figma_or_extension' } }); // Fix: Add required pageId
    }, [setState, logAnalyticsEvent]);

    const upgradeTier = useCallback((tier: 'free' | 'pro' | 'enterprise') => {
        setState(prev => ({
            ...prev,
            userTier: tier,
            subscriptionStatus: 'active'
        }));
    }, []);

    const setEngineMode = useCallback((mode: 'standard' | 'hyper') => {
        setState(prev => ({ ...prev, engineMode: mode }));
    }, []);




    const setVariable = useCallback((key: string, value: any, metadata?: { serverOnly?: boolean, envVarName?: string }) => {
        setState(prev => {
            // Delete if undefined
            if (value === undefined) {
                const newVars = { ...prev.variables };
                delete newVars[key];
                return { ...prev, variables: newVars };
            }

            const currentVar = prev.variables?.[key] || {
                id: key,
                name: key,
                type: typeof value === 'object' ? 'json' : typeof value as any,
                value: null
            };

            return {
                ...prev,
                variables: {
                    ...prev.variables,
                    [key]: {
                        ...currentVar,
                        value: value,
                        ...(metadata || {})
                    }
                }
            };
        });
    }, []);

    const addLogicBlueprint = useCallback(() => {
        const id = `bp-${Date.now()}`;
        const newBlueprint: LogicBlueprint = {
            id,
            nodes: {},
            connections: [],
            variables: {}
        };
        setState(prev => ({ ...prev, blueprints: { ...prev.blueprints, [id]: newBlueprint } }));
    }, []);

    // Batch 13.1: Auth Actions
    const signUp = useCallback(async (email: string, password: string) => {
        try {
            const user = await authService.signUp(email, password);
            setState(prev => ({
                ...prev,
                currentUser: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    isAuthenticated: true,
                    metadata: {}
                }
            }));
        } catch (error) {
            console.error('SignUp Failed:', error);
            throw error;
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const user = await authService.login(email, password);
            setState(prev => ({
                ...prev,
                currentUser: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    isAuthenticated: true,
                    metadata: {}
                }
            }));
        } catch (error) {
            console.error('Login Failed:', error);
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentUser: {
                id: 'guest',
                email: '',
                role: 'viewer',
                isAuthenticated: false,
                metadata: {}
            }
        }));
    }, []);


    // Batch 13.2: Secrets & Environments
    const loadEnvironments = useCallback(async () => {
        try {
            const envs = await secretService.getEnvironments();
            setState(prev => ({ ...prev, environments: envs }));
        } catch (err) {
            console.error("Failed to load environments", err);
        }
    }, []);

    const createEnvironment = useCallback(async (name: string, slug: string) => {
        try {
            const env = await secretService.createEnvironment(name, slug);
            setState(prev => ({ ...prev, environments: [...prev.environments, env] }));
        } catch (err) {
            console.error("Failed to create environment", err);
            throw err;
        }
    }, []);

    const setSecret = useCallback(async (envId: string, keyName: string, value: string) => {
        await secretService.setSecret(envId, keyName, value);
    }, []);

    const getSecrets = useCallback(async (envId: string) => {
        return await secretService.listSecrets(envId);
    }, []);

    // Batch 16.1: Logic Debugger Actions
    const setDebuggerMode = useCallback((mode: 'running' | 'paused' | 'stepping') => {
        setState(prev => ({
            ...prev,
            debugger: { ...prev.debugger, mode }
        }));
    }, []);

    const toggleBreakpoint = useCallback((nodeId: string) => {
        setState(prev => {
            const hasBreakpoint = prev.debugger.breakpoints.includes(nodeId);
            return {
                ...prev,
                debugger: {
                    ...prev.debugger,
                    breakpoints: hasBreakpoint
                        ? prev.debugger.breakpoints.filter(id => id !== nodeId)
                        : [...prev.debugger.breakpoints, nodeId]
                }
            };
        });
    }, []);

    const stepDebugger = useCallback(() => {
        // We set mode to 'stepping' which the Engine will consume once then revert to 'paused'
        setState(prev => ({
            ...prev,
            debugger: { ...prev.debugger, mode: 'stepping' }
        }));
    }, []);

    const setExecutionSpeed = useCallback((ms: number) => {
        setState(prev => ({
            ...prev,
            debugger: { ...prev.debugger, executionSpeed: ms }
        }));
    }, []);

    const replayEvent = useCallback((eventId: string) => {
        setState(prev => {
            const eventToReplay = prev.debugger.history.find(e => e.id === eventId);
            if (!eventToReplay) return prev;

            // Clone the event, give it a new ID, and push to queue
            const newEvent = {
                ...eventToReplay,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
                status: undefined, // Reset status
                error: undefined
            };

            return {
                ...prev,
                debugger: {
                    ...prev.debugger,
                    eventQueue: [...prev.debugger.eventQueue, newEvent as any],
                    // Auto-pause to allow inspection of the replayed event
                    mode: 'paused'
                }
            };
        });
    }, []);


    // Initialize Environments on boot (after db init)
    useEffect(() => {
        if (isInitialized) {
            loadEnvironments();
        }
    }, [isInitialized, loadEnvironments]);


    // Updated value object
    const value = {
        state,
        isInitialized,
        history,
        undo: undoCommand,
        redo: redoCommand,
        pushToHistory: (s: ProjectState) => pushToHistory(s),
        initializeProject,
        addElement,
        removeElement,
        updateElementStyles,
        updateElementProp,
        duplicateElement,
        upgradeTier, // Framer8
        importExternalStructure,
        duplicateElements,
        toggleLayoutMode,
        toggleStaticMode,
        setActiveMode, // Framer6
        convertToSafety,
        togglePreviewMode,
        moveElement,
        reorderElement,
        switchPage,
        setSelectedElement,
        setSelectedElements,
        toggleSelection,
        clearSelection,
        bulkAddElements,
        bulkUpdateElements,
        smartStack,
        updateGap,
        setState,
        addToken,
        updateToken,
        deleteToken,
        createClass,
        updateClass,
        renameClass,
        deleteClass,
        applyClass,
        addClass,
        removeClass,
        createMasterComponent,
        instantiateComponent,
        addComponentProp,
        deleteComponentProp,
        setVariableBinding,
        setInstancePropValue,
        pushDebugLog,
        setPageCollection,
        setActiveItemId,
        addToCart,
        removeFromCart,
        toggleCart,
        setElementCode,
        updateElementStateStyle,
        // Asset Intelligence Actions
        uploadAsset,
        deleteAsset,
        createFolder,
        updateAssetMetadata,
        createTeamLibrary,
        addAssetToLibrary,
        createAssetTag,
        highlightedControl: state.highlightedControl,
        setHighlightedControl,
        editingElementId: state.editingElementId,
        setEditingElementId: (id: string | null) => setState(prev => ({ ...prev, editingElementId: id })),
        hoveredElementId: state.hoveredElementId,
        setHoveredElementId: (id: string | null) => setState(prev => ({ ...prev, hoveredElementId: id })),
        dragState: state.dragState,
        setDragState: (drag: ProjectState['dragState']) => setState(prev => ({ ...prev, dragState: drag })),
        setViewMode,
        setActiveState,
        addVariant,
        removeVariant,
        setEditingClassId,
        // Style Management
        getDuplicateStyles,


        // Data Actions
        addCollection,
        updateCollection,
        removeCollection,
        createCollection,
        addField,
        addItem,
        updateItem,
        deleteItem,

        // API Workbench
        addAPISource,
        removeAPISource,
        fetchAPIData,
        mapAPIDataToElement,

        // Workflow & Plugin Actions
        addWorkflow,
        updateWorkflow,
        removeWorkflow,
        installPlugin,
        uninstallPlugin,

        // Phase 12: Multi-Tenancy
        setActiveTenantId,
        updateTenant,
        addTenant,
        reportUsage,
        tenants: state.tenants || [],

        // Motion Timeline
        addAnimationSequence,
        addKeyframe,
        removeKeyframe,
        updateKeyframe,

        // Logic Blueprints
        addLogicNode,
        moveLogicNode,
        removeLogicNode,
        addLogicConnection,
        removeLogicConnection,
        createBlueprint, // Ensure this matches existing
        addLogicBlueprint,
        setVariable,
        setEngineMode,
        // Batch 13.1
        signUp, login, logout,
        // Batch 13.2
        createEnvironment, setSecret, getSecrets,

        // Framer17
        addLocale,
        removeLocale,
        setActiveLocale,
        setLocaleOverride,
        autoTranslateProject,

        // Batch 5.3: Translation Memory
        addTranslation: (key: string, value: string, locale: string) => {
            setState(prev => ({
                ...prev,
                translations: {
                    ...prev.translations,
                    [locale]: {
                        ...(prev.translations[locale] || {}),
                        [key]: value
                    }
                }
            }));
        },

        // Analytics Actions
        logAnalyticsEvent,
        // Framer20: OS Actions
        setPlatform: (platform: ProjectState['platform']) => setState(prev => ({ ...prev, platform })),
        toggleCommandBar: (open?: boolean) => setState(prev => ({ ...prev, isCommandBarOpen: open !== undefined ? open : !prev.isCommandBarOpen })),
        setIsUIVisible,
        setIsSpacePressed,
        setCanvasTransform,
        updateOSSettings: (settings: Partial<ProjectState['osSettings']>) => setState(prev => ({ ...prev, osSettings: { ...prev.osSettings, ...settings } })),
        detachWindow: (windowId: string, detached: boolean) => setState(prev => ({
            ...prev,
            nativeWindows: prev.nativeWindows.map(w => w.id === windowId ? { ...w, isDetached: detached } : w)
        })),
        setGlobalCursor, // Batch 6.1
        togglePenTool: () => setState(prev => ({ ...prev, isPenToolActive: !prev.isPenToolActive })),
        isUIVisible: state.isUIVisible,
        isSpacePressed: state.isSpacePressed,
        toggleHeatmap,
        createAnalyticsFunnel,
        connectProvider,
        disconnectProvider,
        deployProject,
        addFunction,
        updateFunction,
        removeFunction,
        deployFunction,
        runFunction,
        sendAIMessage,
        connectGit,
        selectRepo,
        setBranch,
        createBranch,
        mergeBranch,
        syncWithGit,
        importFromCode,
        dispatchCommand,
        selectArea,
        // Debugger
        setDebuggerMode,
        toggleBreakpoint,
        stepDebugger,
        setExecutionSpeed,
        replayEvent,
        setWorkspaceMode: (mode: 'design' | 'logic') => setState(prev => ({ ...prev, workspaceMode: mode })),
        setLogicGraph: (nodes: any[], edges: any[]) => setState(prev => ({ ...prev, logicNodes: nodes, logicEdges: edges })),
    };

    return <ProjectContext.Provider value={value} > {children} </ProjectContext.Provider >;
}

export function useProjectStore() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjectStore must be used within a ProjectProvider');
    }
    return context;
}
