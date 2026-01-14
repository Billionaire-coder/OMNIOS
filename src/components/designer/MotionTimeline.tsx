import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../../hooks/useProjectStore';
import { DesignerElement, AnimationKeyframe, AnimationSequence } from '../../types/designer';
import { Play, Pause, Plus, Trash2, ChevronRight, ChevronDown, Clock, Zap } from 'lucide-react';

interface MotionTimelineProps {
    element: DesignerElement;
    onClose: () => void;
}

export const MotionTimeline: React.FC<MotionTimelineProps> = ({ element, onClose }) => {
    const { addAnimationSequence, addKeyframe, removeKeyframe, updateKeyframe, setActiveState } = useProjectStore();
    const [activeSequenceId, setActiveSequenceId] = useState<string | null>(
        element.animationSequences ? Object.keys(element.animationSequences)[0] : null
    );
    const [currentTime, setCurrentTime] = useState(0); // 0 to 1
    const [isPlaying, setIsPlaying] = useState(false);
    const timelineRef = useRef<HTMLDivElement>(null);

    const sequences = element.animationSequences || {};
    const activeSequence = activeSequenceId ? sequences[activeSequenceId] : null;

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentTime(prev => {
                    const next = prev + 0.01;
                    return next > 1 ? 0 : next;
                });
            }, 10);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = Math.max(0, Math.min(1, x / rect.width));
        setCurrentTime(time);
    };

    const handleAddKeyframe = () => {
        if (!activeSequenceId) return;
        addKeyframe(element.id, activeSequenceId, currentTime, { ...element.styles });
    };

    return (
        <div className="motion-timeline-container" style={{
            position: 'fixed',
            bottom: 0,
            left: '260px',
            right: '300px',
            height: '240px',
            backgroundColor: '#0a0a0a',
            borderTop: '1px solid #222',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            color: 'white',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Header / Controls */}
            <div style={{
                height: '40px',
                borderBottom: '1px solid #1a1a1a',
                display: 'flex',
                alignItems: 'center',
                padding: '0 15px',
                justifyContent: 'space-between',
                backgroundColor: '#0f0f0f'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap size={14} color="var(--accent-teal)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Motion Timeline</span>
                    </div>

                    <select
                        value={activeSequenceId || ''}
                        onChange={(e) => {
                            if (e.target.value === 'new') {
                                const name = prompt('Sequence Name (e.g. "Intro Reveal")');
                                if (name) {
                                    addAnimationSequence(element.id, name);
                                }
                            } else {
                                setActiveSequenceId(e.target.value);
                            }
                        }}
                        style={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            color: 'white',
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '4px'
                        }}
                    >
                        {Object.entries(sequences).map(([id, seq]) => (
                            <option key={id} value={id}>{seq.name}</option>
                        ))}
                        <option value="new">+ New Sequence</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <div style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}>
                        {(currentTime * (activeSequence?.duration || 1)).toFixed(2)}s / {(activeSequence?.duration || 1).toFixed(2)}s
                    </div>
                </div>

                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '12px' }}>CLOSE</button>
            </div>

            {/* Main Content: Layers + Tracks */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                {/* Left: Sequences/Properties List */}
                <div style={{ width: '200px', borderRight: '1px solid #1a1a1a', overflowY: 'auto', backgroundColor: '#0c0c0c' }}>
                    <div style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.65rem', color: '#888', fontWeight: 'bold' }}>PROPERTIES</span>
                            <button onClick={handleAddKeyframe} style={{ background: 'var(--accent-teal)', border: 'none', color: 'black', borderRadius: '4px', padding: '2px 6px', fontSize: '0.6rem', fontWeight: 'bold', cursor: 'pointer' }}>+ KEY</button>
                        </div>
                        {/* List of animated properties would go here */}
                        <div style={{ fontSize: '0.7rem', color: '#eee', padding: '4px 0' }}>Transform</div>
                        <div style={{ fontSize: '0.7rem', color: '#eee', padding: '4px 0' }}>Opacity</div>
                    </div>
                </div>

                {/* Right: Timeline Track */}
                <div style={{ flex: 1, position: 'relative', overflowX: 'auto', overflowY: 'hidden', backgroundColor: '#080808' }}>
                    {/* Ruler */}
                    <div style={{ height: '24px', borderBottom: '1px solid #1a1a1a', position: 'relative' }}>
                        {[0, 0.25, 0.5, 0.75, 1].map(t => (
                            <div key={t} style={{
                                position: 'absolute',
                                left: `${t * 100}%`,
                                fontSize: '0.6rem',
                                color: '#444',
                                transform: 'translateX(-50%)',
                                top: '4px'
                            }}>
                                {(t * (activeSequence?.duration || 1)).toFixed(1)}s
                            </div>
                        ))}
                    </div>

                    {/* Keyframe Track */}
                    <div
                        ref={timelineRef}
                        onClick={handleTimelineClick}
                        style={{ height: '100%', position: 'relative', cursor: 'crosshair', padding: '0 10px' }}
                    >
                        {activeSequence?.keyframes.map(k => (
                            <div
                                key={k.id}
                                style={{
                                    position: 'absolute',
                                    left: `calc(${k.time * 100}% - 4px)`,
                                    top: '40px',
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: 'var(--accent-teal)',
                                    transform: 'rotate(45deg)',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 5px var(--accent-teal)'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentTime(k.time);
                                }}
                            />
                        ))}

                        {/* Playhead */}
                        <div style={{
                            position: 'absolute',
                            left: `${currentTime * 100}%`,
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            backgroundColor: 'white',
                            zIndex: 10,
                            pointerEvents: 'none'
                        }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                position: 'absolute',
                                top: 0,
                                left: '-4px'
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
