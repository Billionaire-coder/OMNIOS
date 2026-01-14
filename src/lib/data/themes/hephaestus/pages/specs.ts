import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = { bg: '#1a1a1a', text: '#f97316', accent: '#fff', secondary: '#222' };

export const hephaestusSpecs = () => {
    const elements: Record<string, DesignerElement> = {
        'heph-specs-root': createPageRoot('heph-specs-root', ['s-nav', 's-header', 's-table', 's-footer'], { backgroundColor: PALETTE.bg, color: PALETTE.text }),
        's-nav': {
            id: 's-nav',
            type: 'container',
            styles: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
            layoutMode: 'safety',
            parentId: 'heph-specs-root',
            children: ['s-back']
        },
        's-back': { id: 's-back', type: 'button', content: 'RETURN TO FURNACE', styles: { fontSize: '0.8rem', fontWeight: '900' }, layoutMode: 'safety', parentId: 's-nav', action: { type: 'navigate', payload: 'index' } },

        's-header': {
            id: 's-header',
            type: 'container',
            styles: { padding: '60px 40px', borderBottom: '2px solid #333' },
            layoutMode: 'safety',
            parentId: 'heph-specs-root',
            children: ['sh-h1']
        },
        'sh-h1': { id: 'sh-h1', type: 'text', content: 'TECHNICAL\nSPECIFICATIONS', styles: { fontSize: '4rem', fontWeight: '900', color: '#fff' }, layoutMode: 'safety', parentId: 's-header' },

        's-table': {
            id: 's-table',
            type: 'container',
            styles: { padding: '60px 40px', display: 'flex', flexDirection: 'column', gap: '20px' },
            layoutMode: 'safety',
            parentId: 'heph-specs-root',
            children: ['r1', 'r2', 'r3', 'r4']
        },
        'r1': { id: 'r1', type: 'text', content: 'CORE TEMPERATURE: 5000K', styles: { padding: '20px', backgroundColor: '#222', borderLeft: `4px solid ${PALETTE.text}` }, layoutMode: 'safety', parentId: 's-table' },
        'r2': { id: 'r2', type: 'text', content: 'TENSILE STRENGTH: DIVINE', styles: { padding: '20px', backgroundColor: '#222', borderLeft: `4px solid ${PALETTE.text}` }, layoutMode: 'safety', parentId: 's-table' },
        'r3': { id: 'r3', type: 'text', content: 'THROUGHPUT: UNLIMITED', styles: { padding: '20px', backgroundColor: '#222', borderLeft: `4px solid ${PALETTE.text}` }, layoutMode: 'safety', parentId: 's-table' },
        'r4': { id: 'r4', type: 'text', content: 'LATENCY: ZERO', styles: { padding: '20px', backgroundColor: '#222', borderLeft: `4px solid ${PALETTE.text}` }, layoutMode: 'safety', parentId: 's-table' },

        's-footer': {
            id: 's-footer',
            type: 'container',
            styles: { padding: '40px', textAlign: 'center' },
            layoutMode: 'safety',
            parentId: 'heph-specs-root',
            children: ['sf-text']
        },
        'sf-text': { id: 'sf-text', type: 'text', content: 'FORGED FOR ETERNITY.', styles: { fontSize: '0.7rem', opacity: '0.4' }, layoutMode: 'safety', parentId: 's-footer' }
    };
    return elements;
};
