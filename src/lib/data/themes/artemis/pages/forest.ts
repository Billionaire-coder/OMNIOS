import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = { bg: '#f0fdf4', text: '#166534', accent: '#fff', secondary: '#dcfce7' };

export const artemisForest = () => {
    const elements: Record<string, DesignerElement> = {
        'artemis-for-root': createPageRoot('artemis-for-root', ['for-nav', 'for-hero', 'for-grid', 'for-footer'], { backgroundColor: PALETTE.bg, color: PALETTE.text }),
        'for-nav': {
            id: 'for-nav',
            type: 'container',
            styles: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
            layoutMode: 'safety',
            parentId: 'artemis-for-root',
            children: ['for-back']
        },
        'for-back': { id: 'for-back', type: 'button', content: 'RETURN TO MEADOW', styles: { fontSize: '0.8rem', fontWeight: '700' }, layoutMode: 'safety', parentId: 'for-nav', action: { type: 'navigate', payload: 'index' } },

        'for-hero': {
            id: 'for-hero',
            type: 'container',
            styles: { padding: '80px 40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'artemis-for-root',
            children: ['for-h1']
        },
        'for-h1': { id: 'for-h1', type: 'text', content: 'THE FOREST GRID', styles: { fontSize: '4rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'for-hero' },

        'for-grid': {
            id: 'for-grid',
            type: 'container',
            styles: { padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' },
            layoutMode: 'safety',
            parentId: 'artemis-for-root',
            children: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10']
        },
        'f1': { id: 'f1', type: 'box', styles: { height: '300px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=300)' }, layoutMode: 'safety', parentId: 'for-grid' },
        'f2': { id: 'f2', type: 'box', styles: { height: '300px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=300)' }, layoutMode: 'safety', parentId: 'for-grid' },
        'f3': { id: 'f3', type: 'box', styles: { height: '300px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=300)' }, layoutMode: 'safety', parentId: 'for-grid' },
        'f4': { id: 'f4', type: 'box', styles: { height: '300px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=300)' }, layoutMode: 'safety', parentId: 'for-grid' },
        'f5': { id: 'f5', type: 'box', styles: { height: '300px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=300)' }, layoutMode: 'safety', parentId: 'for-grid' },
        'f6': { id: 'f6', type: 'box', styles: { height: '300px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=300)' }, layoutMode: 'safety', parentId: 'for-grid' },
        'f7': { id: 'f7', type: 'box', styles: { height: '300px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=300)' }, layoutMode: 'safety', parentId: 'for-grid' },
        'f8': { id: 'f8', type: 'box', styles: { height: '300px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&w=300)' }, layoutMode: 'safety', parentId: 'for-grid' },
        'f9': { id: 'f9', type: 'box', styles: { height: '300px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1426604966848-d7adac402bdb?auto=format&fit=crop&w=300)' }, layoutMode: 'safety', parentId: 'for-grid' },
        'f10': { id: 'f10', type: 'box', styles: { height: '300px', backgroundColor: '#fff', backgroundImage: 'url(https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=300)' }, layoutMode: 'safety', parentId: 'for-grid' },

        'for-footer': {
            id: 'for-footer',
            type: 'container',
            styles: { padding: '40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'artemis-for-root',
            children: ['for-f-text']
        },
        'for-f-text': { id: 'for-f-text', type: 'text', content: 'KEEP IT WILD.', styles: { fontSize: '0.7rem', opacity: '0.4' }, layoutMode: 'safety', parentId: 'for-footer' }
    };
    return elements;
};
