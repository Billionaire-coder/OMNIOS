import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = { bg: '#000', text: '#fff', accent: '#D4AF37', secondary: '#111' };

export const zeusCheckout = () => {
    const elements: Record<string, DesignerElement> = {
        'zeus-checkout-root': createPageRoot('zeus-checkout-root', ['ch-header', 'ch-main', 'ch-footer'], { backgroundColor: PALETTE.bg }),
        'ch-header': {
            id: 'ch-header',
            type: 'container',
            styles: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #111' },
            layoutMode: 'safety',
            parentId: 'zeus-checkout-root',
            children: ['ch-logo']
        },
        'ch-logo': { id: 'ch-logo', type: 'text', content: 'Z E U S', styles: { fontSize: '1.5rem', fontWeight: '900', color: PALETTE.accent, letterSpacing: '4px' }, layoutMode: 'safety', parentId: 'ch-header' },

        'ch-main': {
            id: 'ch-main',
            type: 'container',
            styles: { padding: '100px 60px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '60px', maxWidth: '1200px', margin: '0 auto' },
            layoutMode: 'safety',
            parentId: 'zeus-checkout-root',
            children: ['ch-form', 'ch-summary']
        },
        'ch-form': {
            id: 'ch-form',
            type: 'container',
            styles: { display: 'flex', flexDirection: 'column', gap: '30px' },
            layoutMode: 'safety',
            parentId: 'ch-main',
            children: ['ch-title', 'ch-input-1', 'ch-input-2', 'ch-btn-pay']
        },
        'ch-title': { id: 'ch-title', type: 'text', content: 'SECURE ASCENSION', styles: { fontSize: '2rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'ch-form' },
        'ch-input-1': { id: 'ch-input-1', type: 'box', styles: { height: '50px', backgroundColor: '#111', border: '1px solid #333', padding: '15px', display: 'flex', alignItems: 'center' }, content: 'Olympian Name', layoutMode: 'safety', parentId: 'ch-form' },
        'ch-input-2': { id: 'ch-input-2', type: 'box', styles: { height: '50px', backgroundColor: '#111', border: '1px solid #333', padding: '15px', display: 'flex', alignItems: 'center' }, content: 'Lightning Bolt Delivery Address', layoutMode: 'safety', parentId: 'ch-form' },
        'ch-btn-pay': {
            id: 'ch-btn-pay',
            type: 'button',
            content: 'COMPLETE PURCHASE',
            styles: { padding: '20px', backgroundColor: PALETTE.accent, color: '#000', fontWeight: '900', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'ch-form'
        },

        'ch-summary': {
            id: 'ch-summary',
            type: 'container',
            styles: { backgroundColor: '#050505', padding: '40px', border: `1px solid ${PALETTE.accent}` },
            layoutMode: 'safety',
            parentId: 'ch-main',
            children: ['sm-title', 'sm-item', 'sm-total']
        },
        'sm-title': { id: 'sm-title', type: 'text', content: 'ORDER SUMMARY', styles: { fontSize: '1rem', fontWeight: '900', color: PALETTE.accent, marginBottom: '20px' }, layoutMode: 'safety', parentId: 'ch-summary' },
        'sm-item': { id: 'sm-item', type: 'text', content: 'Thunder Watch (x1) ... $12,000', styles: { fontSize: '0.9rem', color: '#fff' }, layoutMode: 'safety', parentId: 'ch-summary' },
        'sm-total': { id: 'sm-total', type: 'text', content: 'TOTAL: $12,000', styles: { fontSize: '1.5rem', fontWeight: '900', marginTop: '30px', borderTop: '1px solid #222', paddingTop: '20px' }, layoutMode: 'safety', parentId: 'ch-summary' },

        'ch-footer': {
            id: 'ch-footer',
            type: 'container',
            styles: { padding: '40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'zeus-checkout-root',
            children: ['ch-f-text']
        },
        'ch-f-text': { id: 'ch-f-text', type: 'text', content: 'Your data is protected by the power of Zeus.', styles: { fontSize: '0.7rem', opacity: '0.4' }, layoutMode: 'safety', parentId: 'ch-footer' }
    };
    return elements;
};
