import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = { bg: '#fff', text: '#1e3a8a', accent: '#3b82f6', secondary: '#f8fafc' };

export const athenaBlog = () => {
    const elements: Record<string, DesignerElement> = {
        'athena-blog-root': createPageRoot('athena-blog-root', ['header-blog', 'blog-hero', 'blog-grid', 'footer-blog'], { backgroundColor: PALETTE.bg, color: PALETTE.text }),
        'header-blog': {
            id: 'header-blog',
            type: 'container',
            styles: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: PALETTE.secondary, borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '0', zIndex: '1000' },
            layoutMode: 'safety',
            parentId: 'athena-blog-root',
            children: ['logo-blog', 'nav-blog']
        },
        'logo-blog': { id: 'logo-blog', type: 'text', content: 'ATHENA INTEL', styles: { fontWeight: '900', letterSpacing: '1px', color: PALETTE.text }, layoutMode: 'safety', parentId: 'header-blog' },
        'nav-blog': { id: 'nav-blog', type: 'container', styles: { display: 'flex', gap: '20px' }, layoutMode: 'safety', parentId: 'header-blog', children: ['link-home-b', 'link-blog-b'] },
        'link-home-b': {
            id: 'link-home-b',
            type: 'button',
            content: 'INTELLIGENCE',
            styles: { fontSize: '0.8rem', fontWeight: '700', color: '#64748b' },
            layoutMode: 'safety',
            parentId: 'nav-blog',
            action: { type: 'navigate', payload: 'index' }
        },
        'link-blog-b': { id: 'link-blog-b', type: 'text', content: 'INSIGHT HUB', styles: { fontSize: '0.8rem', fontWeight: '700', color: PALETTE.accent }, layoutMode: 'safety', parentId: 'nav-blog' },

        'blog-hero': {
            id: 'blog-hero',
            type: 'container',
            styles: { padding: '80px 40px', backgroundColor: PALETTE.text, color: '#fff' },
            layoutMode: 'safety',
            parentId: 'athena-blog-root',
            children: ['blog-h1', 'blog-desc']
        },
        'blog-h1': { id: 'blog-h1', type: 'text', content: 'INSIGHT HUB', styles: { fontSize: '4rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'blog-hero' },
        'blog-desc': { id: 'blog-desc', type: 'text', content: 'LATEST ANALYTICS AND STRATEGY FROM THE GODS.', styles: { marginTop: '10px', fontSize: '1rem', opacity: '0.8' }, layoutMode: 'safety', parentId: 'blog-hero' },

        'blog-grid': {
            id: 'blog-grid',
            type: 'container',
            styles: { padding: '60px 40px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '60px' },
            layoutMode: 'safety',
            parentId: 'athena-blog-root',
            children: ['post-1', 'post-2']
        },
        'post-1': { id: 'post-1', type: 'container', children: ['p1-title', 'p1-meta', 'p1-exc'], parentId: 'blog-grid' },
        'p1-title': { id: 'p1-title', type: 'text', content: 'The Power of Divine Data', styles: { fontSize: '2rem', fontWeight: '900', color: PALETTE.text }, layoutMode: 'safety', parentId: 'post-1' },
        'p1-meta': { id: 'p1-meta', type: 'text', content: 'JAN 2026 • BY ZEUS', styles: { fontSize: '0.7rem', color: PALETTE.accent, marginTop: '10px' }, layoutMode: 'safety', parentId: 'post-1' },
        'p1-exc': { id: 'p1-exc', type: 'text', content: 'How predictive modeling shaped the future of the Olympus marketplace.', styles: { marginTop: '15px', color: '#64748b', lineHeight: '1.6' }, layoutMode: 'safety', parentId: 'post-1' },

        'post-2': { id: 'post-2', type: 'container', children: ['p2-title', 'p2-meta', 'p2-exc'], parentId: 'blog-grid' },
        'p2-title': { id: 'p2-title', type: 'text', content: 'Scaing Empires Visually', styles: { fontSize: '2rem', fontWeight: '900', color: PALETTE.text }, layoutMode: 'safety', parentId: 'post-2' },
        'p2-meta': { id: 'p2-meta', type: 'text', content: 'JAN 2026 • BY ATHENA', styles: { fontSize: '0.7rem', color: PALETTE.accent, marginTop: '10px' }, layoutMode: 'safety', parentId: 'post-2' },
        'p2-exc': { id: 'p2-exc', type: 'text', content: 'A deep dive into no-code architectures for sovereign digital states.', styles: { marginTop: '15px', color: '#64748b', lineHeight: '1.6' }, layoutMode: 'safety', parentId: 'post-2' },

        'footer-blog': {
            id: 'footer-blog',
            type: 'container',
            styles: { padding: '40px', textAlign: 'center', borderTop: '1px solid #e2e8f0' },
            layoutMode: 'safety',
            parentId: 'athena-blog-root',
            children: ['fb-text']
        },
        'fb-text': { id: 'fb-text', type: 'text', content: '© 2026 ATHENA INTELLIGENCE. ALL RIGHTS RESERVED.', styles: { fontSize: '0.7rem', color: '#94a3b8' }, layoutMode: 'safety', parentId: 'footer-blog' }
    };
    return elements;
};
