"use client";

import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, closestCenter, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StrictDomEngine } from '@/lib/StrictDomEngine';
import { DesignerElement } from '@/types/designer';
import { ChevronRight, ChevronDown, Layout, Type, Image, Box, FileCode, GripVertical, AlertTriangle } from 'lucide-react';

interface LayersPanelProps {
    // We keep these for compatibility but prefer store now
    elementId?: string;
    elements?: Record<string, DesignerElement>;
    selectedElementId?: string | null;
    onSelect?: (id: string) => void;
    depth?: number;
}

// Map icons
const getIcon = (type: string) => {
    switch (type) {
        case 'container': return <Layout size={14} />;
        case 'text': return <Type size={14} />;
        case 'image': return <Image size={14} />;
        case 'button': return <Box size={14} />;
        default: return <FileCode size={14} />;
    }
}

export function LayersPanel() {
    const { state, setSelectedElement, reorderElement } = useProjectStore();
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const activeElement = state.elements[activeId];
        const overElement = state.elements[overId];

        // LOGIC:
        // If dropping onto an item, determine relation (Sibling or Child).
        // Dnd-kit sortable usually assumes Sibling reorder.
        // To support "Nest", we might need a specific drop zone or mode.
        // For this version:
        // We will enable standard Sortable reordering.
        // If sorting happens, we find the new parent likely sharing the parent of 'over'.

        // Simplified Reorder (Sibling Swap/Insert)
        const commonParentId = overElement.parentId;
        if (!commonParentId) return; // Can't move root or into void

        const commonParent = state.elements[commonParentId];
        const overIndex = commonParent.children?.indexOf(overId) ?? 0;

        // Strict DOM Check
        const validation = StrictDomEngine.validateNesting(
            commonParentId,
            commonParent.tagName || 'div',
            activeElement.tagName || 'div'
        );

        if (!validation.isValid) {
            console.error(validation.error);
            // In a real app we would show a Toast here
            alert(`Illegal Move: ${validation.error}`);
            return;
        }

        // Ideally we check parent tag. For now assume wrapper is valid if it was there.
        // Wait, if we move to a different parent (via DragOver changing context), we need strict check.

        // For now, let's implement the reorder assuming same parent dragging for simplicity (v1),
        // or Cross-Parent if dnd-kit handles it.

        // Dnd-kit's SortableContext handles the visual sorting, but `onDragEnd` needs to commit it.
        // If `over` is in a different container, `overElement.parentId` will be that container.

        reorderElement(activeId, commonParentId, overIndex);
    };

    const rootId = state.rootElementId;
    if (!rootId || !state.elements[rootId]) return null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-full overflow-y-auto p-2">
                <LayerTreeItem elementId={rootId} depth={0} isRoot />
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="p-2 bg-gray-700 rounded opacity-80 flex items-center gap-2">
                        <GripVertical size={14} />
                        {state.elements[activeId]?.type}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function LayerTreeItem({ elementId, depth, isRoot = false }: { elementId: string, depth: number, isRoot?: boolean }) {
    const { state, setSelectedElement } = useProjectStore();
    const element = state.elements[elementId];
    if (!element) return null;

    const [isCollapsed, setIsCollapsed] = useState(false);

    // Sortable Hook
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: elementId,
        data: { type: element.type, element }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        marginLeft: `${depth * 12}px`
    };

    const isSelected = state.selectedElementId === elementId;
    const hasChildren = element.children && element.children.length > 0;

    return (
        <div className="mb-1">
            <div
                ref={setNodeRef}
                style={style}
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(elementId);
                }}
                className={`
                    flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs
                    ${isSelected ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-white/5 text-gray-400'}
                `}
            >
                {/* Drag Handle & Collapse */}
                <div className="flex items-center" onMouseDown={e => e.stopPropagation()}>
                    {hasChildren ? (
                        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-0.5 hover:text-white">
                            {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                        </button>
                    ) : <span className="w-4" />}
                </div>

                {/* Draggable Listener on Icon/Name */}
                <div {...attributes} {...listeners} className="flex-1 flex items-center gap-2 cursor-grab active:cursor-grabbing">
                    {getIcon(element.type)}
                    <span className="truncate max-w-[120px]">{element.name || element.type} <span className="opacity-50 text-[10px]">#{element.id.substr(0, 4)}</span></span>
                    {element.tagName && <span className="ml-auto text-[10px] bg-white/10 px-1 rounded text-gray-500">{element.tagName}</span>}
                </div>
            </div>

            {/* Children container */}
            {!isCollapsed && hasChildren && (
                <div className="flex flex-col">
                    <SortableContext
                        items={element.children!}
                        strategy={verticalListSortingStrategy}
                    >
                        {element.children!.map(childId => (
                            <LayerTreeItem key={childId} elementId={childId} depth={depth + 1} />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    );
}
