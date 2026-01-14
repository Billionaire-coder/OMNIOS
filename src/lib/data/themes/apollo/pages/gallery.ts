import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = { bg: '#fff', text: '#f59e0b', accent: '#000', secondary: '#fafafa' };

export const apolloGallery = () => {
    const elements: Record<string, DesignerElement> = {
        'apollo-gal-root': createPageRoot('apollo-gal-root', ['g-nav', 'g-grid', 'g-footer'], { backgroundColor: PALETTE.bg, color: PALETTE.text }),
        'g-nav': {
            id: 'g-nav',
            type: 'container',
            styles: { height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
            layoutMode: 'safety',
            parentId: 'apollo-gal-root',
            children: ['g-back']
        },
        'g-back': { id: 'g-back', type: 'button', content: 'BACK TO LIGHT', styles: { fontSize: '0.7rem', letterSpacing: '4px' }, layoutMode: 'safety', parentId: 'g-nav', action: { type: 'navigate', payload: 'index' } },

        'g-grid': {
            id: 'g-grid',
            type: 'container',
            styles: { padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
            layoutMode: 'safety',
            parentId: 'apollo-gal-root',
            children: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']
        },
        'm1': { id: 'm1', type: 'box', styles: { height: '500px', backgroundColor: '#f0f0f0', backgroundImage: 'url(https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'g-grid' },
        'm2': { id: 'm2', type: 'box', styles: { height: '500px', backgroundColor: '#f0f0f0', backgroundImage: 'url(https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'g-grid' },
        'm3': { id: 'm3', type: 'box', styles: { height: '500px', backgroundColor: '#f0f0f0', backgroundImage: 'url(https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'g-grid' },
        'm4': { id: 'm4', type: 'box', styles: { height: '500px', backgroundColor: '#f0f0f0', backgroundImage: 'url(https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'g-grid' },
        'm5': { id: 'm5', type: 'box', styles: { height: '500px', backgroundColor: '#f0f0f0', backgroundImage: 'url(https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'g-grid' },
        'm6': { id: 'm6', type: 'box', styles: { height: '500px', backgroundColor: '#f0f0f0', backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400)' }, layoutMode: 'safety', parentId: 'g-grid' },

        'g-footer': {
            id: 'g-footer',
            type: 'container',
            styles: { padding: '40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'apollo-gal-root',
            children: ['gf-text']
        },
        'gf-text': { id: 'gf-text', type: 'text', content: 'EXHIBITION 2026', styles: { fontSize: '0.7rem', opacity: '0.3' }, layoutMode: 'safety', parentId: 'g-footer' }
    };
    return elements;
};
