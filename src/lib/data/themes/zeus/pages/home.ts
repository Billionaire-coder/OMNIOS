import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = {
    gold: '#D4AF37',
    darkGold: '#AA8C2C',
    black: '#0a0a0a',
    charcoal: '#1a1a1a',
    white: '#ffffff',
    glass: 'rgba(255,255,255,0.05)',
    glassBorder: 'rgba(255,255,255,0.1)'
};

export const zeusHome = () => {
    const elements: Record<string, DesignerElement> = {
        'zeus-home-root': createPageRoot('zeus-home-root', ['nav-strip', 'header-main', 'hero-section', 'features-grid', 'collection-showcase', 'heritage-block', 'footer-mega'], {
            backgroundColor: PALETTE.black,
            fontFamily: 'Montserrat, sans-serif'
        }),

        // 1. Top Strip
        'nav-strip': {
            id: 'nav-strip', type: 'container',
            styles: { height: '40px', backgroundColor: PALETTE.charcoal, display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: `1px solid ${PALETTE.glassBorder}` },
            layoutMode: 'safety', parentId: 'zeus-home-root', children: ['strip-text']
        },
        'strip-text': {
            id: 'strip-text', type: 'text', content: 'COMPLIMENTARY GLOBAL SHIPPING ON ORDERS OVER $500',
            styles: { fontSize: '0.7rem', color: PALETTE.gold, letterSpacing: '2px', fontWeight: '600', fontFamily: 'Montserrat, sans-serif' },
            layoutMode: 'safety', parentId: 'nav-strip'
        },

        // 2. Main Header (Mega Menu Simulation)
        'header-main': {
            id: 'header-main', type: 'container',
            styles: {
                height: '100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px',
                position: 'sticky', top: '0', backgroundColor: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', zIndex: '1000',
                borderBottom: `1px solid ${PALETTE.glassBorder}`
            },
            layoutMode: 'safety', parentId: 'zeus-home-root', children: ['header-left', 'header-logo', 'header-right']
        },
        'header-left': { id: 'header-left', type: 'container', styles: { flexDirection: 'row', gap: '30px' }, layoutMode: 'safety', parentId: 'header-main', children: ['nav-shop', 'nav-col', 'nav-abt'] },
        'nav-shop': { id: 'nav-shop', type: 'button', content: 'SHOP', styles: { background: 'transparent', color: 'white', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '1px' }, layoutMode: 'safety', parentId: 'header-left', action: { type: 'navigate', payload: 'shop' } },
        'nav-col': { id: 'nav-col', type: 'text', content: 'COLLECTIONS', styles: { cursor: 'pointer', color: 'white', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '1px' }, layoutMode: 'safety', parentId: 'header-left' },
        'nav-abt': { id: 'nav-abt', type: 'text', content: 'HERITAGE', styles: { cursor: 'pointer', color: 'white', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '1px' }, layoutMode: 'safety', parentId: 'header-left' },

        'header-logo': {
            id: 'header-logo', type: 'text', content: 'ZEUS',
            styles: { fontSize: '2.5rem', fontFamily: 'Cinzel, serif', fontWeight: '900', color: PALETTE.gold, letterSpacing: '0.2em' },
            layoutMode: 'safety', parentId: 'header-main'
        },

        'header-right': { id: 'header-right', type: 'container', styles: { flexDirection: 'row', gap: '20px' }, layoutMode: 'safety', parentId: 'header-main', children: ['icon-search', 'icon-cart'] },
        'icon-search': { id: 'icon-search', type: 'text', content: 'SEARCH', styles: { fontSize: '0.8rem', color: '#888', borderBottom: '1px solid #333' }, layoutMode: 'safety', parentId: 'header-right' },
        'icon-cart': { id: 'icon-cart', type: 'text', content: 'CART (0)', styles: { fontSize: '0.9rem', color: 'white', fontWeight: '600' }, layoutMode: 'safety', parentId: 'header-right' },

        // 3. Hero Section
        'hero-section': {
            id: 'hero-section', type: 'container',
            styles: {
                height: '85vh', width: '100%', position: 'relative', overflow: 'hidden',
                backgroundColor: 'black', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
            },
            layoutMode: 'safety', parentId: 'zeus-home-root', children: ['hero-bg', 'hero-content']
        },
        'hero-bg': {
            id: 'hero-bg', type: 'box',
            styles: {
                position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
                backgroundImage: 'radial-gradient(circle at 50% 50%, #2a2a2a 0%, #000 100%)', opacity: '0.8', zIndex: '0'
            },
            layoutMode: 'safety', parentId: 'hero-section'
        },
        'hero-content': {
            id: 'hero-content', type: 'container',
            styles: { zIndex: '10', alignItems: 'center', gap: '30px' },
            layoutMode: 'safety', parentId: 'hero-section', children: ['hero-super', 'hero-title', 'hero-sub', 'hero-cta']
        },
        'hero-super': { id: 'hero-super', type: 'text', content: 'EST. 2026', styles: { color: PALETTE.gold, letterSpacing: '0.5em', fontSize: '0.9rem', fontFamily: 'Cinzel, serif' }, layoutMode: 'safety', parentId: 'hero-content' },
        'hero-title': {
            id: 'hero-title', type: 'text', content: 'DIVINE PROPORTIONS',
            styles: {
                fontSize: '6rem', lineHeight: '1', fontFamily: 'Playfair Display, serif', fontWeight: '400',
                color: 'white', letterSpacing: '-0.02em', textTransform: 'uppercase'
            },
            layoutMode: 'safety', parentId: 'hero-content'
        },
        'hero-sub': { id: 'hero-sub', type: 'text', content: 'The new standard in digital opulence.', styles: { color: '#ccc', fontSize: '1.2rem', fontFamily: 'Montserrat, sans-serif', maxWidth: '600px' }, layoutMode: 'safety', parentId: 'hero-content' },
        'hero-cta': {
            id: 'hero-cta', type: 'button', content: 'EXPLORE COLLECTION',
            styles: {
                marginTop: '20px', padding: '18px 45px', backgroundColor: PALETTE.gold, color: 'black',
                fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.1em', borderRadius: '0', border: 'none', cursor: 'pointer'
            },
            layoutMode: 'safety', parentId: 'hero-content', action: { type: 'navigate', payload: 'shop' }
        },

        // 4. Features Grid
        'features-grid': {
            id: 'features-grid', type: 'container',
            styles: { padding: '80px 60px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', backgroundColor: '#111' },
            layoutMode: 'safety', parentId: 'zeus-home-root', children: ['feat-1', 'feat-2', 'feat-3']
        },
        'feat-1': { id: 'feat-1', type: 'container', styles: { padding: '40px', backgroundColor: 'black', alignItems: 'center', textAlign: 'center', gap: '20px' }, layoutMode: 'safety', parentId: 'features-grid', children: ['f1-icon', 'f1-title', 'f1-desc'] },
        'f1-icon': { id: 'f1-icon', type: 'text', content: '✈', styles: { fontSize: '2rem', color: PALETTE.gold }, layoutMode: 'safety', parentId: 'feat-1' },
        'f1-title': { id: 'f1-title', type: 'text', content: 'GLOBAL PRIORITY', styles: { color: 'white', fontFamily: 'Cinzel, serif', letterSpacing: '1px' }, layoutMode: 'safety', parentId: 'feat-1' },
        'f1-desc': { id: 'f1-desc', type: 'text', content: 'Complimentary shipping on all international orders.', styles: { color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }, layoutMode: 'safety', parentId: 'feat-1' },

        'feat-2': { id: 'feat-2', type: 'container', styles: { padding: '40px', backgroundColor: 'black', alignItems: 'center', textAlign: 'center', gap: '20px' }, layoutMode: 'safety', parentId: 'features-grid', children: ['f2-icon', 'f2-title', 'f2-desc'] },
        'f2-icon': { id: 'f2-icon', type: 'text', content: '🛡', styles: { fontSize: '2rem', color: PALETTE.gold }, layoutMode: 'safety', parentId: 'feat-2' },
        'f2-title': { id: 'f2-title', type: 'text', content: 'LIFETIME WARRANTY', styles: { color: 'white', fontFamily: 'Cinzel, serif', letterSpacing: '1px' }, layoutMode: 'safety', parentId: 'feat-2' },
        'f2-desc': { id: 'f2-desc', type: 'text', content: 'Every piece is guaranteed for eternity.', styles: { color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }, layoutMode: 'safety', parentId: 'feat-2' },

        'feat-3': { id: 'feat-3', type: 'container', styles: { padding: '40px', backgroundColor: 'black', alignItems: 'center', textAlign: 'center', gap: '20px' }, layoutMode: 'safety', parentId: 'features-grid', children: ['f3-icon', 'f3-title', 'f3-desc'] },
        'f3-icon': { id: 'f3-icon', type: 'text', content: '💎', styles: { fontSize: '2rem', color: PALETTE.gold }, layoutMode: 'safety', parentId: 'feat-3' },
        'f3-title': { id: 'f3-title', type: 'text', content: 'RARE MATERIALS', styles: { color: 'white', fontFamily: 'Cinzel, serif', letterSpacing: '1px' }, layoutMode: 'safety', parentId: 'feat-3' },
        'f3-desc': { id: 'f3-desc', type: 'text', content: 'Sourced from the most exclusive locations on Earth.', styles: { color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }, layoutMode: 'safety', parentId: 'feat-3' },

        // 5. Featured Collection
        'collection-showcase': {
            id: 'collection-showcase', type: 'container',
            styles: { padding: '100px 60px', backgroundColor: '#050505', gap: '60px' },
            layoutMode: 'safety', parentId: 'zeus-home-root', children: ['col-header', 'col-grid']
        },
        'col-header': { id: 'col-header', type: 'container', styles: { alignItems: 'center', textAlign: 'center', gap: '15px' }, layoutMode: 'safety', parentId: 'collection-showcase', children: ['ch-sup', 'ch-title'] },
        'ch-sup': { id: 'ch-sup', type: 'text', content: 'CURATED SELECTION', styles: { color: PALETTE.gold, fontSize: '0.8rem', letterSpacing: '3px' }, layoutMode: 'safety', parentId: 'col-header' },
        'ch-title': { id: 'ch-title', type: 'text', content: 'THE OLYMPUS SERIES', styles: { color: 'white', fontSize: '3rem', fontFamily: 'Playfair Display, serif' }, layoutMode: 'safety', parentId: 'col-header' },

        'col-grid': {
            id: 'col-grid', type: 'container',
            styles: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' },
            layoutMode: 'safety', parentId: 'collection-showcase', children: ['prod-1', 'prod-2']
        },
        'prod-1': { id: 'prod-1', type: 'box', styles: { height: '600px', backgroundColor: '#111', backgroundImage: 'url(https://images.unsplash.com/photo-1596704017254-9b1b1848fb90?auto=format&fit=crop&w=800)', backgroundSize: 'cover', position: 'relative' }, layoutMode: 'safety', parentId: 'col-grid', children: ['prod-1-ov'] },
        'prod-1-ov': { id: 'prod-1-ov', type: 'text', content: 'THE CHRONOS', styles: { position: 'absolute', bottom: '30px', left: '30px', color: 'white', fontSize: '1.5rem', fontFamily: 'Cinzel, serif', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }, layoutMode: 'safety', parentId: 'prod-1' },

        'prod-2': { id: 'prod-2', type: 'box', styles: { height: '600px', backgroundColor: '#111', backgroundImage: 'url(https://images.unsplash.com/photo-1617317376997-8748e6862c01?auto=format&fit=crop&w=800)', backgroundSize: 'cover', position: 'relative' }, layoutMode: 'safety', parentId: 'col-grid', children: ['prod-2-ov'] },
        'prod-2-ov': { id: 'prod-2-ov', type: 'text', content: 'THE AETHER', styles: { position: 'absolute', bottom: '30px', left: '30px', color: 'white', fontSize: '1.5rem', fontFamily: 'Cinzel, serif', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }, layoutMode: 'safety', parentId: 'prod-2' },


        // 6. Footer (Mega)
        'footer-mega': {
            id: 'footer-mega', type: 'container',
            styles: { padding: '100px 60px', backgroundColor: '#000', borderTop: '1px solid #222', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px' },
            layoutMode: 'safety', parentId: 'zeus-home-root', children: ['ft-brand', 'ft-shop', 'ft-supp', 'ft-news']
        },
        'ft-brand': { id: 'ft-brand', type: 'container', styles: { gap: '20px' }, layoutMode: 'safety', parentId: 'footer-mega', children: ['brand-logo', 'brand-desc'] },
        'brand-logo': { id: 'brand-logo', type: 'text', content: 'ZEUS', styles: { color: 'white', fontSize: '2rem', fontFamily: 'Cinzel, serif', fontWeight: '900' }, layoutMode: 'safety', parentId: 'ft-brand' },
        'brand-desc': { id: 'brand-desc', type: 'text', content: 'Defining the future of luxury commerce through superior design and uncompromising quality.', styles: { color: '#666', lineHeight: '1.8' }, layoutMode: 'safety', parentId: 'ft-brand' },

        'ft-shop': { id: 'ft-shop', type: 'container', styles: { gap: '15px' }, layoutMode: 'safety', parentId: 'footer-mega', children: ['h-shop', 'li-1', 'li-2', 'li-3'] },
        'h-shop': { id: 'h-shop', type: 'text', content: 'SHOP', styles: { color: 'white', fontWeight: 'bold', marginBottom: '10px' }, layoutMode: 'safety', parentId: 'ft-shop' },
        'li-1': { id: 'li-1', type: 'text', content: 'New Arrivals', styles: { color: '#888', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'ft-shop' },
        'li-2': { id: 'li-2', type: 'text', content: 'Best Sellers', styles: { color: '#888', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'ft-shop' },
        'li-3': { id: 'li-3', type: 'text', content: 'Accessories', styles: { color: '#888', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'ft-shop' },

        'ft-supp': { id: 'ft-supp', type: 'container', styles: { gap: '15px' }, layoutMode: 'safety', parentId: 'footer-mega', children: ['h-supp', 'li-4', 'li-5', 'li-6'] },
        'h-supp': { id: 'h-supp', type: 'text', content: 'SUPPORT', styles: { color: 'white', fontWeight: 'bold', marginBottom: '10px' }, layoutMode: 'safety', parentId: 'ft-supp' },
        'li-4': { id: 'li-4', type: 'text', content: 'FAQ', styles: { color: '#888', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'ft-supp' },
        'li-5': { id: 'li-5', type: 'text', content: 'Shipping Returns', styles: { color: '#888', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'ft-supp' },
        'li-6': { id: 'li-6', type: 'text', content: 'Care Guide', styles: { color: '#888', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'ft-supp' },

        'ft-news': { id: 'ft-news', type: 'container', styles: { gap: '20px' }, layoutMode: 'safety', parentId: 'footer-mega', children: ['h-news', 'news-text'] },
        'h-news': { id: 'h-news', type: 'text', content: 'NEWSLETTER', styles: { color: 'white', fontWeight: 'bold', marginBottom: '10px' }, layoutMode: 'safety', parentId: 'ft-news' },
        'news-text': { id: 'news-text', type: 'text', content: 'Subscribe to receive early access to new collections.', styles: { color: '#888', lineHeight: '1.6' }, layoutMode: 'safety', parentId: 'ft-news' },
    };
    return elements;
};
