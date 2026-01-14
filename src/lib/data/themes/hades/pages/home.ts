import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = {
    void: '#000000',
    blood: '#8a0000',
    ash: '#333333',
    concrete: '#888888',
    text: '#ffffff'
};

export const hadesHome = () => {
    const elements: Record<string, DesignerElement> = {
        'hades-home-root': createPageRoot('hades-home-root', ['h-head', 'h-hero', 'h-manifesto-strip', 'h-grid'], {
            backgroundColor: PALETTE.void,
            fontFamily: 'Roboto Mono, monospace'
        }),

        'h-head': {
            id: 'h-head', type: 'container',
            styles: { height: '60px', borderBottom: '2px solid white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', backgroundColor: 'black', position: 'sticky', top: '0', zIndex: '100' },
            layoutMode: 'safety', parentId: 'hades-home-root', children: ['hh-logo', 'hh-menu']
        },
        'hh-logo': { id: 'hh-logo', type: 'text', content: 'HADES_SYSTEM//', styles: { fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }, layoutMode: 'safety', parentId: 'h-head' },
        'hh-menu': { id: 'hh-menu', type: 'text', content: '[MENU]', styles: { fontSize: '1rem', color: PALETTE.blood, cursor: 'pointer', fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'h-head' },

        'h-hero': {
            id: 'h-hero', type: 'container',
            styles: { padding: '100px 20px', borderBottom: '2px solid white', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' },
            layoutMode: 'safety', parentId: 'hades-home-root', children: ['h-lg-text']
        },
        'h-lg-text': { id: 'h-lg-text', type: 'text', content: 'UNDERWORLD ARCHITECTURE', styles: { fontSize: '8vw', fontWeight: '900', lineHeight: '0.8', color: 'white', textTransform: 'uppercase' }, layoutMode: 'safety', parentId: 'h-hero' },

        'h-manifesto-strip': {
            id: 'h-manifesto-strip', type: 'container',
            styles: { padding: '40px 20px', backgroundColor: 'white' },
            layoutMode: 'safety', parentId: 'hades-home-root', children: ['h-man-text']
        },
        'h-man-text': { id: 'h-man-text', type: 'text', content: 'WE REJECT THE SOFT. WE EMBRACE THE BRUTAL. DESIGN IS NOT DECORATION. IT IS STRUCTURE.', styles: { fontSize: '1.5rem', fontWeight: 'bold', color: 'black', maxWidth: '800px' }, layoutMode: 'safety', parentId: 'h-manifesto-strip' },

        'h-grid': {
            id: 'h-grid', type: 'container',
            styles: { display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid white' },
            layoutMode: 'safety', parentId: 'hades-home-root', children: ['h-cell-1', 'h-cell-2']
        },
        'h-cell-1': { id: 'h-cell-1', type: 'container', styles: { padding: '60px', borderRight: '2px solid white', height: '500px', justifyContent: 'space-between' }, layoutMode: 'safety', parentId: 'h-grid', children: ['hc1-title', 'hc1-img'] },
        'hc1-title': { id: 'hc1-title', type: 'text', content: 'PROJECT 01', styles: { fontSize: '2rem', fontWeight: 'bold', color: 'white' }, layoutMode: 'safety', parentId: 'h-cell-1' },
        'hc1-img': { id: 'hc1-img', type: 'box', styles: { width: '100%', height: '200px', backgroundColor: '#222' }, layoutMode: 'safety', parentId: 'h-cell-1' },

        'h-cell-2': { id: 'h-cell-2', type: 'container', styles: { padding: '60px', height: '500px', justifyContent: 'space-between', backgroundColor: '#111' }, layoutMode: 'safety', parentId: 'h-grid', children: ['hc2-title', 'hc2-btn'] },
        'hc2-title': { id: 'hc2-title', type: 'text', content: 'PROJECT 02', styles: { fontSize: '2rem', fontWeight: 'bold', color: 'white' }, layoutMode: 'safety', parentId: 'h-cell-2' },
        'hc2-btn': { id: 'hc2-btn', type: 'button', content: 'VIEW DATA >', styles: { padding: '20px', border: '2px solid white', background: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'h-cell-2', action: { type: 'navigate', payload: 'manifesto' } }
    };
    return elements;
};
