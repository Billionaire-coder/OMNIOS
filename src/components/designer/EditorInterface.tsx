"use client";

import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Button } from '@/components/ui/button'; // Batch 4.1
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useProjectStore } from '@/hooks/useProjectStore';
import Link from 'next/link';
import { ElementRenderer } from '@/components/designer/ElementRenderer';
import { AIAssistantPanel } from './AIAssistantPanel';
import { DataContext } from '@/lib/context/DataContext';
import { hyperBridge } from '@/lib/engine/HyperBridge';
import { useLogicEngine } from '@/hooks/useLogicEngine'; // Framer14: Global Triggers
import { collabService } from '@/lib/collab/CollabService';
import { CollaborationProvider, useCollaboration } from '@/hooks/useCollaboration'; // Framer11
import { CursorOverlay } from './CursorOverlay';
import { PresenceLayer } from './PresenceLayer';
import { CommentsOverlay } from './CommentsOverlay'; // Framer11
import { MobilePreview } from './MobilePreview'; // Framer12
import { LayersPanel } from '@/components/designer/LayersPanel';
import { PropertiesPanel } from '@/components/designer/PropertiesPanel';
import { TokenManager } from '@/components/designer/TokenManager';
import { DataManager } from '@/components/designer/DataManager';
import { StyleManager } from '@/components/designer/StyleManager';
import { ComponentsPanel } from '@/components/designer/ComponentsPanel';
import { InteractionOverlay } from '@/components/designer/InteractionOverlay';
import { CommerceOverlay } from './commerce/CommerceOverlay';
import { SchemaEditor } from '@/components/data/SchemaEditor'; // Batch 3.2
import { MotionTimeline } from './MotionTimeline';
import { ContextToolbar } from './ContextToolbar';
import { NavigatorMap } from './NavigatorMap';
import { MarqueeSelector, MarqueeHandle } from './MarqueeSelector';
import { CommandBar } from './CommandBar';
import { ContextMenu } from './ContextMenu';
import { AssetVault } from './AssetVault';
import { VariablesPanel } from '@/components/designer/VariablesPanel';
import { APIWorkbench } from './APIWorkbench';
import { ApiRequestEditor } from './api/ApiRequestEditor'; // Batch 3.1

import { WebhookEditor } from './logic/WebhookEditor'; // Batch 3.4
import { UserAuth } from './auth/UserAuth'; // Batch 13.1
import { AuthSimulator } from './auth/AuthSimulator'; // Batch 3.5
import { EnvironmentManager } from './secrets/EnvironmentManager'; // Batch 13.2
import { Restricted } from '../auth/Restricted'; // Batch 13.3
import { UserManagementPanel } from './settings/UserManagementPanel'; // Batch 13.3
import { IssuesPanel } from './intelligence/IssuesPanel'; // Batch 14.1
import { DependencyManager } from './DependencyManager';
import { AssetManager } from './AssetManager'; // Keeping for now if needed else remove later
import { aiBridgeSource } from '@/lib/ai/aiBridge';
import { BreakpointSwitcher } from './controls/BreakpointSwitcher';



import { ModeToggle } from './ModeToggle'; // Framer6
import { ShortcutManager } from './ShortcutManager';
import { DesignSystemPanel } from './DesignSystemPanel'; // Framer6
import { VQAParityPanel } from './VQAParityPanel';
import { ThemeTemplate, DesignerElement, ProjectState, ElementType, ElementStyles } from '@/types/designer';
import {
    Layout, Type, Image as ImageIcon, MousePointer2, Box, Square,
    Layers, Plus, Play, Monitor, Tablet, Smartphone, Search,
    Columns, Grid as GridIcon, Navigation, ChevronDown, List,
    CheckSquare, CircleDot, PlayCircle, Eye, Trash2, Code2, Sparkles, Code,
    Smartphone as MobileIcon, Layers2, FileCode, Hammer, Database, Globe, X, MessageSquare,
    CreditCard, ShoppingBag, Share2, Brain, Zap, Palette, Lock, LayoutTemplate, Package, Wand2, History, Rocket, PartyPopper, Bot, ArrowRight, Terminal, BarChart3, Radio, Languages,
    Framer, Download, GitBranch, Shield, Workflow
} from 'lucide-react';
import { LocaleManager } from './localization/LocaleManager';
import Confetti from 'react-confetti';
import { TranslationPanel } from './localization/TranslationPanel'; // Batch 5.3
import { GlobalCursorManager } from './GlobalCursorManager';
import { CustomerDashboard } from './membership/CustomerDashboard';
import { cleanupLayout } from '@/lib/intelligence/layoutEngine';
import { accessibilityAgent } from '@/lib/intelligence/accessibilityAgent';
import { architectPatterns } from '@/lib/intelligence/architectPatterns';
import { applyResponsiveBestPractices } from '@/lib/intelligence/responsiveAssistant';
import { applyVisualPolish } from '@/lib/intelligence/visualPolish';
import { getStripeCheckoutComponent, getParallaxHeroComponent, getTiltCardComponent } from '@/lib/data/marketComponents';
import { SEOHelper } from '@/components/seo/SEOHelper';
import { SEODashboard } from '@/components/designer/seo/SEODashboard';
import { LogicDebugger } from './debug/LogicDebugger';
import { MarketplacePanel } from './marketplace/MarketplacePanel'; // Batch 4.1 Consolidated
import { DataInspector } from './debug/DataInspector'; // Added for potential inline inspection
import { CollectionManager } from '@/lib/data/CollectionManager'; // Batch 2.1
import { RuntimeProvider } from '@/lib/runtime/RuntimeContext';
import { PerformanceHUD } from './debug/PerformanceHUD'; // Framer16
import { AnalyticsOverlay } from './analytics/AnalyticsOverlay'; // Framer19
import { PluginsPanel } from './PluginsPanel'; // Batch 2.1
// import { pluginManager } from '@/lib/plugins/manager';
import { OfficialThemeGenerator } from '@/lib/plugins/defaults';
import { Puzzle, PenTool as PenToolIcon } from 'lucide-react';
import { PenTool } from './controls/PenTool'; // Batch 4.2
import { PGliteProvider, useDB, useSync } from '@/lib/data/pglite/PGliteContext'; // Batch 2.4
import { SyncIndicator } from '@/components/ui/SyncIndicator'; // Batch 3.3
import { AICopilot as AICopilotTool } from './tools/AICopilot';
import { pluginHost } from '@/lib/plugins/PluginHost';
import { PluginContext } from '@/types/plugins';
import { PropertyEstimatorPlugin } from '@/lib/plugins/samples/PropertyEstimator';
import { A11yPanel } from './A11yPanel'; // Batch 4.6
import { ScreenReaderSimulator } from '../tools/ScreenReaderSimulator'; // Batch 4.6

// Batch 7.2: Code Optimization (Lazy Loading)
const AICopilot = dynamic(() => import('./tools/AICopilot').then(mod => mod.AICopilot), {
    loading: () => <div className="w-80 h-96 flex items-center justify-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>,
    ssr: false
});

// Phase 3: Logic Brain
const LogicCanvas = dynamic(() => import('../logic/LogicCanvas').then(mod => mod.LogicCanvas), {
    loading: () => <div className="flex items-center justify-center w-full h-full text-white/50">Loading Logic Engine...</div>,
    ssr: false
});
const PluginMarketplace = dynamic<any>(() => import('./marketplace/PluginMarketplace').then(mod => mod.PluginMarketplace), { ssr: false });
const VersionControlPanel = dynamic<any>(() => import('./VersionControlPanel').then(mod => mod.VersionControlPanel), { ssr: false });
const AnalyticsDashboard = dynamic<any>(() => import('./analytics/AnalyticsDashboard').then(mod => mod.AnalyticsDashboard), { ssr: false });
const HyperCanvas = dynamic<any>(() => import('../engine/HyperCanvas').then(mod => mod.HyperCanvas), { ssr: false });
const GitSidebar = dynamic<any>(() => import('./GitSidebar').then(mod => mod.GitSidebar), { ssr: false });
const DeploymentPanel = dynamic<any>(() => import('./DeploymentPanel').then(mod => mod.DeploymentPanel), { ssr: false });
const ServerlessPanel = dynamic<any>(() => import('./ServerlessPanel').then(mod => mod.ServerlessPanel), { ssr: false });
const SchemaDesigner = dynamic<any>(() => import('./Architect/SchemaDesigner').then(mod => mod.SchemaDesigner), { ssr: false });
const ArchitectConnect = dynamic<any>(() => import('./Architect/ArchitectConnect').then(mod => mod.ArchitectConnect), { ssr: false });
const WorkflowStudio = dynamic<any>(() => import('./Architect/WorkflowStudio').then(mod => mod.WorkflowStudio), { ssr: false });
const SaaSAdminDashboard = dynamic<any>(() => import('./Architect/SaaSAdminDashboard').then(mod => mod.SaaSAdminDashboard), { ssr: false });
const WorkshopPanel = dynamic<any>(() => import('./marketplace/WorkshopPanel').then(mod => mod.WorkshopPanel), { ssr: false }); // Batch 15.1


interface EditorInterfaceProps {
    initialTheme: ThemeTemplate | any; // using any for blank theme object flexibility
    mode: 'blank' | 'theme' | 'template';
}

const ToolButton = ({ onClick, icon, label, gridSpan }: { onClick: () => void, icon: React.ReactNode, label: string, gridSpan?: number }) => (
    <button
        onClick={onClick}
        className="glass"
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '16px 8px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            gridColumn: gridSpan ? `span ${gridSpan}` : 'auto',
            height: '80px', // Uniform height
            width: '100%'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'var(--accent-teal)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
        }}
    >
        <div style={{ color: '#eee' }}>{icon}</div>
        <span style={{ fontSize: '0.65rem', fontWeight: '500', color: '#aaa' }}>{label}</span>
    </button>
);

const SidebarTab = ({ onClick, icon, label, active, color }: { onClick: () => void, icon: React.ReactNode, label: string, active?: boolean, color?: string }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '10px 4px',
            fontSize: '0.6rem',
            borderRadius: '6px',
            backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: active ? 'white' : (color || '#666'),
            border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '0'
        }}
        onMouseEnter={(e) => {
            if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
        }}
        onMouseLeave={(e) => {
            if (!active) e.currentTarget.style.backgroundColor = 'transparent';
        }}
    >
        <div style={{ opacity: active ? 1 : 0.6 }}>{icon}</div>
        <span style={{ fontSize: '0.55rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </button>
);
const CollaborationStatus = ({ onFollow, followingId }: { onFollow: (id: number | null) => void, followingId: number | null }) => {
    const { isConnected, peers, user, isDirector, toggleDirector, directorId } = useCollaboration();

    if (!isConnected) {
        return (
            <div className="flex items-center gap-2 px-2 py-1 glass rounded-md border border-white/5 bg-white/5 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-mono text-white/50 font-bold mr-2">OFFLINE</span>
            </div>
        );
    }

    const directorPeer = directorId ? peers.find(p => p.user?.id === directorId) : null;
    const isFollowingDirector = !!directorId && !isDirector;

    return (
        <div className={`flex items-center gap-2 px-2 py-1 glass rounded-md border transition-colors ${isDirector ? 'border-red-500/50 bg-red-500/10' : (isFollowingDirector ? 'border-blue-500/50 bg-blue-500/10' : 'border-green-500/20 bg-green-500/5')}`}>

            {/* Connection Status / Director Indicator */}
            <div className={`w-2 h-2 rounded-full animate-pulse ${isDirector ? 'bg-red-500' : (isFollowingDirector ? 'bg-blue-500' : 'bg-green-500')}`} />
            <span className={`text-xs font-mono font-bold mr-2 ${isDirector ? 'text-red-400' : (isFollowingDirector ? 'text-blue-400' : 'text-green-400')}`}>
                {isDirector ? 'ON AIR' : (isFollowingDirector ? 'FOLLOWING' : 'LIVE')}
            </span>

            {/* Present Button */}
            <button
                onClick={toggleDirector}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${isDirector ? 'text-red-400' : 'text-white/40 hover:text-white'}`}
                title={isDirector ? "Stop Presenting" : "Start Presenting"}
            >
                <Monitor size={14} />
            </button>
            <div className="w-px h-3 bg-white/10 mx-1" />

            {/* Render Self */}
            <div
                className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[0.5rem] font-bold text-black ring-1 ring-white/20"
                style={{ backgroundColor: user.color }}
                title={`${user.name} (You)`}
            >
                {user.name[0]}
            </div>

            {/* Render Peers */}
            {peers.map((p) => {
                const pName = p.user?.name || 'A';
                const pColor = p.user?.color || '#ccc';
                // Highlight director if we are following them
                const isDirectorPeer = p.user?.id === directorId;

                return (
                    <div
                        key={p.clientId}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[0.5rem] font-bold text-black -ml-1 transition-transform hover:scale-110 hover:z-10 ${isDirectorPeer ? 'ring-2 ring-blue-500 z-20 scale-110' : 'border-white/20'}`}
                        style={{ backgroundColor: pColor }}
                        title={isDirectorPeer ? `Presenting: ${pName}` : pName}
                    >
                        {pName[0]}
                    </div>
                );
            })}
        </div>
    );
};

// Phase 16: Debug Console Logic
const NativeTitleBar = ({
    setIsUserManagementOpen,
    setIsEnvManagerOpen,
    isIssuesPanelOpen,
    setIsIssuesPanelOpen,
    setShowDeployment // Consolidated Batch 4.1
}: {
    setIsUserManagementOpen: (v: boolean) => void,
    setIsEnvManagerOpen: (v: boolean) => void,
    isIssuesPanelOpen: boolean,
    setIsIssuesPanelOpen: (v: boolean) => void,
    setShowDeployment: (v: boolean) => void // Consolidated Batch 4.1
}) => {
    const { state, setEngineMode } = useProjectStore();

    const handleExport = async () => {
        try {
            const blob = await import('@/lib/compiler/export').then(m => m.exportProjectToZip(state));
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${state.name.toLowerCase().replace(/\s+/g, '-')}-export.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Check console for details.');
        }
    };

    if (!state.osSettings.showTitleBar) return null;

    return (
        <div className="h-10 bg-[#0d0d0d] border-b border-white/5 flex items-center justify-between px-4 select-none drag-region">
            <div className="flex items-center gap-2">
                <div className="flex gap-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/10 cursor-pointer" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-black/10 cursor-pointer" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840] border border-black/10 cursor-pointer" />
                </div>
                {/* Batch 4.1: Deploy Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-white gap-2 px-2"
                    onClick={() => setShowDeployment(true)}
                >
                    <Rocket className="w-3 h-3" />
                    Deploy
                </Button>

                <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10">
                    <Framer size={12} className="text-[#00ffd5]" />
                    <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">OMNIOS OS</span>
                </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 backdrop-blur-md shadow-inner shadow-black/50">
                <button
                    onClick={() => setEngineMode('standard')}
                    className={`px-3 py-1 text-[10px] font-medium rounded transition-all ${state.engineMode === 'standard' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                >
                    Standard
                </button>
                <div className="w-[1px] h-3 bg-white/5 mx-1" />
                <button
                    onClick={() => setEngineMode('hyper')}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all flex items-center gap-1.5 ${state.engineMode === 'hyper' ? 'bg-[#00ffd5]/10 text-[#00ffd5] shadow-[0_0_10px_rgba(0,255,213,0.1)] border border-[#00ffd5]/20' : 'text-white/40 hover:text-[#00ffd5]/60'}`}
                >
                    <Zap size={10} className={state.engineMode === 'hyper' ? 'fill-current animate-pulse' : ''} />
                    HYPER
                </button>
            </div>

            <div className="flex items-center gap-4">
                <Restricted to="users:read">
                    <div
                        onClick={() => setIsUserManagementOpen(true)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-zinc-500 hover:text-purple-400 transition-colors"
                        title="User Management"
                    >
                        <Shield size={12} />
                        <span className="text-[10px] font-medium">Users</span>
                    </div>
                </Restricted>

                <Restricted to="secrets:read">
                    <div
                        onClick={() => setIsEnvManagerOpen(true)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-zinc-500 hover:text-purple-400 transition-colors"
                        title="Environment Variables"
                    >
                        <Lock size={12} />
                        <span className="text-[10px] font-medium">Sec</span>
                    </div>
                </Restricted>

                <SyncIndicator />

                <div
                    onClick={() => setIsIssuesPanelOpen(!isIssuesPanelOpen)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-colors ${isIssuesPanelOpen ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/5 text-zinc-500 hover:text-yellow-400'
                        }`}
                    title="Design Intelligence"
                >
                    <Brain size={12} />
                    <span className="text-[10px] font-medium">Auto</span>
                </div>

                <div className="h-4 w-[1px] bg-white/10 mx-1" />

                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-md border border-white/10">
                    <button
                        onClick={async () => {
                            const { nativeForge } = await import('@/lib/engine/NativeForge');
                            nativeForge.forge(state.name, 'windows');
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#00ffd5]/20 text-[#00ffd5] transition-all group"
                        title="Forge Native Standalone (Windows)"
                    >
                        <Rocket size={12} className="group-hover:animate-bounce" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Forge</span>
                    </button>
                </div>

                <Restricted role="editor">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-[#00ffd5]">
                        <Zap size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Live</span>
                    </div>
                </Restricted>

                <div
                    onClick={handleExport}
                    className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-[#00ffd5] border border-[#00ffd5]/20"
                    title="Export to Code"
                >
                    <Download size={12} />
                    <span className="text-[10px] font-medium">Export</span>
                </div>
            </div>
        </div >
    );
};


const SessionSync = () => {
    const { data: session, status } = useSession();
    const { setState, isInitialized } = useProjectStore();

    useEffect(() => {
        if (isInitialized && status === 'authenticated' && session?.user) {
            const user = session.user;
            console.log("[SessionSync] Syncing session to store:", user.email);

            setState(prev => ({
                ...prev,
                auth: {
                    ...prev.auth,
                    currentUser: {
                        id: (user as any).id || user.email || 'unknown',
                        email: user.email || '',
                        role: (user as any).role || 'editor',
                        metadata: { name: user.name || '' },
                        isAuthenticated: true
                    }
                }
            }));
        }
    }, [session, setState, isInitialized, status]);

    return null;
};

export function EditorInterface({ initialTheme, mode }: EditorInterfaceProps) {
    return (
        <CollaborationProvider>
            <SessionSync />
            <ErrorBoundary name="EditorInterface" fallback={<div className="flex items-center justify-center h-screen text-red-500">Editor Crashed. Please refresh.</div>}>
                <EditorInterfaceContent initialTheme={initialTheme} mode={mode} />
            </ErrorBoundary>
        </CollaborationProvider>
    );
}

function EditorInterfaceContent({ initialTheme, mode }: EditorInterfaceProps) {
    const router = useRouter();
    const { state, isInitialized, initializeProject, setSelectedElement, setSelectedElements, selectArea, history,
        clearSelection, toggleLayoutMode, togglePreviewMode, moveElement, addElement,
        bulkAddElements, updateElementStyles, removeElement, switchPage, setState,
        undo, redo, createMasterComponent, instantiateComponent, setPageCollection,
        toggleStaticMode,
        setEditingElementId, setHoveredElementId, setEditingClassId, setHighlightedControl,
        setActiveItemId, createCollection, addField, addItem, updateItem, deleteItem,
        reportUsage,
        toggleCart, addToCart, removeFromCart, bulkUpdateElements, bulkUpdateDeltas,
        logAnalyticsEvent, importExternalStructure,
        toggleCommandBar, togglePenTool, dispatchCommand,
        isUIVisible, setIsUIVisible, isSpacePressed, setIsSpacePressed,
        setCanvasTransform,
        setWorkspaceMode // Added Batch 8.3
    } = useProjectStore();

    // Batch 2.1.2: Sync Logic
    const { syncStatus, saveProject } = useSync();

    // Auto-save on change (debounced)
    const activeHistoryRef = useRef(history); // Keep ref for effect dependency tracking if needed or just use history
    useEffect(() => {
        activeHistoryRef.current = history;
    }, [history]);

    // Initialize Project
    useEffect(() => {
        console.log('[Editor] isInitialized:', isInitialized);
        if (!isInitialized) {
            console.log('[Editor] Triggering manual initialization');
            initializeProject({ id: 'blank' });
        }
    }, [isInitialized, initializeProject]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (activeHistoryRef.current.past.length > 0) { // Only save if there are changes
                saveProject();
            }
        }, 3000); // 3 seconds debounce
        return () => clearTimeout(timeout);
    }, [history]); // Depend on history changes

    // Phase 3: Logic Brain Switcher (Global State)
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [showDeployment, setShowDeployment] = useState(false);
    const [showServerless, setShowServerless] = useState(false);
    const [showSchemaDesigner, setShowSchemaDesigner] = useState(false);
    const [showWorkflowStudio, setShowWorkflowStudio] = useState(false);
    const [showSaaSAdmin, setShowSaaSAdmin] = useState(false);
    const [showConnect, setShowConnect] = useState(false);

    const viewMode = state.workspaceMode;
    const setViewMode = setWorkspaceMode;

    // Mapping for local compatibility
    const canvasTransform = { x: state.canvasPosition.x, y: state.canvasPosition.y, scale: state.canvasScale };

    // Batch 2.4: Data Manager Instance
    const collectionManager = useMemo(() => new CollectionManager(state, setState), [state, setState]);
    const pgliteSettings = useDB();
    const db = pgliteSettings.db;

    // Batch 13.1: Auth Gate (Disabled for Dev Convenience)
    // if (!state.currentUser?.isAuthenticated && !state.auth.isPreviewMode) {
    //     return <UserAuth />;
    // }

    const { fireTrigger, triggerState } = useLogicEngine(); // Framer12 & Batch 9.3

    // Phase 18: Register System Plugins
    React.useEffect(() => {
        import('@/lib/plugins/SystemPlugins').then(m => m.registerSystemPlugins());
    }, []);


    // Framer11: Follow State
    const [followPeerId, setFollowPeerId] = useState<number | null>(null);

    // Batch 6.1: AI Copilot
    const [isAIOpen, setIsAIOpen] = useState(false);

    const marqueeRef = React.useRef<MarqueeHandle>(null);

    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    const [isExporting, setIsExporting] = useState(false);
    const [exportedCode, setExportedCode] = useState('');
    const [leftPanelTab, setLeftPanelTab] = useState<'add' | 'layers' | 'theme' | 'components' | 'tokens' | 'data' | 'variables' | 'styles' | 'intelligence' | 'packages' | 'market' | 'locales' | 'analytics' | 'plugins' | 'translations' | 'git' | 'access'>('add');
    const [pluginPanels, setPluginPanels] = useState<any[]>([]);

    // Batch 4.6: A11y Simulator State
    const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

    // Batch 7.5: Production Mode (UI Toggle)
    // Batch 7.5: Production Mode (UI Toggle) - NOW IN STORE

    // Batch 4.2: Plugin System Initialization (LEGACY - Replaced by PluginHost in Batch 9.1)
    /*
    useEffect(() => {
        // Initialize Manager with Context
        ...
    }, []); 
    */
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(null);
    const [isAssetVaultOpen, setIsAssetVaultOpen] = useState(false);
    const [isApiRequestEditorOpen, setIsApiRequestEditorOpen] = useState(false); // Batch 3.1
    const [isWebhookEditorOpen, setIsWebhookEditorOpen] = useState(false); // Batch 3.4
    const [isAuthSimulatorOpen, setIsAuthSimulatorOpen] = useState(false); // Batch 3.5
    const [isWorkshopOpen, setIsWorkshopOpen] = useState(false); // Batch 15.1
    const [workshopComponentId, setWorkshopComponentId] = useState<string | null>(null); // Batch 15.1
    const [isDesignSystemOpen, setIsDesignSystemOpen] = useState(false); // Framer6
    const [vaultCallback, setVaultCallback] = useState<{ onSelect: (asset: any) => void } | null>(null);

    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false); // Batch 7.3
    const [showSEO, setShowSEO] = useState(false); // Framer10: SEO Dashboard // Framer5

    // Framer11: Collaboration
    const { updatePresence, peers, versions, broadcastEvent, lastEvent, isDirector, toggleDirector, directorId } = useCollaboration();
    const [activeTool, setActiveTool] = useState<'select' | 'hand' | 'comment'>('select');
    const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false);
    const [diffVersionId, setDiffVersionId] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false); // Framer12: Mobile Native Preview
    const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false); // Framer15: Publishing
    const [isDebugOpen, setIsDebugOpen] = useState(false); // Framer16: Developer Tools
    const [isEnvManagerOpen, setIsEnvManagerOpen] = useState(false); // Batch 13.2
    const [isUserManagementOpen, setIsUserManagementOpen] = useState(false); // Batch 13.3
    const [isIssuesPanelOpen, setIsIssuesPanelOpen] = useState(false); // Batch 14.1

    // Batch 14.4: Director Mode (Force Follow)
    useEffect(() => {
        if (directorId && directorId !== collabService.getUserId()) {
            // Find the director in peers
            const directorPeer = peers.find(p => p.user && p.user.id === directorId);
            if (directorPeer && directorPeer.user.viewport) {
                // Smoothly sync viewport
                // Note: direct setCanvasTransform might act jarringly if updates are infrequent.
                // But Y.Awareness is fast enough (usually).
                // Use a functional update to avoid dependency usage if possible, but we need raw values.
                setCanvasTransform(directorPeer.user.viewport);
            }
        }
    }, [directorId, peers, setCanvasTransform]); // Peers update on presence change

    // Framer20: Global Command Bar Listener (NOW HANDLED BY SHORTCUTMANAGER)

    // Handle incoming events
    useEffect(() => {
        if (lastEvent && lastEvent.type === 'GO_LIVE') {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [lastEvent]);

    const handleGoLive = () => {
        // Broadcast the event
        broadcastEvent('GO_LIVE', { version: 'v1.0' });
        // Show local confetti too
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
    };

    // Framer19: Implicit Page View Tracking
    useEffect(() => {
        if (state.activePageId) {
            logAnalyticsEvent({
                type: 'page_view',
                pageId: state.activePageId,
                metadata: { timestamp: Date.now() }
            });
        }
    }, [state.activePageId, logAnalyticsEvent]);

    // INFINITE CANVAS STATE
    // INFINITE CANVAS STATE - NOW IN STORE
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Rate Limiting for Mouse Move
    const lastCursorUpdate = React.useRef(0);

    // Sync transform to ref for event handlers to avoid re-binding
    const canvasTransformRef = useRef(canvasTransform);
    useEffect(() => { canvasTransformRef.current = canvasTransform; }, [canvasTransform]);

    // Batch 12.1: Hyper Mode Hit Testing
    useEffect(() => {
        if (state.engineMode !== 'hyper') return;

        const handleHyperMouseMove = (e: MouseEvent) => {
            // Throttle hit testing to ~60fps (16ms)
            // Or just let it fly since Rust is fast? 
            // Let's optimize slightly.

            const rect = document.getElementById('hyper-canvas')?.getBoundingClientRect() || document.body.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Transform to world space
            const { x: tx, y: ty, scale } = canvasTransformRef.current;
            const worldX = (x - tx) / scale;
            const worldY = (y - ty) / scale;

            const hitId = hyperBridge.hitTest(worldX, worldY);

            // Only update if changed to avoid React thrashing
            if (hitId !== state.hoveredElementId) {
                // If hitId is undefined, it means nothing hit (or error), so we clear hover (null)
                // If ID returned, we set it.
                setHoveredElementId(hitId || null);
            }
        };

        window.addEventListener('mousemove', handleHyperMouseMove);
        return () => window.removeEventListener('mousemove', handleHyperMouseMove);
    }, [state.engineMode, state.hoveredElementId, setHoveredElementId]);

    const selectedElement = state.selectedElementId && !state.selectedElementId.includes('::') ? state.elements[state.selectedElementId] : null;



    const handleCanvasWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            // ZOOM TO POINTER
            const zoomSensitivity = 0.001;
            const delta = -e.deltaY * zoomSensitivity;
            const newScale = Math.min(Math.max(0.1, canvasTransform.scale + delta), 5);

            // Calculate pointer position relative to the canvas origin
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Project mouse position into "world space" (pre-zoom)
            const worldX = (mouseX - canvasTransform.x) / canvasTransform.scale;
            const worldY = (mouseY - canvasTransform.y) / canvasTransform.scale;

            // Calculate new offset to keep the world point fixed under the mouse
            const newX = mouseX - worldX * newScale;
            const newY = mouseY - worldY * newScale;

            setCanvasTransform({
                x: newX,
                y: newY,
                scale: newScale
            });
        } else {
            // PAN
            setCanvasTransform(prev => ({
                ...prev,
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    };

    // Framer14: Global Logic Triggers
    useEffect(() => {
        // 1. On Load
        fireTrigger('bp-root', 'on_load');

        // 2. On Blur
        const handleBlur = () => fireTrigger('bp-root', 'on_blur');
        window.addEventListener('blur', handleBlur);

        // 3. On Idle (30s)
        let idleTimer: NodeJS.Timeout;
        const resetIdle = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                console.log("[Global Trigger] System Idle for 30s");
                fireTrigger('bp-root', 'on_idle');
            }, 30000);
        };
        window.addEventListener('mousemove', resetIdle);
        window.addEventListener('keydown', resetIdle);
        resetIdle();

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('mousemove', resetIdle);
            window.removeEventListener('keydown', resetIdle);
            clearTimeout(idleTimer);
        };
    }, [fireTrigger]);



    // Framer11: Follow Mode Logic
    useEffect(() => {
        if (!followPeerId) return;

        const peer = peers.find(p => p.clientId === followPeerId);
        if (peer && peer.viewport) {
            // Smoothly animate to peer's viewport
            // For MVP, simplistic snap or direct set
            // To prevent jitter, we only update if diff is significant? 
            // Or we just set it.
            setCanvasTransform(prev => ({
                x: peer.viewport.x,
                y: peer.viewport.y,
                scale: peer.viewport.scale
            }));
        } else if (!peer) {
            // Peer disconnected?
            setFollowPeerId(null);
        }
    }, [peers, followPeerId]); // Re-run when peers update (which happens on awareness change)

    // Reset View Helper
    const resetView = () => setCanvasTransform({ x: 0, y: 0, scale: 1 });
    const isSlotSelected = state.selectedElementId?.includes('::');

    // Keyboard Shortcuts (NOW HANDLED BY SHORTCUTMANAGER)

    useEffect(() => {
        let lastPos = { x: 0, y: 0 };
        let lastTime = performance.now();
        let hoverStartTime = performance.now();
        let currentHoverId: string | null = null;

        const handleMouseMoveGlobal = (e: MouseEvent) => {
            const now = performance.now();
            const dt = now - lastTime;
            const dx = e.clientX - lastPos.x;
            const dy = e.clientY - lastPos.y;
            const velocity = Math.sqrt(dx * dx + dy * dy) / (dt || 1);

            lastPos = { x: e.clientX, y: e.clientY };
            lastTime = now;

            hyperBridge.logInteraction('move', { x: e.clientX, y: e.clientY });

            // Batch 22.2: Tick Neural Forecaster
            const hoveredId = hyperBridge.hitTest(e.clientX, e.clientY);
            if (hoveredId) {
                if (currentHoverId !== hoveredId) {
                    currentHoverId = hoveredId;
                    hoverStartTime = now;
                }
                const hoverDuration = now - hoverStartTime;

                hyperBridge.logInteraction('hover', { x: e.clientX, y: e.clientY, id: hoveredId });
                import('@/lib/intelligence/NeuralForecaster').then(mod => {
                    mod.neuralForecaster.tick(hoveredId, hoverDuration, velocity);
                });
            } else {
                currentHoverId = null;
            }
        };

        const handleClickGlobal = (e: MouseEvent) => {
            hyperBridge.logInteraction('click', { x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMoveGlobal);
        window.addEventListener('mousedown', handleClickGlobal);

        return () => {
            window.removeEventListener('mousemove', handleMouseMoveGlobal);
            window.removeEventListener('mousedown', handleClickGlobal);
        };
    }, []);

    // Panning Mouse Handlers
    const handleMouseDownPan = (e: React.MouseEvent) => {
        if (isSpacePressed || (e.button === 1)) { // Middle click or Space+Left
            e.preventDefault();
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
        } else if (!isSpacePressed && !isPanning && e.button === 0) {
            marqueeRef.current?.startSelection(e.clientX, e.clientY);
        }
    };

    const handleMouseMovePan = (e: React.MouseEvent) => {
        // Framer11: Update Presence (Mouse Position)
        // Throttle to 50ms
        const now = Date.now();
        if (now - lastCursorUpdate.current > 50) {
            // Calculate World Coordinates
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const worldX = (x - canvasTransform.x) / canvasTransform.scale;
            const worldY = (y - canvasTransform.y) / canvasTransform.scale;

            updatePresence({
                cursor: { x: worldX, y: worldY },
                // Also send viewport so others can follow us
                viewport: { ...canvasTransform }
            });
            lastCursorUpdate.current = now;
        }

        if (isPanning) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            setCanvasTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUpPan = () => {
        setIsPanning(false);
    };

    // Batch 14.4: Sync Viewport to Presence
    useEffect(() => {
        collabService.updatePresence({
            viewport: canvasTransform
        });
    }, [canvasTransform]);

    // Batch 9.1: Initialize Plugin Host
    const stateRef = useRef(state);
    useEffect(() => { stateRef.current = state; }, [state]);

    // Batch 11.1: Initialize Collaboration
    // Batch 14.2: Atomic Command Sync
    const lastCommandTimestamp = useRef(0);

    useEffect(() => {
        collabService.init('omnios-default-room');

        // Listen for remote commands and apply them
        const unsubscribe = collabService.onCommand((command) => {
            // Prevent Echo
            if (command.userId && command.userId === collabService.getUserId()) return;

            // Conflict Resolution: Last Write Wins
            // If we receive a command that is OLDER than the last one we processed, ignore it.
            // This prevents "jitter" where a late packet reverts the state.
            if (command.timestamp && command.timestamp < lastCommandTimestamp.current) {
                return;
            }
            if (command.timestamp) {
                lastCommandTimestamp.current = command.timestamp;
            }

            // Apply command as remote
            dispatchCommand(command, true);
        });

        return () => {
            unsubscribe();
            collabService.destroy();
        };
    }, [dispatchCommand]);

    // Batch 11.2: Local Presence Tracking
    useEffect(() => {
        // Sync selection to peers
        collabService.updatePresence({
            selection: state.selectedElementIds,
            name: state.currentUser?.email?.split('@')[0] || 'Peer'
        });
    }, [state.selectedElementIds, state.currentUser]);

    const handleCanvasMouseMovePresence = (e: React.MouseEvent) => {
        if (!collabService) return;

        // Calculate canvas coordinates
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const cx = (mx - canvasTransform.x) / canvasTransform.scale;
        const cy = (my - canvasTransform.y) / canvasTransform.scale;

        collabService.updatePresence({
            cursor: { x: cx, y: cy }
        });
    };

    // Batch 10.2: State Delta Feedback Loop
    useEffect(() => {
        let active = true;
        const pollDeltas = () => {
            if (!active) return;
            const deltas = hyperBridge.getStateDeltas();
            if (deltas && deltas.length > 0) {
                bulkUpdateDeltas(deltas);
            }
            requestAnimationFrame(pollDeltas);
        };
        const frameId = requestAnimationFrame(pollDeltas);
        return () => {
            active = false;
            cancelAnimationFrame(frameId);
        };
    }, [bulkUpdateDeltas]);

    useEffect(() => {
        // Updated to match src/types/plugins.ts (flattened)
        const pluginContext: PluginContext = {
            projectId: stateRef.current.id || 'demo-project',
            projectName: stateRef.current.name || 'Untitled Project',

            // Core Actions
            addElement: (type, parentId, props) => {
                // Simplified adapter logic
                const id = crypto.randomUUID();
                const newElement: Partial<DesignerElement> = { ...props, type, id };
                bulkAddElements(parentId, { [id]: newElement }, id);
                return id;
            },
            updateElementStyles: (id, styles) => updateElementStyles(id, styles),
            updateElementProp: (id, prop, value) => {
                // Quick adapter for prop updates - might need a dedicated action in store
                // For now, assume it maps to styles or content
                console.warn('updateElementProp not fully implemented in EditorInterface adapter');
            },
            removeElement: (id) => {
                // Need to implement remove in store or import verify_phase4 logic
                console.warn('removeElement not fully implemented');
            },

            // Design System
            addToken: (token) => {
                // Adapter for adding tokens
                console.log('Plugin added token:', token);
            },

            // UI Helpers
            showNotification: (msg, type) => {
                console.log(`[Plugin Notification]: ${msg} (${type})`);
            },

            // State Access
            getState: () => stateRef.current,

            // Engine SDK
            dispatchCommand: (action, targetId, payload) => {
                console.log('Dispatch command:', action, targetId);
            },
            registerEngine: (id, engine) => {
                console.log('Register engine:', id);
            },
            getEngine: (id) => null
        };
        pluginHost.init(pluginContext);
        pluginHost.registerPlugin(OfficialThemeGenerator);
        pluginHost.registerPlugin(PropertyEstimatorPlugin);
    }, [db]); // Only re-init if DB changes

    useEffect(() => {
        if (initialTheme) {
            initializeProject(initialTheme);
        }
    }, [initialTheme, initializeProject]);

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsAIGenerating(false);
        // Show a loading cursor?
        try {
            const section = await aiBridgeSource.generateSection(aiPrompt);
            bulkAddElements(state.selectedElementId || 'root', section.elements, section.rootId);
            setAiPrompt('');
        } catch (err) {
            console.error('AI Generation failed:', err);
        }
    };

    const handleCreateComponent = () => {
        if (!selectedElement) return;
        const name = prompt("Enter Component Name (e.g., 'Product Card')");
        if (name) {
            createMasterComponent(selectedElement.id, name);
        }
    };

    const handleInstantiate = (componentId: string) => {
        const targetId = state.selectedElementId || state.rootElementId;
        instantiateComponent(componentId, targetId);
    };

    const handleInsertPreset = (preset: 'center-hero' | 'navbar' | 'features') => {
        const targetId = state.selectedElementId || state.rootElementId;
        const elements: Record<string, Partial<DesignerElement>> = {};
        let rootId = '';

        if (preset === 'center-hero') {
            const sectionId = `hero_sec_${Math.random().toString(36).substr(2, 5)}`;
            const containerId = `hero_cnt_${Math.random().toString(36).substr(2, 5)}`;
            const headId = `hero_h1_${Math.random().toString(36).substr(2, 5)}`;
            const subtextId = `hero_p_${Math.random().toString(36).substr(2, 5)}`;
            const btnId = `hero_btn_${Math.random().toString(36).substr(2, 5)}`;
            const imgId = `hero_img_${Math.random().toString(36).substr(2, 5)}`;

            rootId = sectionId;
            elements[sectionId] = { type: 'section', styles: { padding: '100px 20px', backgroundColor: '#050505', display: 'flex', justifyContent: 'center' }, children: [containerId] };
            elements[containerId] = { type: 'container', parentId: sectionId, styles: { maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }, children: [headId, subtextId, btnId, imgId] };
            elements[headId] = { type: 'text', parentId: containerId, content: 'Design with Intelligence', styles: { fontSize: '4.5rem', fontWeight: 'bold', lineHeight: '1.1', color: 'white' } };
            elements[subtextId] = { type: 'text', parentId: containerId, content: 'OMNIOS uses predictive layout logic to help you build stunning web experiences in record time.', styles: { fontSize: '1.2rem', color: '#888', maxWidth: '600px' } };
            elements[btnId] = { type: 'button', parentId: containerId, content: 'Get Started Now', styles: { padding: '16px 32px', backgroundColor: 'var(--accent-teal)', color: 'black', borderRadius: '8px', fontWeight: 'bold' } };
            elements[imgId] = { type: 'image', parentId: containerId, content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', styles: { width: '100%', borderRadius: '12px', marginTop: '40px', border: '1px solid #222' } };
        } else if (preset === 'navbar') {
            const headerId = `nav_hdr_${Math.random().toString(36).substr(2, 5)}`;
            const containerId = `nav_cnt_${Math.random().toString(36).substr(2, 5)}`;
            const logoId = `nav_logo_${Math.random().toString(36).substr(2, 5)}`;
            const linksId = `nav_links_${Math.random().toString(36).substr(2, 5)}`;
            const ctaId = `nav_cta_${Math.random().toString(36).substr(2, 5)}`;

            rootId = headerId;
            elements[headerId] = { type: 'section', styles: { height: '80px', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', position: 'sticky', top: '0', zIndex: '1000' }, children: [containerId] };
            elements[containerId] = { type: 'container', parentId: headerId, styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 40px' }, children: [logoId, linksId, ctaId] };
            elements[logoId] = { type: 'text', parentId: containerId, content: 'OMNIOS', styles: { fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-teal)', letterSpacing: '2px' } };
            elements[linksId] = { type: 'box', parentId: containerId, styles: { display: 'flex', gap: '30px' }, children: [] };

            // Add Links
            ['Home', 'Features', 'Pricing'].forEach((label, i) => {
                const linkId = `nav_link_${i}_${Math.random().toString(36).substr(2, 5)}`;
                elements[linkId] = { type: 'text', parentId: linksId, content: label, styles: { fontSize: '0.9rem', color: '#888', cursor: 'pointer' } };
                elements[linksId].children?.push(linkId);
            });

            elements[ctaId] = { type: 'button', parentId: containerId, content: 'Sign Up', styles: { padding: '8px 20px', border: '1px solid var(--accent-teal)', color: 'var(--accent-teal)', borderRadius: '6px', fontSize: '0.9rem' } };
        } else if (preset === 'features') {
            const sectionId = `feat_sec_${Math.random().toString(36).substr(2, 5)}`;
            const containerId = `feat_cnt_${Math.random().toString(36).substr(2, 5)}`;
            const gridId = `feat_grd_${Math.random().toString(36).substr(2, 5)}`;

            rootId = sectionId;
            elements[sectionId] = { type: 'section', styles: { padding: '80px 20px', backgroundColor: '#0a0a0a' }, children: [containerId] };
            elements[containerId] = { type: 'container', parentId: sectionId, styles: { display: 'flex', flexDirection: 'column', gap: '40px' }, children: [gridId] };
            elements[gridId] = { type: 'grid', parentId: containerId, styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }, children: [] };

            // Add 3 feature cards
            for (let i = 0; i < 3; i++) {
                const cardId = `feat_card_${i}_${Math.random().toString(36).substr(2, 5)}`;
                const titleId = `feat_t_${i}_${Math.random().toString(36).substr(2, 5)}`;
                const descId = `feat_d_${i}_${Math.random().toString(36).substr(2, 5)}`;

                elements[cardId] = { type: 'box', parentId: gridId, styles: { padding: '30px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }, children: [titleId, descId] };
                elements[titleId] = { type: 'text', parentId: cardId, content: `Feature 0${i + 1}`, styles: { fontSize: '1.2rem', fontWeight: 'bold', color: 'white' } };
                elements[descId] = { type: 'text', parentId: cardId, content: 'Description of this amazing feature and why it matters to your users.', styles: { fontSize: '0.9rem', color: '#666', lineHeight: '1.6' } };
                elements[gridId].children?.push(cardId);
            }
        }

        bulkAddElements(targetId, elements, rootId);
    };



    // The generators return a map where the first key is implicitly roots? 
    // No, they return a map of ID -> Element. We need to find the "root" (the one without a parent in that map? Or manually specified).
    // My generators assign 'parentId' to children but the root has no parent *in the map*. 
    // However, bulkAddElements expects a rootId to attach to the targetId.




    const handleAddElement = (type: ElementType, variant?: string, initialStyles?: Partial<ElementStyles>) => {
        const targetId = state.selectedElementId || state.rootElementId;
        console.log('Requesting add element:', type, 'targetId:', targetId);

        let defaultStyles: any = {};
        let defaultContent = '';

        switch (type) {
            case 'box':
                defaultStyles = {
                    backgroundColor: '#333333',
                    width: '300px',
                    height: '300px',
                    borderRadius: '8px'
                };
                break;
            case 'text':
                defaultStyles = {
                    color: '#ffffff',
                    fontSize: '1.5rem',
                    padding: '10px'
                };
                defaultContent = 'Heading Text';
                break;
            case 'button':
                defaultStyles = {
                    backgroundColor: 'var(--accent-teal)',
                    color: '#000000',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    width: 'fit-content'
                };
                defaultContent = 'Click Me';
                break;
            case 'container':
                defaultStyles = {
                    padding: '40px',
                    border: '1px dashed #666',
                    minHeight: '200px',
                    width: '100%',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                };
                break;
            case 'image':
                defaultStyles = {
                    width: '100%',
                    height: 'auto',
                    minHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                };
                defaultContent = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop';
                break;
            case 'video':
                defaultStyles = {
                    width: '100%',
                    height: 'auto',
                    minHeight: '300px',
                    borderRadius: '8px',
                };
                // defaultContent = '...'; // Removed in favor of media prop
                // We need to pass media prop. define it in defaultStyles or separate?
                // addElement takes Partial<DesignerElement>.
                // We'll mutate the object passed to addElement.
                break;
            case 'divider':
                type = 'box'; // Use 'box' type for divider but style it specifically
                defaultStyles = {
                    width: '100%',
                    height: '2px',
                    backgroundColor: 'var(--glass-border)',
                    margin: '20px 0'
                };
                break;
            case 'avatar':
                type = 'image';
                defaultStyles = {
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid white'
                };
                defaultContent = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64';
                break;
            case 'card':
                type = 'container';
                defaultStyles = {
                    width: '300px',
                    minHeight: '200px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid #333',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                };
                break;
            case 'badge':
                type = 'text';
                defaultStyles = {
                    backgroundColor: 'var(--accent-teal)',
                    color: 'black',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    width: 'fit-content'
                };
                defaultContent = 'NEW';
                break;
            case 'spacer':
                type = 'box';
                defaultStyles = {
                    width: '100%',
                    height: '40px',
                    backgroundColor: 'transparent'
                };
                break;
            case 'input':
                defaultStyles = {
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '1rem'
                };
                break;
            case 'textarea':
                defaultStyles = {
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '1rem'
                };
                break;
            case 'label':
                defaultStyles = {
                    width: '100%',
                    marginBottom: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                };
                defaultContent = 'Email Address';
                break;
            case '2-col':
                // Special case: Create container + 2 children
                // We'll handle this by mutating logic slightly or using a helper. 
                // For simplicity, we just create the container here, but we can't easily add children in one go without helper.
                // Alternative: Add container, then immediately trigger addElement for children? 
                // Better approach for MVP: Just add the flex row, let user add children.
                type = 'container';
                defaultStyles = {
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '20px',
                    padding: '20px',
                    border: '1px dashed #444',
                    minHeight: '200px'
                };
                break;
            case '3-col':
                type = 'container';
                defaultStyles = {
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '20px',
                    padding: '20px',
                    border: '1px dashed #444',
                    minHeight: '200px'
                };
                break;
            case 'grid':
                defaultStyles = {
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridGap: '20px',
                    padding: '20px',
                    minHeight: '200px',
                    border: '1px dashed #444'
                };
                break;
            case 'spacer':
                defaultStyles = {
                    width: '100%',
                    height: '50px',
                    backgroundColor: 'transparent',
                    border: '1px dashed rgba(255,255,255,0.1)'
                };
                break;
            case 'divider':
                defaultStyles = {
                    width: '100%',
                    height: '1px',
                    backgroundColor: 'var(--glass-border)',
                    margin: '20px 0'
                };
            case 'input':
                defaultStyles = {
                    width: '100%',
                    padding: '0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1rem'
                };
                defaultContent = '';
                break;
            case 'textarea':
                defaultStyles = {
                    width: '100%',
                    height: '100px',
                    padding: '0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1rem'
                };
                defaultContent = '';
                break;
            case 'label':
                defaultStyles = {
                    width: '100%',
                    marginBottom: '8px',
                    color: '#ccc',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                };
                defaultContent = 'Label Name';
                break;
            case 'slot':
                defaultStyles = {
                    width: '100%',
                    minHeight: '100px',
                    border: '1px dashed #666',
                    backgroundColor: 'rgba(255, 255, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontSize: '0.8rem'
                };
                defaultContent = 'Drop Content Here';
                break;
            case 'repeater':
                defaultStyles = {
                    width: '100%',
                    minHeight: '200px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                    padding: '10px'
                };
                // We default to the first collection found, or none
                // The user will select it in properties.
                break;

            case 'section':
                type = 'container';
                defaultStyles = {
                    width: '100%',
                    minHeight: '400px',
                    backgroundColor: '#111',
                    padding: '60px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px'
                };
                defaultContent = 'Section';
                break;
            case 'icon':
                defaultStyles = {
                    width: '48px',
                    height: '48px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                };
                defaultContent = 'Home'; // Default icon name
                break;
            case 'embed':
                defaultStyles = {
                    width: '100%',
                    minHeight: '300px',
                    border: 'none',
                    display: 'block'
                };
                defaultContent = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
                break;
            case 'login-form':
                type = 'container';
                variant = 'login';
                defaultStyles = {
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: '#0a0a0a',
                    padding: '32px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                };
                break;
            case 'signup-form':
                type = 'container';
                variant = 'signup';
                defaultStyles = {
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: '#0a0a0a',
                    padding: '32px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                };
                break;
            case 'logout-button':
                type = 'button';
                variant = 'logout';
                defaultStyles = {
                    backgroundColor: 'rgba(255, 50, 50, 0.1)',
                    color: '#ff4d4d',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 50, 50, 0.2)',
                    width: 'fit-content',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                };
                defaultContent = 'Sign Out';
                break;
            case 'navbar':
                // Special complex component: Navbar container + Logo + Menu
                type = 'container';
                defaultStyles = {
                    width: '100%',
                    height: '70px',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 40px',
                    position: 'fixed' as any,
                    top: '0',
                    left: '0',
                    zIndex: 1000,
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                };

                // We need to add children manually here since we can't do it easily with just this function.
                // Strategy: Create the container, and since we don't have a helper to add children strictly here,
                // we will rely on the user adding them OR I can try to hack it.
                // Better hack for now: Use the 'navbar' type on the container, and maybe the Renderer can auto-populate if empty?
                // No, that's side-effecty.
                // Let's just create the container for now and let the user add Logo (Text) and Links (Container).
                // Actually, let's make the type 'navbar' so we can specificially render it or identify it?
                // Yes, keeping type 'navbar' allows us to maybe render a hamburger automatically later.
                type = 'navbar' as any;
                break;
            case 'lottie':
                defaultStyles = { width: '300px', height: '300px' };
                defaultContent = '12345'; // Example lottie ID
                break;
            case 'accordion':
                defaultStyles = { width: '100%', marginBottom: '10px' };
                defaultContent = 'New Accordion';
                break;
            case 'tabs':
                defaultStyles = { width: '100%', marginBottom: '20px' };
                defaultContent = 'Tabs';
                break;
            case 'select':
                defaultStyles = { width: '100%', height: '40px' };
                break;
            case 'checkbox':
            case 'radio':
                defaultStyles = { padding: '10px' };
                defaultContent = 'Option Label';
                break;
        }

        if (!targetId) {
            console.error('No target ID found (root or selected)');
            return;
        }
        // Default to Safety Mode (Standard Flow) for responsiveness
        const finalStyles = {
            ...defaultStyles,
            // Only add default position if we were to default to freedom, but we are switching to safety.
            // If the user wants freedom, they can toggle it.
            // We might want to keep width/height as defined in defaultStyles.
        };

        const elementPayload: Partial<any> = { type: type as any, styles: finalStyles, content: defaultContent, layoutMode: 'safety' };
        if (type === 'video') {
            elementPayload.media = {
                src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                controls: true,
                muted: false,
                loop: false
            };
        }
        if (type === 'slot') {
            elementPayload.slotName = 'content'; // Default slot name
        }
        if (type === 'repeater') {
            // If we have collections, maybe default to the first one?
            // elementPayload.collectionId = state.data.collections[0]?.id;
            // Better to let user choose.
        }

        if (type === 'pay-button') {
            type = 'button';
            elementPayload.type = 'button';
            elementPayload.content = 'Buy Now';
            elementPayload.commerce = {
                provider: 'stripe',
                price: 29.99,
                currency: 'USD'
            };
            elementPayload.styles = {
                ...elementPayload.styles,
                backgroundColor: '#635BFF', // Stripe Purple
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            };
        }

        const newId = addElement(type as any, targetId, elementPayload);
        setSelectedElement(newId);
    };


    // Generate Next.js Code
    const generateCode = () => {
        const activePage = state.pages[state.activePageId];
        const isTemplate = activePage?.isTemplate;
        const collection = isTemplate ? state.data.collections.find(c => c.id === activePage.collectionId) : null;
        const slug = activePage?.slugField || 'slug';

        let code = '';

        if (isTemplate && collection) {
            code += `// app/${collection.name.toLowerCase()}/[${slug}]/page.tsx\n`;
            code += `import React from 'react';\n`;
            code += `import {notFound} from 'next/navigation';\n`;
            code += `import {get${collection.name} } from '@/lib/cms';\n\n`;

            code += `// 1. Generate Static Params for all items\n`;
            code += `export async function generateStaticParams() {\n`;
            code += `    const items = await get${collection.name}();\n`;
            code += `    return items.map(item => ({\n`;
            code += `        ${slug}: item.values.${slug}\n`;
            code += `    }));\n`;
            code += `}\n\n`;

            code += `export default async function Page({params}: {params: {${slug}: string } }) {\n`;
            code += `    const items = await get${collection.name}();\n`;
            code += `    const item = items.find(i => i.values.${slug} === params.${slug});\n`;
            code += `    if (!item) return notFound();\n\n`;
            code += `    // In a real app, 'item' would be passed to the renderer or used in components\n`;
            code += `    const context = {item};\n`;
        } else {
            code += `// app/page.tsx\n`;
            code += `import React from 'react';\n`;
        }

        code += `
                                import {LucideIcon} from 'lucide-react';
                                import * as Icons from 'lucide-react';

                                export default function PageComponent({item}: {item ?: any}) {
    // If running in dynamic mode, 'item' is injected from parent
    return (
                                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                                    `;

        const renderNode = (elementId: string): string => {
            const el = state.elements[elementId];
            if (!el) return '';

            // Clean up styles for export
            const exportStyles = { ...el.styles };

            // In Safety mode, we don't want absolute positioning values
            if (el.layoutMode === 'safety') {
                delete exportStyles.position;
                delete exportStyles.left;
                delete exportStyles.top;

                // If it's a stack, ensure flex is on
                if (el.children && el.children.length > 0) {
                    exportStyles.display = 'flex';
                    if (!exportStyles.flexDirection) exportStyles.flexDirection = 'column';
                }
            }

            const stylesStr = JSON.stringify(exportStyles).replace(/"([^"]+)":/g, '$1:');
            const styleProp = `style={${stylesStr}}`;

            // Handle children
            const childrenCode = el.children?.map(childId => renderNode(childId)).join('\n') || '';

            // Map custom types to semantic HTML
            let Tag: string = el.tagName || 'div';

            // Apply default mappings only if tagName is not explicitly set
            if (!el.tagName) {
                if (el.type === 'section') Tag = 'section';
                if (el.type === 'navbar') Tag = 'header';
                if (el.type === 'button') Tag = 'button';
            }
            if (el.type === 'image') return `<img src="${el.content}" alt="Image" ${styleProp} />`;
            if (el.type === 'text') {
                // Check if binding exists
                let content = el.content;
                const binding = el.variableBindings?.content;
                if (binding) {
                    // If it's a template page, assume 'item' prop has the values
                    if (isTemplate) {
                        content = `{item.values['${binding}']}`;
                    }
                }

                const isHeading = parseInt(String(el.styles?.fontSize || '16')) > 24;
                Tag = isHeading ? 'h2' : 'p';

                return `<${Tag} ${styleProp}>${content}</${Tag}>`;
            }

            // Handle Repeater Export specially?
            if (el.type === 'repeater') {
                // For export, we'd loop over data.
                // Simple placeholder for now as full export engine is complex
                return `{/* Repeater ${el.collectionId} */}\n<div ${styleProp}>\n{/* Items would be mapped here */}\n${childrenCode}\n</div>`;
            }

            if (el.type === 'custom-code') {
                const innerCode = el.customCode?.code || 'return () => null;';
                // We wrap it in an IIFE that returns the component, then we render that component.
                // Assuming the code returns a Functional Component.
                return `{/* Custom Code ${el.id} */}\n{(() => {\n    const Component = (() => {\n${innerCode}\n    })();\n    return <Component ${styleProp} {...${JSON.stringify(el.customCode?.exposedProps || {})}} />;\n})()}`;
            }

            return `<${Tag} ${styleProp}>\n${childrenCode}\n</${Tag}>`;
        };

        code += renderNode(state.rootElementId);

        if (isTemplate) {
            code += `
        </div>
    );
}
`;
            // Add the page wrapper closing for the Next.js page component
            code += `// End of Component`;
        } else {
            code += `
        </div>
    );
}
`;
        }
        return code;
    };

    const handleInsertDashboard = () => {
        handleAddElement('box', 'default', {
            width: '1000px',
            minHeight: '600px',
            backgroundColor: '#0a0a0a',
            borderRadius: '16px',
            border: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        });

        // We need to set the customCode to render the actual React component
        // Since handleAddElement adds the *last* element to state, we can't easily target it immediately 
        // without a return value. 
        // Actually, handleAddElement in this file doesn't return the ID.
        // Let's modify the last added element in the store?
        // Or better: Use the `customCode` prop in the `handleAddElement` call if I updated it? 
        // No, `handleAddElement` signature is `(type, variant, styles)`.

        // Strategy: We will manually invoke `addElement` from the store which allows full control.
        // But `handleAddElement` is a local wrapper.

        // Let's use `addElement` from props/store directly if available.
        // `addElement` is destructured from `useProjectStore`.

        const dashboardId = `dashboard_${Math.random().toString(36).substr(2, 9)}`;
        const targetId = state.selectedElementId || state.rootElementId;

        if (!targetId) return;

        const newElement = {
            id: dashboardId,
            type: 'box',
            parentId: targetId, // This is redundant if we pass it as arg 2, but harmless.
            name: 'Customer Dashboard',
            styles: {
                width: '100%',
                maxWidth: '1200px',
                minHeight: '600px',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            },
            customCode: {
                code: '',
                componentName: 'CustomerDashboard'
            }
        };

        // Call addElement with the correct signature: (type, parentId, element)
        addElement('box', targetId, newElement as any);
    };

    const handleExport = () => {
        setIsExporting(true);
        setExportedCode(generateCode());
    };

    const handleInsertMarketComponent = (preset: string) => {
        const targetId = state.selectedElementId || state.rootElementId;
        if (!targetId) return;

        // Simple preset logic for now to unblock build
        if (preset === 'stripe') {
            handleAddElement('button', 'primary', {
                content: 'Checkout',
                backgroundColor: '#635bff',
                commerce: { productId: 'prod_demo', price: 99 }
            });
        } else if (preset === 'tilt') {
            handleAddElement('box', 'default', {
                width: '300px', height: '400px',
                backgroundColor: '#222', border: '1px solid #333'
            });
        } else if (preset === 'parallax') {
            const heroId = `para_${Math.random().toString(36).substr(2, 5)}`;
            addElement('section', targetId, {
                id: heroId,
                type: 'section',
                parentId: targetId,
                name: 'Parallax Hero',
                styles: { width: '100%', height: '500px' },
                customCode: {
                    code: '',
                    componentName: 'ParallaxSection'
                },
                media: { src: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80' }
            } as any);
        } else if (preset === 'marquee') {
            const marqId = `marq_${Math.random().toString(36).substr(2, 5)}`;
            addElement('box', targetId, {
                id: marqId,
                type: 'box',
                parentId: targetId,
                name: 'Infinite Marquee',
                styles: { width: '100%', height: '150px', backgroundColor: '#000' },
                customCode: {
                    code: '',
                    componentName: 'Marquee'
                }
            } as any);
        } else if (preset === 'reveal') {
            const revId = `rev_${Math.random().toString(36).substr(2, 5)}`;
            addElement('box', targetId, {
                id: revId,
                type: 'box',
                parentId: targetId,
                name: 'Liquid Image',
                styles: { width: '400px', height: '500px' },
                customCode: {
                    code: '',
                    componentName: 'RevealImage'
                },
                media: { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80' }
            } as any);
        } else if (preset === 'dashboard') {
            handleInsertDashboard();
        }
    };

    if (!isInitialized) {
        return (
            <div className="flex h-screen w-screen bg-[#0a0a0a] text-white overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
                <SEOHelper />
                {showSEO && (
                    <div style={{ position: 'absolute', top: 80, right: 350, zIndex: 100 }}>
                        <SEODashboard />
                    </div>
                )}

                {/* Framer8: Commerce Overlay */}
                <div className="flex items-center justify-center flex-1">
                    <div className="text-xl">Loading Editor...</div>
                </div>
            </div>
        );
    }

    return (
        <RuntimeProvider projectData={state} onNavigate={switchPage} onFireTrigger={fireTrigger} onAddItem={addItem} onReportUsage={reportUsage}>
            <GlobalCursorManager />
            <ScreenReaderSimulator isActive={isScreenReaderActive} />

            <div className={`editor-container ${state.currTheme}`} style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#0a0a0a',
                color: 'white',
                fontFamily: 'Inter, sans-serif'
            }}>
                <NativeTitleBar
                    setIsUserManagementOpen={setIsUserManagementOpen}
                    setIsEnvManagerOpen={setIsEnvManagerOpen}
                    isIssuesPanelOpen={isIssuesPanelOpen}
                    setIsIssuesPanelOpen={setIsIssuesPanelOpen}
                    setShowDeployment={setShowDeployment} // Consolidated Batch 4.1
                />

                {/* Main Layout */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

                    {/* Left Sidebar - Navigation & Library */}
                    {isUIVisible && (
                        <aside className="glass-panel" style={{ width: '280px', display: 'flex', flexDirection: 'column', zIndex: 30 }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-1px', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    OMNI-OS
                                </div>
                                <button onClick={handleExport} style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', border: '1px solid var(--accent-teal)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>EXPORT</button>
                            </div>

                            {/* Tabs */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', padding: '10px' }}>
                                <SidebarTab active={leftPanelTab === 'add'} onClick={() => setLeftPanelTab('add')} icon={<Plus size={16} />} label="ADD" />
                                <SidebarTab active={leftPanelTab === 'layers'} onClick={() => setLeftPanelTab('layers')} icon={<Layers size={16} />} label="LAYERS" />
                                <SidebarTab active={leftPanelTab === 'styles'} onClick={() => setLeftPanelTab('styles')} icon={<Zap size={16} />} label="STYLES" />
                                <SidebarTab active={leftPanelTab === 'components'} onClick={() => setLeftPanelTab('components')} icon={<LayoutTemplate size={16} />} label="COMPS" />
                                <SidebarTab active={leftPanelTab === 'tokens'} onClick={() => setLeftPanelTab('tokens')} icon={<List size={16} />} label="TOKENS" />
                                <SidebarTab onClick={() => setLeftPanelTab('data')} icon={<Database size={18} />} label="DATA" active={leftPanelTab === 'data'} />
                                <SidebarTab onClick={() => setLeftPanelTab('market')} icon={<ShoppingBag size={18} />} label="Market" active={leftPanelTab === 'market'} color="#FFD700" />

                                <SidebarTab onClick={() => setLeftPanelTab('variables')} icon={<Brain size={18} />} label="VARS" active={leftPanelTab === 'variables'} color="var(--accent-teal)" />
                                <SidebarTab onClick={() => setLeftPanelTab('intelligence')} icon={<Sparkles size={18} />} label="AI" active={leftPanelTab === 'intelligence'} color="var(--accent-teal)" />
                                <SidebarTab onClick={() => setLeftPanelTab('locales')} icon={<Globe size={18} />} label="LANG" active={leftPanelTab === 'locales'} color="var(--accent-teal)" />
                                <SidebarTab onClick={() => setLeftPanelTab('git')} icon={<GitBranch size={18} />} label="GIT" active={leftPanelTab === 'git'} color="#f05032" />
                                <SidebarTab onClick={() => setLeftPanelTab('translations')} icon={<Languages size={18} />} label="TRANS" active={leftPanelTab === 'translations'} color="var(--accent-teal)" />
                                <SidebarTab onClick={() => setLeftPanelTab('packages')} icon={<Package size={18} />} label="PKGS" active={leftPanelTab === 'packages'} color="orange" />
                                <SidebarTab onClick={() => setIsAssetVaultOpen(true)} icon={<ImageIcon size={16} />} label="ASSETS" color="#ffcc00" />
                                <SidebarTab onClick={() => setLeftPanelTab('analytics')} icon={<BarChart3 size={18} />} label="ANALYTICS" active={leftPanelTab === 'analytics'} color="var(--accent-indigo)" />
                                <SidebarTab onClick={() => setLeftPanelTab('plugins')} icon={<Puzzle size={18} />} label="PLUGINS" active={leftPanelTab === 'plugins'} color="var(--accent-teal)" />
                                <SidebarTab onClick={() => setLeftPanelTab('access')} icon={<Eye size={18} />} label="A11Y" active={leftPanelTab === 'access'} color="#FFF" />
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                                {leftPanelTab === 'locales' && (
                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        <div style={{ padding: '20px' }}>
                                            <LocaleManager />
                                        </div>
                                    </div>
                                )}
                                {leftPanelTab === 'translations' && (
                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        <TranslationPanel />
                                    </div>
                                )}

                                {leftPanelTab === 'packages' && <DependencyManager />}
                                {leftPanelTab === 'components' && <ComponentsPanel onOpenWorkshop={(id) => {
                                    setWorkshopComponentId(id);
                                    setIsWorkshopOpen(true);
                                }} />}
                                {leftPanelTab === 'analytics' && <AnalyticsDashboard onClose={() => setLeftPanelTab('add')} />}
                                {leftPanelTab === 'plugins' && <PluginsPanel />}
                                {leftPanelTab === 'access' && <A11yPanel isSimulatorActive={isScreenReaderActive} onToggleSimulator={() => setIsScreenReaderActive(!isScreenReaderActive)} />}
                                {leftPanelTab === 'styles' && <StyleManager />}
                                {leftPanelTab === 'theme' && (
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', marginBottom: '15px', color: 'white' }}>Page SEO</h3>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '5px' }}>PAGE TITLE</label>
                                            <input
                                                type="text"
                                                value={state.pages[state.activePageId]?.meta?.title || ''}
                                                onChange={(e) => setState((prev: any) => ({ ...prev, pages: { ...prev.pages, [state.activePageId]: { ...prev.pages[state.activePageId], meta: { ...prev.pages[state.activePageId].meta, title: e.target.value } } } }))}
                                                className="glass"
                                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }}
                                                placeholder="My Awesome Page"
                                            />
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '5px' }}>META DESCRIPTION</label>
                                            <textarea
                                                value={state.pages[state.activePageId]?.meta?.description || ''}
                                                onChange={(e) => setState((prev: any) => ({ ...prev, pages: { ...prev.pages, [state.activePageId]: { ...prev.pages[state.activePageId], meta: { ...prev.pages[state.activePageId].meta, description: e.target.value } } } }))}
                                                className="glass"
                                                style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white', minHeight: '80px' }}
                                                placeholder="A brief description of this page..."
                                            />
                                        </div>

                                        <div style={{ marginBottom: '15px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #222' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--accent-teal)', marginBottom: '10px', fontWeight: 'bold' }}>
                                                <Share2 size={14} /> SOCIAL (OG) SETTINGS
                                            </label>

                                            <div style={{ marginBottom: '10px' }}>
                                                <label style={{ display: 'block', fontSize: '0.65rem', color: '#666', marginBottom: '4px' }}>OG IMAGE URL</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        type="text"
                                                        value={state.pages[state.activePageId]?.meta?.ogImage || ''}
                                                        onChange={(e) => setState((prev: any) => ({ ...prev, pages: { ...prev.pages, [state.activePageId]: { ...prev.pages[state.activePageId], meta: { ...prev.pages[state.activePageId].meta, ogImage: e.target.value } } } }))}
                                                        className="glass"
                                                        style={{ flex: 1, padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #333', color: 'white', fontSize: '0.75rem' }}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                    const page = state.pages[state.activePageId];
                                                    const title = page?.meta?.title || 'OMNIOS Page';
                                                    const { generateOGImage } = await import('@/lib/assets/worker');
                                                    const url = await generateOGImage(title) as string;
                                                    setState((prev: any) => ({ ...prev, pages: { ...prev.pages, [state.activePageId]: { ...prev.pages[state.activePageId], meta: { ...prev.pages[state.activePageId].meta, ogImage: url } } } }));
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    backgroundColor: 'rgba(0, 255, 200, 0.1)',
                                                    border: '1px solid var(--accent-teal)',
                                                    color: 'var(--accent-teal)',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Sparkles size={12} /> AUTO-GENERATE SOCIAL IMAGE
                                            </button>

                                            {state.pages[state.activePageId]?.meta?.ogImage && (
                                                <div style={{ marginTop: '10px', height: '80px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #333' }}>
                                                    <img src={state.pages[state.activePageId]?.meta?.ogImage} alt="Social Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ marginTop: '25px', padding: '15px', border: '1px solid var(--accent-teal)', borderRadius: '8px', backgroundColor: 'rgba(0, 255, 200, 0.02)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                                <Database size={16} color="var(--accent-teal)" />
                                                <h3 style={{ fontSize: '0.8rem', color: 'white', fontWeight: 'bold', margin: 0 }}>COLLECTION TEMPLATE</h3>
                                            </div>


                                            <div style={{ marginBottom: '15px' }}>
                                                <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', marginBottom: '5px' }}>SOURCE COLLECTION</label>
                                                <select
                                                    value={state.pages[state.activePageId]?.collectionId || ''}
                                                    onChange={(e) => setPageCollection(state.activePageId, e.target.value || undefined)}
                                                    className="glass"
                                                    style={{ width: '100%', padding: '8px', backgroundColor: '#000', color: 'white', fontSize: '0.75rem', border: '1px solid #333' }}
                                                >
                                                    <option value="">None (Static Page)</option>
                                                    {state.data.collections.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {state.pages[state.activePageId]?.collectionId && (
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', marginBottom: '5px' }}>PREVIEW ITEM</label>
                                                    <select
                                                        value={state.activeItemId || ''}
                                                        onChange={(e) => setActiveItemId(e.target.value || null)}
                                                        className="glass"
                                                        style={{ width: '100%', padding: '8px', backgroundColor: '#000', color: 'white', fontSize: '0.75rem', border: '1px solid #333' }}
                                                    >
                                                        <option value="">Select Item to Bind Root...</option>
                                                        {state.data.items
                                                            .filter(i => i.collectionId === state.pages[state.activePageId].collectionId)
                                                            .map(i => (
                                                                <option key={i.id} value={i.id}>{i.values.name || i.values.Title || i.id}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    <p style={{ fontSize: '0.6rem', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
                                                        * This item will be used to resolve bindings for all elements on this page.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {leftPanelTab === 'tokens' && <TokenManager />}
                                {leftPanelTab === 'git' && <GitSidebar />}
                                {/* Data Manager is rendered as overlay now */}
                                {leftPanelTab === 'add' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
                                        {/* AI BRAIN (Batch 6.1) */}
                                        <div style={{
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                                            border: '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '12px',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <Sparkles size={14} className="text-blue-400" />
                                                <h3 style={{ fontSize: '0.7rem', color: 'white', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Brain</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                                <ToolButton
                                                    onClick={() => setIsAIOpen(!isAIOpen)}
                                                    icon={<Bot size={20} className={isAIOpen ? "text-blue-400" : "text-white"} />}
                                                    label="AI Copilot"
                                                />
                                            </div>
                                        </div>

                                        {/* MARKETPLACE (Framer7) */}
                                        <div style={{
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 100, 0, 0.05) 100%)',
                                            border: '1px solid rgba(255, 215, 0, 0.2)',
                                            borderRadius: '12px',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <ShoppingBag size={14} color="#FFD700" />
                                                <h3 style={{ fontSize: '0.7rem', color: 'white', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hybrid Marketplace</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                                <ToolButton
                                                    onClick={() => handleInsertMarketComponent('stripe')}
                                                    icon={<CreditCard size={20} color="#635bff" />}
                                                    label="Stripe Checkout"
                                                />
                                                <ToolButton
                                                    onClick={() => handleInsertMarketComponent('tilt')}
                                                    icon={<Box size={20} color="#00ff99" />}
                                                    label="3D Tilt Card (Webgl)"
                                                />
                                                <ToolButton
                                                    onClick={() => handleInsertMarketComponent('parallax')}
                                                    icon={<Layers size={20} color="#ff00ff" />}
                                                    label="Parallax Hero"
                                                />
                                                <ToolButton
                                                    onClick={() => handleInsertMarketComponent('marquee')}
                                                    icon={<Code size={20} color="#00ffff" />} // Using Code icon for scrolling text
                                                    label="Infinite Marquee"
                                                />
                                                <ToolButton
                                                    onClick={() => setShowSEO(!showSEO)}
                                                    icon={<Sparkles size={20} color={showSEO ? "#00ff94" : "white"} />}
                                                    label="SEO Pulse"
                                                />
                                                <ToolButton
                                                    onClick={() => handleInsertMarketComponent('reveal')}
                                                    icon={<Sparkles size={20} color="#ffaa00" />}
                                                    label="Liquid Reveal Img"
                                                />
                                            </div>
                                        </div>

                                        {/* SMART PRESETS */}
                                        <div style={{
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, rgba(0, 224, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%)',
                                            border: '1px solid rgba(0, 224, 255, 0.2)',
                                            borderRadius: '12px',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <Sparkles size={14} color="var(--accent-teal)" />
                                                <h3 style={{ fontSize: '0.7rem', color: 'white', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Smart Presets</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                                <ToolButton
                                                    onClick={() => handleInsertPreset('center-hero')}
                                                    icon={<Layout size={20} color="var(--accent-teal)" />}
                                                    label="Center Hero Section"
                                                />
                                                <ToolButton
                                                    onClick={() => handleInsertPreset('navbar')}
                                                    icon={<Navigation size={20} color="#FF00FF" />}
                                                    label="Standard Navbar"
                                                />
                                                <ToolButton
                                                    onClick={() => handleInsertPreset('features')}
                                                    icon={<GridIcon size={20} color="#00E0FF" />}
                                                    label="Feature Grid"
                                                />
                                            </div>
                                        </div>

                                        {/* AUTHENTICATION (Phase 11.1) */}
                                        <div style={{
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                                            border: '1px solid rgba(16, 185, 129, 0.2)',
                                            borderRadius: '12px',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <Lock size={14} className="text-emerald-400" />
                                                <h3 style={{ fontSize: '0.7rem', color: 'white', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Authentication</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                                <ToolButton
                                                    onClick={() => handleAddElement('login-form')}
                                                    icon={<Lock size={20} className="text-emerald-400" />}
                                                    label="Login Form"
                                                />
                                                <ToolButton
                                                    onClick={() => handleAddElement('signup-form')}
                                                    icon={<Plus size={20} className="text-emerald-500" />}
                                                    label="Signup Form"
                                                />
                                                <ToolButton
                                                    onClick={() => handleAddElement('logout-button')}
                                                    icon={<X size={20} className="text-rose-400" />}
                                                    label="Logout Button"
                                                />
                                            </div>
                                        </div>

                                        {/* EXTENDED PRESENCE (Framer20) */}
                                        <div style={{
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, rgba(255, 100, 255, 0.05) 0%, rgba(100, 100, 255, 0.05) 100%)',
                                            border: '1px solid rgba(255, 100, 255, 0.2)',
                                            borderRadius: '12px',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <Globe size={14} color="#FF64FF" />
                                                <h3 style={{ fontSize: '0.7rem', color: 'white', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Extended Presence</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                                <ToolButton
                                                    onClick={() => {
                                                        const data = window.prompt("Paste the captured site structure from OMNIOS Inspector:");
                                                        if (data) {
                                                            try {
                                                                const parsed = JSON.parse(data);
                                                                importExternalStructure(parsed);
                                                                alert("Site imported successfully!");
                                                            } catch (e) {
                                                                alert("Invalid data. Please capture again using the extension.");
                                                            }
                                                        }
                                                    }}
                                                    icon={<Search size={20} color="#FF64FF" />}
                                                    label="Import from OMNIOS Inspector"
                                                />
                                                <ToolButton
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch('/api/figma/push');
                                                            const { data } = await res.json();
                                                            if (data) {
                                                                importExternalStructure(data);
                                                                alert("Figma design synced!");
                                                            } else {
                                                                alert("No recent Figma push found. Run the plugin in Figma first.");
                                                            }
                                                        } catch (e) {
                                                            alert("Figma Sync failed.");
                                                        }
                                                    }}
                                                    icon={<Framer size={20} color="#FF64FF" />}
                                                    label="Sync from Figma"
                                                />
                                                <ToolButton
                                                    icon={<Radio size={20} className={isWebhookEditorOpen ? 'text-purple-400' : 'text-gray-500'} />}
                                                    label="Hooks"
                                                    onClick={() => setIsWebhookEditorOpen(true)}
                                                />
                                            </div>
                                        </div>

                                        {/* STRUCTURE */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <h3 style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Structure</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <ToolButton onClick={() => handleAddElement('section')} icon={<Layout size={20} />} label="Section" />
                                                <ToolButton onClick={() => handleAddElement('container')} icon={<Box size={20} />} label="Container" />
                                                <ToolButton onClick={() => handleAddElement('grid')} icon={<GridIcon size={20} />} label="Grid" />
                                                <ToolButton onClick={() => handleAddElement('2-col')} icon={<Columns size={20} />} label="Columns" />
                                            </div>
                                        </div>

                                        {/* BASIC */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <h3 style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Basic</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                                <ToolButton onClick={() => handleAddElement('box')} icon={<Square size={20} />} label="Div" />
                                                <ToolButton onClick={() => handleAddElement('button')} icon={<MousePointer2 size={20} />} label="Button" />
                                                <ToolButton onClick={() => handleAddElement('box')} icon={<List size={20} />} label="List" />
                                                <ToolButton onClick={() => handleAddElement('divider')} icon={<Square size={14} style={{ height: '2px', borderTop: '2px solid' }} />} label="Line" />
                                                <ToolButton onClick={() => handleAddElement('spacer')} icon={<Layers size={20} />} label="Spacer" />
                                                <ToolButton onClick={() => handleAddElement('slot')} icon={<Box size={20} style={{ borderStyle: 'dashed' }} />} label="Slot" />
                                                <ToolButton onClick={togglePenTool} icon={<PenToolIcon size={20} color={state.isPenToolActive ? 'var(--accent-teal)' : 'white'} />} label="Pen Tool" />
                                            </div>
                                        </div>

                                        {/* TYPOGRAPHY */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <h3 style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Typography</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <ToolButton onClick={() => handleAddElement('text')} icon={<Type size={20} />} label="Heading" />
                                                <ToolButton onClick={() => handleAddElement('text', 'paragraph')} icon={<Type size={16} />} label="Paragraph" />
                                                <ToolButton onClick={() => handleAddElement('label')} icon={<Type size={14} />} label="Label" />
                                                <ToolButton onClick={() => handleAddElement('text', 'link')} icon={<Type size={14} style={{ textDecoration: 'underline' }} />} label="Link" />
                                            </div>
                                        </div>

                                        {/* MEDIA */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <h3 style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Media</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <ToolButton onClick={() => handleAddElement('image')} icon={<ImageIcon size={20} />} label="Image" />
                                                <ToolButton onClick={() => handleAddElement('video')} icon={<PlayCircle size={20} />} label="Video" />
                                                <ToolButton onClick={() => handleAddElement('embed')} icon={<Code2 size={20} />} label="Embed" />
                                                <ToolButton onClick={() => handleAddElement('lottie')} icon={<Sparkles size={20} />} label="Lottie" />
                                            </div>
                                        </div>

                                        {/* COMMERCE */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <h3 style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commerce</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <ToolButton onClick={() => handleAddElement('pay-button')} icon={<CreditCard size={20} />} label="Pay Button" />
                                                <ToolButton onClick={() => handleAddElement('repeater')} icon={<List size={20} />} label="Product Grid" />
                                                <ToolButton onClick={() => toggleCart()} icon={<ShoppingBag size={20} />} label="Cart Toggle" />
                                            </div>
                                        </div>

                                        {/* FORMS */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <h3 style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Forms</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <ToolButton onClick={() => handleAddElement('input')} icon={<FileCode size={20} />} label="Input" />
                                                <ToolButton onClick={() => handleAddElement('textarea')} icon={<FileCode size={20} />} label="Area" />
                                                <ToolButton onClick={() => handleAddElement('checkbox')} icon={<CheckSquare size={20} />} label="Check" />
                                                <ToolButton onClick={() => handleAddElement('select')} icon={<ChevronDown size={20} />} label="Select" />
                                            </div>
                                        </div>

                                        {/* ADVANCED */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <h3 style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Advanced</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                <ToolButton onClick={() => handleAddElement('repeater')} icon={<List size={20} />} label="Repeater" />
                                                <ToolButton onClick={() => handleAddElement('navbar')} icon={<Navigation size={20} />} label="Navbar" />
                                                <ToolButton onClick={() => handleAddElement('accordion')} icon={<List size={20} />} label="Accordion" />
                                                <ToolButton onClick={() => handleInsertPreset('features')} icon={<Layout size={20} />} label="Feature Grid" gridSpan={2} />
                                            </div>
                                        </div>

                                        {/* BRIDGE ELEMENTS (PHASE 8) */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <h3 style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bridge Elements</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                                <ToolButton
                                                    onClick={() => handleAddElement('auth-wall', undefined, { width: '100%', maxWidth: '600px', margin: '40px auto' })}
                                                    icon={<Lock size={20} color="var(--accent-teal)" />}
                                                    label="Auth Wall"
                                                    gridSpan={2}
                                                />
                                            </div>
                                        </div>

                                        {/* DEVELOPER (Framer4) */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <h3 style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Developer</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                                <ToolButton
                                                    onClick={() => handleAddElement('custom-code', undefined, {
                                                        customCode: {
                                                            code: `// Define your component (IIFE or Function Body)\n// We provide React, LucideIcons in scope.\n\nreturn (props) => {\n    const [count, setCount] = React.useState(0);\n    return (\n        <div style={{ padding: 20, background: '#333', color: 'white', borderRadius: 8 }}>\n            <h3>Custom Code</h3>\n            <p>Count: {count}</p>\n            <button onClick={() => setCount(c => c + 1)} style={{padding:'5px 10px', marginTop: 10}}>Increment</button>\n        </div>\n    );\n};`
                                                        },
                                                        styles: { width: '300px', height: 'auto', display: 'flex' }
                                                    })}
                                                    icon={<Code2 size={20} color="var(--accent-teal)" />}
                                                    label="Custom Code"
                                                />
                                            </div>
                                        </div>

                                        {/* MAGIC AI Section */}
                                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                                            <h3 style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Sparkles size={14} /> Magic AI
                                            </h3>
                                            <button
                                                onClick={() => setIsAIGenerating(true)}
                                                className="magic-button"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px',
                                                    background: 'linear-gradient(135deg, #00E0FF 0%, #FF00FF 100%)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'black',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 0 20px rgba(0, 224, 255, 0.3)'
                                                }}
                                            >
                                                Generate Section ✨
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {leftPanelTab === 'layers' && (
                                    <>
                                        <LayersPanel />
                                        {/* --- INTERACTION OVERLAY MOVED TO CANVAS --- */}
                                    </>
                                )}
                                {leftPanelTab === 'intelligence' && (
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div style={{
                                            padding: '20px',
                                            background: 'linear-gradient(135deg, rgba(0, 224, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
                                            border: '1px solid var(--accent-teal)',
                                            borderRadius: '12px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                                <Sparkles color="var(--accent-teal)" size={20} />
                                                <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Design Intelligence</h2>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1.5', marginBottom: '20px' }}>
                                                AI-powered tools to automate the technical parts of design.
                                            </p>

                                            <button
                                                onClick={() => {
                                                    const updates = applyResponsiveBestPractices(state.elements);
                                                    bulkUpdateElements(updates);
                                                    alert(`Applied responsive optimizations to ${Object.keys(updates).length} elements!`);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    backgroundColor: 'rgba(0, 255, 150, 0.1)',
                                                    color: 'var(--accent-teal)',
                                                    border: '1px solid var(--accent-teal)',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px',
                                                    marginBottom: '10px'
                                                }}
                                            >
                                                <Zap size={16} /> Run Responsive Assistant
                                            </button>

                                            <button
                                                onClick={() => {
                                                    if (!selectedElement) {
                                                        alert("Select an element to polish!");
                                                        return;
                                                    }
                                                    const polishedStyles = applyVisualPolish(selectedElement);
                                                    updateElementStyles(selectedElement.id, polishedStyles);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    backgroundColor: 'var(--accent-teal)',
                                                    color: 'black',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px'
                                                }}
                                            >
                                                <Wand2 size={16} /> Auto-Polish (AI Glow)
                                            </button>
                                        </div>

                                        <div style={{
                                            padding: '20px',
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            border: '1px solid #333',
                                            borderRadius: '12px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                                <Hammer color="var(--accent-teal)" size={20} />
                                                <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', margin: 0 }}>AI Architect</h2>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1.5', marginBottom: '15px' }}>
                                                Select a layout pattern to rebuild the current section.
                                            </p>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {Object.entries(architectPatterns).map(([id, pattern]) => (
                                                    <button
                                                        key={id}
                                                        onClick={() => {
                                                            if (!selectedElement) {
                                                                alert("Please select a section first.");
                                                                return;
                                                            }
                                                            const children = selectedElement.children?.map(cid => state.elements[cid]).filter(Boolean) || [];
                                                            const updates = pattern.apply(selectedElement.id, children);
                                                            bulkUpdateElements(updates);
                                                        }}
                                                        style={{
                                                            padding: '12px',
                                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                                            color: 'white',
                                                            border: '1px solid #444',
                                                            borderRadius: '8px',
                                                            fontSize: '0.8rem',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: 'bold' }}>{pattern.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#888' }}>{pattern.description}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Framer13: Autonomous Agents */}
                                        <div style={{
                                            padding: '20px',
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            border: '1px solid #333',
                                            borderRadius: '12px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                                <Bot color="var(--accent-teal)" size={20} />
                                                <h2 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Autonomous Agents</h2>
                                            </div>

                                            {/* Accessibility Agent */}
                                            <button
                                                onClick={() => {
                                                    const updates = accessibilityAgent.fixAccessibility(state.elements);
                                                    const count = Object.keys(updates).length;
                                                    if (count > 0) {
                                                        bulkUpdateElements(updates);
                                                        alert(`Accessibility Agent fixed ${count} issues (ARIA labels, Contrast).`);
                                                    } else {
                                                        alert("Accessibility Agent found no issues (or is sleeping).");
                                                    }
                                                }}
                                                style={{ width: '100%', marginBottom: '10px', padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                            >
                                                <Eye size={16} /> Run Accessibility Fixer
                                            </button>

                                            {/* Aesthetic Evolution */}
                                            <button
                                                onClick={async () => {
                                                    if (!selectedElement) return alert("Select a section to evolve.");
                                                    // Mock evolution
                                                    const variants = await aiBridgeSource.evolveDesign(selectedElement);
                                                    // In a real app we'd show a picker. For now, just apply the first one or log it.
                                                    alert(`Generated ${variants.length} variations! (See console)`);
                                                    console.log("Variants:", variants);
                                                }}
                                                style={{ width: '100%', marginBottom: '10px', padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                            >
                                                <Palette size={16} /> Evolve Aesthetics
                                            </button>

                                            <div style={{ height: '1px', background: '#444', margin: '15px 0' }} />

                                            {/* Wireframe Interpreter */}
                                            <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '5px' }}>WIREFRAME URL</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input type="text" placeholder="https://..." style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                                                    id="wireframe-input"
                                                />
                                                <button
                                                    onClick={async () => {
                                                        const url = (document.getElementById('wireframe-input') as HTMLInputElement).value;
                                                        if (!url) return;
                                                        const res = await aiBridgeSource.interpretWireframe(url);
                                                        bulkAddElements(state.selectedElementId || 'root', res.elements, res.rootId);
                                                    }}
                                                    style={{ padding: '8px', background: 'var(--accent-teal)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                            <div style={{ height: '1px', background: '#444', margin: '15px 0' }} />

                                            {/* Logic Copilot */}
                                            <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '5px' }}>LOGIC COPILOT</label>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                <textarea placeholder="e.g. Save form to Airtable..." style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white', minHeight: '60px', fontSize: '0.75rem' }}
                                                    id="logic-prompt-input"
                                                />
                                                <button
                                                    onClick={async () => {
                                                        const prompt = (document.getElementById('logic-prompt-input') as HTMLTextAreaElement).value;
                                                        if (!prompt) return;
                                                        const bp = await aiBridgeSource.generateLogic(prompt);
                                                        if (bp) {
                                                            setState(prev => ({
                                                                ...prev,
                                                                blueprints: { ...prev.blueprints, [bp.id]: bp }
                                                            }));
                                                            alert(`Generated Blueprint: ${bp.id}`);
                                                        } else {
                                                            alert("Could not generate logic for that prompt.");
                                                        }
                                                    }}
                                                    style={{ padding: '8px', height: '60px', background: 'var(--accent-teal)', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'center', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Brain size={16} color="black" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {leftPanelTab === 'market' && <MarketplacePanel onClose={() => setLeftPanelTab('layers')} />}
                                {leftPanelTab === 'variables' && <VariablesPanel onOpenBlueprint={setActiveBlueprintId} />}
                                {leftPanelTab === 'plugins' && (
                                    <div className="flex flex-col h-full bg-[#0d0d0d] overflow-y-auto">
                                        {pluginPanels.length === 0 ? (
                                            <div className="p-8 text-center text-white/20 text-xs">
                                                No plugins active. Install from Marketplace.
                                            </div>
                                        ) : (
                                            pluginPanels.map(panel => (
                                                <div key={panel.id} className="border-b border-white/5 bg-white/[0.02]">
                                                    <panel.component />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </aside>
                    )}

                    {/* Center Canvas Area */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                        {/* Phase 3: Logic Brain Canvas */}
                        {(viewMode === 'logic' || activeBlueprintId) && (
                            <div style={{ position: 'absolute', inset: 0, zIndex: 50, backgroundColor: '#050505' }}>
                                <LogicCanvas />
                                {viewMode === 'logic' && (
                                    <button
                                        onClick={() => setViewMode('design')}
                                        style={{ position: 'absolute', top: 20, right: 20, zIndex: 60, padding: '8px 16px', background: 'white', color: 'black', borderRadius: '4px' }}
                                    >
                                        Close Logic
                                    </button>
                                )}
                            </div>
                        )}

                        <CommandBar />

                        <style jsx global>{`
                        .cmdk-dialog {
                            font-family: 'Inter', sans-serif;
                            background: rgba(10, 10, 10, 0.9);
                            backdrop-filter: blur(20px);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                            border-radius: 12px;
                            color: white;
                            max-width: 600px;
                            width: 90%;
                            max-height: 70vh;
                            display: flex;
                            flex-direction: column;
                            overflow: hidden;
                        }
                        .cmdk-input {
                            background: transparent;
                            border: none;
                            padding: 16px;
                            font-size: 1.1rem;
                            color: white;
                            outline: none;
                            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        }
                        .cmdk-input::placeholder {
                            color: #888;
                        }
                        .cmdk-list {
                            flex: 1;
                            overflow-y: auto;
                            padding: 8px;
                        }
                        .cmdk-group {
                            padding: 8px 0;
                        }
                        .cmdk-group-heading {
                            font-size: 0.75rem;
                            color: #aaa;
                            padding: 8px 16px;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                        }
                        .cmdk-item {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            padding: 12px 16px;
                            cursor: pointer;
                            border-radius: 8px;
                            font-size: 0.95rem;
                            transition: background 0.1s ease;
                        }
                        .cmdk-item[data-selected="true"] {
                            background: rgba(0, 255, 200, 0.1);
                            color: var(--accent-teal);
                        }
                        .cmdk-item[data-selected="true"] svg {
                            color: var(--accent-teal);
                        }
                        .cmdk-item:active {
                            background: rgba(0, 255, 200, 0.2);
                        }
                        .cmdk-item-icon {
                            width: 20px;
                            height: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #ccc;
                        }
                        .cmdk-item-shortcut {
                            margin-left: auto;
                            color: #888;
                            font-size: 0.75rem;
                        }
                        .cmdk-empty {
                            text-align: center;
                            color: #888;
                            padding: 20px;
                        }
                    `}</style>

                        {/* FRAMER12: Mobile Preview Overlay */}
                        {
                            isMobilePreviewOpen && (
                                <MobilePreview onClose={() => setIsMobilePreviewOpen(false)} />
                            )
                        }
                        {/* OVERLAYS (Must be here to float over canvas) */}
                        <InteractionOverlay
                            elements={state.elements}
                            selectedId={state.selectedElementId}
                            selectedIds={state.selectedElementIds}
                            hoveredId={state.hoveredElementId}
                            highlightedControl={state.highlightedControl}
                            dragState={state.dragState}
                            canvasTransform={canvasTransform}
                            updateElementStyles={updateElementStyles}
                        />
                        <AnalyticsOverlay />
                        <CursorOverlay canvasTransform={canvasTransform} />

                        {/* Framer11: Puts cursors ON TOP of interaction overlay but BELOW UI Chrome (if needed, z-index handles it) */}
                        <MarqueeSelector
                            ref={marqueeRef}
                            elements={state.elements}
                            canvasTransform={canvasTransform}
                            onSelectionChange={(x, y, w, h) => selectArea(x, y, w, h)}
                            clearSelection={() => setSelectedElements([])}
                        />
                        {isUIVisible && (
                            <>
                                <ContextToolbar
                                    elementId={state.selectedElementId}
                                    canvasTransform={canvasTransform}
                                    onOpenAnalytics={() => setLeftPanelTab('analytics')}
                                />

                                {/* Top Bar - Page Switcher */}
                                <div style={{
                                    height: '40px',
                                    borderBottom: '1px solid var(--glass-border)',
                                    backgroundColor: 'var(--glass-bg)',
                                    backdropFilter: 'var(--glass-blur)',
                                    WebkitBackdropFilter: 'var(--glass-blur)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0 16px',
                                    zIndex: 40
                                }}>
                                    {/* LEFT: Undo/Redo */}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={undo}
                                            disabled={history.past.length === 0}
                                            style={{
                                                background: 'transparent', border: 'none', color: 'white',
                                                opacity: history.past.length === 0 ? 0.3 : 1,
                                                cursor: history.past.length === 0 ? 'not-allowed' : 'pointer',
                                                fontSize: '1.2rem'
                                            }}
                                            title="Undo (Ctrl+Z)"
                                        >
                                            ↩️
                                        </button>
                                        <button
                                            onClick={redo}
                                            disabled={history.future.length === 0}
                                            style={{
                                                background: 'transparent', border: 'none', color: 'white',
                                                opacity: history.future.length === 0 ? 0.3 : 1,
                                                cursor: history.future.length === 0 ? 'not-allowed' : 'pointer',
                                                fontSize: '1.2rem'
                                            }}
                                            title="Redo (Ctrl+Y)"
                                        >
                                            ↪️
                                        </button>
                                    </div>

                                    {/* Phase 3: View Mode Switcher */}
                                    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px' }}>
                                        <button
                                            onClick={() => setViewMode('design')}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                backgroundColor: viewMode === 'design' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                color: viewMode === 'design' ? 'white' : 'rgba(255,255,255,0.5)',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontSize: '0.8rem', fontWeight: 600
                                            }}
                                        >
                                            <Layout size={14} /> Design
                                        </button>
                                        <button
                                            onClick={() => setViewMode('logic')}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                backgroundColor: viewMode === 'logic' ? 'var(--accent-primary)' : 'transparent',
                                                color: viewMode === 'logic' ? 'black' : 'rgba(255,255,255,0.5)',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontSize: '0.8rem', fontWeight: 600
                                            }}
                                        >
                                            <Workflow size={14} /> Logic
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px', marginLeft: '10px' }}>
                                        <button
                                            onClick={() => setShowAIAssistant(!showAIAssistant)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                backgroundColor: showAIAssistant ? 'rgba(0, 224, 255, 0.15)' : 'transparent',
                                                color: showAIAssistant ? 'var(--accent-primary)' : 'rgba(255,255,255,0.5)',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontSize: '0.8rem', fontWeight: 600
                                            }}
                                        >
                                            <Sparkles size={14} /> Constructor
                                        </button>
                                        <button
                                            onClick={() => setShowDeployment(!showDeployment)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                backgroundColor: showDeployment ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                                color: showDeployment ? '#818cf8' : 'rgba(255,255,255,0.5)',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontSize: '0.8rem', fontWeight: 600,
                                                marginLeft: '4px'
                                            }}
                                        >
                                            <Rocket size={14} /> Publisher
                                        </button>
                                        <button
                                            onClick={() => setShowServerless(!showServerless)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                backgroundColor: showServerless ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                                                color: showServerless ? '#4ade80' : 'rgba(255,255,255,0.5)',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontSize: '0.8rem', fontWeight: 600,
                                                marginLeft: '4px'
                                            }}
                                        >
                                            <Terminal size={14} /> Architect
                                        </button>
                                    </div>

                                    {/* CENTER: Device Switcher */}
                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        <button
                                            onClick={() => togglePreviewMode()}
                                            title={state.previewMode ? "Back to Edit" : "Preview Mode"}
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                                backgroundColor: state.previewMode ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                                                color: state.previewMode ? 'black' : 'white',
                                                marginRight: '5px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {state.previewMode ? <Eye size={16} /> : <FileCode size={16} />}
                                        </button>

                                        <button
                                            onClick={() => setIsDesignSystemOpen(true)}
                                            title="Design System (Tokens)"
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                                backgroundColor: isDesignSystemOpen ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                                                color: isDesignSystemOpen ? 'black' : 'white',
                                                marginRight: '5px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <Palette size={16} />
                                        </button>

                                        <button
                                            onClick={() => setActiveTool(activeTool === 'comment' ? 'select' : 'comment')}
                                            title="Comment Tool (C)"
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                                backgroundColor: activeTool === 'comment' ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                                                color: activeTool === 'comment' ? 'black' : 'white',
                                                marginRight: '5px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <MessageSquare size={16} />
                                            <MessageSquare size={16} />
                                        </button>

                                        {/* FRAMER11: Collaboration Toolbar */}
                                        <div className="h-6 w-[1px] bg-white/10 mx-2" />
                                        <CollaborationStatus onFollow={setFollowPeerId} followingId={followPeerId} />
                                        <button
                                            onClick={handleGoLive}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white text-xs font-bold hover:scale-105 transition-transform ml-2"
                                            title="Go Live with Team"
                                        >
                                            <Rocket size={12} />
                                            <span>LIVE</span>
                                        </button>

                                        {/* FRAMER12: Mobile Native Preview */}
                                        <button
                                            onClick={() => setIsMobilePreviewOpen(true)}
                                            title="Mobile Native Preview"
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                                backgroundColor: isMobilePreviewOpen ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                                                color: isMobilePreviewOpen ? 'black' : 'white',
                                                marginRight: '5px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <Smartphone size={16} />
                                        </button>

                                        <Link
                                            href="/mobile"
                                            target="_blank"
                                            title="Open Mobile Companion"
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                                backgroundColor: 'rgba(0, 255, 213, 0.14)',
                                                color: '#00ffd5',
                                                marginRight: '5px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <Smartphone size={16} fill="currentColor" style={{ opacity: 0.3 }} />
                                        </Link>

                                        <button
                                            onClick={() => toggleStaticMode()}
                                            title={state.staticMode ? "Static Mode ON (Zero JS)" : "Enable Static Mode"}
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                                backgroundColor: state.staticMode ? '#ff00ff' : 'rgba(255,255,255,0.05)',
                                                color: state.staticMode ? 'white' : 'white',
                                                marginRight: '5px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            <Zap size={16} fill={state.staticMode ? "currentColor" : "none"} />
                                        </button>

                                        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 10px' }}></div>

                                        <ModeToggle /> {/* Framer6 */}

                                        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 10px' }}></div>

                                        <BreakpointSwitcher />

                                        {/* ZOOM CONTROLS */}
                                        <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '4px 8px' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#888', minWidth: '35px' }}>{Math.round(canvasTransform.scale * 100)}%</span>
                                            <button onClick={resetView} title="Reset View" style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '10px' }}>↺</button>
                                        </div>
                                        <button
                                            onClick={() => setShowDeployment(true)}
                                            data-testid="publish-button"
                                            style={{

                                                padding: '6px 16px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                backgroundColor: 'white',
                                                color: 'black',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            Publish
                                        </button>

                                        {/* Framer15: List in Marketplace */}
                                        <button
                                            onClick={() => setIsMarketplaceOpen(true)}
                                            style={{
                                                padding: '6px 16px',
                                                borderRadius: '6px',
                                                border: '1px solid #333',
                                                cursor: 'pointer',
                                                backgroundColor: 'rgba(46, 213, 115, 0.1)',
                                                color: '#2ed573',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <ShoppingBag size={14} />
                                            List in Market
                                        </button>

                                        {/* Batch 13.2: Secrets Manager */}
                                        <button
                                            onClick={() => setIsEnvManagerOpen(true)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #333',
                                                cursor: 'pointer',
                                                backgroundColor: 'rgba(124, 58, 237, 0.1)', // Purple tint
                                                color: '#a78bfa',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <Lock size={14} />
                                            Secrets
                                        </button>

                                        {/* Framer16: Debug Console */}
                                        <button
                                            onClick={() => setIsDebugOpen(!isDebugOpen)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: isDebugOpen ? 'rgba(0, 224, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                                border: `1px solid ${isDebugOpen ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.1)'}`,
                                                color: isDebugOpen ? 'var(--accent-teal)' : 'white',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            <Terminal size={14} />
                                            Console
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const { downloadPWA } = await import('@/lib/export/pwa');
                                                downloadPWA(state);
                                            }}
                                            title="Export PWA (Manifest)"
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px', border: '1px solid #333', cursor: 'pointer',
                                                backgroundColor: 'black',
                                                color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <Share2 size={14} />
                                        </button>

                                        <button
                                            onClick={() => setIsVersionPanelOpen(!isVersionPanelOpen)}
                                            title="Version History"
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                                backgroundColor: isVersionPanelOpen ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                                                color: isVersionPanelOpen ? 'black' : 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <History size={16} />
                                        </button>
                                    </div>

                                    {/* RIGHT: Page Switcher */}
                                    <div style={{ display: 'flex', gap: '10px' }}>

                                        {
                                            Object.values(state.pages).map((p: any) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => switchPage(p.id)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        color: state.activePageId === p.id ? '#000' : '#888',
                                                        backgroundColor: state.activePageId === p.id ? 'var(--accent-teal)' : 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {p.name.toUpperCase()}
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Framer6: Dynamic Token Injection */}
                        <style>
                            {`
                            :root {
                                ${state.designSystem.tokens.map((token: any) => {
                                const value = (state.activeMode === 'dark' && token.modes?.dark)
                                    ? token.modes.dark
                                    : token.value;
                                const sanitizedName = token.name.replace(/[^a-zA-Z0-9-]/g, '-');
                                return `--token-${sanitizedName}: ${value};`;
                            }).join('\n')}
                            }
                        `}
                        </style>

                        <main
                            style={{
                                flex: 1,
                                position: 'relative',
                                overflow: 'hidden',
                                backgroundColor: '#0a0a0a',
                                cursor: isPanning ? 'grabbing' : (isSpacePressed ? 'grab' : 'default'),
                                // Grid Background
                                backgroundImage: `radial-gradient(#222 1px, transparent 1px), radial-gradient(#222 1px, transparent 1px)`,
                                backgroundSize: `${20 * canvasTransform.scale}px ${20 * canvasTransform.scale}px`,
                                backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`,
                            }}
                            onWheel={handleCanvasWheel}
                            onMouseDown={(e) => {
                                handleMouseDownPan(e);
                                // Clear Selection if clicking blank area and NOT panning
                                if (!isSpacePressed && !isPanning) {
                                    // clearSelection(); // Handled by Marquee background
                                }
                            }}
                            onMouseMove={(e) => {
                                handleMouseMovePan(e);
                                handleCanvasMouseMovePresence(e);
                            }}
                            onMouseUp={handleMouseUpPan}
                            onMouseLeave={handleMouseUpPan}
                        >
                            <div
                                className="canvas-viewport-transform"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
                                    transformOrigin: '0 0', // Changed to 0 0 to match zoom math
                                    transition: 'transform 0.05s ease-out' // Smoothness
                                }}
                            >
                                <div
                                    className="canvas-container"
                                    style={{
                                        width: state.viewMode === 'mobile' ? '375px' : (state.viewMode === 'tablet' ? '768px' : '100%'),
                                        minHeight: '100%', // Ensure it takes height
                                        backgroundColor: 'transparent', // Transparent to see grid? Or black? Let's keep transparent for "page" feel
                                        // Actually, standard is "white" page on gray canvas.
                                        // But we are dark mode. Let's stick to existing background?
                                        // Existing was #050505. Let's make the "Page" slightly lighter or identifiable?
                                        // For now, keep as is.
                                        position: 'relative',
                                        margin: '0 auto', // Center the canvas in the viewport
                                        // Remove overflowY auto to allow infinite canvas to handle view
                                        // overflowY: 'auto', 
                                        borderRight: '1px solid #333',
                                        borderLeft: '1px solid #333',
                                        transition: 'width 0.3s ease',
                                        paddingBottom: '500px' // Extra space at bottom
                                    }}
                                    onClick={() => setSelectedElement(null)}
                                >
                                    {/* TOKEN VARIABLE INJECTION */}
                                    <style>
                                        {`:root {
                                        ${state.designSystem?.tokens?.map(t => `--token-${t.name}: ${t.value};`).join('\n')}
                                    }`}
                                    </style>
                                    {(() => {
                                        const activePage = state.pages[state.activePageId];
                                        const previewItem = state.activeItemId ? state.data.items.find(i => i.id === state.activeItemId) : null;

                                        const content = (
                                            <>
                                                {/* Diff Ghost Overlay */}
                                                {diffVersionId && (() => {
                                                    const v = versions.find(ver => ver.id === diffVersionId);
                                                    if (v && v.state) {
                                                        return (
                                                            <div style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(100%) blur(1px)', zIndex: 0 }}>
                                                                <ElementRenderer
                                                                    elementId={v.state.rootElementId}
                                                                    elements={v.state.elements}
                                                                    selectedElementId={null} // No selection in ghost
                                                                    onSelect={() => { }}
                                                                />
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                {/* Live Content */}
                                                <div style={{ position: 'relative', zIndex: 1 }}>
                                                    <ElementRenderer
                                                        elementId={state.rootElementId}
                                                        elements={state.elements}
                                                        selectedElementId={state.selectedElementId}
                                                        onSelect={(id, e) => setSelectedElement(id)}
                                                    />
                                                </div>

                                                {/* Awareness Layer (Cursors/Selections) */}
                                                <PresenceLayer elements={state.elements} />
                                            </>
                                        );

                                        if (previewItem) {
                                            return <DataContext.Provider value={previewItem}>{content}</DataContext.Provider>;
                                        }
                                        return content;
                                    })()}
                                </div>

                                {/* Batch 9.2: The Visual Layer (Rust Particles) */}
                                <HyperCanvas />
                            </div>
                        </main>

                    </div >
                    {isUIVisible && (
                        <PropertiesPanel
                            selectedElement={selectedElement}
                            selectedElements={state.selectedElementIds.map(id => state.elements[id]).filter(Boolean)}
                            updateElementStyles={updateElementStyles}
                            toggleLayoutMode={toggleLayoutMode}
                            removeElement={removeElement}
                            setState={setState}
                            createMasterComponent={createMasterComponent}
                            openAssetVault={(onSelect) => {
                                setVaultCallback({ onSelect });
                                setIsAssetVaultOpen(true);
                            }}
                            openTimeline={() => setIsTimelineOpen(true)}
                            openBlueprint={(id) => setActiveBlueprintId(id)}
                        />
                    )}


                    {isAssetVaultOpen && <AssetVault isOpen={isAssetVaultOpen} onClose={() => setIsAssetVaultOpen(false)} onSelect={vaultCallback?.onSelect} />}
                    {isDesignSystemOpen && <DesignSystemPanel onClose={() => setIsDesignSystemOpen(false)} />}


                    <ShortcutManager /> {/* Batch 13.2 */}

                    {/* Export Modal */}
                    {
                        isExporting && (
                            <div style={{
                                position: 'fixed',
                                top: 0, left: 0,
                                width: '100vw', height: '100vh',
                                backgroundColor: 'rgba(0,0,0,0.9)',
                                backdropFilter: 'blur(10px)',
                                zIndex: 2000,
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '40px'
                            }}>
                                <div className="glass" style={{
                                    maxWidth: '900px',
                                    width: '100%',
                                    maxHeight: '80vh',
                                    padding: '40px',
                                    overflow: 'auto',
                                    position: 'relative',
                                    border: '1px solid var(--accent-teal)'
                                }}>
                                    <button
                                        onClick={() => setIsExporting(false)}
                                        style={{ position: 'absolute', top: '20px', right: '20px', color: 'white' }}
                                    >
                                        CLOSE
                                    </button>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Exported Code</h2>
                                    <pre style={{
                                        backgroundColor: '#111',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        overflowX: 'auto',
                                        fontSize: '0.8rem',
                                        fontFamily: 'monospace'
                                    }}>
                                        {exportedCode}
                                    </pre>
                                </div>
                            </div>
                        )
                    }

                    {
                        isAIGenerating && (
                            <div style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 5000,
                                backgroundColor: 'rgba(0,0,0,0.85)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div className="glass" style={{ width: '500px', padding: '30px', border: '1px solid var(--accent-teal)' }}>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Sparkles color="var(--accent-teal)" /> Generate Section
                                    </h2>
                                    <p style={{ color: '#888', marginBottom: '20px', fontSize: '0.9rem' }}>
                                        Tell the AI what you want to build. For example: "A dark hero section for a premium tech product."
                                    </p>
                                    <textarea
                                        autoFocus
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAIGenerate()}
                                        placeholder="Describe your section..."
                                        style={{
                                            width: '100%',
                                            height: '120px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--glass-border)',
                                            color: 'white',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            outline: 'none',
                                            marginBottom: '20px'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => setIsAIGenerating(false)}
                                            style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #444', color: 'white', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAIGenerate}
                                            style={{ flex: 2, padding: '12px', background: 'var(--accent-teal)', border: 'none', color: 'black', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            Generate ✨
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    <CommandBar />
                    <NavigatorMap
                        elements={state.elements}
                        canvasTransform={canvasTransform}
                        onNavigate={(x, y) => setCanvasTransform(prev => ({ ...prev, x, y }))}
                    />

                    {/* Overlays & Modals */}
                    <AssetVault
                        isOpen={isAssetVaultOpen}
                        onClose={() => {
                            setIsAssetVaultOpen(false);
                            setVaultCallback(null);
                        }}
                        onSelect={(asset) => {
                            if (vaultCallback) vaultCallback.onSelect(asset);
                            setIsAssetVaultOpen(false);
                            setVaultCallback(null);
                        }}
                    />
                    <CommentsOverlay
                        canvasTransform={canvasTransform}
                        isCommentMode={activeTool === 'comment'}
                        activeBlueprintId={activeBlueprintId}
                        onOpenBlueprint={(id) => setActiveBlueprintId(id)}
                    />
                    <CommerceOverlay />

                    {/* CMS Overlay (Now Schema Editor) */}
                    {
                        leftPanelTab === 'data' && (
                            <SchemaEditor
                                isOpen={true}
                                onClose={() => setLeftPanelTab('add')}
                            />
                        )
                    }

                    {
                        leftPanelTab === 'variables' && (
                            <VariablesPanel onOpenBlueprint={(id) => setActiveBlueprintId(id)} />
                        )
                    }

                    {/* Motion Timeline */}
                    {
                        isTimelineOpen && selectedElement && (
                            <MotionTimeline
                                element={selectedElement}
                                onClose={() => setIsTimelineOpen(false)}
                            />
                        )
                    }


                    {
                        isVersionPanelOpen && (
                            <VersionControlPanel
                                onClose={() => setIsVersionPanelOpen(false)}
                                onToggleDiff={(id: string | null) => setDiffVersionId(id)}
                                diffVersionId={diffVersionId}
                            />
                        )
                    }

                    {/* Batch 3.4: Webhook Editor Overlay */}
                    <AnimatePresence>
                        {isWebhookEditorOpen && (
                            <WebhookEditor onClose={() => setIsWebhookEditorOpen(false)} />
                        )}
                    </AnimatePresence>

                    {/* Batch 3.5: Auth Simulator */}
                    <AuthSimulator />

                    {/* Batch 6.1: AI Copilot */}
                    <AnimatePresence>
                        {isAIOpen && <AICopilot isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />}
                    </AnimatePresence>

                    {/* Batch 4.1: Marketplace Panel */}
                    {
                        leftPanelTab === 'market' && (
                            <MarketplacePanel
                                onClose={() => setLeftPanelTab('add')}
                            />
                        )
                    }

                    {isDebugOpen && (
                        <>
                            <LogicDebugger onClose={() => setIsDebugOpen(false)} />
                            <PerformanceHUD />
                        </>
                    )}

                    {isEnvManagerOpen && <EnvironmentManager onClose={() => setIsEnvManagerOpen(false)} />}
                    {isUserManagementOpen && <UserManagementPanel onClose={() => setIsUserManagementOpen(false)} />}
                    {isIssuesPanelOpen && <IssuesPanel onClose={() => setIsIssuesPanelOpen(false)} />}

                    {/* Batch 14.2: VQA Parity Lab */}
                    <VQAParityPanel />

                    {state.isPenToolActive && (
                        <PenTool />
                    )}

                    {showAIAssistant && (
                        <AIAssistantPanel onClose={() => setShowAIAssistant(false)} />
                    )}
                    {showDeployment && <DeploymentPanel onClose={() => setShowDeployment(false)} />}
                    {showServerless && (
                        <ServerlessPanel
                            onClose={() => setShowServerless(false)}
                            onOpenSchema={() => setShowSchemaDesigner(true)}
                            onOpenConnect={() => setShowConnect(true)}
                            onOpenWorkflow={() => setShowWorkflowStudio(true)}
                            onOpenSaaSAdmin={() => setShowSaaSAdmin(true)}
                        />
                    )}
                    {showSchemaDesigner && <SchemaDesigner onClose={() => setShowSchemaDesigner(false)} />}
                    {showConnect && <ArchitectConnect onClose={() => setShowConnect(false)} />}
                    {showWorkflowStudio && <WorkflowStudio onClose={() => setShowWorkflowStudio(false)} />}
                    {showSaaSAdmin && <SaaSAdminDashboard onClose={() => setShowSaaSAdmin(false)} />}
                    {isMarketplaceOpen && <PluginMarketplace onClose={() => setIsMarketplaceOpen(false)} />}

                    {/* Batch 15.1: Workshop (Creator Studio) */}
                    {isWorkshopOpen && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, backgroundColor: '#0a0a0a' }}>
                            <WorkshopPanel
                                onClose={() => setIsWorkshopOpen(false)}
                                initialComponentId={workshopComponentId}
                            />
                        </div>
                    )}
                </div >
            </div >
        </RuntimeProvider >
    );
}
