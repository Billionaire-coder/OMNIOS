import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = { bg: '#fff5f7', text: '#d63384', accent: '#000', secondary: '#fff' };

export const aphroditeCollections = () => {
    const elements: Record<string, DesignerElement> = {
        'aphrodite-col-root': createPageRoot('aphrodite-col-root', ['col-nav', 'col-hero', 'col-grid', 'col-footer'], { backgroundColor: PALETTE.bg, color: PALETTE.text }),
        'col-nav': {
            id: 'col-nav',
            type: 'container',
            styles: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
            layoutMode: 'safety',
            parentId: 'aphrodite-col-root',
            children: ['col-back']
        },
        'col-back': { id: 'col-back', type: 'button', content: 'BACK TO HOME', styles: { fontSize: '0.7rem', letterSpacing: '2px' }, layoutMode: 'safety', parentId: 'col-nav', action: { type: 'navigate', payload: 'index' } },

        'col-hero': {
            id: 'col-hero',
            type: 'container',
            styles: { padding: '60px 40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'aphrodite-col-root',
            children: ['col-h1']
        },
        'col-h1': { id: 'col-h1', type: 'text', content: 'THE COLLECTIONS', styles: { fontSize: '3rem', fontWeight: '200', letterSpacing: '10px' }, layoutMode: 'safety', parentId: 'col-hero' },

        'col-grid': {
            id: 'col-grid',
            type: 'container',
            styles: { padding: '60px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' },
            layoutMode: 'safety',
            parentId: 'aphrodite-col-root',
            children: ['i1', 'i2', 'i3', 'i4', 'i5', 'i6']
        },
        'i1': { id: 'i1', type: 'box', styles: { height: '400px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'col-grid' },
        'i2': { id: 'i2', type: 'box', styles: { height: '400px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'col-grid' },
        'i3': { id: 'i3', type: 'box', styles: { height: '400px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'col-grid' },
        'i4': { id: 'i4', type: 'box', styles: { height: '400px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'col-grid' },
        'i5': { id: 'i5', type: 'box', styles: { height: '400px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'col-grid' },
        'i6': { id: 'i6', type: 'box', styles: { height: '400px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'col-grid' },

        'col-footer': {
            id: 'col-footer',
            type: 'container',
            styles: { padding: '40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'aphrodite-col-root',
            children: ['cf-text']
        },
        'cf-text': { id: 'cf-text', type: 'text', content: 'EXQUISITE QUALITY. DIVINE ORIGIN.', styles: { fontSize: '0.7rem', opacity: '0.4' }, layoutMode: 'safety', parentId: 'col-footer' }
    };
    return elements;
};
