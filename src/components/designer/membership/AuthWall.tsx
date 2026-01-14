
"use client";

import React, { useState } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { Lock, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthWallProps {
    minTier?: 'free' | 'pro' | 'enterprise';
    children: React.ReactNode;
}

export function AuthWall({ minTier = 'free', children }: AuthWallProps) {
    const { state, upgradeTier } = useProjectStore();
    const { userTier } = state;

    const checkAccess = () => {
        // Tiers Logic
        const tiers = { free: 0, pro: 1, enterprise: 2 };

        if (tiers[userTier as keyof typeof tiers] >= tiers[minTier as keyof typeof tiers]) return true;

        // Simulate Login/Upgrade Flow
        const confirm = window.confirm(`Upgrade to ${minTier.toUpperCase()} to unlock this content?`);
        if (confirm) {
            upgradeTier(minTier);
        }
    };

    if (state.userTier === 'enterprise' || (minTier === 'pro' && state.userTier === 'pro') || minTier === 'free') {
        return <>{children}</>;
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '200px', overflow: 'hidden' }}>
            {/* Blurred Content Placeholder */}
            <div style={{ filter: 'blur(8px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
                {children}
            </div>

            {/* Lock Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                zIndex: 10
            }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        backgroundColor: 'rgba(20,20,20,0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '30px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        maxWidth: '300px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}
                >
                    <div style={{
                        width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
                        color: 'black'
                    }}>
                        <Lock size={24} />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'white' }}>
                        {minTier === 'pro' ? 'Pro Access Only' : 'Member Only Content'}
                    </h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#888', lineHeight: '1.4' }}>
                        Upgrade your plan to unlock this premium blueprint and access exclusive tools.
                    </p>
                    <button
                        onClick={checkAccess}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'white',
                            color: 'black',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            justifyContent: 'center'
                        }}
                    >
                        <Crown size={16} color="orange" fill="orange" /> Unlock Access
                    </button>
                    <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#666' }}>
                        Already a member? <span style={{ color: 'white', cursor: 'pointer', textDecoration: 'underline' }}>Log in</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
