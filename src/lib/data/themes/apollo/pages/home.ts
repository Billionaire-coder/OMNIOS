import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = {
    white: '#ffffff',
    black: '#000000',
    grey: '#f3f4f6',
    accent: '#3b82f6'
};

export const apolloHome = () => {
    const elements: Record<string, DesignerElement> = {
        'apollo-home-root': createPageRoot('apollo-home-root', ['ap-nav', 'ap-hero', 'ap-gallery', 'ap-contact'], {
            backgroundColor: PALETTE.white,
            fontFamily: 'Inter, sans-serif',
            color: PALETTE.black
        }),

        'ap-nav': {
            id: 'ap-nav', type: 'container',
            styles: {
                height: '100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 80px',
                backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: '0', zIndex: '1000'
            },
            layoutMode: 'safety', parentId: 'apollo-home-root', children: ['apn-logo', 'apn-menu']
        },
        'apn-logo': { id: 'apn-logo', type: 'text', content: 'APOLLO', styles: { fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }, layoutMode: 'safety', parentId: 'ap-nav' },
        'apn-menu': { id: 'apn-menu', type: 'container', styles: { flexDirection: 'row', gap: '40px' }, layoutMode: 'safety', parentId: 'ap-nav', children: ['apm-1', 'apm-2', 'apm-3'] },
        'apm-1': { id: 'apm-1', type: 'text', content: 'Work', styles: { fontWeight: '500', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'apn-menu' },
        'apm-2': { id: 'apm-2', type: 'text', content: 'Studio', styles: { fontWeight: '500', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'apn-menu' },
        'apm-3': { id: 'apm-3', type: 'text', content: 'Contact', styles: { fontWeight: '500', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'apn-menu', action: { type: 'navigate', payload: 'contact' } },

        'ap-hero': {
            id: 'ap-hero', type: 'container',
            styles: { padding: '100px 80px', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '40px' },
            layoutMode: 'safety', parentId: 'apollo-home-root', children: ['aph-t1', 'aph-t2', 'aph-desc', 'aph-img']
        },
        'aph-t1': { id: 'aph-t1', type: 'text', content: 'Curating the', styles: { fontSize: '5rem', fontWeight: '300', lineHeight: '1' }, layoutMode: 'safety', parentId: 'ap-hero' },
        'aph-t2': { id: 'aph-t2', type: 'text', content: 'Exceptional.', styles: { fontSize: '5rem', fontWeight: '900', lineHeight: '1' }, layoutMode: 'safety', parentId: 'ap-hero' },
        'aph-desc': { id: 'aph-desc', type: 'text', content: 'A digital studio dedicated to the art of clarity.', styles: { fontSize: '1.5rem', color: '#666', maxWidth: '500px' }, layoutMode: 'safety', parentId: 'ap-hero' },
        'aph-img': {
            id: 'aph-img', type: 'box',
            styles: { width: '100%', height: '500px', backgroundColor: PALETTE.grey, backgroundImage: 'url(https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200)', backgroundSize: 'cover', borderRadius: '4px' },
            layoutMode: 'safety', parentId: 'ap-hero'
        },

        'ap-gallery': {
            id: 'ap-gallery', type: 'container',
            styles: { padding: '100px 80px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '80px' },
            layoutMode: 'safety', parentId: 'apollo-home-root', children: ['apg-1', 'apg-2', 'apg-3', 'apg-4']
        },
        'apg-1': { id: 'apg-1', type: 'container', styles: { gap: '20px' }, layoutMode: 'safety', parentId: 'ap-gallery', children: ['ag1-i', 'ag1-t', 'ag1-d'] },
        'ag1-i': { id: 'ag1-i', type: 'box', styles: { width: '100%', height: '600px', backgroundColor: '#eee', backgroundImage: 'url(https://images.unsplash.com/photo-1545231097-c046d9dcc2f6?auto=format&fit=crop&w=800)', backgroundSize: 'cover' }, layoutMode: 'safety', parentId: 'apg-1' },
        'ag1-t': { id: 'ag1-t', type: 'text', content: 'Project Alpha', styles: { fontSize: '2rem', fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'apg-1' },
        'ag1-d': { id: 'ag1-d', type: 'text', content: 'Branding / UI', styles: { color: '#888' }, layoutMode: 'safety', parentId: 'apg-1' },

        'apg-2': { id: 'apg-2', type: 'container', styles: { gap: '20px', marginTop: '100px' }, layoutMode: 'safety', parentId: 'ap-gallery', children: ['ag2-i', 'ag2-t', 'ag2-d'] },
        'ag2-i': { id: 'ag2-i', type: 'box', styles: { width: '100%', height: '600px', backgroundColor: '#eee', backgroundImage: 'url(https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800)', backgroundSize: 'cover' }, layoutMode: 'safety', parentId: 'apg-2' },
        'ag2-t': { id: 'ag2-t', type: 'text', content: 'Project Beta', styles: { fontSize: '2rem', fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'apg-2' },
        'ag2-d': { id: 'ag2-d', type: 'text', content: 'Strategy / Web', styles: { color: '#888' }, layoutMode: 'safety', parentId: 'apg-2' },

        'apg-3': { id: 'apg-3', type: 'container', styles: { gap: '20px' }, layoutMode: 'safety', parentId: 'ap-gallery', children: ['ag3-i', 'ag3-t', 'ag3-d'] },
        'ag3-i': { id: 'ag3-i', type: 'box', styles: { width: '100%', height: '600px', backgroundColor: '#eee', backgroundImage: 'url(https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800)', backgroundSize: 'cover' }, layoutMode: 'safety', parentId: 'apg-3' },
        'ag3-t': { id: 'ag3-t', type: 'text', content: 'Project Gamma', styles: { fontSize: '2rem', fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'apg-3' },
        'ag3-d': { id: 'ag3-d', type: 'text', content: 'Editorial / Print', styles: { color: '#888' }, layoutMode: 'safety', parentId: 'apg-3' },

        'apg-4': { id: 'apg-4', type: 'container', styles: { gap: '20px', marginTop: '100px' }, layoutMode: 'safety', parentId: 'ap-gallery', children: ['ag4-i', 'ag4-t', 'ag4-d'] },
        'ag4-i': { id: 'ag4-i', type: 'box', styles: { width: '100%', height: '600px', backgroundColor: '#eee', backgroundImage: 'url(https://images.unsplash.com/photo-1497215842964-222b4bef37cd?auto=format&fit=crop&w=800)', backgroundSize: 'cover' }, layoutMode: 'safety', parentId: 'apg-4' },
        'ag4-t': { id: 'ag4-t', type: 'text', content: 'Project Delta', styles: { fontSize: '2rem', fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'apg-4' },
        'ag4-d': { id: 'ag4-d', type: 'text', content: 'Photography', styles: { color: '#888' }, layoutMode: 'safety', parentId: 'apg-4' },

        'ap-contact': {
            id: 'ap-contact', type: 'container',
            styles: { padding: '100px 80px', backgroundColor: '#000', color: 'white', textAlign: 'center' },
            layoutMode: 'safety', parentId: 'apollo-home-root', children: ['apc-t', 'apc-e']
        },
        'apc-t': { id: 'apc-t', type: 'text', content: 'Let\'s create something timeless.', styles: { fontSize: '3rem', marginBottom: '20px', fontWeight: '900' }, layoutMode: 'safety', parentId: 'ap-contact' },
        'apc-e': { id: 'apc-e', type: 'text', content: 'hello@apollo.studio', styles: { fontSize: '1.5rem', color: '#888', textDecoration: 'underline', cursor: 'pointer' }, layoutMode: 'safety', parentId: 'ap-contact' }
    };
    return elements;
};
