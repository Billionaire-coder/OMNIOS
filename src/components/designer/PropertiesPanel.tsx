
import React from 'react';
import { DesignerElement, LayoutMode, ElementStyles, TokenType } from '@/types/designer';
import { useProjectStore } from '@/hooks/useProjectStore';
import { ClassSelector } from './controls/ClassSelector'; // NEW
import { ClassBreadcrumbs } from './controls/ClassBreadcrumbs'; // Batch 4.3
import { UnitInput } from './controls/UnitInput';
import { BoxModelEditor } from './controls/BoxModelEditor';
import { ShadowEditor } from './controls/ShadowEditor';
import { FilterEditor } from './controls/FilterEditor';
import { AdvancedBorderEditor } from './controls/AdvancedBorderEditor';
import { GradientPicker } from './controls/GradientPicker';
// NEW
import { StatePanel } from './controls/StatePanel'; // NEW
import { ColorInput } from './controls/ColorInput';
import { SelectInput } from './controls/SelectInput';
import {
    X, Database, Link, MousePointer2, Trash2, LayoutTemplate, AlignHorizontalSpaceBetween, Grid, EyeOff,
    ArrowRight, ArrowDown, ExternalLink, List, AlignVerticalJustifyStart, AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd, AlignHorizontalJustifyCenter, AlignHorizontalJustifyStart, AlignHorizontalJustifyEnd,
    Type, CaseUpper, CaseLower, Home, User, Settings, Search, Menu, ShoppingCart, Star, Heart,
    ChevronDown, ChevronRight, Check, Instagram, Twitter, Facebook, Linkedin, Zap, Sparkles, Wand2, Terminal, Brain, Image as ImageIcon, Plus, Globe, Activity
} from 'lucide-react';
import { ComputedStyleInspector } from './debug/ComputedStyleInspector';
import { AuditLogPanel } from './debug/AuditLogPanel';
import { cleanupLayout } from '@/lib/intelligence/layoutEngine';
import { PhysicsHUD } from './controls/PhysicsHUD';
// import * as Popover from '@radix-ui/react-popover'; 

interface PropertiesPanelProps {
    selectedElement: DesignerElement | null;
    selectedElements: DesignerElement[]; // NEW: Support for batch editing
    updateElementStyles: (id: string, styles: any) => void;
    toggleLayoutMode: (id: string) => void;
    removeElement: (id: string) => void;
    setState: (update: any) => void;
    createMasterComponent: (elementId: string, name: string) => void;
    openAssetVault: (onSelect: (asset: any) => void) => void;
    openTimeline?: () => void;
    openBlueprint?: (id: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
    selectedElement, selectedElements, updateElementStyles, toggleLayoutMode, removeElement, setState,
    createMasterComponent, openAssetVault, openTimeline, openBlueprint
}) => {
    if (!selectedElement) {
        return (
            <div className="glass" style={{ width: '320px', height: '100%', padding: '20px', borderLeft: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.3 }}>👆</div>
                <p>Select an element to edit</p>
                <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>Click any item on the canvas</p>
            </div>
        );
    }

    // Custom Code Editor Overlay
    if (selectedElement.type === 'custom-code') {
        // We must define these hooks here or outside, but hooks can't run conditionally.
        // However, "selectedElement" changes. The hooks for ProjectStore ran above line 53.
        // Wait, hooks like useState below...
        // PropertiesPanel has hooks at line 73. If I return early here, I break Rules of Hooks if those hooks haven't run.
        // My previous attempt placed it LATER, around line 640.
        // Let's place it deeper, inside the return or just render a different component?
        // No, simpler: check type inside the MAIN RENDER block.
    }

    const { state, updateElementProp, createClass, applyClass, addComponentProp, deleteComponentProp, setInstancePropValue, setElementCode, setHighlightedControl, setActiveState, updateClass, setEditingClassId, bulkUpdateElements, createBlueprint, setVariableBinding, setWorkspaceMode } = useProjectStore();

    // Helper: Find which Component Instance this element belongs to
    // We walk up the tree until we find an element with 'componentId'
    // Returns the element that IS the instance root, and the Master Definition
    const getComponentContext = (element: DesignerElement) => {
        let current = element;
        while (current) {
            if (current.componentId) {
                // Found an Instance Root
                const master = state.designSystem.components?.find(c => c.id === current.componentId);
                return { instanceRoot: current, master };
            }
            if (!current.parentId) break;
            current = state.elements[current.parentId];
        }
        return { instanceRoot: null, master: null };
    };

    const componentContext = getComponentContext(selectedElement);
    const [activeTab, setActiveTab] = React.useState<'style' | 'settings' | 'code' | 'interactions'>('style');

    // Design System Helper
    const [isCreatingClass, setIsCreatingClass] = React.useState(false);
    const [newClassName, setNewClassName] = React.useState('');

    // Component Prop Helper
    const [newPropName, setNewPropName] = React.useState('');
    const [newPropType, setNewPropType] = React.useState('text');
    const [newPropDef, setNewPropDef] = React.useState('');
    const [showPhysicsHUD, setShowPhysicsHUD] = React.useState(false);

    const handleCreateClass = () => {
        if (!newClassName.trim() || !selectedElement) return;
        createClass(newClassName, selectedElement.styles || {});
        setIsCreatingClass(false);
        setNewClassName('');
    };

    const handleUpdateStyles = (updates: any) => {
        if (state.editingClassId) {
            updateClass(state.editingClassId, updates);
            return;
        }

        // Framer11: Phase 3 - Shared Component Overrides
        // Identify if we are editing a single instance that needs overrides
        const isInstance = selectedElement && selectedElement.masterComponentId && selectedElements.length <= 1;

        if (isInstance) {
            // Write to Sync-aware "overrides" field
            const currentOverrides = selectedElement.overrides || {};
            const currentStyleOverrides = currentOverrides.styles || {};

            // Merge new updates into existing style overrides
            const newStyleOverrides = { ...currentStyleOverrides, ...updates };

            const newOverrides = {
                ...currentOverrides,
                styles: newStyleOverrides
            };

            // Patch via setState to update 'overrides'
            setState((prev: any) => ({
                ...prev,
                elements: {
                    ...prev.elements,
                    [selectedElement.id]: {
                        ...prev.elements[selectedElement.id],
                        overrides: newOverrides
                    }
                }
            }));
            return;
        }

        // BATCH UPDATE
        if (selectedElements.length > 0) {
            selectedElements.forEach(el => {
                updateElementStyles(el.id, updates);
            });
        } else if (selectedElement) {
            updateElementStyles(selectedElement.id, updates);
        }
    };

    const handleChange = (key: keyof ElementStyles, value: any) => {
        handleUpdateStyles({ [key]: value });
    };

    const handleMagicCleanup = () => {
        if (!selectedElement) return;
        const children = selectedElement.children?.map(id => state.elements[id]).filter(Boolean) || [];
        const updates = cleanupLayout(selectedElement, children);
        bulkUpdateElements(updates);
    };

    // Resolve current styles to display based on context
    const getActiveStyles = () => {
        // If editing a Class, return class styles
        if (state.editingClassId) {
            const cls = state.designSystem.classes.find(c => c.id === state.editingClassId);
            if (cls) {
                const base = cls.styles || {};
                const tablet = cls.tabletStyles || {};
                const mobile = cls.mobileStyles || {};
                const hover = cls.hoverStyles || {};
                const active = cls.activeStyles || {};
                const focus = cls.focusStyles || {};

                let current = { ...base };
                if (state.viewMode === 'tablet') current = { ...current, ...tablet };
                if (state.viewMode === 'mobile') current = { ...current, ...mobile };

                if (state.activeState === 'hover') current = { ...current, ...hover };
                if (state.activeState === 'active') current = { ...current, ...active };
                if (state.activeState === 'focus') current = { ...current, ...focus };
                return current;
            }
        }

        const base = selectedElement.styles || {};
        const tablet = selectedElement.tabletStyles || {};
        const mobile = selectedElement.mobileStyles || {};
        const hover = selectedElement.hoverStyles || {};
        const active = selectedElement.activeStyles || {};
        const focus = selectedElement.focusStyles || {};

        let current = { ...base };
        if (state.viewMode === 'tablet') current = { ...current, ...tablet };
        if (state.viewMode === 'mobile') current = { ...current, ...mobile };

        if (state.activeState === 'hover') current = { ...current, ...hover };
        if (state.activeState === 'active') current = { ...current, ...active };
        if (state.activeState === 'focus') current = { ...current, ...focus };

        return current;
    };

    const s = getActiveStyles();

    const isPropertyOverridden = (prop: string | string[]) => {
        const props = Array.isArray(prop) ? prop : [prop];
        return props.some(p => {
            if (state.activeState !== 'none') {
                const stateStyles = selectedElement[`${state.activeState} Styles` as keyof DesignerElement] as any;
                return stateStyles && stateStyles[p] !== undefined;
            }
            if (state.viewMode === 'mobile') {
                return selectedElement.mobileStyles && (selectedElement.mobileStyles as any)[p] !== undefined;
            }
            if (state.viewMode === 'tablet') {
                return selectedElement.tabletStyles && (selectedElement.tabletStyles as any)[p] !== undefined;
            }
            return false;
        });
    };

    const editingClass = state.editingClassId ? state.designSystem.classes.find(c => c.id === state.editingClassId) : null;

    const InputGroup = ({ label, propNames, children, bindableProp }: { label: string, propNames?: string | string[], children: React.ReactNode, bindableProp?: string }) => {
        const overridden = propNames ? isPropertyOverridden(propNames) : false;
        return (
            <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.65rem',
                            color: overridden ? 'var(--accent-teal)' : 'var(--text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: '600'
                        }}>
                            {label}
                        </label>
                        {overridden && (
                            <div title="Overridden in current state/breakpoint" style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)', boxShadow: '0 0 5px var(--accent-teal)' }} />
                        )}
                    </div>
                    {bindableProp && (
                        <div style={{ position: 'relative' }}>
                            <BindingPopover propName={bindableProp} />
                        </div>
                    )}
                </div>
                {children}
            </div>
        );
    };

    const [activeBindingProp, setActiveBindingProp] = React.useState<string | null>(null);

    const BindingPopover = ({ propName }: { propName: string }) => {
        const isCollectionBound = state.selectedElementId && state.elements[state.selectedElementId]?.bindings?.[propName];
        const isVariableBound = state.selectedElementId && state.elements[state.selectedElementId]?.variableBindings?.[propName];
        const isBound = isCollectionBound || isVariableBound;

        if (activeBindingProp !== propName) return (
            <button
                onClick={() => setActiveBindingProp(propName)}
                style={{
                    padding: '2px',
                    color: isBound ? 'var(--accent-teal)' : '#444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                }}
                title="Connect to CMS Data"
            >
                <Database size={10} />
            </button>
        );

        return (
            <div className="glass" style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                zIndex: 200,
                width: '180px',
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '6px',
                padding: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.6rem', color: '#888', fontWeight: 'bold' }}>BINDING: {propName.toUpperCase()}</span>
                    <button onClick={() => setActiveBindingProp(null)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><X size={10} /></button>
                </div>

                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                        onClick={() => {
                            if (isCollectionBound) setVariableBinding(selectedElement.id, propName, null, 'collection');
                            if (isVariableBound) setVariableBinding(selectedElement.id, propName, null, 'variable');
                            setActiveBindingProp(null);
                        }}
                        style={{ padding: '6px', textAlign: 'left', fontSize: '0.7rem', color: '#ff4444', backgroundColor: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        None (Static Value)
                    </button>

                    {state.data.collections.map(c => (
                        <div key={c.id} style={{ marginTop: '4px' }}>
                            <div style={{ fontSize: '0.55rem', color: '#555', padding: '2px 6px', textTransform: 'uppercase' }}>{c.name}</div>
                            {c.fields.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => { setVariableBinding(selectedElement.id, propName, f.id, 'collection'); setActiveBindingProp(null); }}
                                    style={{
                                        width: '100%', padding: '6px', textAlign: 'left', fontSize: '0.7rem',
                                        color: isBound === f.id ? 'var(--accent-teal)' : '#ccc',
                                        backgroundColor: isBound === f.id ? 'rgba(0,255,150,0.1)' : 'transparent',
                                        border: 'none', borderRadius: '4px', cursor: 'pointer'
                                    }}
                                >
                                    {f.name} <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>({f.type})</span>
                                </button>
                            ))}
                        </div>
                    ))}

                    <div style={{ height: '1px', backgroundColor: '#222', margin: '5px 0' }}></div>
                    <div style={{ fontSize: '0.55rem', color: '#555', padding: '2px 6px', textTransform: 'uppercase' }}>Project Variables</div>
                    {Object.values(state.globalVariables).map(v => (
                        <button
                            key={v.id}
                            onClick={() => {
                                setVariableBinding(selectedElement.id, propName, v.name, 'variable');
                                setActiveBindingProp(null);
                            }}
                            style={{
                                width: '100%', padding: '6px', textAlign: 'left', fontSize: '0.7rem',
                                color: state.elements[selectedElement.id]?.variableBindings?.[propName] === v.name ? 'var(--accent-teal)' : '#ccc',
                                backgroundColor: state.elements[selectedElement.id]?.variableBindings?.[propName] === v.name ? 'rgba(0,255,150,0.1)' : 'transparent',
                                border: 'none', borderRadius: '4px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <Brain size={10} /> {v.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const PropertyLabel = ({ label, propName }: { label: string, propName: string }) => {
        const overridden = isPropertyOverridden(propName);
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.6rem', color: overridden ? 'var(--accent-teal)' : '#666', fontWeight: overridden ? 'bold' : 'normal' }}>
                        {label}
                    </span>
                    {overridden && (
                        <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)' }} />
                    )}
                </div>
                <div style={{ position: 'relative' }}>
                    <BindingPopover propName={propName} />
                </div>
            </div>
        );
    };

    const [fluidConfig, setFluidConfig] = React.useState<{ targetProp: string, min: string, max: string, minV: string, maxV: string } | null>(null);

    const generateFluidValue = () => {
        if (!fluidConfig) return;
        const { min, max, minV, maxV } = fluidConfig;
        const minVal = parseFloat(min) || 0;
        const maxVal = parseFloat(max) || 0;
        const minVVal = parseFloat(minV) || 320;
        const maxVVal = parseFloat(maxV) || 1200;

        // Formula: clamp(min, preferred, max)
        // preferred = min + (max - min) * ((100vw - minV) / (maxV - minV))
        // preferred = (min - (max - min) * minV / (maxV - minV)) + (100 * (max - min) / (maxV - minV))vw

        const slope = (maxVal - minVal) / (maxVVal - minVVal);
        const yAxisIntersection = -minVVal * slope + minVal;

        const preferred = `${yAxisIntersection.toFixed(2)} px + ${(slope * 100).toFixed(2)} vw`;
        const result = `clamp(${minVal}px, ${preferred}, ${maxVal}px)`;

        handleUpdateStyles({ [fluidConfig.targetProp]: result });
        setFluidConfig(null);
    };

    const SliderInput = ({ label, value, min, max, step, onChange, unit = '' }: { label: string, value: any, min: number, max: number, step: number, onChange: (v: string) => void, unit?: string }) => {
        const numValue = parseFloat(value) || (unit === '' ? 1 : 0);
        return (
            <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.55rem', color: '#666', fontWeight: 'bold' }}>{label}</span>
                    <span style={{ fontSize: '0.55rem', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{numValue}{unit}</span>
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={numValue}
                    onChange={(e) => onChange(e.target.value + unit)}
                    style={{ width: '100%', height: '3px', accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
                />
            </div>
        );
    };

    const TextInput = ({ value, onChange, placeholder, propName, typeHint }: { value: any, onChange: (val: string) => void, placeholder?: string, propName?: string, typeHint?: TokenType }) => {
        const [showSuggestions, setShowSuggestions] = React.useState(false);
        const tokens = typeHint ? state.designSystem.tokens.filter(t => t.type === typeHint) : [];

        // SIBLING CONSENSUS LOGIC
        const getSuggestion = () => {
            if (!propName || !state.selectedElementId) return null;
            const el = state.elements[state.selectedElementId];
            if (!el || !el.parentId) return null;
            const parent = state.elements[el.parentId];
            if (!parent || !parent.children || parent.children.length < 2) return null;

            // Gather siblings (excluding self)
            const siblings = parent.children.filter(id => id !== el.id).map(id => state.elements[id]);
            if (siblings.length === 0) return null;

            // Count occurrences of this property value
            const counts: Record<string, number> = {};
            siblings.forEach(sib => {
                const val = (sib.styles as any)[propName];
                if (val) counts[val] = (counts[val] || 0) + 1;
            });

            // Find majority
            let bestVal = null;
            let maxCount = 0;
            for (const [val, count] of Object.entries(counts)) {
                if (count > maxCount) {
                    maxCount = count;
                    bestVal = val;
                }
            }

            // Threshold: If more than 50% of siblings share this value, suggest it.
            if (maxCount >= Math.ceil(siblings.length / 2)) {
                return { value: bestVal, count: maxCount, total: siblings.length };
            }
            return null;
        };

        const suggestion = getSuggestion();
        const hasSuggestion = suggestion && suggestion.value !== value;
        const isBound = propName && state.selectedElementId && state.elements[state.selectedElementId]?.variableBindings?.[propName];

        return (
            <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        className="glass"
                        value={isBound ? `{{ ${state.elements[state.selectedElementId!]?.variableBindings?.[propName!]} }}` : (value || '')}
                        disabled={!!isBound}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={hasSuggestion ? `Try ${suggestion?.value}?` : placeholder}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onMouseEnter={() => propName && setHighlightedControl(propName)}
                        onMouseLeave={() => propName && setHighlightedControl(null)}
                        style={{
                            width: '100%', padding: '8px',
                            paddingRight: (propName || tokens.length > 0) ? '30px' : '8px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: hasSuggestion ? '1px solid var(--accent-teal)' : '1px solid var(--glass-border)', // Highlight if suggestion available
                            color: 'white', borderRadius: '4px', fontSize: '0.8rem'
                        }}
                    />

                    {/* Magic Wand for Suggestion */}
                    {hasSuggestion && (
                        <button
                            onClick={() => suggestion?.value && onChange(suggestion.value)}
                            title={`Apply Sibling Consensus: ${suggestion?.value} (${suggestion?.count}/${suggestion?.total} siblings)`}
                            style={{ position: 'absolute', right: '25px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', zIndex: 10, filter: 'grayscale(0%)' }}
                        >
                            🪄
                        </button>
                    )}

                    {/* Data Binding Icon */}
                    {propName && (
                        <div style={{ position: 'absolute', right: '5px' }}>
                            <BindingPopover propName={propName} />
                        </div>
                    )}

                    {/* Fluid Builder Trigger */}
                    {propName && !hasSuggestion && (
                        <button
                            onClick={() => setFluidConfig({ targetProp: propName, min: '16', max: '32', minV: '320', maxV: '1200' })}
                            title="Fluid Value Builder"
                            style={{ position: 'absolute', right: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', opacity: 0.5, zIndex: 10 }}
                        >
                            ⚡
                        </button>
                    )}
                    {/* Token Trigger (if no fluid trigger) */}
                    {!propName && tokens.length > 0 && (
                        <span style={{ position: 'absolute', right: '8px', fontSize: '10px', color: 'var(--accent-teal)', pointerEvents: 'none' }}>T</span>
                    )}
                </div>
                {/* Token Suggestions Dropdown - NOW INCLUDES SUGGESTION */}
                {showSuggestions && (tokens.length > 0 || hasSuggestion) && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#111', border: '1px solid #333', zIndex: 100, maxHeight: '150px', overflowY: 'auto', borderRadius: '4px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>

                        {/* Render Suggestion at top */}
                        {hasSuggestion && (
                            <div
                                onMouseDown={(e) => { e.preventDefault(); onChange(suggestion!.value!); setShowSuggestions(false); }}
                                style={{ padding: '6px', cursor: 'pointer', fontSize: '0.75rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', color: 'var(--accent-teal)', backgroundColor: 'rgba(56, 189, 248, 0.1)' }}
                            >
                                <span>🪄 Magic: {suggestion?.value}</span>
                                <span style={{ opacity: 0.7 }}>{suggestion?.count} siblings</span>
                            </div>
                        )}

                        {tokens.map(t => (
                            <div
                                key={t.id}
                                onMouseDown={(e) => { e.preventDefault(); onChange(`var(--token - ${t.name})`); setShowSuggestions(false); }}
                                style={{ padding: '6px', cursor: 'pointer', fontSize: '0.75rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', color: '#ccc' }}
                            >
                                <span>{t.name}</span>
                                <span style={{ opacity: 0.5 }}>{t.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };



    const IconToggleGroup = ({ label, value, onChange, options }: { label?: string, value: string, onChange: (val: string) => void, options: { value: string, icon: any, title: string }[] }) => (
        <div style={{}}>
            {label && <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{label}</label>}
            <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '2px', border: '1px solid var(--glass-border)' }}>
                {options.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = value === opt.value;
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            title={opt.title}
                            style={{
                                flex: 1,
                                padding: '6px',
                                border: 'none',
                                background: isActive ? 'var(--accent-teal)' : 'transparent',
                                color: isActive ? 'black' : '#888',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {Icon ? <Icon size={14} /> : opt.title}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const CodeArea = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string }) => (
        <div style={{ marginBottom: '15px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--accent-teal)', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{label.toUpperCase()}</span>
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || 'Enter JS code...'}
                spellCheck={false}
                style={{
                    width: '100%',
                    height: '100px',
                    backgroundColor: '#111',
                    border: '1px solid #333',
                    color: '#00ff00',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    padding: '8px',
                    borderRadius: '4px'
                }}
            />
        </div>
    );

    // Framer17: Localization - Media Overrides
    // If an image is selected and a specific locale is active, show "Locale Media" controls
    const renderLocaleMediaControls = () => {
        if (state.localization.activeLocale === 'default' || selectedElement.type !== 'image') return null;

        const currentOverride = selectedElement.localeOverrides?.[state.localization.activeLocale]?.media;
        const currentSrc = currentOverride?.src || selectedElement.media?.src;
        const currentAlt = currentOverride?.altText || selectedElement.altText;
        const isOverridden = !!currentOverride;

        const updateLocaleMedia = (key: 'src' | 'altText', value: string) => {
            const newOverrides = { ...selectedElement.localeOverrides };
            if (!newOverrides[state.localization.activeLocale]) {
                newOverrides[state.localization.activeLocale] = {};
            }
            if (!newOverrides[state.localization.activeLocale].media) {
                newOverrides[state.localization.activeLocale].media = {};
            }
            // TypeScript check logic wrapper
            (newOverrides[state.localization.activeLocale].media as any)[key] = value;

            // If reverting to default (empty), maybe cleanup? For now keep explicit.

            setState((prev: any) => ({
                ...prev,
                elements: {
                    ...prev.elements,
                    [selectedElement.id]: {
                        ...prev.elements[selectedElement.id],
                        localeOverrides: newOverrides
                    }
                }
            }));
        };

        return (
            <div style={{ marginTop: '15px', padding: '10px', border: '1px solid var(--accent-teal)', borderRadius: '6px', background: 'rgba(0, 255, 200, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Globe size={14} color="var(--accent-teal)" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--accent-teal)', textTransform: 'uppercase' }}>
                        {state.localization.activeLocale} Asset Override
                    </span>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.65rem', color: '#888', display: 'block', marginBottom: '4px' }}>IMAGE URL</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                            type="text"
                            value={currentSrc || ''}
                            onChange={(e) => updateLocaleMedia('src', e.target.value)}
                            className="glass"
                            style={{ flex: 1, padding: '6px', fontSize: '0.7rem', color: isOverridden ? 'var(--accent-teal)' : 'white' }}
                            placeholder="Locale specific image..."
                        />
                        <button
                            onClick={() => openAssetVault((asset) => {
                                updateLocaleMedia('src', asset.url);
                                if (asset.filterPreset && asset.filterPreset !== 'none') {
                                    const filterMap: Record<string, string> = {
                                        'grayscale': 'grayscale(100%)',
                                        'sepia': 'sepia(100%)',
                                        'contrast': 'contrast(150%)',
                                        'vintage': 'sepia(50%) contrast(80%)'
                                    };
                                    // Update styles directly (assuming singular selection or active element)
                                    // PropertiesPanel usually has selectedElementId in scope or via store
                                    if (state.selectedElementId) {
                                        updateElementStyles(state.selectedElementId, { filter: filterMap[asset.filterPreset] || 'none' });
                                    }
                                } else if (asset.filterPreset === 'none') {
                                    if (state.selectedElementId) {
                                        updateElementStyles(state.selectedElementId, { filter: 'none' });
                                    }
                                }
                            })}
                            style={{ padding: '6px', background: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
                        >
                            <ImageIcon size={14} />
                        </button>
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: '0.65rem', color: '#888', display: 'block', marginBottom: '4px' }}>ALT TEXT</label>
                    <input
                        type="text"
                        value={currentAlt || ''}
                        onChange={(e) => updateLocaleMedia('altText', e.target.value)}
                        className="glass"
                        style={{ width: '100%', padding: '6px', fontSize: '0.7rem', color: isOverridden ? 'var(--accent-teal)' : 'white' }}
                        placeholder={`Alt text for ${state.localization.activeLocale}...`}
                    />
                </div>
            </div>
        );
    };


    return (
        <aside className="glass" style={{ width: '320px', height: '100%', borderLeft: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', flexShrink: 0, backgroundColor: '#0a0a0a', zIndex: 50, position: 'relative' }}>

            {/* FLUID BUILDER MODAL */}
            {fluidConfig && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 100, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* ... (Existing Fluid Builder) ... */}
                    {/* I will keep the fluid builder content just use ellipses for brevity in prompt context but in reality I am not touching it */}
                    {/* Actually I need to be careful not to delete it. I am inserting ABOVE it but targeting the line 430 start */}
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                        Fluid Value Builder: <span style={{ color: 'var(--accent-teal)' }}>{fluidConfig.targetProp}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ fontSize: '0.7rem' }}>
                            <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Min Size (px)</label>
                            <input type="text" value={fluidConfig.min} onChange={(e) => setFluidConfig({ ...fluidConfig, min: e.target.value })} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #444', color: 'white' }} />
                        </div>
                        <div style={{ fontSize: '0.7rem' }}>
                            <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Max Size (px)</label>
                            <input type="text" value={fluidConfig.max} onChange={(e) => setFluidConfig({ ...fluidConfig, max: e.target.value })} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #444', color: 'white' }} />
                        </div>
                        <div style={{ fontSize: '0.7rem' }}>
                            <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Min Viewport (px)</label>
                            <input type="text" value={fluidConfig.minV} onChange={(e) => setFluidConfig({ ...fluidConfig, minV: e.target.value })} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #444', color: 'white' }} />
                        </div>
                        <div style={{ fontSize: '0.7rem' }}>
                            <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Max Viewport (px)</label>
                            <input type="text" value={fluidConfig.maxV} onChange={(e) => setFluidConfig({ ...fluidConfig, maxV: e.target.value })} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #444', color: 'white' }} />
                        </div>
                    </div>

                    <div style={{ flex: 1 }} />

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setFluidConfig(null)} style={{ flex: 1, padding: '10px', background: '#333', border: 'none', color: 'white', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={generateFluidValue} style={{ flex: 2, padding: '10px', background: 'var(--accent-teal)', border: 'none', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>Generate clamp()</button>
                    </div>
                </div>
            )}

            {/* CLASS EDITING BANNER */}
            {editingClass && (
                <div style={{ backgroundColor: 'var(--accent-teal)', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'black' }}>
                    <div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', display: 'block', opacity: 0.8 }}>EDITING CLASS</span>
                        <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>.{editingClass.name}</div>
                    </div>
                    <button onClick={() => setEditingClassId(null)} style={{ background: 'rgba(0,0,0,0.2)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}>
                        <X size={14} color="black" />
                    </button>
                </div>
            )}

            {/* Batch 4.3: Class Context breadcrumbs */}
            <ClassBreadcrumbs elementId={selectedElement.id} />

            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {selectedElements.length > 1 ? (
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontWeight: 'bold' }}>BATCH EDITING</span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{selectedElements.length} elements selected</div>
                        </div>
                    ) : (
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{selectedElement.type.toUpperCase()}</span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ID: {selectedElement.id.substring(0, 8)}...</div>
                            <button
                                onClick={() => setWorkspaceMode('logic')}
                                style={{
                                    marginTop: '8px',
                                    padding: '4px 8px',
                                    fontSize: '0.7rem',
                                    background: 'rgba(0, 224, 255, 0.1)',
                                    color: 'var(--accent-primary)',
                                    border: '1px solid var(--accent-primary)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                            >
                                <Brain size={12} /> Edit Logic
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            if (selectedElements.length > 1) {
                                selectedElements.forEach(el => removeElement(el.id));
                            } else {
                                removeElement(selectedElement.id);
                            }
                        }}
                        style={{ color: '#ff4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                        🗑️
                    </button>
                </div>
                {/* Repeater Data Source */}
                {selectedElement.type === 'repeater' && (
                    <div style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>DATA SOURCE</span>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', marginBottom: '5px' }}>COLLECTION</label>
                            <select
                                value={selectedElement.collectionId || ''}
                                onChange={(e) => updateElementProp(selectedElement.id, 'collectionId', e.target.value)}
                                style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px', fontSize: '0.75rem' }}
                            >
                                <option value="">Select Collection...</option>
                                {state.data.collections.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', marginBottom: '5px' }}>LIMIT Items</label>
                            <input
                                type="number"
                                value={selectedElement.limit || ''}
                                onChange={(e) => updateElementProp(selectedElement.id, 'limit', parseInt(e.target.value))}
                                placeholder="All"
                                style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px', fontSize: '0.75rem' }}
                            />
                        </div>
                    </div>
                )}

                <div style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '5px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    <button onClick={() => setActiveTab('style')} style={{ flex: 1, padding: '6px', fontSize: '0.7rem', background: activeTab === 'style' ? 'var(--accent-teal)' : 'transparent', color: activeTab === 'style' ? 'black' : '#888', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Style</button>
                    <button onClick={() => setActiveTab('settings')} style={{ flex: 1, padding: '6px', fontSize: '0.7rem', background: activeTab === 'settings' ? 'var(--accent-teal)' : 'transparent', color: activeTab === 'settings' ? 'black' : '#888', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Settings</button>
                    <button onClick={() => setActiveTab('code')} style={{ flex: 1, padding: '6px', fontSize: '0.7rem', background: activeTab === 'code' ? 'var(--accent-teal)' : 'transparent', color: activeTab === 'code' ? 'black' : '#888', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Code</button>
                    <button onClick={() => setActiveTab('interactions')} style={{ flex: 1, padding: '6px', fontSize: '0.7rem', background: activeTab === 'interactions' ? 'var(--accent-teal)' : 'transparent', color: activeTab === 'interactions' ? 'black' : '#888', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Logic</button>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {activeTab === 'code' ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {selectedElement.type === 'custom-code' && (
                            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
                                <div style={{ padding: '10px 15px', background: '#111', borderBottom: '1px solid #333', borderRadius: '6px 6px 0 0' }}>
                                    <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>
                                        <strong>React Component Body</strong><br />
                                        Must return a functional component definition or be an IIFE.
                                    </p>
                                </div>
                                <textarea
                                    value={selectedElement.customCode?.code || ''}
                                    onChange={(e) => {
                                        const code = e.target.value;
                                        // Simple prop detection regex
                                        const propMatches = code.match(/props\.([a-zA-Z0-9_]+)/g);
                                        const exposedProps = { ...(selectedElement.customCode?.exposedProps || {}) };

                                        if (propMatches) {
                                            propMatches.forEach(match => {
                                                const propName = match.split('.')[1];
                                                if (!exposedProps[propName]) {
                                                    exposedProps[propName] = { type: 'string', value: 'Default ' + propName };
                                                }
                                            });
                                        }

                                        updateElementProp(selectedElement.id, 'customCode', {
                                            ...(selectedElement.customCode || {}),
                                            code,
                                            exposedProps
                                        });
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        backgroundColor: '#0d0d0d',
                                        border: '1px solid #333',
                                        borderTop: 'none',
                                        color: '#00ffcc',
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        padding: '10px',
                                        resize: 'vertical',
                                        outline: 'none',
                                        lineHeight: '1.5',
                                        borderRadius: '0 0 6px 6px'
                                    }}
                                    spellCheck={false}
                                />

                                {/* EXPOSED PROPS UI */}
                                {selectedElement.customCode?.exposedProps && Object.keys(selectedElement.customCode.exposedProps).length > 0 && (
                                    <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                                        <h4 style={{ fontSize: '0.65rem', color: '#888', marginBottom: '8px', fontWeight: 'bold' }}>DETECTED PROPS</h4>
                                        {Object.entries(selectedElement.customCode.exposedProps).map(([key, config]) => (
                                            <div key={key} style={{ marginBottom: '8px' }}>
                                                <label style={{ display: 'block', fontSize: '0.6rem', color: '#aaa', marginBottom: '4px' }}>{key}</label>
                                                <input
                                                    type="text"
                                                    value={config.value}
                                                    onChange={(e) => {
                                                        const newProps = { ...selectedElement.customCode?.exposedProps };
                                                        newProps[key] = { ...newProps[key], value: e.target.value };
                                                        updateElementProp(selectedElement.id, 'customCode', {
                                                            ...selectedElement.customCode,
                                                            exposedProps: newProps
                                                        });
                                                    }}
                                                    className="glass"
                                                    style={{ width: '100%', padding: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.7rem' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ padding: '10px', backgroundColor: 'rgba(0,255,150,0.05)', borderRadius: '6px', border: '1px solid rgba(0,255,150,0.1)', marginBottom: '20px', fontSize: '0.7rem', color: '#888' }}>
                            <span style={{ color: 'var(--accent-teal)', fontWeight: 'bold' }}>INFO:</span> Use <code style={{ color: 'white' }}>el</code> to access this DOM element. Use <code style={{ color: 'white' }}>state</code> to access project state.
                        </div>

                        <CodeArea
                            label="On Mount"
                            value={selectedElement.customCode?.onMount || ''}
                            onChange={(v) => setElementCode(selectedElement.id, 'onMount', v)}
                            placeholder="// Run when element appears\nel.style.opacity = 0;\nsetTimeout(() => el.style.opacity = 1, 500);"
                        />

                        <CodeArea
                            label="On Hover"
                            value={selectedElement.customCode?.onHover || ''}
                            onChange={(v) => setElementCode(selectedElement.id, 'onHover', v)}
                            placeholder="// Run when mouse enters\nel.style.transform = 'skewX(10deg)';"
                        />

                        <CodeArea
                            label="On Click"
                            value={selectedElement.customCode?.onClick || ''}
                            onChange={(v) => setElementCode(selectedElement.id, 'onClick', v)}
                            placeholder="// Run when clicked (Preview Mode)\nalert('Clicked: ' + el.id);"
                        />
                    </div>
                ) : activeTab === 'style' ? (
                    <div style={{ overflowY: 'auto', flex: 1, padding: '15px' }}>

                        {/* 0. STATE PANEL (REPLACED SWITCHER) */}
                        <StatePanel />

                        {/* 0.9 CMS TEMPLATE SETTINGS (Root Only) */}
                        {selectedElement.id === state.pages[state.activePageId].rootElementId && (
                            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #222' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--accent-teal)' }}>
                                    <LayoutTemplate size={14} />
                                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>PAGE SETTINGS</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#ccc' }}>Is Template Page?</span>
                                    <input
                                        type="checkbox"
                                        checked={state.pages[state.activePageId].isTemplate || false}
                                        onChange={(e) => {
                                            const isTemplate = e.target.checked;
                                            setState((prev: any) => ({
                                                ...prev,
                                                pages: {
                                                    ...prev.pages,
                                                    [prev.activePageId]: {
                                                        ...prev.pages[prev.activePageId],
                                                        isTemplate,
                                                        collectionId: isTemplate ? prev.pages[prev.activePageId].collectionId : undefined
                                                    }
                                                }
                                            }));
                                        }}
                                        style={{ accentColor: 'var(--accent-teal)' }}
                                    />
                                </div>

                                {state.pages[state.activePageId].isTemplate && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', marginBottom: '6px' }}>SOURCE COLLECTION</label>
                                        <select
                                            className="glass"
                                            value={state.pages[state.activePageId].collectionId || ''}
                                            onChange={(e) => {
                                                const collectionId = e.target.value;
                                                setState((prev: any) => ({
                                                    ...prev,
                                                    pages: {
                                                        ...prev.pages,
                                                        [prev.activePageId]: {
                                                            ...prev.pages[prev.activePageId],
                                                            collectionId,
                                                            // Auto-guess slug field?
                                                            slugField: 'slug'
                                                        }
                                                    }
                                                }));
                                            }}
                                            style={{ width: '100%', padding: '8px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
                                        >
                                            <option value="">Select Collection...</option>
                                            {state.data.collections.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>

                                        {state.pages[state.activePageId].collectionId && (
                                            <div style={{ marginTop: '10px' }}>
                                                <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', marginBottom: '6px' }}>PREVIEW ITEM (EDITOR ONLY)</label>
                                                <select
                                                    className="glass"
                                                    value={state.activeItemId || ''}
                                                    onChange={(e) => {
                                                        const itemId = e.target.value;
                                                        // This action needs to be exposed in ProjectContext or just call setState directly for now?
                                                        // ProjectContext has setActiveItemId
                                                        // But I need access to it. I have `setActiveItemId` destructured from useProjectStore().
                                                        // I checked PropertiesPanel imports/destructuring in step 4853.
                                                        // line 53: const { state, updateElementProp, ... } = useProjectStore();
                                                        // setActiveItemId IS NOT in the destructuring list.
                                                        // I must use setState or add it to destructuring.
                                                        // I'll assume I can use setState or I'll fix the destructuring in a separate step or just use setState hack.
                                                        // Actually, setState(prev => ({...prev, activeItemId: val})) is cleaner/safer than assuming destructuring.
                                                        setState((prev: any) => ({ ...prev, activeItemId: itemId }));
                                                    }}
                                                    style={{ width: '100%', padding: '8px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
                                                >
                                                    <option value="">Select Item to Preview...</option>
                                                    {state.data.items
                                                        .filter(i => i.collectionId === state.pages[state.activePageId].collectionId)
                                                        .map(item => (
                                                            <option key={item.id} value={item.id}>
                                                                {Object.values(item.values).find(v => typeof v === 'string') || item.id}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 0.0 SEMANTIC TAG (NEW) */}
                        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #222' }}>
                            <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>HTML TAG</span>
                            <select
                                className="glass"
                                value={selectedElement.tagName || 'div'}
                                onChange={(e) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, tagName: e.target.value } } }))}
                                style={{ width: '100%', padding: '8px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
                            >
                                <option value="div">div (Default)</option>
                                <option value="section">section</option>
                                <option value="main">main</option>
                                <option value="header">header</option>
                                <option value="footer">footer</option>
                                <option value="nav">nav</option>
                                <option value="article">article</option>
                                <option value="aside">aside</option>
                            </select>
                        </div>

                        {/* 0.05 DATA BINDING (NEW) */}
                        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #222' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--accent-teal)' }}>
                                <Database size={14} />
                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>DATA BINDING</span>
                            </div>

                            {/* Repeater: Select Collection */}
                            {selectedElement.type === 'repeater' && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '6px' }}>SOURCE COLLECTION</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <select
                                            className="glass"
                                            value={selectedElement.collectionId || ''}
                                            onChange={(e) => updateElementStyles(selectedElement.id, { collectionId: e.target.value } as any)}
                                            style={{ width: '100%', padding: '8px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
                                        >
                                            <option value="">Select Collection...</option>
                                            {state.data.collections.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => {
                                                const varName = prompt('Enter Global Variable Name to bind to:', selectedElement.variableBindings?.['collectionId'] || '');
                                                if (varName !== null) {
                                                    setVariableBinding(selectedElement.id, 'collectionId', varName);
                                                }
                                            }}
                                            style={{ backgroundColor: selectedElement.variableBindings?.['collectionId'] ? 'var(--accent-teal)' : '#222', border: 'none', color: selectedElement.variableBindings?.['collectionId'] ? 'black' : '#666', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
                                            title="Bind to Variable"
                                        >
                                            <Brain size={14} />
                                        </button>
                                    </div>

                                    {/* Repeater: Data Query (Filters & Sort) */}
                                    {selectedElement.collectionId && (
                                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #222' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--accent-teal)' }}>
                                                <List size={14} />
                                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>DATA QUERY</span>
                                            </div>

                                            {/* SORT */}
                                            <div style={{ marginBottom: '10px' }}>
                                                <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', marginBottom: '6px' }}>SORT BY</label>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <select
                                                        className="glass"
                                                        value={selectedElement.sort?.field || ''}
                                                        onChange={(e) => updateElementStyles(selectedElement.id, { sort: { ...selectedElement.sort, field: e.target.value, direction: selectedElement.sort?.direction || 'asc' } } as any)}
                                                        style={{ flex: 2, padding: '6px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.7rem' }}
                                                    >
                                                        <option value="">None</option>
                                                        {state.data.collections.find(c => c.id === selectedElement.collectionId)?.fields.map(f => (
                                                            <option key={f.id} value={f.id}>{f.name}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        className="glass"
                                                        value={selectedElement.sort?.direction || 'asc'}
                                                        onChange={(e) => updateElementStyles(selectedElement.id, { sort: { ...selectedElement.sort, direction: e.target.value } } as any)}
                                                        style={{ flex: 1, padding: '6px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.7rem' }}
                                                    >
                                                        <option value="asc">ASC</option>
                                                        <option value="desc">DESC</option>
                                                    </select>
                                                    <div style={{ flex: 1 }}>
                                                        <input
                                                            type="number"
                                                            placeholder="Limit"
                                                            value={selectedElement.limit || ''}
                                                            onChange={(e) => updateElementStyles(selectedElement.id, { limit: parseInt(e.target.value) || undefined } as any)}
                                                            style={{ width: '100%', padding: '6px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.7rem' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FILTER */}
                                            <div style={{ marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <label style={{ fontSize: '0.65rem', color: '#888' }}>FILTERS</label>
                                                    <button
                                                        onClick={() => {
                                                            const newFilter = { field: '', operator: 'equals', value: '' };
                                                            updateElementStyles(selectedElement.id, { filter: [...(selectedElement.filter || []), newFilter] } as any);
                                                        }}
                                                        style={{ fontSize: '0.6rem', color: 'var(--accent-teal)', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        + ADD
                                                    </button>
                                                </div>

                                                {(selectedElement.filter || []).map((filter: any, idx: number) => (
                                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <select
                                                                className="glass"
                                                                value={filter.field}
                                                                onChange={(e) => {
                                                                    const newFilters = [...(selectedElement.filter || [])];
                                                                    newFilters[idx] = { ...newFilters[idx], field: e.target.value };
                                                                    updateElementStyles(selectedElement.id, { filter: newFilters } as any);
                                                                }}
                                                                style={{ flex: 1, padding: '4px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '3px', fontSize: '0.65rem' }}
                                                            >
                                                                <option value="">Field...</option>
                                                                {state.data.collections.find(c => c.id === selectedElement.collectionId)?.fields.map(f => (
                                                                    <option key={f.id} value={f.id}>{f.name}</option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                onClick={() => {
                                                                    const newFilters = [...(selectedElement.filter || [])];
                                                                    newFilters.splice(idx, 1);
                                                                    updateElementStyles(selectedElement.id, { filter: newFilters } as any);
                                                                }}
                                                                style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <select
                                                                className="glass"
                                                                value={filter.operator}
                                                                onChange={(e) => {
                                                                    const newFilters = [...(selectedElement.filter || [])];
                                                                    newFilters[idx] = { ...newFilters[idx], operator: e.target.value as any };
                                                                    updateElementStyles(selectedElement.id, { filter: newFilters } as any);
                                                                }}
                                                                style={{ flex: 1, padding: '4px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '3px', fontSize: '0.65rem' }}
                                                            >
                                                                <option value="equals">Equals</option>
                                                                <option value="contains">Contains</option>
                                                                <option value="gt">&gt;</option>
                                                                <option value="lt">&lt;</option>
                                                            </select>
                                                            <div style={{ flex: 1, position: 'relative' }}>
                                                                <input
                                                                    value={filter.value}
                                                                    onChange={(e) => {
                                                                        const newFilters = [...(selectedElement.filter || [])];
                                                                        newFilters[idx] = { ...newFilters[idx], value: e.target.value };
                                                                        updateElementStyles(selectedElement.id, { filter: newFilters } as any);
                                                                    }}
                                                                    placeholder="Value or {{var}}"
                                                                    style={{ width: '100%', padding: '4px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '3px', fontSize: '0.65rem' }}
                                                                />
                                                                {/* Simple bind trigger */}
                                                                <button
                                                                    onClick={() => {
                                                                        const varName = prompt('Enter Variable Name (e.g. searchQuery):');
                                                                        if (varName) {
                                                                            const newFilters = [...(selectedElement.filter || [])];
                                                                            newFilters[idx] = { ...newFilters[idx], value: `{{${varName}}}` };
                                                                            updateElementStyles(selectedElement.id, { filter: newFilters } as any);
                                                                        }
                                                                    }}
                                                                    style={{ position: 'absolute', right: '2px', top: '2px', border: 'none', background: 'none', color: 'var(--accent-teal)', cursor: 'pointer' }}
                                                                >
                                                                    <Brain size={10} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* PAGINATION */}
                                            <div style={{ marginTop: '15px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <label style={{ fontSize: '0.65rem', color: '#888' }}>PAGINATION</label>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedElement.pagination?.enabled || false}
                                                        onChange={(e) => updateElementStyles(selectedElement.id, { pagination: { ...selectedElement.pagination, enabled: e.target.checked } } as any)}
                                                        style={{ accentColor: 'var(--accent-teal)' }}
                                                    />
                                                </div>

                                                {selectedElement.pagination?.enabled && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.65rem', color: '#666' }}>Page Size</span>
                                                            <input
                                                                type="number"
                                                                value={selectedElement.pagination?.pageSize || 10}
                                                                onChange={(e) => updateElementStyles(selectedElement.id, { pagination: { ...selectedElement.pagination, pageSize: parseInt(e.target.value) } } as any)}
                                                                style={{ width: '50px', padding: '4px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.7rem', textAlign: 'right' }}
                                                            />
                                                        </div>
                                                        <select
                                                            className="glass"
                                                            value={selectedElement.pagination?.type || 'paged'}
                                                            onChange={(e) => updateElementStyles(selectedElement.id, { pagination: { ...selectedElement.pagination, type: e.target.value } } as any)}
                                                            style={{ width: '100%', padding: '6px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.7rem' }}
                                                        >
                                                            <option value="paged">Standard (Pages)</option>
                                                            <option value="infinite">Infinite Scroll</option>
                                                            <option value="load-more">Load More Button</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Bind Properties */}
                            {['text', 'image', 'video', 'button'].includes(selectedElement.type) && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '6px' }}>
                                        BIND {selectedElement.type === 'image' ? 'SOURCE' : 'TEXT'} TO FIELD
                                    </label>
                                    <select
                                        className="glass"
                                        value={selectedElement.bindings?.content || selectedElement.bindings?.src || ''}
                                        onChange={(e) => {
                                            const fieldId = e.target.value;
                                            const bindingKey = (selectedElement.type === 'image' || selectedElement.type === 'video') ? 'src' : 'content';
                                            setVariableBinding(selectedElement.id, bindingKey, fieldId);
                                        }}
                                        style={{ width: '100%', padding: '8px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
                                    >
                                        <option value="">No Binding (Use Static Value)</option>
                                        {state.data.collections.map(c => (
                                            <optgroup key={c.id} label={c.name}>
                                                {c.fields.map(f => (
                                                    <option key={f.id} value={f.id}>{f.name} ({f.type})</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    {selectedElement.bindings && (selectedElement.bindings.content || selectedElement.bindings.src) && (
                                        <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--accent-teal)', display: 'flex', gap: '6px' }}>
                                            <Link size={12} />
                                            <span>Connected to Data</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>



                        {/* 0.06 INTERACTIONS (Phase 4) */}
                        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #222' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--accent-teal)' }}>
                                <MousePointer2 size={14} />
                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>ON CLICK ACTION</span>
                            </div>

                            <select
                                className="glass"
                                value={selectedElement.action?.type || 'none'}
                                onChange={(e) => {
                                    const type = e.target.value as any;
                                    updateElementStyles(selectedElement.id, { action: { type, payload: '', target: '_self' } });
                                }}
                                style={{ width: '100%', padding: '8px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '8px' }}
                            >
                                <option value="">No Action</option>
                                <option value="navigate">Open URL</option>
                                <option value="scroll_to">Scroll to Section</option>
                                <option value="alert">Show Message</option>
                            </select>

                            {/* Payload Input */}
                            {selectedElement.action?.type && selectedElement.action.type !== 'none' && (
                                <input
                                    type="text"
                                    className="glass"
                                    placeholder={selectedElement.action.type === 'url' ? 'https://example.com' : selectedElement.action.type === 'scroll' ? 'Section ID' : 'Message Text'}
                                    value={selectedElement.action.payload || ''}
                                    onChange={(e) => updateElementStyles(selectedElement.id, { action: { ...selectedElement.action!, payload: e.target.value } })}
                                    style={{ width: '100%', padding: '8px', backgroundColor: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
                                />
                            )}
                        </div>

                        {/* INSTANCE PROPS (Edit Values) */}
                        {selectedElement.type === 'instance' && componentContext.master && (
                            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #222' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold' }}>INSTANCE PROPS</span>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--accent-gold)' }}>{componentContext.master.name}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {componentContext.master.props?.map(prop => (
                                        <div key={prop.id}>
                                            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{prop.name}</label>
                                            <input
                                                className="glass"
                                                value={selectedElement.props?.[prop.id] || prop.defaultValue || ''}
                                                onChange={(e) => setInstancePropValue(selectedElement.id, prop.id, e.target.value)}
                                                style={{ width: '100%', padding: '6px', fontSize: '0.8rem', color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px' }}
                                            />
                                        </div>
                                    ))}
                                    {(!componentContext.master.props || componentContext.master.props.length === 0) && (
                                        <div style={{ fontStyle: 'italic', color: '#555', fontSize: '0.7rem' }}>No props to configure</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* COMPONENT DEFINITION (Props) */}
                        {componentContext.master && (
                            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #222' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold' }}>COMPONENT PROPS</span>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--accent-teal)' }}>{componentContext.master.name}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                                    {componentContext.master.props?.map(prop => (
                                        <div key={prop.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', padding: '4px', backgroundColor: '#222', borderRadius: '4px' }}>
                                            <span style={{ color: 'var(--accent-teal)', fontWeight: 'bold', width: '20px' }}>{prop.type === 'text' ? 'Tx' : prop.type === 'image' ? 'Im' : 'Bl'}</span>
                                            <span style={{ flex: 1, color: 'white' }}>{prop.name}</span>
                                            <button onClick={() => deleteComponentProp(componentContext.master!.id, prop.id)} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={12} /></button>
                                        </div>
                                    ))}
                                    {(!componentContext.master.props || componentContext.master.props.length === 0) && (
                                        <div style={{ fontStyle: 'italic', color: '#555', fontSize: '0.7rem' }}>No props defined</div>
                                    )}
                                </div>
                                <div style={{ backgroundColor: '#111', padding: '8px', borderRadius: '4px' }}>
                                    <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                        <input
                                            value={newPropName}
                                            onChange={(e) => setNewPropName(e.target.value)}
                                            placeholder="Prop Name"
                                            className="glass"
                                            style={{ flex: 1, padding: '4px', fontSize: '0.75rem', color: 'white', backgroundColor: '#000' }}
                                        />
                                        <select
                                            value={newPropType}
                                            onChange={(e) => setNewPropType(e.target.value)}
                                            className="glass"
                                            style={{ width: '60px', padding: '4px', fontSize: '0.75rem', color: 'white', backgroundColor: '#000' }}
                                        >
                                            <option value="text">Text</option>
                                            <option value="image">Img</option>
                                            <option value="boolean">Bool</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input
                                            value={newPropDef}
                                            onChange={(e) => setNewPropDef(e.target.value)}
                                            placeholder="Default Value"
                                            className="glass"
                                            style={{ flex: 1, padding: '4px', fontSize: '0.75rem', color: 'white', backgroundColor: '#000' }}
                                        />
                                        <button
                                            onClick={() => {
                                                if (newPropName) {
                                                    addComponentProp(componentContext.master!.id, { name: newPropName, type: newPropType, defaultValue: newPropDef });
                                                    setNewPropName('');
                                                    setNewPropDef('');
                                                }
                                            }}
                                            style={{ padding: '4px 8px', backgroundColor: 'var(--accent-teal)', color: 'black', border: 'none', fontSize: '0.7rem', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
                                        >
                                            ADD
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 0.1 STATE SWITCHER (Desktop Only) */}
                        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #222' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold' }}>STYLE CLASSES</span>
                            </div>
                            <ClassSelector elementId={selectedElement.id} />
                        </div>

                        {/* 1. LAYOUT MODE */}
                        <div style={{ marginBottom: '25px' }}>
                            <button
                                onClick={() => toggleLayoutMode(selectedElement.id)}
                                style={{
                                    width: '100%', padding: '10px',
                                    backgroundColor: selectedElement.layoutMode === 'freedom' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                                    color: selectedElement.layoutMode === 'freedom' ? 'black' : 'white',
                                    border: '1px solid var(--glass-border)', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer'
                                }}
                            >
                                {selectedElement.layoutMode === 'freedom' ? '🔓 FREEDOM MODE' : '🔒 AUTO LAYOUT'}
                            </button>
                        </div>

                        {/* 2. CONTENT (Text/Img) */}
                        {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
                            <InputGroup label="Content" bindableProp="content">
                                <textarea
                                    className="glass"
                                    value={selectedElement.content || ''}
                                    onChange={(e) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, content: e.target.value } } }))}
                                    rows={3}
                                    style={{ width: '100%', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px', fontSize: '0.8rem', resize: 'vertical' }}
                                />
                                {/* BINDING UI - Only if inside a Master Component */}
                                {componentContext.master && (
                                    <div style={{ marginTop: '5px' }}>
                                        <label style={{ fontSize: '0.6rem', color: 'var(--accent-teal)' }}>🔗 Bind to Prop</label>
                                        <select
                                            value={selectedElement.bindings?.content || ''}
                                            onChange={(e) => setVariableBinding(selectedElement.id, 'content', e.target.value)}
                                            style={{ width: '100%', padding: '5px', backgroundColor: '#111', border: '1px solid #333', color: '#ccc', borderRadius: '4px', fontSize: '0.7rem' }}
                                        >
                                            <option value="">None (Static Content)</option>
                                            {componentContext.master.props?.filter(p => p.type === 'text').map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </InputGroup>
                        )}
                        {/* 2.5 MEDIA SETTINGS (Video/Audio) */}
                        {(selectedElement.type === 'video' || selectedElement.type === 'audio') && (
                            <InputGroup label="Media Settings" bindableProp="src">
                                <span style={{ fontSize: '0.6rem', color: '#666' }}>SOURCE URL</span>
                                <TextInput
                                    value={selectedElement.media?.src || selectedElement.content}
                                    onChange={(v) => setState((prev: any) => ({
                                        ...prev,
                                        elements: {
                                            ...prev.elements,
                                            [selectedElement.id]: {
                                                ...selectedElement,
                                                media: { ...selectedElement.media, src: v }
                                            }
                                        }
                                    }))}
                                    placeholder="https://example.com/media.mp4"
                                />

                                {selectedElement.type === 'video' && (
                                    <>
                                        <div style={{ height: '10px' }}></div>
                                        <span style={{ fontSize: '0.6rem', color: '#666' }}>POSTER IMAGE</span>
                                        <TextInput
                                            value={selectedElement.media?.poster}
                                            onChange={(v) => setState((prev: any) => ({
                                                ...prev,
                                                elements: {
                                                    ...prev.elements,
                                                    [selectedElement.id]: {
                                                        ...selectedElement,
                                                        media: { ...selectedElement.media, poster: v }
                                                    }
                                                }
                                            }))}
                                            placeholder="https://example.com/poster.jpg"
                                        />
                                    </>
                                )}

                                <div style={{ height: '10px' }}></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#ccc', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedElement.media?.controls !== false} // Default true
                                            onChange={(e) => setState((prev: any) => ({
                                                ...prev,
                                                elements: {
                                                    ...prev.elements,
                                                    [selectedElement.id]: {
                                                        ...selectedElement,
                                                        media: { ...selectedElement.media, controls: e.target.checked }
                                                    }
                                                }
                                            }))}
                                        />
                                        Controls
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#ccc', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedElement.media?.autoplay || false}
                                            onChange={(e) => setState((prev: any) => ({
                                                ...prev,
                                                elements: {
                                                    ...prev.elements,
                                                    [selectedElement.id]: {
                                                        ...selectedElement,
                                                        media: { ...selectedElement.media, autoplay: e.target.checked }
                                                    }
                                                }
                                            }))}
                                        />
                                        Autoplay
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#ccc', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedElement.media?.loop || false}
                                            onChange={(e) => setState((prev: any) => ({
                                                ...prev,
                                                elements: {
                                                    ...prev.elements,
                                                    [selectedElement.id]: {
                                                        ...selectedElement,
                                                        media: { ...selectedElement.media, loop: e.target.checked }
                                                    }
                                                }
                                            }))}
                                        />
                                        Loop
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#ccc', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedElement.media?.muted || false}
                                            onChange={(e) => setState((prev: any) => ({
                                                ...prev,
                                                elements: {
                                                    ...prev.elements,
                                                    [selectedElement.id]: {
                                                        ...selectedElement,
                                                        media: { ...selectedElement.media, muted: e.target.checked }
                                                    }
                                                }
                                            }))}
                                        />
                                        Muted
                                    </label>
                                </div>
                            </InputGroup>
                        )}

                        {/* 2.6 COMMERCE SETTINGS */}
                        {(selectedElement.type === 'button' || selectedElement.commerce) && (
                            <InputGroup label="Commerce Settings">
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', marginBottom: '5px' }}>PROVIDER</label>
                                    <select
                                        value={selectedElement.commerce?.provider || 'stripe'}
                                        onChange={(e) => setState((prev: any) => ({
                                            ...prev,
                                            elements: {
                                                ...prev.elements,
                                                [selectedElement.id]: {
                                                    ...selectedElement,
                                                    commerce: { ...selectedElement.commerce, provider: e.target.value }
                                                }
                                            }
                                        }))}
                                        className="glass"
                                        style={{ width: '100%', padding: '8px', backgroundColor: '#000', color: 'white', fontSize: '0.75rem', border: '1px solid #333' }}
                                    >
                                        <option value="stripe">Stripe</option>
                                        <option value="lemonsqueezy">LemonSqueezy</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                        <label style={{ fontSize: '0.65rem', color: '#888' }}>PRODUCT ID / SKU</label>
                                        <PropertyLabel label="" propName="commerce.productId" />
                                    </div>
                                    <TextInput
                                        value={selectedElement.commerce?.productId || ''}
                                        onChange={(v) => setState((prev: any) => ({
                                            ...prev,
                                            elements: {
                                                ...prev.elements,
                                                [selectedElement.id]: {
                                                    ...selectedElement,
                                                    commerce: { ...selectedElement.commerce, productId: v }
                                                }
                                            }
                                        }))}
                                        placeholder="prod_..."
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                            <label style={{ fontSize: '0.65rem', color: '#888' }}>PRICE</label>
                                        </div>
                                        <TextInput
                                            value={selectedElement.commerce?.price?.toString() || ''}
                                            onChange={(v) => setState((prev: any) => ({
                                                ...prev,
                                                elements: {
                                                    ...prev.elements,
                                                    [selectedElement.id]: {
                                                        ...selectedElement,
                                                        commerce: { ...selectedElement.commerce, price: parseFloat(v) || 0 }
                                                    }
                                                }
                                            }))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', marginBottom: '5px' }}>CURRENCY</label>
                                        <select
                                            value={selectedElement.commerce?.currency || 'USD'}
                                            onChange={(e) => setState((prev: any) => ({
                                                ...prev,
                                                elements: {
                                                    ...prev.elements,
                                                    [selectedElement.id]: {
                                                        ...selectedElement,
                                                        commerce: { ...selectedElement.commerce, currency: e.target.value }
                                                    }
                                                }
                                            }))}
                                            className="glass"
                                            style={{ width: '100%', padding: '8px', backgroundColor: '#000', color: 'white', fontSize: '0.75rem', border: '1px solid #333' }}
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>
                            </InputGroup>
                        )}
                        {/* 2.5 PLACEHOLDER (New) */}
                        {(selectedElement.type === 'input' || selectedElement.type === 'textarea') && (
                            <InputGroup label="Placeholder">
                                <TextInput
                                    value={selectedElement.placeholder}
                                    onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, placeholder: v } } }))}
                                    placeholder="Type placeholder text..."
                                />
                            </InputGroup>
                        )}

                        {/* 2.6 GRID SETTINGS */}
                        {(selectedElement.type === 'grid' || s.display === 'grid') && (
                            <InputGroup label="Grid Layout">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <span style={{ fontSize: '0.6rem', color: '#666' }}>COLUMNS</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            className="glass"
                                            value={String(s.gridTemplateColumns || '').match(/repeat\((\d+)/)?.[1] || '2'}
                                            onChange={(e) => handleUpdateStyles({ gridTemplateColumns: `repeat(${e.target.value}, 1fr)` })}
                                            style={{ width: '100%', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}
                                        />
                                    </div>
                                    <div>
                                        <UnitInput label="Gap" value={String(s.gridGap || '')} onChange={(v) => handleUpdateStyles({ gridGap: v, gap: v })} placeholder="20px" />
                                    </div>
                                </div>
                            </InputGroup>
                        )}

                        {/* 2.7 SPACER SETTINGS */}
                        {selectedElement.type === 'spacer' && (
                            <UnitInput label="Height" value={String(s.height || '')} onChange={(v) => handleUpdateStyles({ height: v })} placeholder="50px" />
                        )}

                        {/* 2.8 DIVIDER SETTINGS */}
                        {selectedElement.type === 'divider' && (
                            <InputGroup label="Divider Settings">
                                <span style={{ fontSize: '0.6rem', color: '#666' }}>COLOR</span>
                                <ColorInput value={s.backgroundColor} onChange={(v) => handleUpdateStyles({ backgroundColor: v })} />
                                <div style={{ height: '10px' }}></div>
                                <UnitInput label="Thickness" value={String(s.height || '')} onChange={(v) => handleUpdateStyles({ height: v })} placeholder="1px" />
                                <div style={{ height: '10px' }}></div>
                                <UnitInput label="Margin (Ver)" value={String(s.margin || '')} onChange={(v) => handleUpdateStyles({ margin: v })} placeholder="20px 0" />
                            </InputGroup>
                        )}

                        {/* 1. LAYOUT INTELLIGENCE (PHASE 7) */}
                        <div style={{ padding: '15px', background: 'linear-gradient(135deg, rgba(0, 224, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%)', border: '1px solid rgba(0, 224, 255, 0.3)', borderRadius: '12px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Sparkles size={14} color="var(--accent-teal)" />
                                <h3 style={{ fontSize: '0.7rem', color: 'white', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Layout Intelligence</h3>
                            </div>
                            <button
                                onClick={handleMagicCleanup}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: 'var(--accent-teal)',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Wand2 size={14} /> MAGIC CLEANUP 🪄
                            </button>
                            <p style={{ fontSize: '0.6rem', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                                Converts messy absolute layouts into clean, predictive stacks.
                            </p>
                        </div>

                        {/* 2.9 FORM SETTINGS */}
                        {(selectedElement.type === 'input') && (
                            <InputGroup label="Form Settings">
                                <span style={{ fontSize: '0.6rem', color: '#666' }}>INPUT TYPE</span>
                                <SelectInput
                                    value={selectedElement.inputType || 'text'}
                                    onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, inputType: v } } }))}
                                    options={[
                                        { label: 'Text', value: 'text' },
                                        { label: 'Email', value: 'email' },
                                        { label: 'Password', value: 'password' },
                                        { label: 'Number', value: 'number' },
                                        { label: 'Date', value: 'date' },
                                        { label: 'URL', value: 'url' },
                                    ]}
                                />
                                <div style={{ height: '10px' }}></div>
                                <span style={{ fontSize: '0.6rem', color: '#666' }}>FIELD NAME (API ID)</span>
                                <TextInput value={selectedElement.name} onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, name: v } } }))} placeholder="email_field" />
                                <div style={{ height: '10px' }}></div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ccc' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedElement.required || false}
                                        onChange={(e) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, required: e.target.checked } } }))}
                                    />
                                    Required Field
                                </label>
                            </InputGroup>
                        )}

                        {/* 2.8.5 ACTIONS (LINKS) */}
                        <InputGroup label="Click Action">
                            <SelectInput
                                value={selectedElement.action?.type || 'none'}
                                onChange={(v) => {
                                    if (v === 'none') {
                                        setState((prev: any) => {
                                            const { action, ...rest } = prev.elements[selectedElement.id];
                                            return { ...prev, elements: { ...prev.elements, [selectedElement.id]: rest } };
                                        });
                                    } else {
                                        setState((prev: any) => ({
                                            ...prev,
                                            elements: {
                                                ...prev.elements,
                                                [selectedElement.id]: {
                                                    ...selectedElement,
                                                    action: { type: v, payload: selectedElement.action?.payload || '', target: '_self' }
                                                }
                                            }
                                        }));
                                    }
                                }}
                                options={[
                                    { label: 'None', value: 'none' },
                                    { label: 'Open URL', value: 'url' },
                                    { label: 'Go to Page', value: 'page' },
                                    { label: 'Scroll to Section', value: 'scroll' },
                                ]}
                            />
                            {selectedElement.action && (
                                <div style={{ marginTop: '10px' }}>
                                    <TextInput
                                        value={selectedElement.action.payload}
                                        onChange={(v) => setState((prev: any) => ({
                                            ...prev,
                                            elements: {
                                                ...prev.elements,
                                                [selectedElement.id]: {
                                                    ...selectedElement,
                                                    action: { ...selectedElement.action!, payload: v }
                                                }
                                            }
                                        }))}
                                        placeholder={selectedElement.action.type === 'url' ? 'https://example.com' : 'Target ID or Page Name'}
                                    />
                                    {selectedElement.action.type === 'url' && (
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ccc' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedElement.action.target === '_blank'}
                                                    onChange={(e) => setState((prev: any) => ({
                                                        ...prev,
                                                        elements: {
                                                            ...prev.elements,
                                                            [selectedElement.id]: {
                                                                ...selectedElement,
                                                                action: { ...selectedElement.action!, target: e.target.checked ? '_blank' : '_self' }
                                                            }
                                                        }
                                                    }))}
                                                />
                                                Open in new tab
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}
                        </InputGroup>
                        {selectedElement.type === 'icon' && (
                            <InputGroup label="Icon Settings">
                                <span style={{ fontSize: '0.6rem', color: '#666' }}>ICON NAME</span>
                                <SelectInput
                                    value={selectedElement.content}
                                    onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, content: v } } }))}
                                    options={[
                                        { label: 'Home', value: 'Home' },
                                        { label: 'User', value: 'User' },
                                        { label: 'Settings', value: 'Settings' },
                                        { label: 'Search', value: 'Search' },
                                        { label: 'Menu', value: 'Menu' },
                                        { label: 'ShoppingCart', value: 'ShoppingCart' },
                                        { label: 'Star', value: 'Star' },
                                        { label: 'Heart', value: 'Heart' },
                                        { label: 'ChevronDown', value: 'ChevronDown' },
                                        { label: 'ChevronRight', value: 'ChevronRight' },
                                        { label: 'ArrowRight', value: 'ArrowRight' },
                                        { label: 'Check', value: 'Check' },
                                        { label: 'X', value: 'X' },
                                        { label: 'Instagram', value: 'Instagram' },
                                        { label: 'Twitter', value: 'Twitter' },
                                        { label: 'Facebook', value: 'Facebook' },
                                        { label: 'Linkedin', value: 'Linkedin' },
                                    ]}
                                />
                                <div style={{ height: '10px' }}></div>
                                <span style={{ fontSize: '0.6rem', color: '#666' }}>COLOR</span>
                                <ColorInput value={s.color} onChange={(v) => handleUpdateStyles({ color: v })} />
                                <div style={{ height: '10px' }}></div>
                                <UnitInput label="Size" value={String(s.width || '')} onChange={(v) => handleUpdateStyles({ width: v, height: v, fontSize: v })} placeholder="48px" />
                            </InputGroup>
                        )}

                        {/* 2.10 EMBED SETTINGS */}
                        {selectedElement.type === 'embed' && (
                            <InputGroup label="Embed Code">
                                <textarea
                                    className="glass"
                                    value={selectedElement.content || ''}
                                    onChange={(e) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, content: e.target.value } } }))}
                                    rows={6}
                                    placeholder="Paste <iframe> or HTML here..."
                                    style={{ width: '100%', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace' }}
                                />
                            </InputGroup>
                        )}

                        {/* 2.11 LOTTIE SETTINGS */}
                        {selectedElement.type === 'lottie' && (
                            <InputGroup label="Lottie Settings">
                                <span style={{ fontSize: '0.6rem', color: '#666' }}>LOTTIE ANIMATION ID</span>
                                <TextInput
                                    value={selectedElement.content}
                                    onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, content: v } } }))}
                                    placeholder="e.g. 12345"
                                />
                                <a href="https://lottiefiles.com/featured" target="_blank" rel="noreferrer" style={{ fontSize: '0.6rem', color: 'var(--accent-teal)', marginTop: '5px', display: 'block' }}>Browse LottieFiles →</a>
                            </InputGroup>
                        )}

                        {/* 2.12 ACCORDION SETTINGS */}
                        {selectedElement.type === 'accordion' && (
                            <InputGroup label="Accordion Settings">
                                <span style={{ fontSize: '0.6rem', color: '#666' }}>TITLE</span>
                                <TextInput
                                    value={selectedElement.content}
                                    onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, content: v } } }))}
                                    placeholder="Click to expand"
                                />
                            </InputGroup>
                        )}

                        {/* 2.13 OPTION BUILDER (Select, Checkbox, Radio) */}
                        {(selectedElement.type === 'select' || selectedElement.type === 'checkbox' || selectedElement.type === 'radio') && (
                            <InputGroup label="Options / Items">
                                {selectedElement.options?.map((opt, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px', alignItems: 'center' }}>
                                        <TextInput
                                            value={opt.label}
                                            onChange={(v) => {
                                                const newOpts = [...(selectedElement.options || [])];
                                                newOpts[i] = { ...newOpts[i], label: v, value: v.toLowerCase().replace(/\s+/g, '_') };
                                                setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, options: newOpts } } }));
                                            }}
                                            placeholder="Label"
                                        />
                                        <button
                                            onClick={() => {
                                                const newOpts = selectedElement.options?.filter((_, index) => index !== i);
                                                setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, options: newOpts } } }));
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1rem' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newOpts = [...(selectedElement.options || []), { label: 'New Option', value: 'new_option' }];
                                        setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, options: newOpts } } }));
                                    }}
                                    style={{ width: '100%', padding: '5px', background: 'rgba(255,255,255,0.05)', border: '1px dashed #444', color: '#aaa', fontSize: '0.6rem', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    + ADD OPTION
                                </button>
                            </InputGroup>
                        )}

                        {/* 3. DIMENSIONS */}
                        <InputGroup label="Dimensions" propNames={['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight']}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <PropertyLabel label="WIDTH" propName="width" />
                                    <UnitInput value={String(s.width || '')} onChange={(v) => handleUpdateStyles({ width: v })} placeholder="auto" />
                                </div>
                                <div>
                                    <PropertyLabel label="HEIGHT" propName="height" />
                                    <UnitInput value={String(s.height || '')} onChange={(v) => handleUpdateStyles({ height: v })} placeholder="auto" />
                                </div>
                            </div>
                            <div style={{ height: '10px' }}></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <PropertyLabel label="MIN W" propName="minWidth" />
                                    <UnitInput value={String(s.minWidth || '')} onChange={(v) => handleUpdateStyles({ minWidth: v })} placeholder="0px" />
                                </div>
                                <div>
                                    <PropertyLabel label="MAX W" propName="maxWidth" />
                                    <UnitInput value={String(s.maxWidth || '')} onChange={(v) => handleUpdateStyles({ maxWidth: v })} placeholder="none" />
                                </div>
                            </div>
                        </InputGroup>

                        {/* 4. LAYOUT (Flex/Grid) */}
                        <InputGroup label="Layout">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <IconToggleGroup
                                    label="Display"
                                    value={s.display || 'block'}
                                    onChange={(v) => handleUpdateStyles({ display: v })}
                                    options={[
                                        { value: 'block', icon: LayoutTemplate, title: 'Block' },
                                        { value: 'flex', icon: AlignHorizontalSpaceBetween, title: 'Flex' },
                                        { value: 'grid', icon: Grid, title: 'Grid' },
                                        { value: 'none', icon: EyeOff, title: 'None' }
                                    ]}
                                />
                                {s.display === 'flex' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <IconToggleGroup
                                            label="Direction"
                                            value={s.flexDirection || 'row'}
                                            onChange={(v) => handleUpdateStyles({ flexDirection: v })}
                                            options={[
                                                { value: 'row', icon: ArrowRight, title: 'Row' },
                                                { value: 'column', icon: ArrowDown, title: 'Column' }
                                            ]}
                                        />
                                        <IconToggleGroup
                                            label="Wrap"
                                            value={s.flexWrap || 'nowrap'}
                                            onChange={(v) => handleUpdateStyles({ flexWrap: v })}
                                            options={[
                                                { value: 'nowrap', icon: ExternalLink, title: 'No Wrap' }, // Icon placeholder
                                                { value: 'wrap', icon: List, title: 'Wrap' }
                                            ]}
                                        />
                                    </div>
                                )}

                                {s.display === 'flex' && (
                                    <>
                                        <div style={{ marginBottom: '10px' }}>
                                            <IconToggleGroup
                                                label="Align Items"
                                                value={s.alignItems || 'stretch'}
                                                onChange={(v) => handleUpdateStyles({ alignItems: v })}
                                                options={[
                                                    { value: 'flex-start', icon: AlignVerticalJustifyStart, title: 'Start' },
                                                    { value: 'center', icon: AlignVerticalJustifyCenter, title: 'Center' },
                                                    { value: 'flex-end', icon: AlignVerticalJustifyEnd, title: 'End' },
                                                    { value: 'stretch', icon: AlignHorizontalJustifyCenter, title: 'Stretch' } // Approx icon
                                                ]}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <IconToggleGroup
                                                label="Justify Content"
                                                value={s.justifyContent || 'flex-start'}
                                                onChange={(v) => handleUpdateStyles({ justifyContent: v })}
                                                options={[
                                                    { value: 'flex-start', icon: AlignHorizontalJustifyStart, title: 'Start' },
                                                    { value: 'center', icon: AlignHorizontalJustifyCenter, title: 'Center' },
                                                    { value: 'flex-end', icon: AlignHorizontalJustifyEnd, title: 'End' },
                                                    { value: 'space-between', icon: AlignHorizontalSpaceBetween, title: 'Between' }
                                                ]}
                                            />
                                        </div>
                                    </>
                                )}

                                {s.display === 'grid' && (
                                    <>
                                        <div>
                                            <span style={{ fontSize: '0.6rem', color: '#666' }}>TEMPLATE COLS</span>
                                            <TextInput value={s.gridTemplateColumns} onChange={(v) => handleUpdateStyles({ gridTemplateColumns: v })} placeholder="1fr 1fr" />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.6rem', color: '#666' }}>TEMPLATE ROWS</span>
                                            <TextInput value={s.gridTemplateRows} onChange={(v) => handleUpdateStyles({ gridTemplateRows: v })} placeholder="auto" />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.6rem', color: '#666' }}>AUTO FLOW</span>
                                            <SelectInput value={s.gridAutoFlow} onChange={(v) => handleUpdateStyles({ gridAutoFlow: v })} options={[{ label: 'Row', value: 'row' }, { label: 'Column', value: 'column' }, { label: 'Dense', value: 'dense' }]} />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <span style={{ fontSize: '0.6rem', color: '#666' }}>TEMPLATE AREAS</span>
                                            <TextInput value={s.gridTemplateAreas} onChange={(v) => handleUpdateStyles({ gridTemplateAreas: v })} placeholder='"header header" "sidebar content"' />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <UnitInput label="Gap" value={String(s.gap || '')} onChange={(v) => handleUpdateStyles({ gap: v })} placeholder="0px" />
                                </div>
                            </div>
                        </InputGroup>

                        {/* 4.1 LAYOUT (Child Context) */}
                        {selectedElement.parentId && state.elements[selectedElement.parentId] && (
                            state.elements[selectedElement.parentId].styles?.display === 'flex' || state.elements[selectedElement.parentId].styles?.display === 'grid'
                        ) && (
                                <InputGroup label={`Layout(Item in ${state.elements[selectedElement.parentId].styles?.display})`}>
                                    {state.elements[selectedElement.parentId].styles?.display === 'flex' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <span style={{ fontSize: '0.6rem', color: '#666' }}>GROW</span>
                                                <TextInput value={String(s.flexGrow || '')} onChange={(v) => handleUpdateStyles({ flexGrow: v })} placeholder="0" />
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.6rem', color: '#666' }}>SHRINK</span>
                                                <TextInput value={String(s.flexShrink || '')} onChange={(v) => handleUpdateStyles({ flexShrink: v })} placeholder="1" />
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.6rem', color: '#666' }}>BASIS</span>
                                                <TextInput value={String(s.flexBasis || '')} onChange={(v) => handleUpdateStyles({ flexBasis: v })} placeholder="auto" />
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.6rem', color: '#666' }}>ALIGN SELF</span>
                                                <SelectInput value={s.alignSelf} onChange={(v) => handleUpdateStyles({ alignSelf: v })} options={[{ label: 'Auto', value: 'auto' }, { label: 'Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'flex-end' }, { label: 'Stretch', value: 'stretch' }]} />
                                            </div>
                                        </div>
                                    )}
                                    {state.elements[selectedElement.parentId].styles?.display === 'grid' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <span style={{ fontSize: '0.6rem', color: '#666' }}>COL SPAN</span>
                                                <TextInput value={s.gridColumn} onChange={(v) => handleUpdateStyles({ gridColumn: v })} placeholder="auto / span 1" />
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.6rem', color: '#666' }}>ROW SPAN</span>
                                                <TextInput value={s.gridRow} onChange={(v) => handleUpdateStyles({ gridRow: v })} placeholder="auto / span 1" />
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <span style={{ fontSize: '0.6rem', color: '#666' }}>GRID AREA NAME</span>
                                                <TextInput value={s.gridArea} onChange={(v) => handleUpdateStyles({ gridArea: v })} placeholder="e.g. sidebar" />
                                            </div>
                                        </div>
                                    )}
                                </InputGroup>
                            )}

                        {/* 5. SPACING */}
                        <InputGroup label="Spacing" propNames={['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']}>
                            <BoxModelEditor
                                styles={s}
                                onChange={(updates: any) => handleUpdateStyles(updates)}
                            />
                        </InputGroup>

                        {/* 6. APPEARANCE */}
                        <InputGroup label="Appearance" propNames={['color', 'backgroundColor', 'backgroundImage', 'borderRadius', 'border', 'opacity', 'cursor', 'backgroundAttachment']}>
                            <PropertyLabel label="BACKGROUND" propName="backgroundColor" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <ColorInput value={s.backgroundColor} onChange={(v) => handleUpdateStyles({ backgroundColor: v })} />
                                <GradientPicker value={s.backgroundImage || 'none'} onChange={(v) => handleUpdateStyles({ backgroundImage: v })} />
                            </div>

                            <div style={{ height: '10px' }}></div>

                            <PropertyLabel label="TEXT COLOR" propName="color" />
                            <ColorInput value={s.color} onChange={(v) => handleUpdateStyles({ color: v })} />

                            <div style={{ height: '10px' }}></div>

                            <PropertyLabel label="BG IMAGE URL" propName="backgroundImage" />
                            <TextInput value={s.backgroundImage?.replace('url(', '').replace(')', '')?.replace(/linear-gradient\(.*\)/, '')} onChange={(v) => handleUpdateStyles({ backgroundImage: `url(${v})`, backgroundSize: 'cover', backgroundPosition: 'center' })} placeholder="https://..." />

                            {/* Attachment */}
                            <div style={{ marginTop: '8px' }}>
                                <PropertyLabel label="ATTACHMENT" propName="backgroundAttachment" />
                                <SelectInput
                                    value={s.backgroundAttachment || 'scroll'}
                                    onChange={(v) => handleUpdateStyles({ backgroundAttachment: v })}
                                    options={[{ label: 'Scroll', value: 'scroll' }, { label: 'Fixed', value: 'fixed' }, { label: 'Local', value: 'local' }]}
                                />
                            </div>

                            <div style={{ height: '10px' }}></div>

                            {/* ADVANCED BORDERS */}
                            <AdvancedBorderEditor styles={s} onChange={(updates: any) => handleUpdateStyles(updates)} />

                            <div style={{ height: '10px' }}></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <PropertyLabel label="OPACITY" propName="opacity" />
                                    <TextInput value={s.opacity} onChange={(v) => handleUpdateStyles({ opacity: v })} placeholder="0.0 - 1.0" />
                                </div>
                                <div>
                                    <PropertyLabel label="CURSOR" propName="cursor" />
                                    <SelectInput value={s.cursor} onChange={(v) => handleUpdateStyles({ cursor: v })} options={[{ label: 'Default', value: 'default' }, { label: 'Pointer', value: 'pointer' }, { label: 'Text', value: 'text' }, { label: 'Move', value: 'move' }]} />
                                </div>
                            </div>
                        </InputGroup>

                        {/* 6.1 PREMIUM EFFECT PRESETS (PHASE 8) */}
                        <div style={{ padding: '15px', border: '1px solid rgba(253, 0, 255, 0.2)', backgroundColor: 'rgba(253, 0, 255, 0.02)', borderRadius: '12px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Sparkles size={14} color="#FF00FF" />
                                <h3 style={{ fontSize: '0.7rem', color: 'white', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Premium Presets</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <button
                                    onClick={() => handleUpdateStyles({
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px'
                                    })}
                                    style={{ padding: '8px', fontSize: '0.65rem', backgroundColor: '#111', color: '#eee', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Glassmorphism
                                </button>
                                <button
                                    onClick={() => handleUpdateStyles({
                                        backgroundColor: '#e0e0e0',
                                        boxShadow: '9px 9px 16px #bebebe, -9px -9px 16px #ffffff',
                                        borderRadius: '20px',
                                        color: '#333'
                                    })}
                                    style={{ padding: '8px', fontSize: '0.65rem', backgroundColor: '#111', color: '#eee', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Neumorphism
                                </button>
                                <button
                                    onClick={() => handleUpdateStyles({
                                        backgroundImage: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(339,49%,30%,1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(253,16%,7%,1) 0, transparent 50%)',
                                        backgroundSize: 'cover'
                                    })}
                                    style={{ padding: '8px', fontSize: '0.65rem', backgroundColor: '#111', color: '#eee', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', gridColumn: 'span 2' }}
                                >
                                    Dark Mesh Gradient
                                </button>
                                <button
                                    onClick={() => {
                                        // "Apple-style" Spring Presets
                                        setState((prev: any) => ({
                                            ...prev,
                                            elements: {
                                                ...prev.elements,
                                                [selectedElement.id]: {
                                                    ...selectedElement,
                                                    animationTransition: { type: 'spring', stiffness: 100, damping: 15, mass: 1 },
                                                    animationVariant: 'revealLeft' // Reveal with spring
                                                }
                                            }
                                        }));
                                    }}
                                    style={{ padding: '8px', fontSize: '0.65rem', backgroundColor: '#111', color: '#eee', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', gridColumn: 'span 2' }}
                                >
                                    Apple "Spring" Reveal
                                </button>
                            </div>
                        </div>

                        {/* 6.5 SHADOWS */}
                        <InputGroup label="Shadows" propNames={['boxShadow']}>
                            <ShadowEditor value={s.boxShadow || 'none'} onChange={(v) => handleUpdateStyles({ boxShadow: v })} />
                        </InputGroup>

                        {/* 6.6 EFFECTS */}
                        <InputGroup label="Effects" propNames={['filter', 'backdropFilter', 'mixBlendMode']}>
                            <FilterEditor styles={s} onChange={(updates: any) => handleUpdateStyles(updates)} />
                        </InputGroup>


                        {/* 7. TYPOGRAPHY */}
                        <InputGroup label="Typography" propNames={['fontSize', 'fontWeight', 'textAlign', 'lineHeight', 'letterSpacing', 'textTransform']}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                    <UnitInput label="Font Size" value={String(s.fontSize || '')} onChange={(v) => handleUpdateStyles({ fontSize: v })} placeholder="16px" overridden={isPropertyOverridden('fontSize')} />
                                </div>
                                <div>
                                    <PropertyLabel label="WEIGHT" propName="fontWeight" />
                                    <SelectInput
                                        value={s.fontWeight}
                                        onChange={(v) => handleUpdateStyles({ fontWeight: v })}
                                        options={[{ label: 'Thin', value: '100' }, { label: 'Light', value: '300' }, { label: 'Regular', value: '400' }, { label: 'Medium', value: '500' }, { label: 'Bold', value: '700' }, { label: 'Black', value: '900' }]}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '8px' }}>
                                <IconToggleGroup
                                    label="Alignment"
                                    value={s.textAlign || 'left'}
                                    onChange={(v) => handleUpdateStyles({ textAlign: v })}
                                    options={[
                                        { value: 'left', icon: AlignHorizontalJustifyStart, title: 'Left' },
                                        { value: 'center', icon: AlignHorizontalJustifyCenter, title: 'Center' },
                                        { value: 'right', icon: AlignHorizontalJustifyEnd, title: 'Right' },
                                        { value: 'justify', icon: AlignHorizontalSpaceBetween, title: 'Justify' }
                                    ]}
                                />
                                {isPropertyOverridden('textAlign') && <div style={{ height: '2px', backgroundColor: 'var(--accent-teal)', marginTop: '2px', borderRadius: '1px' }} />}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                                <div>
                                    <UnitInput label="Height" value={String(s.lineHeight || '')} onChange={(v) => handleUpdateStyles({ lineHeight: v })} placeholder="1.5" overridden={isPropertyOverridden('lineHeight')} />
                                </div>
                                <div>
                                    <UnitInput label="Spacing" value={String(s.letterSpacing || '')} onChange={(v) => handleUpdateStyles({ letterSpacing: v })} placeholder="0px" overridden={isPropertyOverridden('letterSpacing')} />
                                </div>
                            </div>

                            <div style={{ marginTop: '8px' }}>
                                <IconToggleGroup
                                    label="Transform"
                                    value={s.textTransform || 'none'}
                                    onChange={(v) => handleUpdateStyles({ textTransform: v })}
                                    options={[
                                        { value: 'none', icon: Type, title: 'None' },
                                        { value: 'uppercase', icon: CaseUpper, title: 'uppercase' }, // Need CaseUpper icon
                                        { value: 'lowercase', icon: CaseLower, title: 'lowercase' }, // Need CaseLower icon
                                        { value: 'capitalize', icon: Type, title: 'Capitalize' } // Placeholder
                                    ]}
                                />
                                {isPropertyOverridden('textTransform') && <div style={{ height: '2px', backgroundColor: 'var(--accent-teal)', marginTop: '2px', borderRadius: '1px' }} />}
                            </div>
                            {/* SPLIT TEXT REVEAL */}
                            <div style={{ marginTop: '10px', borderTop: '1px solid #222', paddingTop: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontWeight: 'bold' }}>SPLIT TEXT REVEAL</span>
                                    <SelectInput
                                        value={selectedElement.splitText || 'none'}
                                        onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, splitText: v } } }))}
                                        options={[{ label: 'None', value: 'none' }, { label: 'By Chars', value: 'chars' }, { label: 'By Words', value: 'words' }]}
                                    />
                                </div>
                                {selectedElement.splitText && selectedElement.splitText !== 'none' && (
                                    <div style={{ marginTop: '5px' }}>
                                        <span style={{ fontSize: '0.6rem', color: '#666' }}>STAGGER DELAY (s)</span>
                                        <TextInput
                                            value={selectedElement.staggerDelay || 0.05}
                                            onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, staggerDelay: parseFloat(v) } } }))}
                                            placeholder="0.05"
                                        />
                                    </div>
                                )}
                            </div>


                        </InputGroup>

                        {/* 7.5 IMAGE SETTINGS */}
                        {selectedElement.type === 'image' && (
                            <InputGroup label="Image Settings">
                                <span style={{ fontSize: '0.6rem', color: '#666' }}>IMAGE SOURCE URL</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <TextInput
                                        value={selectedElement.content}
                                        onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, content: v } } }))}
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                    <button
                                        onClick={() => openAssetVault((asset) => {
                                            setState((prev: any) => ({
                                                ...prev,
                                                elements: {
                                                    ...prev.elements,
                                                    [selectedElement.id]: {
                                                        ...selectedElement,
                                                        content: asset.url,
                                                        altText: asset.altText || selectedElement.altText
                                                    }
                                                }
                                            }));
                                        })}
                                        style={{
                                            padding: '4px 8px',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            border: '1px solid #444',
                                            color: 'var(--accent-teal)',
                                            borderRadius: '4px',
                                            fontSize: '0.65rem',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <ImageIcon size={12} /> LIBRARY
                                    </button>
                                </div>
                                <div style={{ height: '10px' }}></div>
                                <span style={{ fontSize: '0.6rem', color: '#666' }}>ALT TEXT (SEO)</span>
                                <TextInput
                                    value={selectedElement.altText || ''}
                                    onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, altText: v } } }))}
                                    placeholder="Describe this image..."
                                />
                                <div style={{ height: '10px' }}></div>
                                <span style={{ fontSize: '0.6rem', color: '#666' }}>OBJECT FIT</span>
                                <SelectInput
                                    value={s.objectFit}
                                    onChange={(v) => handleUpdateStyles({ objectFit: v })}
                                    options={[{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Fill', value: 'fill' }]}
                                />

                                {/* Framer17: Locale Overrides */}
                                {renderLocaleMediaControls()}

                                <div style={{ marginTop: '15px', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(0, 255, 200, 0.03)', border: '1px solid rgba(0, 255, 200, 0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <Sparkles size={12} color="var(--accent-teal)" />
                                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'white' }}>ASSET INTELLIGENCE</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem' }}>
                                            <span style={{ color: '#888' }}>Format</span>
                                            <span style={{ color: 'var(--accent-teal)' }}>WebP (Auto)</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem' }}>
                                            <span style={{ color: '#888' }}>SEO Score</span>
                                            <span style={{ color: selectedElement.altText ? 'var(--accent-teal)' : '#ff4444' }}>{selectedElement.altText ? '100%' : '0%'}</span>
                                        </div>
                                    </div>
                                </div>
                            </InputGroup>
                        )}

                        {/* 8. INTERACTIONS & MOTION (Unified) */}
                        <InputGroup label="Interactions & Motion" propNames={['animationName', 'scrollTimeline', 'hoverStyles']}>
                            <button
                                onClick={openTimeline}
                                className="glass"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginBottom: '15px',
                                    backgroundColor: 'rgba(0, 224, 255, 0.05)',
                                    border: '1px solid rgba(0, 224, 255, 0.2)',
                                    borderRadius: '8px',
                                    color: '#00E0FF',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    cursor: 'pointer'
                                }}
                            >
                                <Zap size={14} /> OPEN MOTION TIMELINE
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                                {/* TRIGGER: ENTER (Entrance Animations) */}
                                <div className="interaction-section" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                        <Zap size={14} color="var(--accent-gold)" />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>ENTRANCE</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.6rem', color: '#666' }}>PRESET</span>
                                            <SelectInput
                                                value={s.animationName}
                                                onChange={(v) => handleUpdateStyles({ animationName: v, animationFillMode: 'both' })}
                                                options={[
                                                    { label: 'None', value: 'none' },
                                                    { label: 'Fade In', value: 'fadeIn' },
                                                    { label: 'Fade In Up', value: 'fadeInUp' },
                                                    { label: 'Fade In Down', value: 'fadeInDown' },
                                                    { label: 'Reveal Left', value: 'revealLeft' },
                                                    { label: 'Reveal Right', value: 'revealRight' },
                                                    { label: 'Blur In', value: 'blurIn' },
                                                    { label: 'Scale Up', value: 'scaleUp' },
                                                    { label: 'Slide In Left', value: 'slideInLeft' },
                                                    { label: 'Slide In Right', value: 'slideInRight' },
                                                    { label: 'Zoom In', value: 'zoomIn' },
                                                    { label: 'Bounce', value: 'bounce' },
                                                    { label: 'Spin', value: 'spin' },
                                                ]}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedElement.animationRepeat || false}
                                                onChange={(e) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, animationRepeat: e.target.checked } } }))}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#aaa' }}>REPEAT ON ENTRY</span>
                                        </div>

                                        {selectedElement.type === 'text' && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.6rem', color: '#666' }}>SPLIT TEXT</span>
                                                    <SelectInput
                                                        value={selectedElement.splitText || 'none'}
                                                        onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, splitText: v } } }))}
                                                        options={[{ label: 'None', value: 'none' }, { label: 'Words', value: 'words' }, { label: 'Chars', value: 'chars' }]}
                                                    />
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.6rem', color: '#666' }}>STAGGER (s)</span>
                                                    <TextInput
                                                        value={selectedElement.staggerDelay || 0.05}
                                                        onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, staggerDelay: parseFloat(v) } } }))}
                                                        placeholder="0.05"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: '5px', borderRadius: '4px' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'white' }}>DYNAMICS</span>
                                            <SelectInput
                                                value={selectedElement.animationTransition?.type || 'tween'}
                                                onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, animationTransition: { ...selectedElement.animationTransition, type: v } } } }))}
                                                options={[{ label: 'Tween (Linear)', value: 'tween' }, { label: 'Spring (Physics)', value: 'spring' }]}
                                            />
                                        </div>

                                        {/* NEW: PHYSICS TUNER TRIGGER */}
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                onClick={() => setShowPhysicsHUD(!showPhysicsHUD)}
                                                className="glass"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    backgroundColor: 'rgba(0, 255, 150, 0.05)',
                                                    border: '1px solid rgba(0, 255, 150, 0.2)',
                                                    borderRadius: '4px',
                                                    color: 'var(--accent-teal)',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Activity size={12} /> TUNE SPRING PHYSICS
                                            </button>

                                            {showPhysicsHUD && (
                                                <div style={{ position: 'absolute', bottom: '100%', right: '0', marginBottom: '10px', zIndex: 1000 }}>
                                                    <PhysicsHUD />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ marginBottom: '10px' }}>
                                            <span style={{ fontSize: '0.6rem', color: '#666' }}>PRESET</span>
                                            <SelectInput
                                                value={selectedElement.animationTransition?.preset || 'custom'}
                                                onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, animationTransition: { ...selectedElement.animationTransition, preset: v as any } } } }))}
                                                options={[
                                                    { label: 'Natural', value: 'natural' },
                                                    { label: 'Snappy', value: 'snappy' },
                                                    { label: 'Soft', value: 'soft' },
                                                    { label: 'Custom', value: 'custom' }
                                                ]}
                                            />
                                        </div>

                                        {(selectedElement.animationTransition?.type === 'spring' || !selectedElement.animationTransition?.type) && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                                                <div style={{ opacity: selectedElement.animationTransition?.preset && selectedElement.animationTransition.preset !== 'custom' ? 0.5 : 1 }}>
                                                    <span style={{ fontSize: '0.5rem', color: '#666' }}>STIFFNESS</span>
                                                    <TextInput
                                                        value={selectedElement.animationTransition?.stiffness || 100}
                                                        onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, animationTransition: { ...selectedElement.animationTransition, stiffness: parseFloat(v), preset: 'custom' } } } }))}
                                                        placeholder="100"
                                                    />
                                                </div>
                                                <div style={{ opacity: selectedElement.animationTransition?.preset && selectedElement.animationTransition.preset !== 'custom' ? 0.5 : 1 }}>
                                                    <span style={{ fontSize: '0.5rem', color: '#666' }}>DAMPING</span>
                                                    <TextInput
                                                        value={selectedElement.animationTransition?.damping || 10}
                                                        onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, animationTransition: { ...selectedElement.animationTransition, damping: parseFloat(v), preset: 'custom' } } } }))}
                                                        placeholder="10"
                                                    />
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.5rem', color: '#666' }}>MASS</span>
                                                    <TextInput
                                                        value={selectedElement.animationTransition?.mass || 1}
                                                        onChange={(v) => setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, animationTransition: { ...selectedElement.animationTransition, mass: parseFloat(v) } } } }))}
                                                        placeholder="1"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <span style={{ fontSize: '0.6rem', color: '#666' }}>DURATION (s)</span>
                                                <TextInput value={s.animationDuration} onChange={(v) => handleUpdateStyles({ animationDuration: v })} placeholder="0.3s" />
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.6rem', color: '#666' }}>DELAY (s)</span>
                                                <TextInput value={s.animationDelay} onChange={(v) => handleUpdateStyles({ animationDelay: v })} placeholder="0s" />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: 'rgba(0,255,150,0.05)', borderRadius: '6px', border: '1px solid rgba(0,255,150,0.1)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Zap size={14} color="var(--accent-teal)" />
                                                <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>MAGIC MOTION</span>
                                            </div>
                                            <div
                                                onClick={() => handleUpdateStyles({ magicMotion: !s.magicMotion })}
                                                style={{
                                                    width: '32px',
                                                    height: '18px',
                                                    backgroundColor: s.magicMotion ? 'var(--accent-teal)' : '#444',
                                                    borderRadius: '9px',
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '2px',
                                                    left: s.magicMotion ? '16px' : '2px',
                                                    width: '14px',
                                                    height: '14px',
                                                    backgroundColor: 'white',
                                                    borderRadius: '50%',
                                                    transition: 'left 0.2s'
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TRIGGER: SCROLL (Scroll-Linked) */}
                                <div className="interaction-section" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                        <Menu size={14} color="var(--accent-teal)" />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>SCROLL TRACKING</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedElement.scrollTimeline?.map((t, i) => (
                                            <div key={i} style={{ backgroundColor: '#111', padding: '8px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <SelectInput
                                                        value={t.prop}
                                                        onChange={(v) => {
                                                            const newTimeline = [...(selectedElement.scrollTimeline || [])];
                                                            newTimeline[i] = { ...newTimeline[i], prop: v as any };
                                                            updateElementProp(selectedElement.id, 'scrollTimeline', newTimeline);
                                                        }}
                                                        options={[
                                                            { label: 'Opacity', value: 'opacity' },
                                                            { label: 'Scale', value: 'scale' },
                                                            { label: 'Y Offset', value: 'y' },
                                                            { label: 'Rotate', value: 'rotate' },
                                                            { label: 'Skew X', value: 'skewX' },
                                                            { label: 'Skew Y', value: 'skewY' },
                                                            { label: 'Blur', value: 'blur' }
                                                        ]}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newTimeline = selectedElement.scrollTimeline?.filter((_, idx) => idx !== i);
                                                            setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, scrollTimeline: newTimeline } } }));
                                                        }}
                                                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '10px' }}
                                                    >✖</button>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                                    <div>
                                                        <span style={{ fontSize: '0.5rem', color: '#666' }}>VALUE (TO)</span>
                                                        <TextInput value={t.to} onChange={(v) => {
                                                            const newTimeline = [...(selectedElement.scrollTimeline || [])];
                                                            newTimeline[i] = { ...newTimeline[i], to: v };
                                                            setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, scrollTimeline: newTimeline } } }));
                                                        }} placeholder="1" />
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.5rem', color: '#666' }}>OFFSET (%)</span>
                                                        <TextInput value={t.start} onChange={(v) => {
                                                            const newTimeline = [...(selectedElement.scrollTimeline || [])];
                                                            newTimeline[i] = { ...newTimeline[i], start: parseFloat(v) };
                                                            setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, scrollTimeline: newTimeline } } }));
                                                        }} placeholder="0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => {
                                                const newTimeline = [...(selectedElement.scrollTimeline || []), { prop: 'opacity', from: 1, to: 0, start: 0, end: 1 }];
                                                setState((prev: any) => ({ ...prev, elements: { ...prev.elements, [selectedElement.id]: { ...selectedElement, scrollTimeline: newTimeline } } }));
                                            }}
                                            style={{ width: '100%', padding: '8px', background: 'rgba(0,255,150,0.05)', border: '1px dashed var(--accent-teal)', color: 'var(--accent-teal)', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            + ADD SCROLL TRACK
                                        </button>
                                    </div>
                                </div>

                                {/* TRIGGER: HOVER (Visual Cue) */}
                                <div className="interaction-section" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                        <Sparkles size={14} color="#00E0FF" />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>HOVER STATE</span>
                                    </div>
                                    <button
                                        onClick={() => setState((prev: any) => ({ ...prev, activeState: prev.activeState === 'hover' ? 'default' : 'hover' }))}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            backgroundColor: state.activeState === 'hover' ? 'var(--accent-teal)' : 'rgba(255,255,255,0.05)',
                                            color: state.activeState === 'hover' ? 'black' : 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {state.activeState === 'hover' ? 'EDITING HOVER...' : 'EDIT HOVER STYLES'}
                                    </button>
                                </div>

                                {/* TRIGGER: SCRIPTING (Logic) */}
                                <div className="interaction-section" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                        <Terminal size={14} color="var(--accent-gold)" />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>LOGIC & SCRIPTING</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {selectedElement.blueprintId ? (
                                            <button
                                                onClick={() => openBlueprint?.(selectedElement.blueprintId!)}
                                                className="glass"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    backgroundColor: 'rgba(0, 255, 150, 0.05)',
                                                    border: '1px solid rgba(0, 255, 150, 0.2)',
                                                    borderRadius: '6px',
                                                    color: 'var(--accent-teal)',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.7rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Zap size={14} /> EDIT LOGIC BLUEPRINT
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => createBlueprint(selectedElement.id)}
                                                className="glass"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                                    border: '1px dashed #444',
                                                    borderRadius: '6px',
                                                    color: '#888',
                                                    fontSize: '0.7rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Plus size={14} /> ADD LOGIC BLUEPRINT
                                            </button>
                                        )}

                                        <div style={{ height: '10px', borderTop: '1px solid #222', margin: '5px 0' }}></div>

                                        {['onMount', 'onHover', 'onClick'].map((type) => (
                                            <div key={type}>
                                                <span style={{ fontSize: '0.5rem', color: '#666', textTransform: 'uppercase' }}>{type}</span>
                                                <textarea
                                                    value={(selectedElement.customCode as any)?.[type] || ''}
                                                    onChange={(e) => setElementCode(selectedElement.id, type as any, e.target.value)}
                                                    placeholder="// Enter JS code here..."
                                                    spellCheck={false}
                                                    style={{
                                                        width: '100%',
                                                        height: '60px',
                                                        backgroundColor: '#000',
                                                        color: '#0f0',
                                                        fontSize: '0.6rem',
                                                        fontFamily: 'monospace',
                                                        border: '1px solid #333',
                                                        borderRadius: '4px',
                                                        padding: '5px',
                                                        outline: 'none',
                                                        resize: 'vertical'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </InputGroup>

                        {/* 8.5 POSITIONING */}
                        <InputGroup label="Positioning">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <span style={{ fontSize: '0.6rem', color: '#666' }}>POSITION</span>
                                    <SelectInput
                                        value={s.position || 'relative'}
                                        onChange={(v) => handleUpdateStyles({ position: v })}
                                        options={[
                                            { label: 'Relative', value: 'relative' },
                                            { label: 'Absolute', value: 'absolute' },
                                            { label: 'Fixed', value: 'fixed' },
                                            { label: 'Sticky', value: 'sticky' }
                                        ]}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.6rem', color: '#666' }}>Z-INDEX</span>
                                    <TextInput
                                        value={s.zIndex?.toString() || ''}
                                        onChange={(v) => handleUpdateStyles({ zIndex: parseInt(v) || 0 })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            {(s.position === 'absolute' || s.position === 'fixed' || s.position === 'sticky') && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                    <div>
                                        <span style={{ fontSize: '0.6rem', color: '#666' }}>TOP</span>
                                        <UnitInput value={String(s.top || '')} onChange={(v) => handleUpdateStyles({ top: v })} placeholder="auto" />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.6rem', color: '#666' }}>LEFT</span>
                                        <UnitInput value={String(s.left || '')} onChange={(v) => handleUpdateStyles({ left: v })} placeholder="auto" />
                                    </div>
                                </div>
                            )}
                        </InputGroup>

                        {/* 9. TRANSFORM */}
                        <InputGroup label="Transform">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <SliderInput label="SCALE" value={String(s.scale || '1')} min={0.1} max={3} step={0.05} onChange={(v) => handleUpdateStyles({ scale: v })} />
                                <SliderInput label="ROTATE" value={String(s.rotate || '0deg')} min={-180} max={180} step={1} unit="deg" onChange={(v) => handleUpdateStyles({ rotate: v })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '5px' }}>
                                <SliderInput label="SKEW X" value={String(s.skewX || '0deg')} min={-45} max={45} step={1} unit="deg" onChange={(v) => handleUpdateStyles({ skewX: v })} />
                                <SliderInput label="SKEW Y" value={String(s.skewY || '0deg')} min={-45} max={45} step={1} unit="deg" onChange={(v) => handleUpdateStyles({ skewY: v })} />
                            </div>
                            <div style={{ height: '10px' }}></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <span style={{ fontSize: '0.6rem', color: '#666' }}>MOVE X (px)</span>
                                    <TextInput value={s.translateX} onChange={(v) => handleUpdateStyles({ translateX: v })} placeholder="0px" />
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.6rem', color: '#666' }}>MOVE Y (px)</span>
                                    <TextInput value={s.translateY} onChange={(v) => handleUpdateStyles({ translateY: v })} placeholder="0px" />
                                </div>
                            </div>
                        </InputGroup>

                        {/* 10. EFFECTS */}
                        <InputGroup label="Effects">
                            <span style={{ fontSize: '0.6rem', color: '#666' }}>SHADOW</span>
                            <TextInput value={s.boxShadow} onChange={(v) => handleUpdateStyles({ boxShadow: v })} placeholder="0 4px 6px rgba(0,0,0,0.1)" />

                            <div style={{ height: '10px' }}></div>

                            <span style={{ fontSize: '0.6rem', color: '#666' }}>BLUR (Backdrop)</span>
                            <TextInput value={s.backdropFilter} onChange={(v) => handleUpdateStyles({ backdropFilter: v })} placeholder="blur(10px)" />

                            <div style={{ height: '10px' }}></div>

                            <span style={{ fontSize: '0.6rem', color: '#666' }}>FILTER (CSS)</span>
                            <TextInput value={s.filter} onChange={(v) => handleUpdateStyles({ filter: v })} placeholder="blur(5px) grayscale(100%)..." />

                            <div style={{ height: '10px' }}></div>

                            <span style={{ fontSize: '0.6rem', color: '#666' }}>TRANSITION</span>
                            <TextInput value={s.transition} onChange={(v) => handleUpdateStyles({ transition: v })} placeholder="all 0.3s ease" />
                        </InputGroup>

                        {/* 11. AUTONOMOUS ENGINE (The Living OS) */}
                        <InputGroup label="Autonomous Engine">
                            <div style={{
                                padding: '12px',
                                background: 'linear-gradient(135deg, rgba(0, 224, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)',
                                borderRadius: '8px',
                                border: '1px solid rgba(0, 224, 255, 0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Brain size={16} color="#00E0FF" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'white', letterSpacing: '0.05em' }}>AUTO-EVOLVE</span>
                                    </div>
                                    <div
                                        onClick={() => setState((prev: any) => ({
                                            ...prev,
                                            elements: {
                                                ...prev.elements,
                                                [selectedElement.id]: {
                                                    ...selectedElement,
                                                    props: { ...(selectedElement.props || {}), autoTest: !selectedElement.props?.autoTest }
                                                }
                                            }
                                        }))}
                                        style={{
                                            width: '36px',
                                            height: '20px',
                                            backgroundColor: selectedElement.props?.autoTest ? 'var(--accent-teal)' : '#333',
                                            borderRadius: '10px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: '2px',
                                            left: selectedElement.props?.autoTest ? '18px' : '2px',
                                            width: '16px',
                                            height: '16px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            transition: 'inherit'
                                        }} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.6rem', color: '#aaa', margin: 0, lineHeight: '1.4' }}>
                                    The engine will autonomously A/B test variants and mutate the structural blueprint toward high-conversion architectures.
                                </p>
                                {selectedElement.props?.autoTest && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00ff00', boxShadow: '0 0 8px #00ff00' }}></div>
                                        <span style={{ fontSize: '0.55rem', color: '#00ff00', fontWeight: 'bold' }}>H.B.L. (Hyper-Bridge Live)</span>
                                    </div>
                                )}
                            </div>
                        </InputGroup>

                        {selectedElement.layoutMode === 'freedom' && (
                            <InputGroup label="Position (Freedom)">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <TextInput value={s.left} onChange={(v) => handleUpdateStyles({ left: v })} placeholder="X" />
                                    <TextInput value={s.top} onChange={(v) => handleUpdateStyles({ top: v })} placeholder="Y" />
                                    <TextInput value={s.zIndex} onChange={(v) => handleUpdateStyles({ zIndex: parseInt(v) || 0 })} placeholder="Z-Index" />
                                </div>
                            </InputGroup>
                        )}
                    </div>
                ) : null
                }

                {/* Framer16: Developer Tools */}
                <ComputedStyleInspector />
                <AuditLogPanel />
            </div >
        </aside >
    );
}
