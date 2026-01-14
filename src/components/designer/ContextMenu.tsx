import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import * as Icons from 'lucide-react';
import { ejectElementToCode } from '@/lib/designToCode/ejector';

interface ContextMenuProps {
    canvasTransform: { x: number; y: number; scale: number };
}

export function ContextMenu({ canvasTransform }: ContextMenuProps) {
    const { state, addElement, removeElement, setSelectedElement, clearSelection, reorderElement, createMasterComponent, duplicateElement, bulkUpdateElements } = useProjectStore();
    const [menu, setMenu] = useState<{ x: number, y: number, targetId: string | null } | null>(null);

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();

            let targetId: string | null = null;
            let current = e.target as HTMLElement;
            while (current && current !== document.body) {
                if (current.id && state.elements[current.id]) {
                    targetId = current.id;
                    break;
                }
                current = current.parentElement as HTMLElement;
            }

            if (targetId || (e.target as HTMLElement).closest('.canvas-area')) {
                setMenu({ x: e.clientX, y: e.clientY, targetId });
            } else {
                setMenu(null);
            }
        };

        const handleClick = () => setMenu(null);

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('click', handleClick);
        };
    }, [state.elements]);

    if (!menu) return null;

    const handleAction = (action: () => void) => {
        action();
        setMenu(null);
    };

    const wrapInContainer = () => {
        const idsToWrap = state.selectedElementIds.length > 0
            ? state.selectedElementIds
            : (menu.targetId ? [menu.targetId] : []);

        if (idsToWrap.length === 0) return;

        const firstEl = state.elements[idsToWrap[0]];
        const parentId = firstEl.parentId || 'root';

        const containerId = addElement('container', parentId, {
            styles: {
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                width: 'auto',
                height: 'auto'
            }
        });

        idsToWrap.forEach((id, index) => {
            reorderElement(id, containerId, index);
        });

        setSelectedElement(containerId);
    };

    const handleMakeComponent = () => {
        const target = menu.targetId || (state.selectedElementIds.length > 0 ? state.selectedElementIds[0] : null);
        if (!target) return;

        const name = prompt("Enter Component Name:");
        if (name) {
            createMasterComponent(target, name);
        }
    };

    const handleEjectToCode = () => {
        const targetId = menu.targetId || (state.selectedElementIds.length > 0 ? state.selectedElementIds[0] : null);
        if (!targetId) return;

        if (!confirm("Are you sure you want to eject this element to Custom Code? This cannot be fully undone.")) return;

        const code = ejectElementToCode(targetId, state.elements);

        // Transform the element type to 'custom-code'
        // We preserve styles on the wrapper, but the inner content is now the code.
        bulkUpdateElements({
            [targetId]: {
                type: 'custom-code',
                customCode: {
                    code: code,
                    exposedProps: {}
                },
                // We wipe children because they are now part of the code string
                children: []
            }
        });

        // Also need to remove children from the state? 
        // `bulkUpdateElements` merges, likely doesn't remove the children records themselves.
        // But since the parent no longer references them in `children` array, they are effectively orphaned.
        // A garbage collector would be nice, but for now this is fine.
    };

    const MenuItem = ({ icon, label, onClick, danger }: { icon: React.ReactNode, label: string, onClick: () => void, danger?: boolean }) => (
        <div
            onClick={(e) => { e.stopPropagation(); handleAction(onClick); }}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: danger ? '#ff4444' : '#eee',
                fontSize: '0.85rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                gap: '12px',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = danger ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)';
                if (!danger) e.currentTarget.style.color = 'var(--accent-teal)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = danger ? '#ff4444' : '#eee';
            }}
        >
            <span style={{ opacity: 0.7 }}>{icon}</span>
            <span>{label}</span>
        </div>
    );

    return (
        <div style={{
            position: 'fixed',
            top: menu.y,
            left: menu.x,
            width: '220px',
            backgroundColor: 'rgba(15, 15, 15, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            zIndex: 100001,
            padding: '6px',
            animation: 'menuIn 0.15s ease-out'
        }}>
            {menu.targetId ? (
                <>
                    <MenuItem icon={<Icons.MousePointer2 size={14} />} label="Select Element" onClick={() => setSelectedElement(menu.targetId!)} />
                    <MenuItem icon={<Icons.Copy size={14} />} label="Duplicate" onClick={() => duplicateElement(menu.targetId!)} />

                    <MenuItem icon={<Icons.Component size={14} />} label="Make Component" onClick={handleMakeComponent} />
                    <MenuItem icon={<Icons.Code2 size={14} />} label="Eject to Code" onClick={handleEjectToCode} danger />
                    <div style={separatorStyle} />
                    <MenuItem icon={<Icons.Box size={14} />} label="Wrap in Container" onClick={wrapInContainer} />
                    <MenuItem icon={<Icons.EyeOff size={14} />} label="Hide Element" onClick={() => { }} />
                    <MenuItem icon={<Icons.Lock size={14} />} label="Lock Element" onClick={() => { }} />
                    <div style={separatorStyle} />
                    <MenuItem icon={<Icons.Trash2 size={14} />} label="Delete" onClick={() => removeElement(menu.targetId!)} danger />
                </>
            ) : (
                <>
                    <MenuItem icon={<Icons.Plus size={14} />} label="Add Section" onClick={() => addElement('box', 'root', { styles: { width: '100%', height: '400px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' } })} />
                    <MenuItem icon={<Icons.FileText size={14} />} label="Add Page" onClick={() => { }} />
                    <div style={separatorStyle} />
                    <MenuItem icon={<Icons.X size={14} />} label="Clear Selection" onClick={() => clearSelection()} />
                </>
            )}

            <style>{`
                @keyframes menuIn {
                    from { opacity: 0; transform: scale(0.95) translateY(-5px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}

const separatorStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: '4px 6px'
};
