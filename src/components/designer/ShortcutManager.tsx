import { useEffect } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { hyperBridge } from '@/lib/engine/HyperBridge';

export const ShortcutManager = () => {
    const {
        state, undo, redo, saveProject, removeElement, clearSelection,
        copySelection, pasteElement, cutElement, duplicateElement,
        selectAll, groupSelection, ungroupSelection,
        toggleCommandBar, setIsUIVisible, setCanvasTransform, setIsSpacePressed
    } = useProjectStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if input/textarea is focused (unless specialized shortcut? No, standard behavior)
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                // Allow Escape to blur
                if (e.key === 'Escape') {
                    target.blur();
                }
                return;
            }

            // Spacebar Panning (Bypass Universal Pipeline for real-time responsiveness)
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                setIsSpacePressed(true);
                return;
            }

            // Batch 13.2: Universal Shortcut Pipeline
            // 1. Send raw event to Rust
            const action = hyperBridge.handleKeyEvent(e.key, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);

            if (action) {
                e.preventDefault();
                console.log(`[ShortcutManager] Universal Action: ${action}`);

                // 2. Execute Semantic Action
                switch (action) {
                    case 'Undo': undo(); break;
                    case 'Redo': redo(); break;
                    case 'Save': saveProject(); break;
                    case 'Delete':
                        if (state.selectedElementId) removeElement(state.selectedElementId);
                        break;
                    case 'Escape': clearSelection(); break;
                    case 'Copy': copySelection(); break;
                    case 'Paste': pasteElement(); break;
                    case 'Cut': cutElement(); break;
                    case 'Duplicate': duplicateElement(); break;
                    case 'SelectAll': selectAll(); break;
                    case 'Group': groupSelection(); break;
                    case 'Ungroup': ungroupSelection(); break;
                    case 'ZoomIn':
                        setCanvasTransform(prev => ({ ...prev, scale: Math.min(5, prev.scale + 0.1) }));
                        break;
                    case 'ZoomOut':
                        setCanvasTransform(prev => ({ ...prev, scale: Math.max(0.1, prev.scale - 0.1) }));
                        break;
                    case 'ResetView':
                        setCanvasTransform({ x: 0, y: 0, scale: 1 });
                        break;
                    case 'ToggleCommandBar': toggleCommandBar(); break;
                    case 'ToggleUI': setIsUIVisible((prev: boolean) => !prev); break;
                    default: console.warn("Unhandled Universal Action:", action);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [undo, redo, saveProject, removeElement, clearSelection, copySelection, pasteElement, cutElement, duplicateElement, selectAll, groupSelection, ungroupSelection, setIsSpacePressed]);

    return null; // Headless component
};
