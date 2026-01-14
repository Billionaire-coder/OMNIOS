import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = { bg: '#fff', text: '#000', accent: '#3b82f6', secondary: '#f8fafc' };

export const hermesPricing = () => {
    const elements: Record<string, DesignerElement> = {
        'hermes-pricing-root': createPageRoot('hermes-pricing-root', ['p-nav', 'p-hero', 'p-grid', 'p-footer'], { backgroundColor: PALETTE.bg, color: PALETTE.text }),
        'p-nav': {
            id: 'p-nav',
            type: 'container',
            styles: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f1f5f9' },
            layoutMode: 'safety',
            parentId: 'hermes-pricing-root',
            children: ['p-back']
        },
        'p-back': { id: 'p-back', type: 'button', content: 'BACK TO HOME', styles: { fontSize: '0.8rem', fontWeight: '600' }, layoutMode: 'safety', parentId: 'p-nav', action: { type: 'navigate', payload: 'index' } },

        'p-hero': {
            id: 'p-hero',
            type: 'container',
            styles: { padding: '80px 40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'hermes-pricing-root',
            children: ['p-h1', 'p-hp']
        },
        'p-h1': { id: 'p-h1', type: 'text', content: 'PRICING', styles: { fontSize: '4rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'p-hero' },
        'p-hp': { id: 'p-hp', type: 'text', content: 'TRANSPARENT PLANS FOR EVERY SCALE.', styles: { marginTop: '10px', color: '#64748b' }, layoutMode: 'safety', parentId: 'p-hero' },

        'p-grid': {
            id: 'p-grid',
            type: 'container',
            styles: { padding: '60px 40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', maxWidth: '1200px', margin: '0 auto' },
            layoutMode: 'safety',
            parentId: 'hermes-pricing-root',
            children: ['tier-1', 'tier-2', 'tier-3']
        },
        'tier-1': {
            id: 'tier-1',
            type: 'container',
            styles: { padding: '40px', border: '1px solid #f1f5f9', borderRadius: '12px' },
            children: ['t1-n', 't1-p', 't1-btn'], parentId: 'p-grid'
        },
        't1-n': { id: 't1-n', type: 'text', content: 'MORTAL', styles: { fontSize: '1.2rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'tier-1' },
        't1-p': { id: 't1-p', type: 'text', content: '$0 / mo', styles: { fontSize: '2rem', fontWeight: '900', marginTop: '20px' }, layoutMode: 'safety', parentId: 'tier-1' },
        't1-btn': { id: 't1-btn', type: 'button', content: 'START FREE', styles: { marginTop: '30px', width: '100%', padding: '15px', border: '1px solid #000', fontWeight: '700' }, layoutMode: 'safety', parentId: 'tier-1' },

        'tier-2': {
            id: 'tier-2',
            type: 'container',
            styles: { padding: '40px', border: '2px solid #000', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
            children: ['t2-n', 't2-p', 't2-btn'], parentId: 'p-grid'
        },
        't2-n': { id: 't2-n', type: 'text', content: 'HERO', styles: { fontSize: '1.2rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'tier-2' },
        't2-p': { id: 't2-p', type: 'text', content: '$49 / mo', styles: { fontSize: '2rem', fontWeight: '900', marginTop: '20px' }, layoutMode: 'safety', parentId: 'tier-2' },
        't2-btn': { id: 't2-btn', type: 'button', content: 'UPGRADE NOW', styles: { marginTop: '30px', width: '100%', padding: '15px', backgroundColor: '#000', color: '#fff', fontWeight: '700' }, layoutMode: 'safety', parentId: 'tier-2' },

        'tier-3': {
            id: 'tier-3',
            type: 'container',
            styles: { padding: '40px', border: '1px solid #f1f5f9', borderRadius: '12px' },
            children: ['t3-n', 't3-p', 't3-btn'], parentId: 'p-grid'
        },
        't3-n': { id: 't3-n', type: 'text', content: 'GOD', styles: { fontSize: '1.2rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 'tier-3' },
        't3-p': { id: 't3-p', type: 'text', content: 'CONTACT US', styles: { fontSize: '2rem', fontWeight: '900', marginTop: '20px' }, layoutMode: 'safety', parentId: 'tier-3' },
        't3-btn': { id: 't3-btn', type: 'button', content: 'ENTERPRISE', styles: { marginTop: '30px', width: '100%', padding: '15px', border: '1px solid #000', fontWeight: '700' }, layoutMode: 'safety', parentId: 'tier-3' },

        'p-footer': {
            id: 'p-footer',
            type: 'container',
            styles: { padding: '40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'hermes-pricing-root',
            children: ['pf-text']
        },
        'pf-text': { id: 'pf-text', type: 'text', content: 'No credit card required for Mortal plan.', styles: { fontSize: '0.7rem', opacity: '0.4' }, layoutMode: 'safety', parentId: 'p-footer' }
    };
    return elements;
};
