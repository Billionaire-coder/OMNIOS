"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectProvider } from '@/hooks/useProjectStore';
import { PGliteProvider } from '@/lib/data/pglite/PGliteContext';
import { EditorInterface } from '@/components/designer/EditorInterface';
import { THEMES, ThemeTemplate } from '@/lib/data/themes';
import { ProjectState } from '@/types/designer';
import { motion, AnimatePresence } from 'framer-motion';

// The EditorContent component is likely being refactored into EditorInterface,
// so we will remove it from here as per the provided snippet's implication.
// The original EditorContent component's logic for initializing the project
// and determining the theme will need to be moved or adapted for EditorInterface.

export default function EditorClient() {
    const { templateId } = useParams();
    const [theme, setTheme] = useState<ThemeTemplate | null>(null);

    useEffect(() => {
        if (!templateId) return;

        if (templateId === 'blank') {
            setTheme({
                id: 'blank',
                name: 'Blank Canvas',
                category: 'Portfolio',
                description: 'Start from scratch',
                thumbnail: '',
                state: {} as ProjectState
            });
        } else {
            const foundTheme = THEMES.find(t => t.id === templateId);
            if (foundTheme) {
                setTheme(foundTheme);
            } else {
                console.error('Theme not found:', templateId);
                // Optionally redirect or show an error
            }
        }
    }, [templateId]);

    if (!theme) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div className="text-xl">Loading Editor...</div>
            </div>
        );
    }

    return (
        <ProjectProvider>
            <PGliteProvider>
                <EditorInterface initialTheme={theme} mode="template" />
            </PGliteProvider>
        </ProjectProvider>
    );
}
