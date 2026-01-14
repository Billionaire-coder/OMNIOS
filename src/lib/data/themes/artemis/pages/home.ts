import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = {
    forest: '#1e3a29',
    earth: '#5d4037',
    sage: '#8f9a6a',
    cream: '#f5f5dc',
    white: '#ffffff'
};

export const artemisHome = () => {
    const elements: Record<string, DesignerElement> = {
        'artemis-home-root': createPageRoot('artemis-home-root', ['ar-nav', 'ar-hero', 'ar-mission', 'ar-products', 'ar-footer'], {
            backgroundColor: PALETTE.cream,
            fontFamily: 'Montserrat, sans-serif',
            color: PALETTE.forest
        }),

        'ar-nav': {
            id: 'ar-nav', type: 'container',
            styles: {
                height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 50px',
                backgroundColor: PALETTE.cream, position: 'sticky', top: '0', zIndex: '1000'
            },
            layoutMode: 'safety', parentId: 'artemis-home-root', children: ['arn-logo', 'arn-menu']
        },
        'arn-logo': { id: 'arn-logo', type: 'text', content: 'ARTEMIS 🌿', styles: { fontSize: '1.5rem', fontWeight: '700', color: PALETTE.forest }, layoutMode: 'safety', parentId: 'ar-nav' },
        'arn-menu': { id: 'arn-menu', type: 'container', styles: { flexDirection: 'row', gap: '30px' }, layoutMode: 'safety', parentId: 'ar-nav', children: ['arm-1', 'arm-2', 'arm-3'] },
        'arm-1': { id: 'arm-1', type: 'text', content: 'Shop', styles: { fontWeight: '600', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'arn-menu', action: { type: 'navigate', payload: 'shop' } },
        'arm-2': { id: 'arm-2', type: 'text', content: 'Our Story', styles: { fontWeight: '600', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'arn-menu' },
        'arm-3': { id: 'arm-3', type: 'text', content: 'Sustainabilty', styles: { fontWeight: '600', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'arn-menu' },

        'ar-hero': {
            id: 'ar-hero', type: 'container',
            styles: { padding: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
            layoutMode: 'safety', parentId: 'artemis-home-root', children: ['arh-card']
        },
        'arh-card': {
            id: 'arh-card', type: 'container',
            styles: {
                width: '100%', height: '70vh', borderRadius: '40px', backgroundColor: PALETTE.forest,
                backgroundImage: 'url(https://images.unsplash.com/photo-1542601906990-24d4c16419d0?auto=format&fit=crop&w=1200)',
                backgroundSize: 'cover', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '20px'
            },
            layoutMode: 'safety', parentId: 'ar-hero', children: ['arhc-t', 'arhc-d', 'arhc-b']
        },
        'arhc-t': { id: 'arhc-t', type: 'text', content: 'Rooted in Nature.', styles: { fontSize: '5rem', fontWeight: '900', color: 'white', textShadow: '0 4px 10px rgba(0,0,0,0.3)' }, layoutMode: 'safety', parentId: 'arh-card' },
        'arhc-d': { id: 'arhc-d', type: 'text', content: 'Sustainable essentials for a balanced life.', styles: { fontSize: '1.2rem', color: '#eee', maxWidth: '600px' }, layoutMode: 'safety', parentId: 'arh-card' },
        'arhc-b': { id: 'arhc-b', type: 'button', content: 'SHOP THE COLLECTION', styles: { marginTop: '20px', padding: '16px 32px', backgroundColor: PALETTE.sage, color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'arh-card', action: { type: 'navigate', payload: 'shop' } },

        'ar-mission': {
            id: 'ar-mission', type: 'container',
            styles: { padding: '100px 50px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' },
            layoutMode: 'safety', parentId: 'artemis-home-root', children: ['arm-txt', 'arm-img']
        },
        'arm-txt': { id: 'arm-txt', type: 'container', styles: { gap: '20px' }, layoutMode: 'safety', parentId: 'ar-mission', children: ['armt-h', 'armt-p'] },
        'armt-h': { id: 'armt-h', type: 'text', content: 'Earth First.', styles: { fontSize: '3rem', fontWeight: '800', color: PALETTE.forest }, layoutMode: 'safety', parentId: 'arm-txt' },
        'armt-p': { id: 'armt-p', type: 'text', content: 'We believe that luxury shouldn\'t cost the earth. That\'s why 100% of our materials are ethically sourced, and every purchase plants a tree.', styles: { fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }, layoutMode: 'safety', parentId: 'arm-txt' },
        'arm-img': { id: 'arm-img', type: 'box', styles: { width: '100%', height: '500px', borderRadius: '300px 300px 0 0', backgroundColor: PALETTE.sage, backgroundImage: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800)', backgroundSize: 'cover' }, layoutMode: 'safety', parentId: 'ar-mission' },

        'ar-products': {
            id: 'ar-products', type: 'container',
            styles: { padding: '80px 50px', backgroundColor: 'white', borderRadius: '40px 40px 0 0' },
            layoutMode: 'safety', parentId: 'artemis-home-root', children: ['arp-h', 'arp-grid']
        },
        'arp-h': { id: 'arp-h', type: 'text', content: 'The Essentials', styles: { fontSize: '2.5rem', fontWeight: '700', textAlign: 'center', marginBottom: '60px', color: PALETTE.forest }, layoutMode: 'safety', parentId: 'ar-products' },
        'arp-grid': {
            id: 'arp-grid', type: 'container',
            styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' },
            layoutMode: 'safety', parentId: 'ar-products', children: ['arp-1', 'arp-2', 'arp-3']
        },
        'arp-1': { id: 'arp-1', type: 'container', styles: { alignItems: 'center', gap: '15px' }, layoutMode: 'safety', parentId: 'arp-grid', children: ['ap1-i', 'ap1-t', 'ap1-p'] },
        'ap1-i': { id: 'ap1-i', type: 'box', styles: { width: '100%', height: '350px', borderRadius: '20px', backgroundColor: '#f0f0f0', backgroundImage: 'url(https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?auto=format&fit=crop&w=600)', backgroundSize: 'cover' }, layoutMode: 'safety', parentId: 'arp-1' },
        'ap1-t': { id: 'ap1-t', type: 'text', content: 'Botanical Serum', styles: { fontSize: '1.2rem', fontWeight: '600' }, layoutMode: 'safety', parentId: 'arp-1' },
        'ap1-p': { id: 'ap1-p', type: 'text', content: '$45.00', styles: { color: PALETTE.sage, fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'arp-1' },

        'arp-2': { id: 'arp-2', type: 'container', styles: { alignItems: 'center', gap: '15px' }, layoutMode: 'safety', parentId: 'arp-grid', children: ['ap2-i', 'ap2-t', 'ap2-p'] },
        'ap2-i': { id: 'ap2-i', type: 'box', styles: { width: '100%', height: '350px', borderRadius: '20px', backgroundColor: '#f0f0f0', backgroundImage: 'url(https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600)', backgroundSize: 'cover' }, layoutMode: 'safety', parentId: 'arp-2' },
        'ap2-t': { id: 'ap2-t', type: 'text', content: 'Clay Mask', styles: { fontSize: '1.2rem', fontWeight: '600' }, layoutMode: 'safety', parentId: 'arp-2' },
        'ap2-p': { id: 'ap2-p', type: 'text', content: '$38.00', styles: { color: PALETTE.sage, fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'arp-2' },

        'arp-3': { id: 'arp-3', type: 'container', styles: { alignItems: 'center', gap: '15px' }, layoutMode: 'safety', parentId: 'arp-grid', children: ['ap3-i', 'ap3-t', 'ap3-p'] },
        'ap3-i': { id: 'ap3-i', type: 'box', styles: { width: '100%', height: '350px', borderRadius: '20px', backgroundColor: '#f0f0f0', backgroundImage: 'url(https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=600)', backgroundSize: 'cover' }, layoutMode: 'safety', parentId: 'arp-3' },
        'ap3-t': { id: 'ap3-t', type: 'text', content: 'Bamboo Brush', styles: { fontSize: '1.2rem', fontWeight: '600' }, layoutMode: 'safety', parentId: 'arp-3' },
        'ap3-p': { id: 'ap3-p', type: 'text', content: '$12.00', styles: { color: PALETTE.sage, fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'arp-3' },

        'ar-footer': {
            id: 'ar-footer', type: 'container',
            styles: { padding: '60px 50px', backgroundColor: PALETTE.forest, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
            layoutMode: 'safety', parentId: 'artemis-home-root', children: ['arf-l', 'arf-r']
        },
        'arf-l': { id: 'arf-l', type: 'text', content: 'Artemis Earth', styles: { fontSize: '1.2rem', fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'ar-footer' },
        'arf-r': { id: 'arf-r', type: 'text', content: '© 2026. Made with love.', styles: { fontSize: '0.9rem', opacity: '0.8' }, layoutMode: 'safety', parentId: 'ar-footer' }
    };
    return elements;
};
