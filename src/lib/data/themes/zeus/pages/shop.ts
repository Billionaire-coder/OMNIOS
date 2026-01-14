import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = { bg: '#000', text: '#fff', accent: '#D4AF37', secondary: '#111' };

export const zeusShop = () => {
    const elements: Record<string, DesignerElement> = {
        'zeus-shop-root': createPageRoot('zeus-shop-root', ['header-shop', 'shop-hero', 'product-grid', 'footer-shop'], { backgroundColor: PALETTE.bg }),
        'header-shop': {
            id: 'header-shop',
            type: 'container',
            styles: { height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px', borderBottom: `1px solid ${PALETTE.accent}`, position: 'sticky', top: '0', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: '1000' },
            layoutMode: 'safety',
            parentId: 'zeus-shop-root',
            children: ['logo-shop', 'nav-shop']
        },
        'logo-shop': { id: 'logo-shop', type: 'text', content: 'Z E U S', styles: { fontSize: '2rem', fontWeight: '900', color: PALETTE.accent, letterSpacing: '8px' }, layoutMode: 'safety', parentId: 'header-shop' },
        'nav-shop': { id: 'nav-shop', type: 'container', styles: { display: 'flex', gap: '30px' }, layoutMode: 'safety', parentId: 'header-shop', children: ['link-home-shop', 'link-shop-shop'] },
        'link-home-shop': {
            id: 'link-home-shop',
            type: 'button',
            content: 'HOME',
            styles: { fontSize: '0.8rem', letterSpacing: '2px', color: '#fff' },
            layoutMode: 'safety',
            parentId: 'nav-shop',
            action: { type: 'navigate', payload: 'index' }
        },
        'link-shop-shop': { id: 'link-shop-shop', type: 'text', content: 'SHOP', styles: { fontSize: '0.8rem', letterSpacing: '2px', color: PALETTE.accent }, layoutMode: 'safety', parentId: 'nav-shop' },

        'shop-hero': {
            id: 'shop-hero',
            type: 'container',
            styles: { padding: '80px 60px', backgroundColor: '#050505', borderBottom: '1px solid #111' },
            layoutMode: 'safety',
            parentId: 'zeus-shop-root',
            children: ['shop-h1']
        },
        'shop-h1': { id: 'shop-h1', type: 'text', content: 'THE DIVINE COLLECTION', styles: { fontSize: '4rem', fontWeight: '900', letterSpacing: '2px' }, layoutMode: 'safety', parentId: 'shop-hero' },

        'product-grid': {
            id: 'product-grid',
            type: 'container',
            styles: { padding: '60px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' },
            layoutMode: 'safety',
            parentId: 'zeus-shop-root',
            children: ['prod-1', 'prod-2', 'prod-3', 'prod-4']
        },
        'prod-1': { id: 'prod-1', type: 'container', children: ['p1-img', 'p1-info'], parentId: 'product-grid' },
        'p1-img': { id: 'p1-img', type: 'box', styles: { height: '350px', backgroundColor: '#111', backgroundImage: 'url(https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800)' }, layoutMode: 'safety', parentId: 'prod-1' },
        'p1-info': { id: 'p1-info', type: 'container', styles: { marginTop: '15px' }, children: ['p1-title', 'p1-price', 'p1-buy'], parentId: 'prod-1' },
        'p1-title': { id: 'p1-title', type: 'text', content: 'THUNDER WATCH', styles: { fontSize: '1.2rem', fontWeight: '700' }, layoutMode: 'safety', parentId: 'p1-info' },
        'p1-price': { id: 'p1-price', type: 'text', content: '$12,000', styles: { color: PALETTE.accent, marginTop: '5px' }, layoutMode: 'safety', parentId: 'p1-info' },
        'p1-buy': {
            id: 'p1-buy',
            type: 'button',
            content: 'ADD TO CART',
            styles: { marginTop: '10px', width: '100%', padding: '10px', border: `1px solid ${PALETTE.accent}`, color: PALETTE.accent, fontSize: '0.7rem' },
            layoutMode: 'safety',
            parentId: 'p1-info',
            action: { type: 'navigate', payload: 'checkout' }
        },

        // Repeating for prod-2, prod-3, prod-4 with different images
        'prod-2': { id: 'prod-2', type: 'container', children: ['p2-img', 'p2-info'], parentId: 'product-grid' },
        'p2-img': { id: 'p2-img', type: 'box', styles: { height: '350px', backgroundColor: '#111', backgroundImage: 'url(https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800)' }, layoutMode: 'safety', parentId: 'prod-2' },
        'p2-info': { id: 'p2-info', type: 'container', styles: { marginTop: '15px' }, children: ['p2-title', 'p2-price', 'p2-buy'], parentId: 'prod-2' },
        'p2-title': { id: 'p2-title', type: 'text', content: 'LIGHTNING AUDIO', styles: { fontSize: '1.2rem', fontWeight: '700' }, layoutMode: 'safety', parentId: 'p2-info' },
        'p2-price': { id: 'p2-price', type: 'text', content: '$8,500', styles: { color: PALETTE.accent, marginTop: '5px' }, layoutMode: 'safety', parentId: 'p2-info' },
        'p2-buy': { id: 'p2-buy', type: 'button', content: 'ADD TO CART', styles: { marginTop: '10px', width: '100%', padding: '10px', border: `1px solid ${PALETTE.accent}`, color: PALETTE.accent, fontSize: '0.7rem' }, layoutMode: 'safety', parentId: 'p2-info', action: { type: 'navigate', payload: 'checkout' } },

        'prod-3': { id: 'prod-3', type: 'container', children: ['p3-img', 'p3-info'], parentId: 'product-grid' },
        'p3-img': { id: 'p3-img', type: 'box', styles: { height: '350px', backgroundColor: '#111', backgroundImage: 'url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800)' }, layoutMode: 'safety', parentId: 'prod-3' },
        'p3-info': { id: 'p3-info', type: 'container', styles: { marginTop: '15px' }, children: ['p3-title', 'p3-price', 'p3-buy'], parentId: 'prod-3' },
        'p3-title': { id: 'p3-title', type: 'text', content: 'OLYMPIAN SOLE', styles: { fontSize: '1.2rem', fontWeight: '700' }, layoutMode: 'safety', parentId: 'p3-info' },
        'p3-price': { id: 'p3-price', type: 'text', content: '$2,400', styles: { color: PALETTE.accent, marginTop: '5px' }, layoutMode: 'safety', parentId: 'p3-info' },
        'p3-buy': { id: 'p3-buy', type: 'button', content: 'ADD TO CART', styles: { marginTop: '10px', width: '100%', padding: '10px', border: `1px solid ${PALETTE.accent}`, color: PALETTE.accent, fontSize: '0.7rem' }, layoutMode: 'safety', parentId: 'p3-info', action: { type: 'navigate', payload: 'checkout' } },

        'prod-4': { id: 'prod-4', type: 'container', children: ['p4-img', 'p4-info'], parentId: 'product-grid' },
        'p4-img': { id: 'p4-img', type: 'box', styles: { height: '350px', backgroundColor: '#111', backgroundImage: 'url(https://images.unsplash.com/photo-1526170315870-ef68a6f3dd39?auto=format&fit=crop&w=800)' }, layoutMode: 'safety', parentId: 'prod-4' },
        'p4-info': { id: 'p4-info', type: 'container', styles: { marginTop: '15px' }, children: ['p4-title', 'p4-price', 'p4-buy'], parentId: 'prod-4' },
        'p4-title': { id: 'p4-title', type: 'text', content: 'NECTAR ELIXIR', styles: { fontSize: '1.2rem', fontWeight: '700' }, layoutMode: 'safety', parentId: 'p4-info' },
        'p4-price': { id: 'p4-price', type: 'text', content: '$1,200', styles: { color: PALETTE.accent, marginTop: '5px' }, layoutMode: 'safety', parentId: 'p4-info' },
        'p4-buy': { id: 'p4-buy', type: 'button', content: 'ADD TO CART', styles: { marginTop: '10px', width: '100%', padding: '10px', border: `1px solid ${PALETTE.accent}`, color: PALETTE.accent, fontSize: '0.7rem' }, layoutMode: 'safety', parentId: 'p4-info', action: { type: 'navigate', payload: 'checkout' } },

        'footer-shop': {
            id: 'footer-shop',
            type: 'container',
            styles: { padding: '100px 60px', borderTop: `1px solid ${PALETTE.accent}`, display: 'flex', justifyContent: 'space-between', backgroundColor: '#000' },
            layoutMode: 'safety',
            parentId: 'zeus-shop-root',
            children: ['fs-text', 'fs-links']
        },
        'fs-text': { id: 'fs-text', type: 'text', content: '© 2026 ZEUS SUPREME. ALL RIGHTS RESERVED.', styles: { fontSize: '0.7rem', opacity: '0.4' }, layoutMode: 'safety', parentId: 'footer-shop' },
        'fs-links': { id: 'fs-links', type: 'text', content: 'PRIVACY / TERMS / FAQ', styles: { fontSize: '0.7rem', letterSpacing: '2px' }, layoutMode: 'safety', parentId: 'footer-shop' },
    };
    return elements;
};
