
import { HybridImage } from './HybridImage'; // Batch 13.1
import { sanitize } from '@/lib/utils/sanitize';

import React, { createContext, useContext, useRef, useState } from 'react';
import { RTLEngine } from '@/lib/i18n/rtlEngine'; // Batch 5.2
import {
    Box, Type, Image as ImageIcon, Video, MousePointer2,
    Layout, GripHorizontal, ALargeSmall, Square, Link as LinkIcon
} from 'lucide-react';
import { DesignerElement, ElementStyles, TokenType } from '@/types/designer';
import { getDynamicAssetUrl } from '@/lib/assets/cdn'; // Framer18
import { useProjectStore } from '@/hooks/useProjectStore';
import { hyperBridge } from '@/lib/engine/HyperBridge';
import { ResizeHandles } from './ResizeHandles';
import { SpacingHandles } from './SpacingHandles';
import { IconRegistry } from './IconRegistry';
import { useLogicEngine } from '@/hooks/useLogicEngine'; // Framer12: Gestures
import { motion, AnimatePresence, useAnimation, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useSnapping } from '@/hooks/useSnapping';
import { usePhysicsTransform } from '@/hooks/usePhysicsTransform';
import { SmartGuides } from './SmartGuides';
import { RepeaterRenderer } from './RepeaterRenderer';
import { CustomCodeBox } from './CustomCodeBox';
import { guessIntent } from '@/lib/layout/layoutEngine';
import { aiBridgeSource } from '@/lib/ai/aiBridge';
import Image from 'next/image';
import { getOptimizedSizes } from '@/lib/optimization/imageProcessor';
import { initiateStripeCheckout } from '@/lib/commerce/stripeConnect';
import { CustomerDashboard } from './membership/CustomerDashboard';
import { Marquee } from './lush/Marquee';
import { ParallaxSection } from './lush/ParallaxSection';
import { RevealImage } from './lush/RevealImage';
import { ABTestContainer } from '@/components/marketing/ABTestContainer';
import { GrowthOverlay } from '@/components/marketing/GrowthOverlay'; import { FluxEngine } from '@/lib/intelligence/FluxEngine';


const GapHandle = ({ containerId, index, isVertical, onUpdate }: { containerId: string, index: number, isVertical: boolean, onUpdate: (containerId: string, gap: number) => void }) => {
    const [isDragging, setIsDragging] = React.useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsDragging(true);
        const startPos = isVertical ? e.clientY : e.clientX;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const currentPos = isVertical ? moveEvent.clientY : moveEvent.clientX;
            const delta = Math.abs(currentPos - startPos); // Simple delta for now
            onUpdate(containerId, delta);
        };

        const onMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            style={{
                width: isVertical ? '100%' : '8px',
                height: isVertical ? '8px' : '100%',
                backgroundColor: isDragging ? 'var(--accent-teal)' : 'transparent',
                cursor: isVertical ? 'row-resize' : 'col-resize',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                position: 'relative'
            }}
            className="gap-handle"
        >
            <div style={{
                width: isVertical ? '20px' : '2px',
                height: isVertical ? '2px' : '20px',
                backgroundColor: 'rgba(0, 255, 150, 0.3)',
                borderRadius: '1px',
                opacity: 0,
                transition: 'opacity 0.2s'
            }} />
        </div>
    );
};

// Batch 7.2: Code Optimization (Memoization)
export const ElementRenderer = React.memo(ElementRendererRaw, (prevProps, nextProps) => {
    // Custom comparison function for performance
    const prevEl = prevProps.elements[prevProps.elementId];
    const nextEl = nextProps.elements[nextProps.elementId];

    if (!prevEl || !nextEl) return false;

    // Check critical props
    if (prevProps.selectedElementId !== nextProps.selectedElementId) return false;
    if (prevEl !== nextEl) return false; // Reference check is fast if immutable update pattern is used correctly
    // If instance context changed
    if (JSON.stringify(prevProps.instanceContext) !== JSON.stringify(nextProps.instanceContext)) return false;

    return true;
});


import { DataContext } from '@/lib/context/DataContext';

interface ElementRendererProps {
    elementId: string;
    elements: Record<string, DesignerElement>; // Can be overridden for Master Components
    selectedElementId: string | null;
    onSelect: (id: string, e: React.MouseEvent) => void;
    onMove?: (id: string, x: number, y: number) => void;
    instanceContext?: {
        instanceId: string;
        slotContent?: Record<string, string[]>;
    };
    nativeMode?: boolean; // Framer12: Native Validation
}

export function ElementRendererRaw({ elementId, elements, selectedElementId, onSelect, onMove, instanceContext, nativeMode }: ElementRendererProps) {
    const { state, switchPage, removeElement, toggleLayoutMode, convertToSafety, updateElementStyles, updateElementProp, setEditingElementId, setSelectedElement, toggleSelection, addToCart, toggleCart, smartStack, reorderElement, updateGap, logAnalyticsEvent, bulkUpdateElements, login, signUp, logout } = useProjectStore();
    const dataItem = useContext(DataContext);
    // Helper to merge overrides
    const getElementData = () => {
        const el = elements[elementId];
        if (!el) return null;

        // If it's a regular element, return as is
        if (!el.masterComponentId) return el;

        // If it's an instance, we need to merge with master
        const master = elements[el.masterComponentId];
        if (!master) return el; // Fallback if master missing

        // Merge logic: Master is base, Instance specific fields overwrite Master
        // But for "Overrides", we might want to be more granular.
        // For MVP: Instance Styles & Content overwrite Master.
        // The `overrides` field in `el` will store specific property overrides.

        const merged = {
            ...master,
            ...el, // Instance properties (like position) overwrite master
            id: el.id, // Ensure ID is instance ID
            type: master.type, // Type must match master
            // Content override (Resolved later via binding, but here we merge static overrides)
            content: el.overrides?.content ?? master.content,
            styles: {
                ...master.styles,
                ...el.styles, // Instance styles overwrite master (usually positioning)
                ...el.overrides?.styles // Specific style overrides
            },
            // Merge bindings
            bindings: { ...master.bindings, ...el.bindings }
        };

        return merged;
    };

    const element = getElementData();

    if (!element) return null;
    // --- HOOKS ---
    const elementRef = React.useRef<any>(null);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const controls = useAnimation(); // Framer9: Motion Controls
    // const [activeGuides, setActiveGuides] = React.useState<GuideLine[]>([]); // REPLACED BY HOOK
    const { activeGuides, calculateSnap, clearGuides } = useSnapping();
    const [resizeDimensions, setResizeDimensions] = React.useState<{ w: number, h: number } | null>(null);
    const [hasAppeared, setHasAppeared] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState(0);
    const [intent, setIntent] = React.useState<'wrap-col' | 'wrap-row' | 'none'>('none');
    const [suggestedRect, setSuggestedRect] = React.useState<{ left: number, top: number, width: number, height: number } | undefined>(undefined);
    const [isAILoading, setIsAILoading] = React.useState(false);
    const { fireTrigger, triggerState } = useLogicEngine(); // Framer12 & Batch 9.3

    // --- AUTH FORM STATE ---
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    // Batch 9.1: Optimized Physics Bridge (No re-renders)
    usePhysicsTransform(elementId, elementRef);

    // Batch 23.1: Autonomous A/B Testing
    const [activeVariant, setActiveVariant] = React.useState<any>(null);
    React.useEffect(() => {
        if (element.props?.autoTest) {
            import('@/lib/intelligence/AutonomousTestingService').then(mod => {
                mod.autonomousTestingService.startExperiment(elementId, element.styles || {});
                const variant = mod.autonomousTestingService.getVariantForElement(elementId);
                if (variant) setActiveVariant(variant);
            });
        }
    }, [elementId, element.props?.autoTest]);

    const resolvedStyles = activeVariant ? activeVariant.styles_override : (element.styles || {});

    // --- FRAMER7: 3D TILT LOGIC ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 30 });



    const tiltStyle = element.interaction === 'tilt' ? {
        rotateX: mouseY,
        rotateY: mouseX,
        transformStyle: 'preserve-3d'
    } : {};
    // ----------------------------

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    // Reset page when collection/filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [element.collectionId, JSON.stringify(element.filter), element.pagination?.type]);

    const { scrollYProgress } = useScroll({
        target: elementRef,
        offset: ["start end", "end start"]
    });

    // --- LOCALIZATION RESOLUTION (Framer17) ---
    const activeLocale = state.localization.activeLocale;
    const isDefaultLocale = activeLocale === 'en';
    const localeConfig = state.localization.locales.find(l => l.code === activeLocale);
    const isRTL = localeConfig?.isRTL || false;
    const localeOverrides = element.localeOverrides?.[activeLocale];

    // --- VARIABLE & DATA RESOLUTION ---
    const resolveBinding = (propName: string, defaultValue: any) => {
        const bindingId = element.bindings?.[propName];

        // 1. Check for Data Collection Binding (Batch 2.2)
        if (bindingId && dataItem && dataItem.values?.[bindingId]) {
            return dataItem.values[bindingId];
        }

        // 2. Check for Component Props (if inside instance)
        if (bindingId && instanceContext) {
            const instanceRoot = state.elements[instanceContext.instanceId];
            if (instanceRoot) {
                if (instanceRoot.props?.[bindingId]) return instanceRoot.props[bindingId];
                if (instanceRoot.componentId) {
                    const master = state.designSystem.components.find((c: any) => c.id === instanceRoot.componentId);
                    const propDef = master?.props?.find((p: any) => p.id === bindingId);
                    if (propDef) return propDef.defaultValue;
                }
            }
        }

        // 3. Check for Global Variable Binding (React State)
        // 3. Check for Global Variable Binding (Rust State - Batch 9.4)
        if (bindingId) {
            const liveValue = hyperBridge.getVariable(bindingId);
            if (liveValue !== null && liveValue !== undefined && liveValue !== "null") {
                return liveValue;
            }
        }

        // 4. Fallback: Check for Global Variable Binding (React State)
        if (bindingId) {
            return state.globalVariables[bindingId]?.value ?? defaultValue;
        }

        return defaultValue;
    };

    // Framer19: Implicit Analytics (Section View & Click)
    React.useEffect(() => {
        if (!state.previewMode || element.type !== 'section') return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    logAnalyticsEvent({
                        type: 'section_view',
                        pageId: state.activePageId,
                        elementId: element.id,
                        metadata: { name: element.name || 'Untitled Section' }
                    });
                }
            },
            { threshold: 0.5 }
        );

        if (elementRef.current) observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, [state.previewMode, element.id, element.type, element.name, state.activePageId, logAnalyticsEvent]);

    const handlePreviewClick = (e: React.MouseEvent) => {
        if (!state.previewMode) return;

        logAnalyticsEvent({
            type: 'click',
            pageId: state.activePageId,
            elementId: element.id,
            metadata: {
                type: element.type,
                text: element.content?.substring(0, 20)
            }
        });
    };

    const displayContent = localeOverrides?.content ?? resolveBinding('content', element?.content);
    const displayColor = resolveBinding('color', element?.styles?.color);

    const resolvedElement = {
        ...element,
        content: displayContent,
        media: localeOverrides?.media ? { ...element.media, ...localeOverrides.media } : element.media,
        styles: {
            ...resolvedStyles, // Batch 23.1: Autonomous A/B variant takes base
            ...(localeOverrides?.styles || {}),
            color: displayColor || element?.styles?.color
        }
    };

    const getTimeline = (prop: string) => element?.scrollTimeline?.filter(t => (t as any).prop === prop) || [];
    const opacityTimeline = getTimeline('opacity');
    const scrollOpacity = useTransform(
        scrollYProgress,
        opacityTimeline.length > 0 ? opacityTimeline.map(t => t.start || 0) : [0, 1],
        opacityTimeline.length > 0 ? opacityTimeline.map(t => t.to) : [1, 1]
    );

    const scaleTimeline = getTimeline('scale');
    const scrollScale = useTransform(
        scrollYProgress,
        scaleTimeline.length > 0 ? scaleTimeline.map(t => t.start || 0) : [0, 1],
        scaleTimeline.length > 0 ? scaleTimeline.map(t => t.to) : [1, 1]
    );

    const yTimeline = getTimeline('y');
    const scrollY = useTransform(
        scrollYProgress,
        yTimeline.length > 0 ? yTimeline.map(t => t.start || 0) : [0, 1],
        yTimeline.length > 0 ? yTimeline.map(t => t.to) : [0, 0]
    );

    const rotateTimeline = getTimeline('rotate');
    const scrollRotate = useTransform(
        scrollYProgress,
        rotateTimeline.length > 0 ? rotateTimeline.map(t => t.start || 0) : [0, 1],
        rotateTimeline.length > 0 ? rotateTimeline.map(t => t.to) : [0, 0]
    );

    const skewXTimeline = getTimeline('skewX');
    const scrollSkewX = useTransform(
        scrollYProgress,
        skewXTimeline.length > 0 ? skewXTimeline.map(t => t.start || 0) : [0, 1],
        skewXTimeline.length > 0 ? skewXTimeline.map(t => t.to) : [0, 0]
    );

    const skewYTimeline = getTimeline('skewY');
    const scrollSkewY = useTransform(
        scrollYProgress,
        skewYTimeline.length > 0 ? skewYTimeline.map(t => t.start || 0) : [0, 1],
        skewYTimeline.length > 0 ? skewYTimeline.map(t => t.to) : [0, 0]
    );

    const blurTimeline = getTimeline('blur');
    const scrollBlurRaw = useTransform(
        scrollYProgress,
        blurTimeline.length > 0 ? blurTimeline.map(t => t.start || 0) : [0, 1],
        blurTimeline.length > 0 ? blurTimeline.map(t => t.to) : [0, 0]
    );
    const scrollBlur = useTransform(scrollBlurRaw, (v: any) => `blur(${v}px)`);

    // --- ANIMATION SEQUENCE LOGIC ---
    const activeSequence = element?.animationSequences ? Object.values(element.animationSequences)[0] : null;

    const getSequenceAnimate = () => {
        const animatedProps: Record<string, any[]> = {};
        const times: number[] = [];

        if (!activeSequence || activeSequence.keyframes.length === 0) return { animatedProps, times };

        // Sort keyframes by time just in case
        const sortedKeyframes = [...activeSequence.keyframes].sort((a, b) => a.time - b.time);

        // Ensure we have a keyframe at 0 and 1 if not present? 
        // Or just let Framer interpolate? Framer works best with full arrays.

        sortedKeyframes.forEach(kf => {
            times.push(kf.time);
            Object.entries(kf.styles).forEach(([prop, val]) => {
                if (!animatedProps[prop]) animatedProps[prop] = [];
                animatedProps[prop].push(val);
            });
        });

        return { animatedProps, times };
    };

    const { animatedProps, times } = getSequenceAnimate();

    const sequenceTransition = activeSequence ? {
        duration: activeSequence.duration,
        delay: activeSequence.delay,
        repeat: activeSequence.repeat ? Infinity : 0,
        ease: activeSequence.easing || 'easeInOut',
        times: times
    } : {};

    // Merge scroll transforms into a single object for the motion component
    const scrollStyles = {
        opacity: opacityTimeline.length > 0 ? scrollOpacity : undefined,
        scale: scaleTimeline.length > 0 ? scrollScale : undefined,
        y: yTimeline.length > 0 ? scrollY : undefined,
        rotate: rotateTimeline.length > 0 ? scrollRotate : undefined,
        skewX: skewXTimeline.length > 0 ? scrollSkewX : undefined,
        skewY: skewYTimeline.length > 0 ? scrollSkewY : undefined,
        filter: blurTimeline.length > 0 ? scrollBlur : undefined,
    };

    React.useEffect(() => {
        if (state.previewMode && element?.blueprintId) {
            fireTrigger(element.blueprintId, 'on_load');
        }

        if (!element || !element.styles?.animationName || element.styles.animationName === 'none') return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setHasAppeared(true);
                if (!element.animationRepeat) observer.disconnect();
            } else if (element.animationRepeat) {
                setHasAppeared(false);
            }
        }, { threshold: 0.1 });
        if (elementRef.current) observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, [element?.styles?.animationName]);

    React.useEffect(() => {
        if (state.previewMode && element?.customCode?.onMount) {
            try {
                const actions = {
                    navigateTo: (url: string) => window.open(url, '_blank'),
                    scrollTo: (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
                    animate: (targetId: string, animation: any) => {
                        const el = document.getElementById(targetId);
                        if (el) Object.assign(el.style, animation);
                    },
                    console: console
                };
                const fn = new Function('el', 'state', 'actions', element.customCode.onMount);
                fn(elementRef.current, state, actions);
            } catch (err) { console.error('Error in onMount hook:', err); }
        }
    }, [state.previewMode, elementId, element?.customCode?.onMount]);

    if (!element) return null;



    const renderSplitText = (text: string) => {
        if (!element.splitText || element.splitText === 'none') return text;
        const items = element.splitText === 'chars' ? text.split('') : text.split(' ');

        const splitTransition = {
            ...transition,
            delay: transition.delay || 0 // Base delay
        };

        return items.map((item, i) => (
            <motion.span
                key={i}
                style={{ display: 'inline-block' }}
                initial={animationVariant.initial}
                animate={hasAppeared ? animationVariant.animate : animationVariant.initial}
                transition={{
                    ...splitTransition,
                    delay: (splitTransition.delay || 0) + (element.staggerDelay || 0.05) * i
                }}
            >
                {item === ' ' ? '\u00A0' : item}
                {element.splitText === 'words' ? '\u00A0' : ''}
            </motion.span>
        ));
    };

    // --- RENDER LOGIC HOISTED ---
    const isSelected = state.selectedElementIds.includes(elementId);
    const viewMode = state.viewMode;

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (state.previewMode) {
            // Batch 9.3: Global State Machine Trigger
            triggerState('CLICK');

            // Fire Logic Blueprint Trigger
            // Fire Logic Blueprint Trigger (Legacy + New)
            // Batch 8.4: The Runner - Always fire with elementId
            fireTrigger(elementId, 'on_click', { targetId: elementId });

            // Original onClick script for legacy/direct support
            if (element.customCode?.onClick) {
                try {
                    const actions = {
                        navigateTo: (url: string) => window.open(url, '_blank'),
                        scrollTo: (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
                        animate: (targetId: string, animation: any) => {
                            const el = document.getElementById(targetId);
                            if (el) Object.assign(el.style, animation);
                        },
                        console: console
                    };
                    const fn = new Function('el', 'state', 'actions', element.customCode.onClick);
                    fn(elementRef.current, state, actions);
                } catch (err) { console.error('Error in onClick hook:', err); }
            }
            if (element.action && element.action.type !== 'none') {
                const payload = element.action.payload || '';
                if (element.action.type === 'url') {
                    window.open(payload, element.action.target || '_self');
                } else if ((element.action.type === 'page' || element.action.type === 'navigate') && payload) {
                    switchPage(payload);
                } else if (element.action.type === 'scroll' && payload) {
                    document.getElementById(payload)?.scrollIntoView({ behavior: 'smooth' });
                }
            }

            // --- COMMERCE TRIGGER ---
            if (element.commerce && element.commerce.productId) {
                // Resolve name/price from context if bound
                const name = element.content || 'Product';
                const price = element.commerce.price || 0;

                addToCart({
                    productId: element.commerce.productId,
                    name: name,
                    price: price,
                    image: (element as any).media?.src || (elements[elementId] as any).media?.src
                });
            } else if (element.type === 'button' && (element.content?.toLowerCase().includes('cart') || element.content?.toLowerCase().includes('bag'))) {
                // Logic for cart toggle button
                toggleCart();
            }

            // Batch 23.1: Record Autonomous Conversion
            if (element.props?.autoTest) {
                import('@/lib/intelligence/AutonomousTestingService').then(mod => {
                    mod.autonomousTestingService.recordConversion(elementId);
                });
            }

            return;
        }

        if (e.shiftKey) {
            toggleSelection(elementId);
        } else {
            onSelect(elementId, e);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // e.preventDefault(); // Moved inside to allow text selection if needed? No, standard designer behavior is drag
        e.stopPropagation();
        e.preventDefault();

        const isFreedom = element.layoutMode === 'freedom';
        const styles = resolvedStyles;
        const startLeft = parseInt(String(styles.left || '0'));
        const startTop = parseInt(String(styles.top || '0'));
        const offsetX = e.clientX - startLeft;
        const offsetY = e.clientY - startTop;
        const rect = elementRef.current?.getBoundingClientRect();
        const width = rect?.width || 0;
        const height = rect?.height || 0;
        const siblings = Object.values(elements).filter(el =>
            el.parentId === element.parentId && el.id !== elementId
        );
        const freedomSiblings = siblings.filter(s => s.layoutMode === 'freedom');

        let lastInjectedIndex = -1;
        let detectedIntent: 'wrap-col' | 'wrap-row' | 'none' = 'none';

        const onMouseMoveLocal = (moveEvent: MouseEvent) => {
            if (isFreedom) {
                const rawX = moveEvent.clientX - offsetX;
                const rawY = moveEvent.clientY - offsetY;

                const { x: newX, y: newY, suggestedRect } = calculateSnap(
                    rawX,
                    rawY,
                    width,
                    height,
                    freedomSiblings,
                    elementId
                );

                // Guess intent against other siblings
                let currentIntent: 'wrap-col' | 'wrap-row' | 'none' = 'none';
                for (const sibling of freedomSiblings) {
                    const result = guessIntent(elementId, sibling.id, elements);
                    if (result !== 'none') {
                        currentIntent = result;
                        break;
                    }
                }
                detectedIntent = currentIntent;
                setIntent(detectedIntent);

                // --- MAGNETIC FLUX: REAL-TIME PHYSICALITY ---
                const displacements = FluxEngine.calculatePhysicalDisplacement(
                    elementId,
                    newX,
                    newY,
                    width,
                    height,
                    freedomSiblings
                );

                if (Object.keys(displacements).length > 0) {
                    const updates: Record<string, any> = {};
                    Object.entries(displacements).forEach(([id, pos]) => {
                        updates[id] = { styles: { left: `${pos.x}px`, top: `${pos.y}px` } };
                    });
                    bulkUpdateElements(updates, true); // Skip history for intermediate drag frames
                }

                setSuggestedRect(suggestedRect);
                if (onMove) onMove(elementId, newX, newY);
            } else {
                // PUSH LOGIC: Reorder in stack
                const parent = elements[element.parentId || ''];
                if (!parent || !parent.children) return;

                const parentRect = document.getElementById(parent.id)?.getBoundingClientRect();
                if (!parentRect) return;

                const isVertical = parent.styles?.flexDirection === 'column';
                const mousePos = isVertical ? moveEvent.clientY : moveEvent.clientX;

                // Find the nearest index
                let targetIndex = 0;
                const siblingNodes = parent.children.map(id => ({ id, rect: document.getElementById(id)?.getBoundingClientRect() }));

                for (let i = 0; i < siblingNodes.length; i++) {
                    const r = siblingNodes[i].rect;
                    if (!r) continue;
                    const midPoint = isVertical ? (r.top + r.bottom) / 2 : (r.left + r.right) / 2;
                    if (mousePos > midPoint) {
                        targetIndex = i + 1;
                    }
                }

                const currentIndex = parent.children.indexOf(elementId);
                // Clamp target index to avoid jumping past bounds
                const finalTargetIndex = Math.max(0, Math.min(targetIndex, parent.children.length - 1));

                if (finalTargetIndex !== currentIndex && finalTargetIndex !== lastInjectedIndex) {
                    lastInjectedIndex = finalTargetIndex;
                    reorderElement(elementId, parent.id, finalTargetIndex);
                }
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMoveLocal);
            document.removeEventListener('mouseup', onMouseUp);

            // --- SMART STACK (GRAVITY ENGINE) ---
            if (isFreedom && detectedIntent !== 'none') {
                // Find sibling we was snapping to
                for (const sibling of freedomSiblings) {
                    if (guessIntent(elementId, sibling.id, elements) === detectedIntent) {
                        smartStack(elementId, sibling.id, detectedIntent);
                        break;
                    }
                }
            }

            clearGuides();
            setIntent('none');
            setSuggestedRect(undefined);
        };
        document.addEventListener('mousemove', onMouseMoveLocal);
        document.addEventListener('mouseup', onMouseUp);
    };

    const transition: any = {
        type: element.styles?.physics?.type || element.animationTransition?.type || 'spring',
        stiffness: element.styles?.physics?.stiffness || (element.animationTransition?.preset === 'natural' ? 100 :
            element.animationTransition?.preset === 'snappy' ? 400 :
                element.animationTransition?.preset === 'soft' ? 50 :
                    element.animationTransition?.stiffness || (element.styles?.physics?.type === 'tween' ? 0 : 400)),
        damping: element.styles?.physics?.damping || (element.animationTransition?.preset === 'natural' ? 15 :
            element.animationTransition?.preset === 'snappy' ? 28 :
                element.animationTransition?.preset === 'soft' ? 10 :
                    element.animationTransition?.damping || (element.styles?.physics?.type === 'tween' ? 0 : 30)),
        mass: element.styles?.physics?.mass || element.animationTransition?.mass || 1,
        duration: element.animationTransition?.duration || parseFloat(String(element.styles?.animationDuration || '0.3')),
        ease: element.animationTransition?.ease || 'easeInOut',
        // Physics extras
        velocity: element.styles?.physics?.velocity,
        restSpeed: element.styles?.physics?.restSpeed,
        restDelta: element.styles?.physics?.restDelta,
    };

    let baseStyles: ElementStyles = {};
    const classIds = element.classNames || [];
    classIds.forEach(clsId => {
        const cls = state.designSystem.classes.find((c: any) => c.id === clsId);
        if (cls) baseStyles = { ...baseStyles, ...cls.styles };
    });
    baseStyles = { ...baseStyles, ...element.styles };

    // --- PRESET MAPPING (Framer Motion Compiler) ---
    const presetVariants: any = {
        none: { initial: {}, animate: {} },
        fadeIn: {
            initial: { opacity: 0 },
            animate: { opacity: 1 }
        },
        fadeInUp: {
            initial: { opacity: 0, y: 30 },
            animate: { opacity: 1, y: 0 }
        },
        fadeInDown: {
            initial: { opacity: 0, y: -30 },
            animate: { opacity: 1, y: 0 }
        },
        revealLeft: {
            initial: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
            animate: { clipPath: 'inset(0 0% 0 0)', opacity: 1 }
        },
        revealRight: {
            initial: { clipPath: 'inset(0 0 0 100%)', opacity: 0 },
            animate: { clipPath: 'inset(0 0% 0 0)', opacity: 1 }
        },
        blurIn: {
            initial: { filter: 'blur(15px)', opacity: 0 },
            animate: { filter: 'blur(0px)', opacity: 1 }
        },
        scaleUp: {
            initial: { scale: 0.8, opacity: 0 },
            animate: { scale: 1, opacity: 1 }
        },
        slideInLeft: {
            initial: { x: -50, opacity: 0 },
            animate: { x: 0, opacity: 1 }
        },
        slideInRight: {
            initial: { x: 50, opacity: 0 },
            animate: { x: 0, opacity: 1 }
        },
        zoomIn: {
            initial: { scale: 0.5, opacity: 0 },
            animate: { scale: 1, opacity: 1 }
        },
        bounce: {
            initial: { scale: 0.3, opacity: 0 },
            animate: { scale: 1, opacity: 1 }
        },
        spin: {
            initial: { rotate: -180, opacity: 0, scale: 0.5 },
            animate: { rotate: 0, opacity: 1, scale: 1 }
        }
    };

    const currentPreset = element.styles?.animationName || 'none';
    const animationVariant = presetVariants[currentPreset] || presetVariants.none;


    const isEditing = !state.previewMode;

    // Resolve Pseudo-States
    const showHover = isEditing ? (state.activeState === 'hover' && selectedElementId === elementId) : isHovered;
    const showActive = isEditing ? (state.activeState === 'active' && selectedElementId === elementId) : isActive;
    const showFocus = isEditing ? (state.activeState === 'focus' && selectedElementId === elementId) : isFocused;



    const getFinalStyles = () => {
        // --- BATCH 4.3: CLASS INHERITANCE ---
        let mergedClassStyles: any = {};
        if (element.classNames && element.classNames.length > 0) {
            element.classNames.forEach(classId => {
                const cls = state.designSystem.classes.find((c: any) => c.id === classId);
                if (cls) {
                    mergedClassStyles = { ...mergedClassStyles, ...cls.styles };
                }
            });
        }

        // Instance overrides come from resolvedElement (which handles localization/bindings)
        const instanceStyles = resolvedElement.styles || {};

        // Merge: Global Default -> Classes -> Instance
        let styles = { ...mergedClassStyles, ...instanceStyles };

        // ... (Tablet/Mobile/Hover logic remains same) ...
        if (viewMode === 'tablet') {
            if (element.tabletStyles) styles = { ...styles, ...element.tabletStyles };
        }
        else if (viewMode === 'mobile') {
            if (element.mobileStyles) styles = { ...styles, ...element.mobileStyles };
        }

        if (showHover) {
            if (element.hoverStyles) styles = { ...styles, ...element.hoverStyles };
        }

        // Apply RTL Engine (Batch 5.2)
        return RTLEngine.transformStyles(styles, isRTL);
    };

    const finalStyles: any = getFinalStyles();

    // --- HYPER ENGINE OVERRIDE (Batch 5.2.1) ---
    const hyperLayout = hyperBridge.getElementLayoutSync(elementId);
    if (hyperLayout && !state.previewMode) {
        // Apply absolute positioning from Rust
        finalStyles.position = 'absolute';
        finalStyles.left = hyperLayout.x;
        finalStyles.top = hyperLayout.y;
        finalStyles.width = hyperLayout.width;
        finalStyles.height = hyperLayout.height;
        // Optimization: Disable browser-side flex if Rust handles it
        // finalStyles.display = 'block'; 
    }

    // --- BATCH 9.1: PHYSICS BRIDGE ---
    const physicsPos = hyperBridge.getPhysicsPosition(elementId);
    if (physicsPos) {
        // Physics overrides EVERYTHING (it's the simulation truth)
        finalStyles.position = 'absolute';
        finalStyles.left = `${physicsPos.x}px`;
        finalStyles.top = `${physicsPos.y}px`;
        // In future: rotation
    }

    // --- FRAMER12: NATIVE VALIDATION ---
    if (nativeMode && isSelected) {
        const invalidProps = [];
        if (finalStyles.display === 'grid') invalidProps.push('grid (use flex)');
        if (finalStyles.float) invalidProps.push('float');
        if (finalStyles.position === 'fixed') invalidProps.push('fixed position (use absolute)');
        if (finalStyles.backgroundImage?.includes('gradient')) invalidProps.push('css gradients (use LinearGradient)');

        if (invalidProps.length > 0) {
            console.warn(`[Native Compatibility] Element ${element.name} has invalid styles:`, invalidProps);
            // Visual indicator could be added here
        }
    }

    // --- FRAMER MOTION VARIANTS (Smart Animate) ---
    const getVariantStyles = (stateName: string) => {
        let variantStyles: any = {};
        if (stateName === 'none') return {};

        // Custom variants from the NEW architecture
        if (element.variants && element.variants[stateName]) {
            variantStyles = { ...variantStyles, ...element.variants[stateName] };
        }

        // Legacy state styles
        if (stateName === 'hover' && element.hoverStyles) variantStyles = { ...variantStyles, ...element.hoverStyles };
        if (stateName === 'active' && element.activeStyles) variantStyles = { ...variantStyles, ...element.activeStyles };
        if (stateName === 'focus' && element.focusStyles) variantStyles = { ...variantStyles, ...element.focusStyles };

        return variantStyles;
    };

    // Construct the variants object for Framer Motion
    const motionVariants: any = {
        none: { ...baseStyles, transition: transition },
        hover: { ...getVariantStyles('hover'), transition: transition },
        active: { ...getVariantStyles('active'), transition: transition },
        focus: { ...getVariantStyles('focus'), transition: transition },
    };

    // Add custom variants
    if (element.variants) {
        Object.keys(element.variants).forEach(vKey => {
            if (!['hover', 'active', 'focus'].includes(vKey)) {
                motionVariants[vKey] = { ...element.variants![vKey], transition: transition };
            }
        });
    }

    const transformParts = [];
    if (finalStyles.translateX || finalStyles.translateY) transformParts.push(`translate(${finalStyles.translateX || '0'}, ${finalStyles.translateY || '0'})`);
    if (finalStyles.scale && !state.previewMode) transformParts.push(`scale(${finalStyles.scale})`);
    if (finalStyles.rotate && !state.previewMode) transformParts.push(`rotate(${finalStyles.rotate})`);
    if (finalStyles.skewX) transformParts.push(`skewX(${finalStyles.skewX})`);
    if (finalStyles.skewY) transformParts.push(`skewY(${finalStyles.skewY})`);
    if (finalStyles.transform) transformParts.push(finalStyles.transform);
    const transformString = transformParts.join(' ');

    const hasScrollTimeline = element.scrollTimeline && element.scrollTimeline.length > 0;

    const handleRefineText = async () => {
        if (element.type !== 'text' || !element.content) return;
        const instruction = prompt("How should AI refine this text? (e.g., 'Make it punchier', 'Shorter')");
        if (!instruction) return;

        setIsAILoading(true);
        try {
            const refined = await aiBridgeSource.refineText(element.content, instruction);
            updateElementProp(elementId, 'content', refined);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleMagicImage = async () => {
        if (element.type !== 'image') return;
        const promptSt = prompt("Describe the image you want AI to generate:");
        if (!promptSt) return;

        setIsAILoading(true);
        try {
            const imageUrl = await aiBridgeSource.generateImage(promptSt);
            updateElementProp(elementId, 'content', imageUrl);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation();
        e.preventDefault();
        if (!elementRef.current) return;
        const rect = elementRef.current.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = rect.width;
        const startHeight = rect.height;
        const startLeft = parseInt(finalStyles.left || '0') || 0;
        const startTop = parseInt(finalStyles.top || '0') || 0;
        const onMouseMove = (moveEvent: MouseEvent) => {
            let deltaX = moveEvent.clientX - startX;
            let deltaY = moveEvent.clientY - startY;
            const isShift = moveEvent.shiftKey;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newTop = startTop;
            let newLeft = startLeft;

            if (direction.includes('e')) { newWidth = Math.max(10, startWidth + deltaX); }
            else if (direction.includes('w')) { newWidth = Math.max(10, startWidth - deltaX); newLeft = startLeft + deltaX; }

            if (direction.includes('s')) { newHeight = Math.max(10, startHeight + deltaY); }
            else if (direction.includes('n')) { newHeight = Math.max(10, startHeight - deltaY); newTop = startTop + deltaY; }

            // Aspect Ratio Locking
            if (isShift) {
                const aspectRatio = startWidth / startHeight;
                if (direction.length === 2) { // Corner resize
                    // Match the larger delta to maintain ratio
                    const currentRatio = newWidth / newHeight;
                    if (currentRatio > aspectRatio) {
                        newWidth = newHeight * aspectRatio;
                    } else {
                        newHeight = newWidth / aspectRatio;
                    }
                    // Re-calculate left/top if dragging from W or N
                    if (direction.includes('w')) newLeft = startLeft + (startWidth - newWidth);
                    if (direction.includes('n')) newTop = startTop + (startHeight - newHeight);
                }
            }

            let newStyles: any = {};
            if (newWidth !== startWidth) newStyles.width = `${newWidth}px`;
            if (newHeight !== startHeight) newStyles.height = `${newHeight}px`;
            if (element.layoutMode === 'freedom') {
                if (newLeft !== startLeft) newStyles.left = `${newLeft}px`;
                if (newTop !== startTop) newStyles.top = `${newTop}px`;
            }

            updateElementStyles(elementId, newStyles);
            setResizeDimensions({ w: Math.round(newWidth), h: Math.round(newHeight) });
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            setResizeDimensions(null);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const style: React.CSSProperties = {
        ...finalStyles,
        transition: finalStyles.transition || 'all 0.2s ease',
        transform: transformString || undefined,
        cursor: element.layoutMode === 'freedom' ? 'move' : (finalStyles.cursor || 'pointer'),
        position: element.layoutMode === 'freedom' ? 'absolute' : (finalStyles.position || 'relative'),
        top: element.layoutMode === 'freedom' ? (finalStyles.top || undefined) : finalStyles.top,
        left: element.layoutMode === 'freedom' ? finalStyles.left : undefined,
        zIndex: finalStyles.position === 'fixed' ? 100 : finalStyles.zIndex,
        userSelect: 'none',
        // Framer9: Glassmorphism Support
        backdropFilter: finalStyles.backdropFilter,
        WebkitBackdropFilter: finalStyles.backdropFilter,

        // Layout
        display: element.type === 'text' ? 'block' : (finalStyles.display || 'flex'),
        flexDirection: finalStyles.flexDirection || (element.type === 'container' ? 'column' : undefined),
        alignItems: finalStyles.alignItems || (element.type === 'container' ? 'stretch' : undefined),
        gap: finalStyles.gap || finalStyles.gridGap,
        gridTemplateColumns: finalStyles.gridTemplateColumns,
        gridTemplateRows: finalStyles.gridTemplateRows,
        gridAutoFlow: finalStyles.gridAutoFlow,
        gridTemplateAreas: finalStyles.gridTemplateAreas,
        gridArea: finalStyles.gridArea,
        minHeight: finalStyles.height === '100vh' ? 'calc(100vh - 70px)' : (finalStyles.minHeight || (element.type === 'container' ? '100px' : undefined)),
        boxSizing: 'border-box',
        maxWidth: '100%',
        flexShrink: 0
    };


    const motionStyle = {
        ...style,
        ...scrollStyles
    };

    // --- INSTANCE RENDERING ---
    if (element.type === 'instance' && element.componentId) {
        const masterComponent = state.designSystem.components?.find((c: any) => c.id === element.componentId);

        if (!masterComponent) return <div style={{ padding: '20px', border: '1px dashed red', color: 'red' }}>Component Not Found</div>;

        return (
            <div
                ref={elementRef}
                style={{ ...(element.styles as any || {}), position: 'relative' }} // Wrapper for the instance
                onClick={(e) => onSelect(elementId, e)}
            >
                <ElementRenderer
                    elementId={masterComponent.rootElementId}
                    elements={masterComponent.elements}
                    selectedElementId={selectedElementId}
                    onSelect={() => { }}
                    onMove={undefined}
                    instanceContext={{ instanceId: element.id, slotContent: element.slotContent }}
                />
            </div>
        );
    }

    // --- REPEATER RENDERING (Visual ORM) ---
    if (element.type === 'repeater') {
        return (
            <RepeaterRenderer
                element={element}
                state={state}
                onSelect={onSelect}
                onMove={onMove}
                selectedElementId={selectedElementId}
                elements={elements}
                RendererComponent={ElementRenderer} // Inject myself
            />
        );
    }


    if (element.type === 'slot') {
        const slotName = element.slotName || 'content';
        const contentIds = instanceContext?.slotContent?.[slotName];

        if (contentIds && contentIds.length > 0) {
            return (
                <div style={{ ...(element.styles as any), minHeight: '10px' }}>
                    {contentIds.map(childId => (
                        <ElementRenderer
                            key={childId}
                            elementId={childId}
                            elements={state.elements}
                            selectedElementId={selectedElementId}
                            onSelect={onSelect}
                            onMove={onMove}
                        />
                    ))}
                </div>
            );
        }
    }



    // --- FRAMER12: GESTURE DETECTION ---
    // const { fireTrigger } = useLogicEngine(); // Moved to top
    const touchRef = useRef<{ x: number, y: number, time: number, timer: NodeJS.Timeout | null } | null>(null);

    // Helper to get active blueprint (Element's own, or Page's)
    const getBlueprintId = () => {
        if (element.blueprintId) return element.blueprintId;
        // Fallback to Page Blueprint (usually stored on Root Element?)
        // Ideally, LogicEngine should traverse or we pass it down.
        // For MVP, we try root element.
        const pageId = state.activePageId;
        const rootId = state.pages[pageId]?.rootElementId;
        const root = state.elements[rootId];
        return root?.blueprintId;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        const timer = setTimeout(() => {
            // LONG PRESS
            if (touchRef.current) {
                const bpId = getBlueprintId();
                if (bpId) fireTrigger(bpId, 'on_long_press', { targetId: elementId });
                if (navigator.vibrate) navigator.vibrate(50);
                touchRef.current = null; // Consume
            }
        }, 600);

        touchRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
            timer
        };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchRef.current) return;
        if (touchRef.current.timer) clearTimeout(touchRef.current.timer);

        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchRef.current.x;
        const dy = touch.clientY - touchRef.current.y;
        const dt = Date.now() - touchRef.current.time;

        // Swipe Detection (Fast & Significant Move)
        if (dt < 400 && Math.abs(dx) > 40) {
            const bpId = getBlueprintId();
            if (bpId) fireTrigger(bpId, 'on_swipe', { targetId: elementId });
        }

        touchRef.current = null;
    };


    // Lazy load or standard import would work. using dynamic import might be better if circular, but standard is fine mostly.
    // We need to import ResizeHandles.
    // Wait, adding imports needs a separate call or top of file edit. 
    // I will presume ResizeHandles is imported or I'll add the import in a second step if missed.
    // Ah, I cannot add import here easily without file rewrite.
    // I will replace the whole file logic or add import in next step.
    // Actually, I can use require() or just assume I'll fix imports.
    // Let's stick to the plan: Update renderer logic first.

    const commonProps = {
        id: elementId,
        ref: elementRef,
        style: motionStyle,
        onClick: handleSelect,

        // Framer20 Phase 4: Gestures & Smart Animate
        whileHover: state.previewMode ? element.styles?.gestures?.whileHover : undefined,
        whileTap: state.previewMode ? element.styles?.gestures?.whileTap : undefined,
        drag: state.previewMode ? (element.styles?.gestures?.drag || false) : false,
        dragConstraints: element.styles?.gestures?.dragConstraints,
        dragElastic: element.styles?.gestures?.dragElastic,
        dragTransition: element.styles?.gestures?.dragTransition,
        transition: transition,

        onMouseEnter: (e: React.MouseEvent) => {
            setIsHovered(true);
            // Trigger global interaction state for highlighter
            if (element.customCode?.onHover) {
                try {
                    const actions = {
                        navigateTo: (url: string) => window.open(url, '_blank'),
                        scrollTo: (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
                        animate: (targetId: string, animation: any) => { const el = document.getElementById(targetId); if (el) Object.assign(el.style, animation); },
                        console: console
                    };
                    const fn = new Function('el', 'state', 'actions', element.customCode.onHover);
                    fn(elementRef.current, state, actions);
                } catch (e) { console.error(e); }
            }
        },
        onMouseLeave: () => {
            setIsHovered(false);
            setIsActive(false);
        },
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
        onMouseDown: (e: React.MouseEvent) => {
            if (!state.previewMode) {
                handleMouseDown(e);
            } else {
                setIsActive(true);
            }
        },
        onMouseUp: () => setIsActive(false),
        tabIndex: state.previewMode ? 0 : undefined, // Make focusable in preview
        // Framer12: Mobile Gestures
        onTouchStart: (e: React.TouchEvent) => {
            if (state.previewMode || nativeMode) {
                handleTouchStart(e);
            }
        },
        onTouchEnd: (e: React.TouchEvent) => {
            if (state.previewMode || nativeMode) {
                handleTouchEnd(e);
            }
        }
    };


    // --- FRAMER20: VECTOR RENDERING (MOVED) ---
    if (element.type === 'vector') {
        const d = element.content || '';
        return (
            <motion.div
                {...(commonProps as any)}
                ref={elementRef}
                style={motionStyle}
                onClick={handleSelect}
                onMouseDown={handleMouseDown}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${parseFloat(element.styles?.widthVal || '100')} ${parseFloat(element.styles?.heightVal || '100')}`}
                    style={{ overflow: 'visible' }}
                >
                    <path
                        d={d}
                        fill={(element as any).customProperties?.fill || '#00ff96'}
                        stroke={(element as any).customProperties?.stroke || 'none'}
                        strokeWidth={(element as any).customProperties?.strokeWidth || 1}
                    />
                </svg>
            </motion.div>
        );
    }

    const Tag = (element.tagName as any) || 'div';
    const MotionTag = motion(Tag);

    // --- RENDER CONTENT BY TYPE ---
    let content: React.ReactNode = null;

    // STATIC MODE: Render plain HTML without listeners or motion wrappers
    if (state.staticMode) {
        if (element.type === 'text' || element.type === 'button' || element.type === 'label') {
            const textContent = renderSplitText(resolveBinding('content', element.content || 'Text'));
            content = (
                <Tag style={motionStyle} className={resolvedElement.classNames?.join(' ') || ''}>
                    {textContent}
                </Tag>
            );
        }
        // For other types, we might need similar unwrapping or they handle themselves.
        // But for now, let's just handle text/basic nodes here to prove the concept.
        // If content is null, it falls through to specific renderers below which might need updates too.
        // Actually, specific renderers return `content`. We need to wrap that `content` in a non-motion tag at the end?
        // No, the `return` statement at the VERY END of the component converts `content` element wrappers.
        // I should target THAT return statement.
    }

    if (!state.staticMode && (element.type === 'text' || element.type === 'button' || element.type === 'label')) {
        const textContent = renderSplitText(resolveBinding('content', element.content || 'Text'));

        if (state.editingElementId === elementId) {
            content = (
                <span
                    contentEditable
                    suppressContentEditableWarning
                    style={{ outline: 'none', minWidth: '10px', display: 'inline-block', cursor: 'text' }}
                    onBlur={(e) => {
                        setEditingElementId(null);
                        updateElementProp(elementId, 'content', e.currentTarget.textContent);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            setEditingElementId(null);
                        }
                    }}
                >
                    {element.content}
                </span>
            );
        } else {
            content = (
                <MotionTag
                    {...commonProps}
                    style={motionStyle}
                    onDoubleClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setEditingElementId(elementId);
                    }}
                >
                    {/* Framer9: Grain/Noise Texture Overlay */}
                    {finalStyles.texture && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            pointerEvents: 'none',
                            opacity: 0.15,
                            mixBlendMode: 'overlay',
                            zIndex: 0,
                            backgroundImage: finalStyles.texture === 'noise'
                                ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                                : `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                        }} />
                    )}

                    {textContent}
                </MotionTag>
            );
        }
    } else if (state.staticMode && (element.type === 'text' || element.type === 'button' || element.type === 'label')) {
        // Fallback for static mode text
        const textContent = renderSplitText(resolveBinding('content', element.content || 'Text'));
        content = (
            <Tag style={motionStyle} className={resolvedElement.classNames?.join(' ') || ''}>
                {textContent}
            </Tag>
        );
    } else if (element.type === 'custom-code') {
        const { code, exposedProps } = element.customCode || { code: '' };
        content = (
            <CustomCodeBox
                id={element.id}
                code={code || ''}
                exposedProps={exposedProps}
                styles={{ width: '100%', height: '100%', ...element.styles }}
                className=""
            />
        );
    } else if (element.type === 'video') {
        content = (
            <video
                src={resolveBinding('src', element.media?.src || element.content)}
                poster={element.media?.poster}
                controls={element.media?.controls !== false}
                autoPlay={element.media?.autoplay}
                loop={element.media?.loop}
                muted={element.media?.muted}
                playsInline
                style={{ width: '100%', height: '100%', objectFit: ((element.styles?.objectFit) as any) || 'cover', pointerEvents: state.previewMode ? 'auto' : 'none' }}
            />
        );
    } else if (element.type === 'audio') {
        content = (
            <audio
                src={element.media?.src || element.content}
                controls={element.media?.controls !== false}
                autoPlay={element.media?.autoplay}
                loop={element.media?.loop}
                muted={element.media?.muted}
                style={{ width: '100%', pointerEvents: state.previewMode ? 'auto' : 'none' }}
            />
        );
    } else if (element.type === 'image') {
        const alt = element.altText || 'Element';
        const blurDataURL = element.media?.blurDataURL;
        const width = element.styles?.width || '100%';
        const isExternal = resolveBinding('src', element.content || '')?.startsWith('http');

        content = (
            (resolveBinding('src', element.content)?.startsWith('http') || resolveBinding('src', element.content)?.startsWith('/')) ?
                <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <HybridImage
                        src={getDynamicAssetUrl({ url: resolveBinding('src', element.content || ''), isOptimized: false } as any)}
                        alt={alt}
                        style={{ width: '100%', height: '100%', objectFit: (element.styles?.objectFit as any) || 'cover' }}
                        fallbackColors={['#1a1a1a', '#333']}
                    />
                </div> :
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333', fontSize: '2rem' }}>{resolveBinding('content', element.content) || '🖼️'}</div>
        );
    } else if (element.type === 'icon') {
        const IconComponent = IconRegistry[element.content || 'Home'] || IconRegistry.HelpCircle;
        content = <IconComponent size={element.styles?.fontSize || element.styles?.width || 24} color={element.styles?.color || 'white'} />;
    } else if (element.type === 'embed') {
        content = <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: sanitize(element.content || '') }} />;
    } else if (element.type === 'input') {
        content = (
            <input
                type={element.inputType || 'text'}
                placeholder={element.placeholder || 'Placeholder...'}
                name={element.name}
                required={element.required}
                readOnly={!state.previewMode}
                style={{
                    width: '100%',
                    height: '100%',
                    padding: '10px',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    pointerEvents: state.previewMode ? 'auto' : 'none'
                }}
                onBlur={(e) => {
                    if (state.previewMode && !e.target.value) {
                        logAnalyticsEvent({
                            type: 'form_abandon',
                            pageId: state.activePageId,
                            elementId: element.id,
                            metadata: { field: element.name || 'input' }
                        });
                    }
                }}
            />
        );
    } else if (element.type === 'textarea') {
        content = (
            <textarea
                placeholder={element.placeholder || 'Type here...'}
                name={element.name}
                required={element.required}
                readOnly={!state.previewMode}
                style={{
                    width: '100%',
                    height: '100%',
                    padding: '10px',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    pointerEvents: state.previewMode ? 'auto' : 'none',
                    resize: 'none',
                    fontFamily: 'inherit'
                }}
                onBlur={(e) => {
                    if (state.previewMode && !e.target.value) {
                        logAnalyticsEvent({
                            type: 'form_abandon',
                            pageId: state.activePageId,
                            elementId: element.id,
                            metadata: { field: element.name || 'textarea' }
                        });
                    }
                }}
                onClick={handlePreviewClick}
            />
        );
    } else if (element.type === 'lottie') {
        content = (
            <iframe
                src={`https://embed.lottiefiles.com/animation/${element.content || '12345'}`}
                style={{ width: '100%', height: '100%', border: 'none', pointerEvents: state.previewMode ? 'auto' : 'none' }}
                title="Lottie Animation"
            />
        );
    } else if (element.type === 'select') {
        content = (
            <select
                disabled={!state.previewMode}
                style={{
                    width: '100%',
                    height: '100%',
                    padding: '10px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid #444',
                    color: 'white',
                    borderRadius: '4px',
                    outline: 'none',
                    pointerEvents: state.previewMode ? 'auto' : 'none'
                }}
            >
                {element.options?.map((opt, i) => <option key={i} value={opt.value} style={{ backgroundColor: '#111' }}>{opt.label}</option>)}
                {(!element.options || element.options.length === 0) && <option>No Options</option>}
            </select>
        );
    } else if (element.type === 'checkbox' || element.type === 'radio') {
        content = (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                    type={element.type}
                    name={element.name}
                    required={element.required}
                    readOnly={!state.previewMode}
                    style={{ width: '18px', height: '18px', cursor: state.previewMode ? 'pointer' : 'default' }}
                />
                <span>{resolvedElement.content || 'Label'}</span>
            </div>
        );
    } else if (element.type === 'pay-button') {
        content = (
            <button
                {...(commonProps as any)}
                style={{
                    ...motionStyle,
                    padding: '12px 24px',
                    backgroundColor: '#111',
                    color: 'white',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}
                onClick={() => alert(`Stripe Checkout for ${element.commerce?.productId || 'item'}`)}
            >
                <IconRegistry.CreditCard size={18} /> {resolvedElement.content || 'Buy Now'}
            </button>
        );
    } else if (resolvedElement.type === 'auth-wall') {
        content = (
            <div
                {...(commonProps as any)}
                style={{
                    ...motionStyle,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    textAlign: 'center',
                    gap: '20px'
                }}
            >
                <div style={{ padding: '20px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: '10px' }}>
                    <IconRegistry.Lock size={40} color="var(--accent-teal)" />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 10px 0' }}>Member Access</h2>
                    <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>Please sign in to view this content.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
                    <button style={{ padding: '12px', backgroundColor: 'var(--accent-teal)', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
                    <button style={{ padding: '12px', backgroundColor: 'transparent', color: 'white', border: '1px solid #444', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Create Account</button>
                </div>
            </div>
        );
    } else if (resolvedElement.type === 'login-form' || resolvedElement.type === 'signup-form') {
        const isLogin = resolvedElement.type === 'login-form';
        const handleAuth = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!state.previewMode) return;
            setAuthLoading(true);
            setAuthError(null);
            try {
                if (isLogin) {
                    await login(authEmail, authPassword);
                } else {
                    await signUp(authEmail, authPassword);
                }
            } catch (err: any) {
                setAuthError(err.message || 'Authentication failed');
            } finally {
                setAuthLoading(false);
            }
        };

        content = (
            <form
                onSubmit={handleAuth}
                {...(commonProps as any)}
                style={{
                    ...motionStyle,
                    padding: '32px',
                    backgroundColor: '#0a0a0a',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--accent-teal)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                        {isLogin ? <IconRegistry.Lock size={20} color="black" /> : <IconRegistry.Plus size={20} color="black" />}
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{isLogin ? 'Sign In' : 'Create Account'}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Welcome back to OMNIOS</p>
                </div>

                {authError && (
                    <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '0.75rem' }}>
                        {authError}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>Email</label>
                    <input
                        type="email"
                        placeholder="you@domain.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        required
                        disabled={!state.previewMode || authLoading}
                        style={{ padding: '12px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        required
                        disabled={!state.previewMode || authLoading}
                        style={{ padding: '12px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!state.previewMode || authLoading}
                    style={{
                        padding: '12px',
                        backgroundColor: 'var(--accent-teal)',
                        color: 'black',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: state.previewMode ? 'pointer' : 'default',
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    {authLoading ? <IconRegistry.RefreshCw size={16} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
            </form>
        );
    } else if (resolvedElement.type === 'logout-button') {
        content = (
            <button
                {...(commonProps as any)}
                onClick={async (e) => {
                    handleSelect(e);
                    if (state.previewMode) {
                        await logout();
                    }
                }}
                style={{
                    ...motionStyle,
                    padding: '10px 20px',
                    backgroundColor: 'rgba(255, 50, 50, 0.1)',
                    color: '#ff4d4d',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 50, 50, 0.2)',
                    cursor: state.previewMode ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <IconRegistry.X size={16} /> {resolvedElement.content || 'Sign Out'}
            </button>
        );
    } else if (resolvedElement.type === 'accordion') {
        content = (
            <div style={{ width: '100%', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                <div
                    onClick={() => state.previewMode && setIsExpanded(!isExpanded)}
                    style={{ padding: '15px', backgroundColor: '#111', cursor: state.previewMode ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <span style={{ fontWeight: 'bold' }}>{resolvedElement.content || 'Accordion Title'}</span>
                    <motion.span animate={{ rotate: isExpanded ? 180 : 0 }}>▼</motion.span>
                </div>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ padding: '20px', borderTop: '1px solid #222' }}>
                                {resolvedElement.children?.map(childId => (
                                    <ElementRenderer
                                        key={childId}
                                        elementId={childId}
                                        elements={elements}
                                        selectedElementId={selectedElementId}
                                        onSelect={onSelect}
                                        onMove={onMove}
                                        instanceContext={instanceContext}
                                    />
                                ))}
                                {(!resolvedElement.children || resolvedElement.children.length === 0) && (
                                    <div style={{ color: '#666', fontSize: '0.8rem' }}>Accordion Content (Add elements here)</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    } else if (resolvedElement.type === 'tabs') {
        content = (
            <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #333', gap: '5px' }}>
                    {['Tab 1', 'Tab 2', 'Tab 3'].map((label, i) => (
                        <button
                            key={i}
                            onClick={() => state.previewMode && setActiveTab(i)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: activeTab === i ? '#222' : 'transparent',
                                border: 'none',
                                color: activeTab === i ? 'var(--accent-teal)' : '#666',
                                borderBottom: activeTab === i ? '2px solid var(--accent-teal)' : 'none',
                                cursor: state.previewMode ? 'pointer' : 'default',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div style={{ padding: '20px' }}>
                    Active Content for Tab {activeTab + 1}
                    {/* Future: Render children assigned to tabs */}
                </div>
            </div>
        );
    } else if (resolvedElement.type === 'navbar' && (!resolvedElement.children || resolvedElement.children.length === 0)) {
        content = (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontStyle: 'italic', width: '100%', textAlign: 'center' }}>
                Navbar (Add Logo & Links)
            </div>
        );
    }

    const aiButtonStyle: React.CSSProperties = {
        padding: '6px 10px',
        backgroundColor: 'rgba(0,255,150,0.15)',
        color: 'var(--accent-teal)',
        border: '1px solid rgba(0,255,150,0.3)',
        borderRadius: '6px',
        cursor: isAILoading ? 'wait' : 'pointer',
        fontSize: '10px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.2s ease',
        boxShadow: '0 0 10px rgba(0,255,150,0.1)',
        backdropFilter: 'blur(5px)'
    };

    // Framer8: Custom Component Rendering
    if (resolvedElement.customCode?.componentName === 'CustomerDashboard') {
        content = <CustomerDashboard className={resolvedElement.classNames?.join(' ') || ''} />;
    }
    // Framer9: Lush UI Components
    else if (resolvedElement.customCode?.componentName === 'Marquee') {
        content = (
            <Marquee speed={20} direction="left" className={resolvedElement.classNames?.join(' ') || ''}>
                {/* Normally we'd render children slots here, for now dummy text */}
                <span style={{ fontSize: '4rem', fontWeight: 'bold', marginRight: '50px', color: 'rgba(255,255,255,0.1)' }}>OMNI</span>
                <span style={{ fontSize: '4rem', fontWeight: 'bold', marginRight: '50px', color: 'rgba(255,255,255,0.5)' }}>OS</span>
                <span style={{ fontSize: '4rem', fontWeight: 'bold', marginRight: '50px', color: 'var(--accent-teal)' }}>DESIGN</span>
                <span style={{ fontSize: '4rem', fontWeight: 'bold', marginRight: '50px', color: 'white' }}>FUTURE</span>
            </Marquee>
        );
    }
    else if (resolvedElement.customCode?.componentName === 'ParallaxSection') {
        content = (
            <ParallaxSection
                backgroundImage={resolvedElement.media?.src || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80"}
                speed={0.3}
                className={resolvedElement.classNames?.join(' ') || ''}
                style={{ height: '100%' }}
            >
                {/* Render children inside if they existed in the component definition */}
                <h1 style={{ fontSize: '5rem', fontWeight: '900', textAlign: 'center', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    PARALLAX
                </h1>
            </ParallaxSection>
        );
    }
    else if (resolvedElement.customCode?.componentName === 'RevealImage') {
        content = (
            <RevealImage
                src={resolvedElement.media?.src || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80"}
                revealEffect="liquid"
                className={resolvedElement.classNames?.join(' ') || ''}
            />
        );
    }

    // Framer9: 3D Tilt Logic
    const handleTiltMove = (e: React.MouseEvent) => {
        if (element.interaction !== 'tilt') return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
        const rotateY = ((x - centerX) / centerX) * 10;

        (e.currentTarget as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleTiltLeave = (e: React.MouseEvent) => {
        if (element.interaction !== 'tilt') return;
        (e.currentTarget as HTMLElement).style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    };

    if (state.staticMode) {
        return (
            <Tag
                id={elementId}
                ref={elementRef}
                data-testid="designer-element"
                className={resolvedElement.classNames?.join(' ') || ''}

                style={{
                    ...motionStyle,
                    position: motionStyle.position === 'absolute' ? 'absolute' : (motionStyle.position || 'relative')
                }}
            >
                {content}
            </Tag>
        );
    }

    return (
        <MotionTag
            id={elementId}
            ref={elementRef}
            data-testid="designer-element"
            className={resolvedElement.classNames?.join(' ') || ''}

            layout={state.previewMode && finalStyles.magicMotion} // Enable Magic Motion if explicitly turned on
            layoutId={state.previewMode ? elementId : undefined} // Cross-page ID matching for Magic Motion
            variants={motionVariants}


            whileHover={
                !state.dragState.isDragging &&
                    element.interaction !== 'tilt' && // Disable std hover if tilt active
                    state.previewMode
                    ? "hover"
                    : undefined
            }
            whileTap={!state.dragState.isDragging && state.previewMode ? "click" : undefined}



            style={{
                ...finalStyles,
                // Framer9: Glassmorphism Support
                backdropFilter: finalStyles.backdropFilter,
                WebkitBackdropFilter: finalStyles.backdropFilter,

                // Layout
                display: element.type === 'text' ? 'block' : (finalStyles.display || 'flex'),
                flexDirection: finalStyles.flexDirection || (element.type === 'container' ? 'column' : undefined),
                alignItems: finalStyles.alignItems || (element.type === 'container' ? 'stretch' : undefined),
                gap: finalStyles.gap || finalStyles.gridGap,

                // Position
                position: element.layoutMode === 'freedom' ? 'absolute' : (finalStyles.position || 'relative'),
                left: element.layoutMode === 'freedom' ? finalStyles.left : undefined,
                top: element.layoutMode === 'freedom' ? finalStyles.top : undefined,
                gridColumn: finalStyles.gridColumn,
                gridRow: finalStyles.gridRow,

                // 3D Transform Defaults
                transformStyle: element.interaction === 'tilt' ? 'preserve-3d' : undefined,
                transition: element.interaction === 'tilt' ? 'transform 0.1s ease-out' : finalStyles.transition,
            }}

            // Framer9: Grain/Noise Texture Overlay
            animate={hasAppeared ? (
                state.previewMode ?
                    (isHovered ? 'hover' : (isActive ? 'active' : (isFocused ? 'focus' : animationVariant.animate)))
                    : state.activeState
            ) : animationVariant.initial}

            transition={transition}
            onMouseEnter={(e: React.MouseEvent) => {
                setIsHovered(true);
                if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.outline = '1px solid var(--accent-teal)';
                }
                // PHASE 3: onHover Hook
                if (state.previewMode && resolvedElement.customCode?.onHover) {
                    try {
                        const actions = {
                            navigateTo: (url: string) => window.open(url, '_blank'),
                            scrollTo: (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
                            animate: (targetId: string, animation: any) => {
                                const el = document.getElementById(targetId);
                                if (el) Object.assign(el.style, animation);
                            },
                            console: console
                        };

                        const fn = new Function('el', 'state', 'actions', resolvedElement.customCode.onHover);
                        fn(elementRef.current, state, actions);
                    } catch (err) {
                        console.error('Error in onHover hook:', err);
                    }
                }
            }}
            onMouseLeave={(e: React.MouseEvent) => {
                if (state.previewMode && element.interaction === 'tilt') handleTiltLeave(e);
                setIsHovered(false);
                if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.outline = 'none';
                }
            }}
            onClick={async (e: React.MouseEvent) => {
                e.stopPropagation();
                if (!state.previewMode) {
                    onSelect(elementId, e);
                    return;
                }

                // Framer8: Checkout Trigger
                if (element.interaction === 'checkout-trigger') {
                    const result = await initiateStripeCheckout(state.cart);
                    if (result.success) {
                        alert(`Redirecting to Stripe: ${result.sessionUrl}`);
                    } else {
                        alert(`Checkout Failed: ${result.error}`);
                    }
                }

                // Custom Logic Interaction
                fireTrigger(elementId, 'on_click');

                // Framer19: Click Tracking
                handlePreviewClick(e);
            }}
        >
            {isSelected && (
                <>
                    {/* Toolbar */}
                    {resolvedElement.id !== 'root' && document.getElementById(resolvedElement.parentId || '')?.dataset.type !== 'root' && (
                        <div style={{
                            position: 'absolute',
                            top: '-40px',
                            right: '0',
                            display: 'flex',
                            gap: '5px',
                            zIndex: 1000,
                            pointerEvents: 'auto'
                        }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => toggleLayoutMode(elementId)}
                                title="Toggle Layout Mode"
                                style={{
                                    padding: '6px',
                                    backgroundColor: resolvedElement.layoutMode === 'freedom' ? 'var(--accent-gold)' : '#222',
                                    color: resolvedElement.layoutMode === 'freedom' ? 'black' : 'white',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                {resolvedElement.layoutMode === 'freedom' ? '🔓' : '🔒'}
                            </button>

                            {/* AI Refinement Tools */}
                            {resolvedElement.type === 'text' && (
                                <button
                                    onClick={handleRefineText}
                                    disabled={isAILoading}
                                    title="Refine Copy with AI ✨"
                                    style={aiButtonStyle}
                                >
                                    <IconRegistry.Sparkles size={12} /> {isAILoading ? '...' : 'AI'}
                                </button>
                            )}
                            {element.type === 'image' && (
                                <button
                                    onClick={handleMagicImage}
                                    disabled={isAILoading}
                                    title="Magic Image ✨"
                                    style={aiButtonStyle}
                                >
                                    <IconRegistry.Zap size={12} /> {isAILoading ? '...' : 'GEN'}
                                </button>
                            )}
                            {element.layoutMode === 'freedom' && element.children && element.children.length > 0 && (
                                <button
                                    onClick={() => convertToSafety(elementId)}
                                    title="Magic Convert to Responsive (Flex)"
                                    style={{
                                        padding: '6px',
                                        backgroundColor: 'var(--accent-teal)',
                                        color: 'black',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ✨
                                </button>
                            )}
                            <button
                                onClick={() => removeElement(elementId)}
                                title="Delete Element"
                                style={{
                                    padding: '6px',
                                    backgroundColor: '#ff4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                🗑️
                            </button>
                        </div>
                    )}
                    {/* Smart Guides */}
                    {activeGuides.length > 0 && <SmartGuides guides={activeGuides} suggestedRect={suggestedRect} />}

                    {/* Resize Handles */}
                    <ResizeHandles onResizeStart={handleResizeStart} />

                    {/* Dimensions Tooltip */}
                    {resizeDimensions && (
                        <div style={{
                            position: 'absolute',
                            bottom: '-40px', // Below the element
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#000',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            zIndex: 2000,
                            pointerEvents: 'none',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}>
                            {resizeDimensions.w} x {resizeDimensions.h}
                        </div>
                    )}

                    {/* Intent Guessing Helper (Logic-Lock) */}
                    {intent !== 'none' && (
                        <div style={{
                            position: 'absolute',
                            top: intent === 'wrap-col' ? '100%' : '50%',
                            left: intent === 'wrap-row' ? '100%' : '50%',
                            transform: intent === 'wrap-col' ? 'translateY(10px)' : intent === 'wrap-row' ? 'translateX(10px)' : 'translate(-50%, -50%)',
                            width: 'fit-content',
                            padding: '8px 12px',
                            backgroundColor: 'rgba(0, 255, 213, 0.2)',
                            border: '1px solid #00ffd5',
                            boxShadow: '0 0 20px rgba(0, 255, 213, 0.4)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '9px',
                            color: '#00ffd5',
                            fontWeight: '800',
                            pointerEvents: 'none',
                            zIndex: 999,
                            backdropFilter: 'blur(8px)',
                            whiteSpace: 'nowrap'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                <IconRegistry.Zap size={10} fill="currentColor" />
                                <span style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Logic-Lock</span>
                            </div>
                            <span style={{ fontSize: '11px' }}>{intent === 'wrap-col' ? 'Commit to Vertical Stack' : 'Commit to Horizontal Row'}</span>
                        </div>
                    )}
                </>
            )
            }
            {content}
            {
                element.children?.map((childId, index) => (
                    <React.Fragment key={childId}>
                        <ElementRenderer
                            elementId={childId}
                            elements={elements}
                            selectedElementId={selectedElementId}
                            onSelect={onSelect}
                            onMove={onMove}
                            instanceContext={instanceContext}
                        />
                        {!state.previewMode && element.layoutMode === 'safety' && index < (element.children?.length || 0) - 1 && (
                            <GapHandle
                                containerId={elementId}
                                index={index}
                                isVertical={element.styles?.flexDirection === 'column'}
                                onUpdate={updateGap}
                            />
                        )}
                    </React.Fragment>
                ))
            }
        </MotionTag >
    );

}
