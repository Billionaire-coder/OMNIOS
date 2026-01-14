import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = {
    metal: '#2d3748',
    rust: '#c05621',
    steel: '#cbd5e0',
    dark: '#1a202c',
    neon: '#ed8936'
};

export const hephaestusHome = () => {
    const elements: Record<string, DesignerElement> = {
        'heph-home-root': createPageRoot('heph-home-root', ['hp-nav', 'hp-hero', 'hp-specs', 'hp-grid', 'hp-footer'], {
            backgroundColor: PALETTE.dark,
            fontFamily: 'Roboto Mono, monospace',
            color: PALETTE.steel
        }),

        'hp-nav': {
            id: 'hp-nav', type: 'container',
            styles: {
                height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px',
                backgroundColor: '#111', borderBottom: `2px solid ${PALETTE.rust}`, position: 'sticky', top: '0', zIndex: '1000'
            },
            layoutMode: 'safety', parentId: 'heph-home-root', children: ['hpn-l', 'hpn-r']
        },
        'hpn-l': { id: 'hpn-l', type: 'text', content: '[HEPHAESTUS_IND]', styles: { fontSize: '1.2rem', fontWeight: 'bold', color: PALETTE.rust }, layoutMode: 'safety', parentId: 'hp-nav' },
        'hpn-r': { id: 'hpn-r', type: 'text', content: 'SYSTEM: ONLINE', styles: { fontSize: '0.8rem', color: '#0f0' }, layoutMode: 'safety', parentId: 'hp-nav' },

        'hp-hero': {
            id: 'hp-hero', type: 'container',
            styles: { padding: '100px 40px', borderBottom: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '30px', backgroundImage: 'linear-gradient(45deg, #1a202c 25%, #2d3748 25%, #2d3748 50%, #1a202c 50%, #1a202c 75%, #2d3748 75%, #2d3748 100%)', backgroundSize: '40px 40px' },
            layoutMode: 'safety', parentId: 'heph-home-root', children: ['hph-box']
        },
        'hph-box': {
            id: 'hph-box', type: 'container',
            styles: { padding: '60px', backgroundColor: '#111', border: `2px solid ${PALETTE.steel}`, maxWidth: '800px' },
            layoutMode: 'safety', parentId: 'hp-hero', children: ['hph-t1', 'hph-t2', 'hph-btn']
        },
        'hph-t1': { id: 'hph-t1', type: 'text', content: 'WARNING: HEAVY DUTY.', styles: { color: PALETTE.rust, fontWeight: 'bold', marginBottom: '10px' }, layoutMode: 'safety', parentId: 'hph-box' },
        'hph-t2': { id: 'hph-t2', type: 'text', content: 'ENGINEERED FOR EXTREME CONDITIONS.', styles: { fontSize: '3.5rem', fontWeight: 'bold', color: 'white', lineHeight: '1.1', marginBottom: '30px' }, layoutMode: 'safety', parentId: 'hph-box' },
        'hph-btn': { id: 'hph-btn', type: 'button', content: 'INITIATE_ORDER()', styles: { padding: '15px 30px', backgroundColor: PALETTE.rust, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Roboto Mono, monospace', fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'hph-box', action: { type: 'navigate', payload: 'shop' } },

        'hp-specs': {
            id: 'hp-specs', type: 'container',
            styles: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #333' },
            layoutMode: 'safety', parentId: 'heph-home-root', children: ['hs-1', 'hs-2', 'hs-3', 'hs-4']
        },
        'hs-1': { id: 'hs-1', type: 'container', styles: { padding: '40px 20px', borderRight: '1px solid #333', textAlign: 'center', gap: '10px' }, layoutMode: 'safety', parentId: 'hp-specs', children: ['hs1-v', 'hs1-l'] },
        'hs1-v': { id: 'hs1-v', type: 'text', content: '500 KG', styles: { fontSize: '2rem', fontWeight: 'bold', color: 'white' }, layoutMode: 'safety', parentId: 'hs-1' },
        'hs1-l': { id: 'hs1-l', type: 'text', content: 'MAX LOAD', styles: { fontSize: '0.8rem', color: '#666' }, layoutMode: 'safety', parentId: 'hs-1' },

        'hs-2': { id: 'hs-2', type: 'container', styles: { padding: '40px 20px', borderRight: '1px solid #333', textAlign: 'center', gap: '10px' }, layoutMode: 'safety', parentId: 'hp-specs', children: ['hs2-v', 'hs2-l'] },
        'hs2-v': { id: 'hs2-v', type: 'text', content: 'TI-6AL', styles: { fontSize: '2rem', fontWeight: 'bold', color: 'white' }, layoutMode: 'safety', parentId: 'hs-2' },
        'hs2-l': { id: 'hs2-l', type: 'text', content: 'MATERIAL', styles: { fontSize: '0.8rem', color: '#666' }, layoutMode: 'safety', parentId: 'hs-2' },

        'hs-3': { id: 'hs-3', type: 'container', styles: { padding: '40px 20px', borderRight: '1px solid #333', textAlign: 'center', gap: '10px' }, layoutMode: 'safety', parentId: 'hp-specs', children: ['hs3-v', 'hs3-l'] },
        'hs3-v': { id: 'hs3-v', type: 'text', content: 'IP68', styles: { fontSize: '2rem', fontWeight: 'bold', color: 'white' }, layoutMode: 'safety', parentId: 'hs-3' },
        'hs3-l': { id: 'hs3-l', type: 'text', content: 'RATING', styles: { fontSize: '0.8rem', color: '#666' }, layoutMode: 'safety', parentId: 'hs-3' },

        'hs-4': { id: 'hs-4', type: 'container', styles: { padding: '40px 20px', textAlign: 'center', gap: '10px' }, layoutMode: 'safety', parentId: 'hp-specs', children: ['hs4-v', 'hs4-l'] },
        'hs4-v': { id: 'hs4-v', type: 'text', content: '25 YR', styles: { fontSize: '2rem', fontWeight: 'bold', color: 'white' }, layoutMode: 'safety', parentId: 'hs-4' },
        'hs4-l': { id: 'hs4-l', type: 'text', content: 'WARRANTY', styles: { fontSize: '0.8rem', color: '#666' }, layoutMode: 'safety', parentId: 'hs-4' },

        'hp-grid': {
            id: 'hp-grid', type: 'container',
            styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', backgroundColor: '#333' },
            layoutMode: 'safety', parentId: 'heph-home-root', children: ['hpg-1', 'hpg-2', 'hpg-3']
        },
        'hpg-1': { id: 'hpg-1', type: 'container', styles: { padding: '40px', backgroundColor: '#111', gap: '20px' }, layoutMode: 'safety', parentId: 'hp-grid', children: ['hp1-t', 'hp1-d'] },
        'hp1-t': { id: 'hp1-t', type: 'text', content: 'MODULE_A', styles: { color: PALETTE.rust, fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'hpg-1' },
        'hp1-d': { id: 'hp1-d', type: 'text', content: 'High-performance structural components.', styles: { color: '#888' }, layoutMode: 'safety', parentId: 'hpg-1' },

        'hpg-2': { id: 'hpg-2', type: 'container', styles: { padding: '40px', backgroundColor: '#111', gap: '20px' }, layoutMode: 'safety', parentId: 'hp-grid', children: ['hp2-t', 'hp2-d'] },
        'hp2-t': { id: 'hp2-t', type: 'text', content: 'MODULE_B', styles: { color: PALETTE.rust, fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'hpg-2' },
        'hp2-d': { id: 'hp2-d', type: 'text', content: 'Precision machined fittings.', styles: { color: '#888' }, layoutMode: 'safety', parentId: 'hpg-2' },

        'hpg-3': { id: 'hpg-3', type: 'container', styles: { padding: '40px', backgroundColor: '#111', gap: '20px' }, layoutMode: 'safety', parentId: 'hp-grid', children: ['hp3-t', 'hp3-d'] },
        'hp3-t': { id: 'hp3-t', type: 'text', content: 'MODULE_C', styles: { color: PALETTE.rust, fontWeight: 'bold' }, layoutMode: 'safety', parentId: 'hpg-3' },
        'hp3-d': { id: 'hp3-d', type: 'text', content: 'Thermal resistant shielding.', styles: { color: '#888' }, layoutMode: 'safety', parentId: 'hpg-3' },

        'hp-footer': {
            id: 'hp-footer', type: 'container',
            styles: { padding: '60px', borderTop: '2px solid #333', backgroundColor: '#000', color: PALETTE.steel },
            layoutMode: 'safety', parentId: 'heph-home-root', children: ['hpf-t']
        },
        'hpf-t': { id: 'hpf-t', type: 'text', content: 'HEPHAESTUS INDUSTRIES // EST. 2099', styles: { fontFamily: 'Roboto Mono, monospace' }, layoutMode: 'safety', parentId: 'hp-footer' }
    };
    return elements;
};
