import React, { useState } from 'react';
import { ChevronRight, Plus, X, Type } from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { DesignClass } from '@/types/designer';

export const ClassBreadcrumbs = ({ elementId }: { elementId: string }) => {
    const { state, updateElementProp, mergeStylesIntoClass, setEditingClassId } = useProjectStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newClassName, setNewClassName] = useState('');

    const element = state.elements[elementId];
    if (!element) return null;

    const classNames = element.classNames || [];

    // Resolve class objects
    const classes = classNames.map(id => state.designSystem.classes.find(c => c.id === id)).filter(Boolean) as DesignClass[];
    const activeClassId = state.editingClassId;

    const handleAddClass = () => {
        if (!newClassName.trim()) return;
        // Merge current element styles into new class
        const classId = mergeStylesIntoClass(newClassName, element.styles || {}, [elementId]);
        setNewClassName('');
        setIsCreating(false);
        // Automatically switch to editing the new class
        setEditingClassId(classId);
    };

    const handleRemoveClass = (classId: string) => {
        const newClasses = classNames.filter(id => id !== classId);
        updateElementProp(elementId, 'classNames', newClasses);
        if (state.editingClassId === classId) setEditingClassId(null);
    };

    return (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #222', backgroundColor: '#0a0a0a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: '600' }}>SELECTOR:</span>

                {/* INHERITANCE CHAIN */}
                {classes.map((cls, i) => {
                    const isActive = activeClassId === cls.id;
                    return (
                        <div key={cls.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                                onClick={() => setEditingClassId(isActive ? null : cls.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    backgroundColor: isActive ? 'var(--accent-teal)' : 'var(--accent-teal-dim, rgba(0, 255, 150, 0.1))',
                                    border: '1px solid var(--accent-teal)',
                                    borderRadius: '12px',
                                    color: isActive ? 'black' : 'var(--accent-teal)',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    fontWeight: isActive ? 'bold' : 'normal'
                                }}
                                title={`Click to edit .${cls.name}`}
                            >
                                <span>.{cls.name}</span>
                                <X
                                    size={12}
                                    style={{ cursor: 'pointer', opacity: 0.7 }}
                                    onClick={(e) => { e.stopPropagation(); handleRemoveClass(cls.id); }}
                                />
                            </div>
                            <ChevronRight size={12} color="#444" style={{ margin: '0 2px' }} />
                        </div>
                    );
                })}

                {/* CURRENT INSTANCE */}
                <div
                    onClick={() => setEditingClassId(null)}
                    style={{
                        padding: '2px 8px',
                        backgroundColor: !activeClassId ? 'rgba(255,255,255,0.2)' : 'transparent',
                        borderRadius: '4px',
                        color: !activeClassId ? 'white' : '#666',
                        fontSize: '0.75rem',
                        fontStyle: 'italic',
                        cursor: 'pointer',
                        border: !activeClassId ? '1px solid #444' : '1px solid transparent'
                    }}>
                    Instance
                </div>

                {/* ADD CLASS BUTTON */}
                {isCreating ? (
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                        <input
                            autoFocus
                            type="text"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                            onBlur={() => setIsCreating(false)}
                            placeholder="ClassName..."
                            style={{
                                width: '100px',
                                background: '#111',
                                border: '1px solid var(--accent-teal)',
                                color: 'white',
                                fontSize: '0.75rem',
                                padding: '2px 4px',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        style={{
                            marginLeft: 'auto',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.7rem'
                        }}
                    >
                        <Plus size={14} /> Class
                    </button>
                )}
            </div>

            {classes.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '0.65rem', color: '#555', display: 'flex', gap: '8px' }}>
                    <span>{classes.length} classes applied</span>
                    <span style={{ color: activeClassId ? 'var(--accent-teal)' : '#888' }}>
                        {activeClassId ? 'Editing Class (Changes affect all instances)' : 'Editing Instance (Changes override classes)'}
                    </span>
                </div>
            )}
        </div>
    );
};
