import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = {
    deepBlue: '#001d3d',
    ocean: '#003566',
    teal: '#38bdf8',
    foam: '#e0f2fe',
    text: '#ffffff',
    glass: 'rgba(0, 29, 61, 0.7)'
};

export const poseidonHome = () => {
    const elements: Record<string, DesignerElement> = {
        'poseidon-home-root': createPageRoot('poseidon-home-root', ['p-header', 'p-hero', 'p-liquid-grid', 'p-cta'], {
            backgroundColor: PALETTE.deepBlue,
            fontFamily: 'Montserrat, sans-serif'
        }),

        'p-header': {
            id: 'p-header', type: 'container',
            styles: {
                height: '90px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 50px',
                position: 'sticky', top: '0', backgroundColor: PALETTE.glass, backdropFilter: 'blur(15px)', zIndex: '100'
            },
            layoutMode: 'safety', parentId: 'poseidon-home-root', children: ['p-logo', 'p-nav']
        },
        'p-logo': { id: 'p-logo', type: 'text', content: 'POSEIDON', styles: { fontSize: '2rem', fontWeight: '800', color: PALETTE.teal, letterSpacing: '2px', fontFamily: 'Cinzel, serif' }, layoutMode: 'safety', parentId: 'p-header' },
        'p-nav': { id: 'p-nav', type: 'container', styles: { flexDirection: 'row', gap: '30px' }, layoutMode: 'safety', parentId: 'p-header', children: ['pn-1', 'pn-2', 'pn-3'] },
        'pn-1': { id: 'pn-1', type: 'text', content: 'Work', styles: { color: 'white', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'p-nav' },
        'pn-2': { id: 'pn-2', type: 'text', content: 'Agency', styles: { color: 'white', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'p-nav' },
        'pn-3': { id: 'pn-3', type: 'button', content: 'Hire Us', styles: { padding: '10px 25px', backgroundColor: PALETTE.teal, color: PALETTE.deepBlue, fontWeight: 'bold', borderRadius: '30px' }, layoutMode: 'safety', parentId: 'p-nav', action: { type: 'navigate', payload: 'blog' } },

        'p-hero': {
            id: 'p-hero', type: 'container',
            styles: {
                height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative',
                backgroundImage: 'linear-gradient(135deg, #001d3d 0%, #003566 100%)'
            },
            layoutMode: 'safety', parentId: 'poseidon-home-root', children: ['ph-title', 'ph-sub']
        },
        'ph-title': { id: 'ph-title', type: 'text', content: 'FLUID CREATIVITY', styles: { fontSize: '7rem', fontWeight: '900', color: 'transparent', WebkitTextStroke: '2px #38bdf8', fontFamily: 'Playfair Display, serif', opacity: '0.8' }, layoutMode: 'safety', parentId: 'p-hero' },
        'ph-sub': { id: 'ph-sub', type: 'text', content: 'We build digital waves that move the world.', styles: { fontSize: '1.5rem', color: PALETTE.foam, marginTop: '20px', fontFamily: 'Montserrat, sans-serif' }, layoutMode: 'safety', parentId: 'p-hero' },

        'p-liquid-grid': {
            id: 'p-liquid-grid', type: 'container',
            styles: { padding: '80px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' },
            layoutMode: 'safety', parentId: 'poseidon-home-root', children: ['pl-card1', 'pl-card2']
        },
        'pl-card1': { id: 'pl-card1', type: 'box', styles: { height: '400px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }, layoutMode: 'safety', parentId: 'p-liquid-grid' },
        'pl-card2': { id: 'pl-card2', type: 'box', styles: { height: '400px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginTop: '60px' }, layoutMode: 'safety', parentId: 'p-liquid-grid' },

        'p-cta': {
            id: 'p-cta', type: 'container',
            styles: { padding: '100px', alignItems: 'center', textAlign: 'center' },
            layoutMode: 'safety', parentId: 'poseidon-home-root', children: ['pcta-text']
        },
        'pcta-text': { id: 'pcta-text', type: 'text', content: 'DIVE DEEP', styles: { fontSize: '4rem', color: 'white', fontFamily: 'Cinzel, serif' }, layoutMode: 'safety', parentId: 'p-cta' }
    };
    return elements;
};
