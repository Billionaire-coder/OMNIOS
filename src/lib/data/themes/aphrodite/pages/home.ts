import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = {
    blush: '#fff1f2',
    roseGold: '#e11d48',
    cream: '#fffdf5',
    text: '#881337',
    softGold: '#fbbf24'
};

export const aphroditeHome = () => {
    const elements: Record<string, DesignerElement> = {
        'aphrodite-home-root': createPageRoot('aphrodite-home-root', ['ap-nav', 'ap-hero', 'ap-quote', 'ap-showcase', 'ap-footer'], {
            backgroundColor: PALETTE.cream,
            fontFamily: 'Playfair Display, serif',
            color: PALETTE.text
        }),

        'ap-nav': {
            id: 'ap-nav', type: 'container',
            styles: {
                height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'white', position: 'sticky', top: '0', zIndex: '1000', borderBottom: '1px solid #fecdd3'
            },
            layoutMode: 'safety', parentId: 'aphrodite-home-root', children: ['ap-logo', 'ap-links']
        },
        'ap-logo': { id: 'ap-logo', type: 'text', content: 'APHRODITE', styles: { fontSize: '2.5rem', fontFamily: 'Cinzel, serif', color: PALETTE.roseGold, letterSpacing: '0.1em' }, layoutMode: 'safety', parentId: 'ap-nav' },
        'ap-links': { id: 'ap-links', type: 'container', styles: { flexDirection: 'row', gap: '40px', marginTop: '10px' }, layoutMode: 'safety', parentId: 'ap-nav', children: ['al-1', 'al-2', 'al-3'] },
        'al-1': { id: 'al-1', type: 'text', content: 'SHOP', styles: { fontSize: '0.8rem', letterSpacing: '2px', cursor: 'pointer', fontWeight: '600' }, layoutMode: 'safety', parentId: 'ap-links', action: { type: 'navigate', payload: 'shop' } },
        'al-2': { id: 'al-2', type: 'text', content: 'RITUALS', styles: { fontSize: '0.8rem', letterSpacing: '2px', cursor: 'pointer', fontWeight: '600' }, layoutMode: 'safety', parentId: 'ap-links' },
        'al-3': { id: 'al-3', type: 'text', content: 'ABOUT', styles: { fontSize: '0.8rem', letterSpacing: '2px', cursor: 'pointer', fontWeight: '600' }, layoutMode: 'safety', parentId: 'ap-links' },

        'ap-hero': {
            id: 'ap-hero', type: 'container',
            styles: { padding: '80px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', alignItems: 'center', minHeight: '700px' },
            layoutMode: 'safety', parentId: 'aphrodite-home-root', children: ['aph-img', 'aph-txt']
        },
        'aph-img': {
            id: 'aph-img', type: 'box',
            styles: { height: '600px', backgroundImage: 'url(https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=800)', backgroundSize: 'cover', borderRadius: '200px 200px 0 0' },
            layoutMode: 'safety', parentId: 'ap-hero'
        },
        'aph-txt': { id: 'aph-txt', type: 'container', styles: { padding: '60px', textAlign: 'center', alignItems: 'center', gap: '30px' }, layoutMode: 'safety', parentId: 'ap-hero', children: ['apht-sub', 'apht-head', 'apht-desc', 'apht-btn'] },
        'apht-sub': { id: 'apht-sub', type: 'text', content: 'THE ESSENCE OF BEAUTY', styles: { color: PALETTE.softGold, letterSpacing: '3px', fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }, layoutMode: 'safety', parentId: 'aph-txt' },
        'apht-head': { id: 'apht-head', type: 'text', content: 'Radiance from Within.', styles: { fontSize: '4.5rem', lineHeight: '1.1', fontStyle: 'italic' }, layoutMode: 'safety', parentId: 'aph-txt' },
        'apht-desc': { id: 'apht-desc', type: 'text', content: 'Discover a skincare collection inspired by ancient rituals and powered by modern science.', styles: { fontSize: '1.2rem', color: '#9f1239', lineHeight: '1.6', maxWidth: '400px' }, layoutMode: 'safety', parentId: 'aph-txt' },
        'apht-btn': { id: 'apht-btn', type: 'button', content: 'DISCOVER THE GLOW', styles: { marginTop: '20px', padding: '18px 40px', backgroundColor: PALETTE.roseGold, color: 'white', borderRadius: '50px', border: 'none', fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', letterSpacing: '1px' }, layoutMode: 'safety', parentId: 'aph-txt' },

        'ap-quote': {
            id: 'ap-quote', type: 'container',
            styles: { padding: '100px 200px', backgroundColor: PALETTE.blush, textAlign: 'center' },
            layoutMode: 'safety', parentId: 'aphrodite-home-root', children: ['aq-t']
        },
        'aq-t': { id: 'aq-t', type: 'text', content: '"Beauty is not just what you see. It is what you feel. It is a ritual of self-love that transforms the soul."', styles: { fontSize: '2rem', fontStyle: 'italic', lineHeight: '1.6' }, layoutMode: 'safety', parentId: 'ap-quote' },

        'ap-showcase': {
            id: 'ap-showcase', type: 'container',
            styles: { padding: '100px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '60px' },
            layoutMode: 'safety', parentId: 'aphrodite-home-root', children: ['aps-head', 'aps-grid']
        },
        'aps-head': { id: 'aps-head', type: 'text', content: 'Best Sellers', styles: { fontSize: '3rem', fontStyle: 'italic' }, layoutMode: 'safety', parentId: 'ap-showcase' },
        'aps-grid': {
            id: 'aps-grid', type: 'container',
            styles: { width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' },
            layoutMode: 'safety', parentId: 'ap-showcase', children: ['ap-p1', 'ap-p2', 'ap-p3']
        },
        'ap-p1': { id: 'ap-p1', type: 'container', styles: { alignItems: 'center', gap: '10px' }, layoutMode: 'safety', parentId: 'aps-grid', children: ['p1-img', 'p1-t', 'p1-p'] },
        'p1-img': { id: 'p1-img', type: 'box', styles: { width: '100%', height: '400px', backgroundColor: '#e2e8f0', backgroundImage: 'url(https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600)', backgroundSize: 'cover' }, layoutMode: 'safety', parentId: 'ap-p1' },
        'p1-t': { id: 'p1-t', type: 'text', content: 'Rose Elixir', styles: { fontSize: '1.5rem', marginTop: '10px' }, layoutMode: 'safety', parentId: 'ap-p1' },
        'p1-p': { id: 'p1-p', type: 'text', content: '$85.00', styles: { fontFamily: 'Montserrat, sans-serif' }, layoutMode: 'safety', parentId: 'ap-p1' },

        'ap-p2': { id: 'ap-p2', type: 'container', styles: { alignItems: 'center', gap: '10px' }, layoutMode: 'safety', parentId: 'aps-grid', children: ['p2-img', 'p2-t', 'p2-p'] },
        'p2-img': { id: 'p2-img', type: 'box', styles: { width: '100%', height: '400px', backgroundColor: '#e2e8f0', backgroundImage: 'url(https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=600)', backgroundSize: 'cover' }, layoutMode: 'safety', parentId: 'ap-p2' },
        'p2-t': { id: 'p2-t', type: 'text', content: 'Golden Serum', styles: { fontSize: '1.5rem', marginTop: '10px' }, layoutMode: 'safety', parentId: 'ap-p2' },
        'p2-p': { id: 'p2-p', type: 'text', content: '$120.00', styles: { fontFamily: 'Montserrat, sans-serif' }, layoutMode: 'safety', parentId: 'ap-p2' },

        'ap-p3': { id: 'ap-p3', type: 'container', styles: { alignItems: 'center', gap: '10px' }, layoutMode: 'safety', parentId: 'aps-grid', children: ['p3-img', 'p3-t', 'p3-p'] },
        'p3-img': { id: 'p3-img', type: 'box', styles: { width: '100%', height: '400px', backgroundColor: '#e2e8f0', backgroundImage: 'url(https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?auto=format&fit=crop&w=600)', backgroundSize: 'cover' }, layoutMode: 'safety', parentId: 'ap-p3' },
        'p3-t': { id: 'p3-t', type: 'text', content: 'Night Cream', styles: { fontSize: '1.5rem', marginTop: '10px' }, layoutMode: 'safety', parentId: 'ap-p3' },
        'p3-p': { id: 'p3-p', type: 'text', content: '$95.00', styles: { fontFamily: 'Montserrat, sans-serif' }, layoutMode: 'safety', parentId: 'ap-p3' },


        'ap-footer': {
            id: 'ap-footer', type: 'container',
            styles: { padding: '80px', backgroundColor: PALETTE.roseGold, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
            layoutMode: 'safety', parentId: 'aphrodite-home-root', children: ['apf-l', 'apf-c']
        },
        'apf-l': { id: 'apf-l', type: 'text', content: 'APHRODITE', styles: { fontSize: '3rem', fontFamily: 'Cinzel, serif' }, layoutMode: 'safety', parentId: 'ap-footer' },
        'apf-c': { id: 'apf-c', type: 'text', content: '© 2026. THE ART OF BEAUTY.', styles: { fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem' }, layoutMode: 'safety', parentId: 'ap-footer' }
    };
    return elements;
};
