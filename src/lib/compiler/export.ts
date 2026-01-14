import JSZip from 'jszip';
import { ProjectState } from '@/types/designer';
import { generateProjectConfig } from './structure';
import { mapElementToAST } from './ast';
import { generateComponentCode } from './generator';

export async function exportProjectToZip(state: ProjectState): Promise<Blob> {
    const zip = new JSZip();
    const appName = state.name.toLowerCase().replace(/\s+/g, '-');

    // 1. Structure Scaffolding
    const configFiles = generateProjectConfig(appName);
    Object.entries(configFiles).forEach(([path, content]) => {
        zip.file(path, content);
    });

    // 2. Generate Pages
    // For now, only 'activePageId' or iterate all pages. 
    // Let's assume rootElementId is the main page for MVP.
    // In real implementation, we iterate state.pages

    // Default Home Page (src/app/page.tsx)
    const rootAst = mapElementToAST(state.rootElementId, state);
    if (rootAst) {
        const pageCode = generateComponentCode('Home', rootAst);
        zip.file('src/app/page.tsx', pageCode);
    } else {
        // Fallback if no root element
        zip.file('src/app/page.tsx', `export default function Home() { return <div>Empty Project</div> }`);
    }

    // 3. Asset Gathering (TODO: Batch 6.3 continued)
    // We would fetch images and add to public/ folder here.

    // 4. Generate Zip Blob
    const content = await zip.generateAsync({ type: 'blob' });
    return content;
}
