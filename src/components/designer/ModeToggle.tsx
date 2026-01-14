import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useProjectStore } from '@/hooks/useProjectStore';

export const ModeToggle = () => {
    const { state, setActiveMode } = useProjectStore();

    return (
        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
                onClick={() => setActiveMode('light')}
                title="Light Mode"
                style={{
                    backgroundColor: state.activeMode === 'light' ? 'white' : 'transparent',
                    color: state.activeMode === 'light' ? 'black' : '#666',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                <Sun size={14} fill={state.activeMode === 'light' ? 'black' : 'none'} />
            </button>
            <button
                onClick={() => setActiveMode('dark')}
                title="Dark Mode"
                style={{
                    backgroundColor: state.activeMode === 'dark' ? '#333' : 'transparent',
                    color: state.activeMode === 'dark' ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                <Moon size={14} fill={state.activeMode === 'dark' ? 'white' : 'none'} />
            </button>
        </div>
    );
};
