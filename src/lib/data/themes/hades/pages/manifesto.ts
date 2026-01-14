import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = { bg: '#050505', text: '#ff4d4d', accent: '#fff', secondary: '#111' };

export const hadesManifesto = () => {
    const elements: Record<string, DesignerElement> = {
        'hades-manifesto-root': createPageRoot('hades-manifesto-root', ['m-header', 'm-hero', 'm-text', 'm-footer'], { backgroundColor: PALETTE.bg, color: PALETTE.text }),
        'm-header': {
            id: 'm-header',
            type: 'container',
            styles: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '2px solid #222' },
            layoutMode: 'safety',
            parentId: 'hades-manifesto-root',
            children: ['m-logo', 'm-nav']
        },
        'm-logo': { id: 'm-logo', type: 'text', content: 'HADES / ARCHITECT', styles: { fontWeight: '900', fontSize: '1.2rem' }, layoutMode: 'safety', parentId: 'm-header' },
        'm-nav': { id: 'm-nav', type: 'container', styles: { display: 'flex', gap: '30px' }, layoutMode: 'safety', parentId: 'm-header', children: ['m-link-home'] },
        'm-link-home': { id: 'm-link-home', type: 'button', content: 'BACK TO WORK', styles: { fontSize: '0.8rem', fontWeight: '900', color: PALETTE.accent }, layoutMode: 'safety', parentId: 'm-nav', action: { type: 'navigate', payload: 'index' } },

        'm-hero': {
            id: 'm-hero',
            type: 'container',
            styles: { padding: '120px 40px', borderBottom: '2px solid #222' },
            layoutMode: 'safety',
            parentId: 'hades-manifesto-root',
            children: ['m-h1']
        },
        'm-h1': { id: 'm-h1', type: 'text', content: 'THE SHADOW\nLAWS', styles: { fontSize: '8rem', fontWeight: '900', lineHeight: '0.8' }, layoutMode: 'safety', parentId: 'm-hero' },

        'm-text': {
            id: 'm-text',
            type: 'container',
            styles: { padding: '100px 40px', display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '800px' },
            layoutMode: 'safety',
            parentId: 'hades-manifesto-root',
            children: ['t1', 't2', 't3']
        },
        't1': { id: 't1', type: 'text', content: '01. LESS IS WEAK. ONLY DARKNESS IS PURE.', styles: { fontSize: '1.5rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'm-text' },
        't2': { id: 't2', type: 'text', content: '02. FUNCTION OVER COMFORT.', styles: { fontSize: '1.5rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'm-text' },
        't3': { id: 't3', type: 'text', content: '03. THE UNDERWORLD IS THE ONLY SOURCE OF TRUTH.', styles: { fontSize: '1.5rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'm-text' },

        'm-footer': {
            id: 'm-footer',
            type: 'container',
            styles: { padding: '40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'hades-manifesto-root',
            children: ['mf-text']
        },
        'mf-text': { id: 'mf-text', type: 'text', content: 'ADMIT NOTHING.', styles: { fontSize: '0.8rem', opacity: '0.4' }, layoutMode: 'safety', parentId: 'm-footer' }
    };
    return elements;
};
