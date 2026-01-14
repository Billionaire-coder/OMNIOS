"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { ProjectProvider } from '@/hooks/useProjectStore';
import { PGliteProvider } from '@/lib/data/pglite/PGliteContext';
import { EditorInterface } from '@/components/designer/EditorInterface';
import { THEMES } from '@/lib/data/themes';

function ThemeEditorContent() {
    const { themeId } = useParams();

    // Find the theme directly from the data
    const theme = THEMES.find(t => t.id === themeId);

    if (!theme) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
                <h1 className="text-4xl font-bold mb-4">Theme Not Found</h1>
                <p className="text-gray-400">The theme "{themeId}" does not exist.</p>
                <a href="/templates" className="mt-8 px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform">
                    Back to Store
                </a>
            </div>
        );
    }

    return <EditorInterface initialTheme={theme} mode="theme" />;
}

export default function ThemeEditorClient() {
    return (
        <ProjectProvider>
            <PGliteProvider>
                <ThemeEditorContent />
            </PGliteProvider>
        </ProjectProvider>
    );
}
