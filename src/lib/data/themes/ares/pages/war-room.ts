import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = { bg: '#000', text: '#dc2626', accent: '#fff', secondary: '#111' };

export const aresWarRoom = () => {
    const elements: Record<string, DesignerElement> = {
        'ares-war-root': createPageRoot('ares-war-root', ['w-nav', 'w-hero', 'w-stats', 'w-footer'], { backgroundColor: PALETTE.bg, color: PALETTE.text }),
        'w-nav': {
            id: 'w-nav',
            type: 'container',
            styles: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
            layoutMode: 'safety',
            parentId: 'ares-war-root',
            children: ['w-back']
        },
        'w-back': { id: 'w-back', type: 'button', content: 'BACK TO FRONT', styles: { fontSize: '0.8rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'w-nav', action: { type: 'navigate', payload: 'index' } },

        'w-hero': {
            id: 'w-hero',
            type: 'container',
            styles: { padding: '80px 40px', textAlign: 'center', borderBottom: '2px solid #dc2626' },
            layoutMode: 'safety',
            parentId: 'ares-war-root',
            children: ['w-h1']
        },
        'w-h1': { id: 'w-h1', type: 'text', content: 'THE WAR ROOM', styles: { fontSize: '6rem', fontWeight: '900', color: '#fff' }, layoutMode: 'safety', parentId: 'w-hero' },

        'w-stats': {
            id: 'w-stats',
            type: 'container',
            styles: { padding: '100px 40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' },
            layoutMode: 'safety',
            parentId: 'ares-war-root',
            children: ['st1', 'st2', 'st3']
        },
        'st1': { id: 'st1', type: 'text', content: 'ENEMIES: 0', styles: { fontSize: '3rem', fontWeight: '900', textAlign: 'center' }, layoutMode: 'safety', parentId: 'w-stats' },
        'st2': { id: 'st2', type: 'text', content: 'VICTORIES: 100%', styles: { fontSize: '3rem', fontWeight: '900', textAlign: 'center' }, layoutMode: 'safety', parentId: 'w-stats' },
        'st3': { id: 'st3', type: 'text', content: 'FORCE: DIVINE', styles: { fontSize: '3rem', fontWeight: '900', textAlign: 'center' }, layoutMode: 'safety', parentId: 'w-stats' },

        'w-footer': {
            id: 'w-footer',
            type: 'container',
            styles: { padding: '40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'ares-war-root',
            children: ['wf-text']
        },
        'wf-text': { id: 'wf-text', type: 'text', content: 'THINK FAST. STRIKE HARD.', styles: { fontSize: '0.7rem', opacity: '0.4' }, layoutMode: 'safety', parentId: 'w-footer' }
    };
    return elements;
};
