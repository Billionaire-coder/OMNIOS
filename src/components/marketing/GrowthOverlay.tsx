"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface GrowthOverlayProps {
    children: React.ReactNode;
    triggerType: 'exit' | 'scroll' | 'timer' | 'none';
    triggerConfig?: {
        scrollThreshold?: number;
        timerDelay?: number;
    };
    id: string;
}

export function GrowthOverlay({ children, triggerType, triggerConfig, id }: GrowthOverlayProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        if (triggerType === 'none' || hasTriggered) return;

        const handleExit = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                setIsVisible(true);
                setHasTriggered(true);
            }
        };

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;

            if (scrollPercent >= (triggerConfig?.scrollThreshold || 50)) {
                setIsVisible(true);
                setHasTriggered(true);
            }
        };

        if (triggerType === 'exit') {
            document.addEventListener('mouseleave', handleExit);
        } else if (triggerType === 'scroll') {
            window.addEventListener('scroll', handleScroll);
        } else if (triggerType === 'timer') {
            const timer = setTimeout(() => {
                setIsVisible(true);
                setHasTriggered(true);
            }, triggerConfig?.timerDelay || 5000);
            return () => clearTimeout(timer);
        }

        return () => {
            document.removeEventListener('mouseleave', handleExit);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [triggerType, triggerConfig, hasTriggered]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="glass"
                        style={{
                            padding: '40px',
                            borderRadius: '16px',
                            position: 'relative',
                            maxWidth: '500px',
                            width: '90%'
                        }}
                    >
                        <button
                            onClick={() => setIsVisible(false)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
