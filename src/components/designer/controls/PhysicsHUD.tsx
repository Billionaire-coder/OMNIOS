
import React from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Zap, Activity, Repeat, Wind } from 'lucide-react';

export const PhysicsHUD: React.FC = () => {
    const { state, updateElementStyles } = useProjectStore();
    const selectedElementId = state.selectedElementId;
    const element = selectedElementId ? state.elements[selectedElementId] : null;

    if (!element) return null;

    const physics = element.styles?.physics || {
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 1
    };

    const updatePhysics = (updates: any) => {
        if (!selectedElementId) return;
        updateElementStyles(selectedElementId, {
            physics: { ...physics, ...updates }
        });
    };

    const Slider = ({ label, value, min, max, step, prop }: any) => (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>{label}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => updatePhysics({ [prop]: parseFloat(e.target.value) })}
                style={{ width: '100%', height: '4px', accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
            />
        </div>
    );

    return (
        <div className="glass" style={{
            padding: '16px',
            backgroundColor: '#0d0d0d',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            width: '240px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
                <Activity size={14} color="var(--accent-teal)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white' }}>PHYSICS TUNER</span>
            </div>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {['spring', 'tween', 'inertia'].map(type => (
                    <button
                        key={type}
                        onClick={() => updatePhysics({ type })}
                        style={{
                            flex: 1,
                            padding: '6px',
                            fontSize: '0.6rem',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            background: physics.type === type ? 'var(--accent-teal)' : '#222',
                            color: physics.type === type ? 'black' : '#888',
                            textTransform: 'capitalize',
                            fontWeight: 'bold'
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {physics.type === 'spring' && (
                <>
                    <Slider label="Stiffness" value={physics.stiffness} min={0} max={1000} step={10} prop="stiffness" />
                    <Slider label="Damping" value={physics.damping} min={0} max={100} step={1} prop="damping" />
                    <Slider label="Mass" value={physics.mass} min={0.1} max={10} step={0.1} prop="mass" />
                </>
            )}

            {physics.type === 'inertia' && (
                <Slider label="Velocity" value={physics.velocity || 0} min={-1000} max={1000} step={10} prop="velocity" />
            )}

            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.55rem', color: '#555', fontStyle: 'italic' }}>
                    Tip: Move the element or hover to see physics in action.
                </div>
            </div>
        </div>
    );
};
