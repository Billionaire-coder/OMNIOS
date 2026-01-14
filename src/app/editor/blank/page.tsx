"use client";

import React from 'react';
import { ProjectProvider } from '@/hooks/useProjectStore';
import { PGliteProvider } from '@/lib/data/pglite/PGliteContext';
import { EditorInterface } from '@/components/designer/EditorInterface';

const BLANK_THEME = {
    id: 'blank',
    name: 'Blank Canvas',
    category: 'Portfolio', // Default placeholder
    description: 'Start from scratch',
    thumbnail: '',
    pages: {}
};

export default function BlankEditorPage() {
    return (
        <ProjectProvider>
            <PGliteProvider>
                <EditorInterface initialTheme={BLANK_THEME} mode="blank" />
            </PGliteProvider>
        </ProjectProvider>
    );
}
