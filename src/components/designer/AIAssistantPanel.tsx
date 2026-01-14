import React, { useState } from 'react';
import { Sparkles, X, Loader2, Send } from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { GenerativeCore } from '@/lib/intelligence/GenerativeCore';

export function AIAssistantPanel({ onClose }: { onClose: () => void }) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { state, bulkUpdateElements } = useProjectStore();

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        try {
            const elements = await GenerativeCore.generateLayout(prompt);

            // Convert array to Record for bulk update
            const updates: Record<string, any> = {};
            elements.forEach(el => {
                updates[el.id] = el;
            });

            // If we have an active page, make sure the top-level elements point to it
            const topLevel = elements.find(el => !el.parentId);
            if (topLevel) {
                updates[topLevel.id] = { ...topLevel, parentId: state.activePageId };
            }

            bulkUpdateElements(updates);
            setPrompt('');
            onClose();
        } catch (err) {
            console.error('Generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{
            position: 'absolute',
            bottom: '80px',
            right: '24px',
            width: '360px',
            backgroundColor: 'rgba(15, 15, 15, 0.85)',
            backdropFilter: 'blur(16px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0, 224, 255, 0.1)',
            zIndex: 1000,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(45deg, var(--accent-primary), var(--accent-teal))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Sparkles size={18} color="black" />
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>The Constructor</span>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                >
                    <X size={18} />
                </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1.4' }}>
                Describe the section or layout you want to build. I'll handle the structures, styles, and spacing.
            </div>

            <div style={{ position: 'relative' }}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. A dark hero section for a crypto landing page"
                    disabled={isGenerating}
                    style={{
                        width: '100%',
                        height: '100px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: 'white',
                        fontSize: '0.85rem',
                        resize: 'none',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: prompt.trim() ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                    color: prompt.trim() ? 'black' : '#666',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: prompt.trim() ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}
            >
                {isGenerating ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Send size={18} />
                        Construct Layout
                    </>
                )}
            </button>
        </div>
    );
}
