import { DesignerPage, ProjectState } from "@/types/designer";
import { SourceCompiler } from "./SourceCompiler";

/**
 * PageCompiler generates Next.js App Router pages (app/[slug]/page.tsx).
 */
export class PageCompiler {
    /**
     * Generates the page hierarchy for a project.
     */
    static compilePages(project: ProjectState): Record<string, string> {
        const files: Record<string, string> = {};

        Object.values(project.pages).forEach(page => {
            const body = SourceCompiler.compileElementToJSX(page.rootElementId, project, 0);
            const path = page.path === '/' ? 'app/page.tsx' : `app/${page.path.replace(/^\//, '')}/page.tsx`;

            files[path] = `
"use client";

import React, { useEffect } from 'react';
import { useLogicEngine } from '@/lib/runtime/LogicEngine';
// Import Master Components
${this.generateComponentImports(page, project)}

export default function Page() {
  const { executeBlueprint } = useLogicEngine();

  useEffect(() => {
    // on_load logic would go here
  }, []);

  return (
    <main>
${body}
    </main>
  );
}
`.trim();
        });

        return files;
    }

    private static generateComponentImports(page: DesignerPage, project: ProjectState): string {
        // Collect all used masterComponentIds in this page recursively
        const usedComponentIds = new Set<string>();
        const traverse = (elId: string) => {
            const el = project.elements[elId];
            if (!el) return;
            if (el.masterComponentId) usedComponentIds.add(el.masterComponentId);
            (el.children || []).forEach(traverse);
        };

        traverse(page.rootElementId);

        return Array.from(usedComponentIds).map(id => {
            const comp = project.designSystem.components.find(c => id === c.id);
            const name = comp ? comp.name.replace(/\s+/g, '') : 'Component';
            return `import { ${name} } from '@/components/ui/${name}';`;
        }).join('\n');
    }
}
