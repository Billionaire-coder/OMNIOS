"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { runtimeEventBus } from './EventBus';
import { ProjectState } from '@/types/designer';
import { LogicEngine } from './LogicEngine';

import { ApiManager } from '../api/ApiManager';

interface RuntimeState {
    variables: Record<string, any>;
    activePageId: string;
    navigationHistory: string[];
}

interface RuntimeContextType {
    state: RuntimeState;
    setVariable: (key: string, value: any) => void;
    getVariable: (key: string) => any;
    getVariables: () => Record<string, any>;
    navigate: (pageId: string) => void;
    triggerEvent: (blueprintId: string, eventType: string, payload?: any) => void;
    executeApiRequest: (requestId: string, variables: Record<string, any>) => Promise<any>;
    engine: LogicEngine | null;
}

const RuntimeContext = createContext<RuntimeContextType | undefined>(undefined);

interface RuntimeProviderProps {
    children: ReactNode;
    initialState?: Partial<RuntimeState>;
    projectData?: ProjectState;
    onNavigate?: (pageId: string) => void;
    onFireTrigger?: (blueprintId: string, eventType: string, payload?: any) => void;
    onAddItem?: (collectionId: string, values: Record<string, any>) => void; // Phase 12
    onReportUsage?: (tenantId: string, metric: string, amount: number) => void; // Phase 12.3
}

export const RuntimeProvider: React.FC<RuntimeProviderProps> = ({ children, initialState, projectData, onNavigate, onFireTrigger, onAddItem, onReportUsage }) => {
    const [state, setState] = useState<RuntimeState>({
        variables: {
            currentUser: projectData?.auth?.currentUser || null
        },
        activePageId: 'index',
        navigationHistory: [],
        ...initialState
    });

    const engineRef = useRef<LogicEngine | null>(null);
    const apiManagerRef = useRef<ApiManager | null>(null);

    // Sync currentUser from projectData to runtime variables if it changes
    useEffect(() => {
        if (projectData?.auth?.currentUser) {
            setState(prev => ({
                ...prev,
                variables: { ...prev.variables, currentUser: projectData.auth.currentUser }
            }));
        }
    }, [projectData?.auth?.currentUser]);

    // Initialize Managers
    if (projectData && !apiManagerRef.current) {
        apiManagerRef.current = new ApiManager(projectData, () => { });
    }

    // Initialize Engine
    if (!engineRef.current) {
        const contextBridge = {
            setVariable: (k: string, v: any) => {
                setState(prev => ({
                    ...prev,
                    variables: { ...prev.variables, [k]: v }
                }));
            },
            getVariable: (k: string) => {
                // Return variable from state
                // This is tricky because contextBridge is defined outside React lifecycle
                // However, we can use a ref or just closure if we update engine logic
            },
            getVariables: () => state.variables,
            navigate: (pageId: string) => {
                setState(prev => ({
                    ...prev,
                    activePageId: pageId,
                    navigationHistory: [...prev.navigationHistory, pageId]
                }));
                if (onNavigate) onNavigate(pageId);
            },
            executeApiRequest: async (requestId: string, vars: Record<string, any>) => {
                if (apiManagerRef.current) {
                    return await apiManagerRef.current.executeRequest(requestId, vars);
                }
                return { error: "ApiManager not initialized" };
            },
            addItem: (colId: string, vals: any) => {
                if (onAddItem) onAddItem(colId, vals);
            },
            reportUsage: (tenantId: string, metric: string, amount: number) => {
                if (onReportUsage) onReportUsage(tenantId, metric, amount);
            }
        };
        engineRef.current = new LogicEngine(contextBridge, projectData?.data, projectData?.activeTenantId);
    }

    // Sync engine state
    useEffect(() => {
        if (engineRef.current && projectData) {
            engineRef.current.updateProjectData(projectData.data, projectData.activeTenantId);
            engineRef.current.registerBlueprints(projectData.blueprints);
        }
    }, [projectData]);

    const setVariable = useCallback((key: string, value: any) => {
        setState(prev => ({
            ...prev,
            variables: { ...prev.variables, [key]: value }
        }));
    }, []);

    const getVariable = useCallback((key: string) => {
        return state.variables[key];
    }, [state.variables]);

    const getVariables = useCallback(() => state.variables, [state.variables]);

    const navigate = useCallback((pageId: string) => {
        setState(prev => ({
            ...prev,
            activePageId: pageId,
            navigationHistory: [...prev.navigationHistory, pageId]
        }));
        if (onNavigate) onNavigate(pageId);
    }, [onNavigate]);

    const triggerEvent = useCallback((blueprintId: string, eventType: string, payload?: any) => {
        const mode = projectData?.engineMode || 'standard';
        console.log(`[HybridKernel] Triggering ${eventType} in ${blueprintId} (Mode: ${mode})`);

        if (onFireTrigger) {
            onFireTrigger(blueprintId, eventType, payload);
            return;
        }

        if (mode === 'hyper' && (window as any).hyperBridge) {
            // Hyper Engine (Rust WASM)
            (window as any).hyperBridge.fireTrigger(blueprintId, eventType, payload);
        } else if (engineRef.current) {
            // Standard Engine (TypeScript)
            engineRef.current.trigger(blueprintId, eventType, payload);
        }
    }, [projectData?.engineMode, onFireTrigger]);

    const executeApiRequest = useCallback(async (requestId: string, vars: Record<string, any>) => {
        if (apiManagerRef.current) {
            return await apiManagerRef.current.executeRequest(requestId, vars);
        }
        return { error: "ApiManager not initialized" };
    }, []);

    return (
        <RuntimeContext.Provider value={{
            state,
            setVariable,
            getVariable,
            getVariables,
            navigate,
            triggerEvent,
            executeApiRequest,
            engine: engineRef.current
        }}>
            {children}
        </RuntimeContext.Provider>
    );
};

export const useRuntime = () => {
    const context = useContext(RuntimeContext);
    // Optional: Return a dummy context if used outside provider?
    // For now we enforce provider.
    return context;
};
