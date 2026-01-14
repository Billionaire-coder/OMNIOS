import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = { bg: '#001a1a', text: '#00ffd5', accent: '#fff', secondary: '#003333' };

export const poseidonBlog = () => {
    const elements: Record<string, DesignerElement> = {
        'poseidon-blog-root': createPageRoot('poseidon-blog-root', ['b-nav', 'b-hero', 'b-posts', 'b-footer'], { backgroundColor: PALETTE.bg, color: PALETTE.text }),
        'b-nav': {
            id: 'b-nav',
            type: 'container',
            styles: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #003333' },
            layoutMode: 'safety',
            parentId: 'poseidon-blog-root',
            children: ['b-logo', 'b-back']
        },
        'b-logo': { id: 'b-logo', type: 'text', content: 'WAVE FLOW', styles: { fontSize: '1.2rem', fontWeight: '900', color: '#fff' }, layoutMode: 'safety', parentId: 'b-nav' },
        'b-back': { id: 'b-back', type: 'button', content: 'BACK TO SHORE', styles: { marginLeft: '20px', fontSize: '0.7rem' }, layoutMode: 'safety', parentId: 'b-nav', action: { type: 'navigate', payload: 'index' } },

        'b-hero': {
            id: 'b-hero',
            type: 'container',
            styles: { height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#003333' },
            layoutMode: 'safety',
            parentId: 'poseidon-blog-root',
            children: ['b-h1']
        },
        'b-h1': { id: 'b-h1', type: 'text', content: 'DEEP THOUGHTS', styles: { fontSize: '5rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'b-hero' },

        'b-posts': {
            id: 'b-posts',
            type: 'container',
            styles: { padding: '80px 40px', display: 'flex', flexDirection: 'column', gap: '80px', maxWidth: '1000px', margin: '0 auto' },
            layoutMode: 'safety',
            parentId: 'poseidon-blog-root',
            children: ['p1', 'p2']
        },
        'p1': {
            id: 'p1',
            type: 'container',
            styles: { borderLeft: '4px solid #00ffd5', paddingLeft: '40px' },
            children: ['p1-t', 'p1-c'],
            parentId: 'b-posts'
        },
        'p1-t': { id: 'p1-t', type: 'text', content: 'Fluid Dynamics in UI', styles: { fontSize: '2.5rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'p1' },
        'p1-c': { id: 'p1-c', type: 'text', content: 'Exploring how liquid motion improves user retention in high-conversion landing pages.', styles: { marginTop: '20px', fontSize: '1.1rem', opacity: '0.7' }, layoutMode: 'safety', parentId: 'p1' },

        'p2': {
            id: 'p2',
            type: 'container',
            styles: { borderLeft: '4px solid #00ffd5', paddingLeft: '40px' },
            children: ['p2-t', 'p2-c'],
            parentId: 'b-posts'
        },
        'p2-t': { id: 'p2-t', type: 'text', content: 'The Depth of Minimalism', styles: { fontSize: '2.5rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'p2' },
        'p2-c': { id: 'p2-c', type: 'text', content: 'Why the ocean provides the perfect metaphor for complex systems hidden behind simple interfaces.', styles: { marginTop: '20px', fontSize: '1.1rem', opacity: '0.7' }, layoutMode: 'safety', parentId: 'p2' },

        'b-footer': {
            id: 'b-footer',
            type: 'container',
            styles: { padding: '40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'poseidon-blog-root',
            children: ['bf-text']
        },
        'bf-text': { id: 'bf-text', type: 'text', content: 'DRIFTING INTO 2026.', styles: { fontSize: '0.7rem', opacity: '0.3' }, layoutMode: 'safety', parentId: 'b-footer' }
    };
    return elements;
};
