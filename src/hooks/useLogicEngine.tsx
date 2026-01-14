import { useCallback, useEffect, useRef } from 'react';
import { useRuntime } from '../lib/runtime/RuntimeContext';
import { hyperBridge } from '../lib/engine/HyperBridge';
import { useProjectStore } from './useProjectStore';
import { nativeBridge } from '../lib/native/nativeBridge';

export const useLogicEngine = () => {
    const { state, setState, setDebuggerMode, switchPage } = useProjectStore(); // Batch 8.4: switchPage added
    const processingRef = useRef(false);

    // ... (Debugger Effect - Unchanged) ...

    const executeAction = useCallback((node: any, payload: any) => {
        const actionLabel = node.data?.label || '';
        console.log(`[Logic Runner] Executing Action: ${actionLabel}`);

        // Mock Action Payload Parser (In real engine, use node.data.config)
        if (actionLabel.includes('Navigate')) {
            const path = actionLabel.split('Navigate to ')[1]?.trim();
            if (path) {
                console.log(`[Logic Runner] Navigating to ${path}`);
                // In a real app, 'path' might be a page ID or slug. 
                // For this demo, let's assume path matches page ID or handle basic routing mock
                switchPage(path.replace('/', '') || 'index');
            }
        }
    }, [switchPage]);

    const fireTrigger = useCallback((elementId: string, eventType: string, payload?: any) => {
        // Check for Breakpoints (Legacy Blueprint Support + New Graph Support)
        // ... (Simplified Debugger Logic for New Graph) ...

        console.log(`[Logic Runner] Trigger Fired: ${elementId} (${eventType})`);

        // 1. Find Matching Event Nodes in the Live Graph
        const eventNodes = state.logicNodes.filter(n =>
            n.type === 'event' &&
            n.data?.elementId === elementId
        );

        if (eventNodes.length === 0) {
            // Fallback to HyperBridge (Legacy/Rust)
            try {
                hyperBridge.fireTrigger(elementId, eventType, payload);
            } catch (e) { /* Ignore if legacy not present */ }
            return;
        }

        // 2. Traverse Graph
        eventNodes.forEach(sourceNode => {
            const outgoingEdges = state.logicEdges.filter(e => e.source === sourceNode.id);
            outgoingEdges.forEach(edge => {
                const targetNode = state.logicNodes.find(n => n.id === edge.target);
                if (targetNode) {
                    executeAction(targetNode, payload);
                }
            });
        });

    }, [state.logicNodes, state.logicEdges, executeAction, state.debugger.mode]);

    const triggerState = useCallback((event: string) => {
        // Only block triggers that are "Events", not raw state transitions for now
        // Or should we block this too? For now, let's keep it simple.
        const result = hyperBridge.trigger(event);
        console.log(`[Hyper-Engine] State Trigger: ${event} -> ${result ? 'Transitioned' : 'Ignored'}`);
        return result;
    }, []);

    // Batch 19.2: Mobile Hardware Triggers
    const triggerMobileAction = useCallback(async (action: 'camera' | 'haptic' | 'biometric', payload?: any) => {
        console.log(`[Mobile-Logic] Triggering Hardware Action: ${action}`);

        switch (action) {
            case 'camera':
                const hasPerm = await nativeBridge.requestCameraPermission();
                if (hasPerm) fireTrigger('system', 'onCameraOpen', payload);
                break;
            case 'haptic':
                nativeBridge.triggerHaptic(payload?.type || 'selection');
                break;
            case 'biometric':
                nativeBridge.showNotification('Biometric', 'Security verification initiated');
                break;
        }
    }, [fireTrigger]);

    return { fireTrigger, triggerState, triggerMobileAction };
};
