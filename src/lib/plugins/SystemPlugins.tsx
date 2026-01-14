import React from 'react';
import { pluginManager } from './PluginManager';
import { OMNIOSPlugin } from '@/types/plugins';
import { FigmaSyncPlugin } from '@/components/designer/tools/FigmaSyncPlugin';
import { NativeBuildTool } from '@/components/designer/tools/NativeBuildTool';

export const registerSystemPlugins = () => {
    const figmaSync: OMNIOSPlugin = {
        id: 'com.omnios.figma-sync',
        name: 'Figma Live Sync',
        version: '1.0.0',
        description: 'High-fidelity Figma to OMNIOS synchronization with Neural Layout Reconstruction.',
        author: 'OMNIOS Core',
        type: 'panel',
        icon: 'Zap',
        init: () => console.log('[SystemPlugin] Figma Sync Initialized'),
        onEnable: () => console.log('[SystemPlugin] Figma Sync Enabled'),
        render: () => <FigmaSyncPlugin />
    };

    const nativeForge: OMNIOSPlugin = {
        id: 'com.omnios.native-forge',
        name: 'Native Build Forge',
        version: '1.0.0',
        description: 'One-click export to iOS and Android via cloud build orchestration.',
        author: 'OMNIOS Core',
        type: 'panel',
        icon: 'Package',
        init: () => console.log('[SystemPlugin] Native Forge Initialized'),
        onEnable: () => console.log('[SystemPlugin] Native Forge Enabled'),
        render: () => <NativeBuildTool />
    };

    pluginManager.registerPlugin(figmaSync);
    pluginManager.registerPlugin(nativeForge);

    // Auto-enable for Phase 19 demonstration
    pluginManager.enablePlugin(figmaSync.id);
    pluginManager.enablePlugin(nativeForge.id);
};
