import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = {
    orange: '#ff6b00',
    black: '#111111',
    grey: '#222222',
    silver: '#e0e0e0',
    white: '#ffffff'
};

export const hermesHome = () => {
    const elements: Record<string, DesignerElement> = {
        'hermes-home-root': createPageRoot('hermes-home-root', ['h-nav', 'h-hero', 'h-ticker', 'h-grid', 'h-footer'], {
            backgroundColor: PALETTE.black,
            fontFamily: 'Inter, sans-serif',
            color: 'white'
        }),

        'h-nav': {
            id: 'h-nav', type: 'container',
            styles: {
                height: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px',
                backgroundColor: 'rgba(17,17,17,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${PALETTE.grey}`, position: 'sticky', top: '0', zIndex: '1000'
            },
            layoutMode: 'safety', parentId: 'hermes-home-root', children: ['hn-logo', 'hn-links', 'hn-act']
        },
        'hn-logo': { id: 'hn-logo', type: 'text', content: 'HERMES //', styles: { fontSize: '1.5rem', fontWeight: '900', fontFamily: 'Roboto Mono, monospace', color: 'white' }, layoutMode: 'safety', parentId: 'h-nav' },
        'hn-links': { id: 'hn-links', type: 'container', styles: { flexDirection: 'row', gap: '30px' }, layoutMode: 'safety', parentId: 'h-nav', children: ['hl-1', 'hl-2', 'hl-3'] },
        'hl-1': { id: 'hl-1', type: 'text', content: 'TRACKING', styles: { fontWeight: '600', fontSize: '0.8rem', letterSpacing: '1px', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'hn-links' },
        'hl-2': { id: 'hl-2', type: 'text', content: 'SOLUTIONS', styles: { fontWeight: '600', fontSize: '0.8rem', letterSpacing: '1px', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'hn-links' },
        'hl-3': { id: 'hl-3', type: 'text', content: 'CAREERS', styles: { fontWeight: '600', fontSize: '0.8rem', letterSpacing: '1px', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'hn-links' },
        'hn-act': { id: 'hn-act', type: 'button', content: 'SHIP NOW →', styles: { padding: '8px 20px', backgroundColor: PALETTE.orange, color: 'white', fontWeight: 'bold', borderRadius: '0', fontSize: '0.8rem' }, layoutMode: 'safety', parentId: 'h-nav', action: { type: 'navigate', payload: 'ship' } },

        'h-hero': {
            id: 'h-hero', type: 'container',
            styles: { height: '80vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 60px' },
            layoutMode: 'safety', parentId: 'hermes-home-root', children: ['hh-bg', 'hh-content']
        },
        'hh-bg': {
            id: 'hh-bg', type: 'box',
            styles: { position: 'absolute', top: '0', right: '-20%', width: '80%', height: '100%', backgroundColor: '#1a1a1a', transform: 'skewX(-20deg)', zIndex: '0' },
            layoutMode: 'safety', parentId: 'h-hero'
        },
        'hh-content': { id: 'hh-content', type: 'container', styles: { zIndex: '10', gap: '20px', maxWidth: '600px' }, layoutMode: 'safety', parentId: 'h-hero', children: ['hhc-sup', 'hhc-ti', 'hhc-desc', 'hhc-btn'] },
        'hhc-sup': { id: 'hhc-sup', type: 'text', content: 'GLOBAL LOGISTICS NETWORK', styles: { color: PALETTE.orange, fontWeight: 'bold', letterSpacing: '3px', fontFamily: 'Roboto Mono, monospace' }, layoutMode: 'safety', parentId: 'hh-content' },
        'hhc-ti': { id: 'hhc-ti', type: 'text', content: 'SPEED AT THE SCALE OF BUSINESS.', styles: { fontSize: '4.5rem', fontWeight: '900', lineHeight: '0.9', fontStyle: 'italic' }, layoutMode: 'safety', parentId: 'hh-content' },
        'hhc-desc': { id: 'hhc-desc', type: 'text', content: 'From Tokyo to Toronto in 24 hours. The fastest delivery network in the known universe.', styles: { color: '#888', fontSize: '1.2rem', lineHeight: '1.5' }, layoutMode: 'safety', parentId: 'hh-content' },
        'hhc-btn': { id: 'hhc-btn', type: 'button', content: 'GET A QUOTE', styles: { marginTop: '20px', padding: '15px 40px', backgroundColor: 'white', color: 'black', fontWeight: '900', fontSize: '1rem', width: 'fit-content' }, layoutMode: 'safety', parentId: 'hh-content' },

        'h-ticker': {
            id: 'h-ticker', type: 'container',
            styles: { height: '60px', backgroundColor: PALETTE.orange, display: 'flex', alignItems: 'center', overflow: 'hidden', whiteSpace: 'nowrap' },
            layoutMode: 'safety', parentId: 'hermes-home-root', children: ['ht-text']
        },
        'ht-text': { id: 'ht-text', type: 'text', content: 'LIVE TRACKING: ORDER #892911 DELIVERED • ORDER #11293 IN TRANSIT • ORDER #99281 CUSTOMS CLEARED •', styles: { color: 'white', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'Roboto Mono, monospace' }, layoutMode: 'safety', parentId: 'h-ticker' },

        'h-grid': {
            id: 'h-grid', type: 'container',
            styles: { padding: '100px 60px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' },
            layoutMode: 'safety', parentId: 'hermes-home-root', children: ['hg-1', 'hg-2', 'hg-3']
        },
        'hg-1': { id: 'hg-1', type: 'container', styles: { padding: '40px', border: '1px solid #333', gap: '20px', transition: 'all 0.3s ease' }, layoutMode: 'safety', parentId: 'h-grid', children: ['h1-i', 'h1-t', 'h1-d'] },
        'h1-i': { id: 'h1-i', type: 'text', content: '✈', styles: { fontSize: '3rem', color: PALETTE.orange }, layoutMode: 'safety', parentId: 'hg-1' },
        'h1-t': { id: 'h1-t', type: 'text', content: 'AIR FREIGHT', styles: { fontSize: '1.5rem', fontWeight: '900', fontStyle: 'italic' }, layoutMode: 'safety', parentId: 'hg-1' },
        'h1-d': { id: 'h1-d', type: 'text', content: 'Same-day delivery to major global hubs.', styles: { color: '#888' }, layoutMode: 'safety', parentId: 'hg-1' },

        'hg-2': { id: 'hg-2', type: 'container', styles: { padding: '40px', border: '1px solid #333', gap: '20px', backgroundColor: '#222' }, layoutMode: 'safety', parentId: 'h-grid', children: ['h2-i', 'h2-t', 'h2-d'] },
        'h2-i': { id: 'h2-i', type: 'text', content: '🚛', styles: { fontSize: '3rem', color: PALETTE.orange }, layoutMode: 'safety', parentId: 'hg-2' },
        'h2-t': { id: 'h2-t', type: 'text', content: 'GROUND FLEET', styles: { fontSize: '1.5rem', fontWeight: '900', fontStyle: 'italic' }, layoutMode: 'safety', parentId: 'hg-2' },
        'h2-d': { id: 'h2-d', type: 'text', content: 'Reliable last-mile delivery across the continent.', styles: { color: '#888' }, layoutMode: 'safety', parentId: 'hg-2' },

        'hg-3': { id: 'hg-3', type: 'container', styles: { padding: '40px', border: '1px solid #333', gap: '20px' }, layoutMode: 'safety', parentId: 'h-grid', children: ['h3-i', 'h3-t', 'h3-d'] },
        'h3-i': { id: 'h3-i', type: 'text', content: '📦', styles: { fontSize: '3rem', color: PALETTE.orange }, layoutMode: 'safety', parentId: 'hg-3' },
        'h3-t': { id: 'h3-t', type: 'text', content: 'WAREHOUSING', styles: { fontSize: '1.5rem', fontWeight: '900', fontStyle: 'italic' }, layoutMode: 'safety', parentId: 'hg-3' },
        'h3-d': { id: 'h3-d', type: 'text', content: 'Secure storage solutions with real-time inventory.', styles: { color: '#888' }, layoutMode: 'safety', parentId: 'hg-3' },

        'h-footer': {
            id: 'h-footer', type: 'container',
            styles: { padding: '80px 60px', backgroundColor: '#111', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
            layoutMode: 'safety', parentId: 'hermes-home-root', children: ['hf-l', 'hf-r']
        },
        'hf-l': { id: 'hf-l', type: 'text', content: 'HERMES LOGISTICS', styles: { fontSize: '1.5rem', fontWeight: '900', fontFamily: 'Roboto Mono, monospace' }, layoutMode: 'safety', parentId: 'h-footer' },
        'hf-r': { id: 'hf-r', type: 'container', styles: { flexDirection: 'row', gap: '20px' }, layoutMode: 'safety', parentId: 'h-footer', children: ['hfr-1', 'hfr-2'] },
        'hfr-1': { id: 'hfr-1', type: 'text', content: 'Privacy', styles: { color: '#666' }, layoutMode: 'safety', parentId: 'hf-r' },
        'hfr-2': { id: 'hfr-2', type: 'text', content: 'Terms', styles: { color: '#666' }, layoutMode: 'safety', parentId: 'hf-r' }
    };
    return elements;
};
