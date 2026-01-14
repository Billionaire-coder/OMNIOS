"use client";

import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Tag, Plus, X, Pencil, Search } from 'lucide-react';

interface ClassSelectorProps {
    elementId: string;
}

export function ClassSelector({ elementId }: ClassSelectorProps) {
    const { state, createClass, addClass, removeClass, setEditingClassId } = useProjectStore();
    const element = state.elements[elementId];
    const [inputValue, setInputValue] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!element) return null;

    const availableClasses = state.designSystem.classes || [];
    const appliedClasses = element.classNames || [];

    // AUTO-ADD LOGIC: If a class was just created, add it to the element
    useEffect(() => {
        if (inputValue.includes('::created::')) {
            const className = inputValue.replace('::created::', '');
            const newClass = availableClasses.find(c => c.name === className);
            if (newClass) {
                addClass(elementId, newClass.id);
                setInputValue('');
            }
        }
    }, [availableClasses, inputValue, elementId, addClass]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const cleanName = inputValue.trim().replace(/^\./, '');
            const matchingClass = availableClasses.find(c => c.name.toLowerCase() === cleanName.toLowerCase());

            if (matchingClass) {
                addClass(elementId, matchingClass.id);
                setInputValue('');
            } else {
                createClass(cleanName, {});
                // Mark for auto-add in useEffect
                setInputValue(`::created::${cleanName}`);
            }
        }
    };

    const filteredClasses = availableClasses.filter(c =>
        c.name.toLowerCase().includes(inputValue.replace(/^\./, '').toLowerCase()) &&
        !appliedClasses.includes(c.id)
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {appliedClasses.map(classId => {
                    const cls = availableClasses.find(c => c.id === classId);
                    if (!cls) return null;
                    const isEditing = state.editingClassId === classId;

                    return (
                        <div
                            key={classId}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                border: '1px solid',
                                backgroundColor: isEditing ? 'rgba(0,255,150,0.1)' : 'rgba(96,165,250,0.1)',
                                borderColor: isEditing ? 'rgba(0,255,150,0.2)' : 'rgba(96,165,250,0.2)',
                                color: isEditing ? 'var(--accent-teal)' : '#60a5fa',
                                transition: 'all 0.2s ease',
                                cursor: 'default'
                            }}
                        >
                            <span style={{ opacity: 0.5 }}>.</span>
                            <span style={{ fontWeight: '600' }}>{cls.name}</span>

                            <div style={{ display: 'flex', gap: '2px', marginLeft: '2px' }}>
                                <button
                                    onClick={() => setEditingClassId(isEditing ? null : classId)}
                                    style={{ background: 'none', border: 'none', padding: '2px', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    title="Edit Style"
                                >
                                    <Pencil size={10} />
                                </button>
                                <button
                                    onClick={() => removeClass(elementId, classId)}
                                    style={{ background: 'none', border: 'none', padding: '2px', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.6 }}
                                    title="Remove"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ position: 'relative' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    padding: '0 8px',
                    transition: 'border-color 0.2s ease'
                }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                    <Tag size={12} color="#666" style={{ marginRight: '8px' }} />
                    <input
                        type="text"
                        value={inputValue.startsWith('::created::') ? '' : inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setIsMenuOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsMenuOpen(true)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '0.75rem',
                            padding: '8px 0',
                            width: '100%',
                            outline: 'none',
                            fontFamily: 'monospace'
                        }}
                        placeholder="Add style class..."
                    />
                </div>

                {isMenuOpen && inputValue && !inputValue.startsWith('::created::') && (
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        width: '100%',
                        backgroundColor: '#111',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        zIndex: 1000,
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        {filteredClasses.length > 0 ? (
                            filteredClasses.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        addClass(elementId, c.id);
                                        setInputValue('');
                                        setIsMenuOpen(false);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        width: '100%',
                                        border: 'none',
                                        background: 'none',
                                        color: '#aaa',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span style={{ color: '#60a5fa' }}>.</span> {c.name}
                                </button>
                            ))
                        ) : (
                            <button
                                onClick={() => {
                                    const cleanName = inputValue.trim().replace(/^\./, '');
                                    createClass(cleanName, {});
                                    setInputValue(`::created::${cleanName}`);
                                    setIsMenuOpen(false);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 12px',
                                    width: '100%',
                                    border: 'none',
                                    background: 'none',
                                    color: 'var(--accent-teal)',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,255,150,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Plus size={12} /> Create "{inputValue.replace(/^\./, '')}"
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
