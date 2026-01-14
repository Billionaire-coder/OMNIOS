"use client";

import React, { useEffect } from 'react';
import { useProjectStore } from '@/hooks/useProjectStore';
import { generateSchema } from '@/lib/seo/schemaGenerator';

export function SEOHelper() {
    const { state } = useProjectStore();
    const { seo } = state;

    useEffect(() => {
        if (!seo) return;

        // Dynamic Title
        if (seo.title) {
            document.title = seo.title;
        }

        // Helper to update meta tags
        const updateMeta = (name: string, content: string, property: boolean = false) => {
            let meta = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(property ? 'property' : 'name', name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        // Standard Meta
        if (seo.description) updateMeta('description', seo.description);

        // Open Graph (Social)
        if (seo.title) updateMeta('og:title', seo.title, true);
        if (seo.description) updateMeta('og:description', seo.description, true);
        if (seo.socialImage) updateMeta('og:image', seo.socialImage, true);

        // Inject JSON-LD
        const scriptId = 'omnios-json-ld';
        let script = document.getElementById(scriptId);
        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.setAttribute('type', 'application/ld+json');
            document.head.appendChild(script);
        }
        script.textContent = generateSchema(state);

    }, [seo, state]);

    return null; // Headless component
}
