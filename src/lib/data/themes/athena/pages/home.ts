import { DesignerElement } from "@/types/designer";
import { createPageRoot } from "../../utils";

const PALETTE = {
    navy: '#0f172a',
    lightNavy: '#1e293b',
    gold: '#fbbf24',
    white: '#ffffff',
    grey: '#94a3b8'
};

export const athenaHome = () => {
    const elements: Record<string, DesignerElement> = {
        'athena-home-root': createPageRoot('athena-home-root', ['a-nav', 'a-hero', 'a-stats', 'a-services', 'a-footer'], {
            backgroundColor: 'white',
            fontFamily: 'Montserrat, sans-serif',
            color: PALETTE.navy
        }),

        'a-nav': {
            id: 'a-nav', type: 'container',
            styles: {
                height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px',
                backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '0', zIndex: '1000'
            },
            layoutMode: 'safety', parentId: 'athena-home-root', children: ['a-logo', 'a-menu', 'a-cta']
        },
        'a-logo': { id: 'a-logo', type: 'text', content: 'ATHENA.', styles: { fontSize: '1.8rem', fontWeight: '900', color: PALETTE.navy, fontFamily: 'Playfair Display, serif' }, layoutMode: 'safety', parentId: 'a-nav' },
        'a-menu': { id: 'a-menu', type: 'container', styles: { flexDirection: 'row', gap: '40px' }, layoutMode: 'safety', parentId: 'a-nav', children: ['am-1', 'am-2', 'am-3'] },
        'am-1': { id: 'am-1', type: 'text', content: 'Approach', styles: { fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }, layoutMode: 'safety', parentId: 'a-menu' },
        'am-2': { id: 'am-2', type: 'text', content: 'Case Studies', styles: { fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }, layoutMode: 'safety', parentId: 'a-menu' },
        'am-3': { id: 'am-3', type: 'text', content: 'Insights', styles: { fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }, layoutMode: 'safety', parentId: 'a-menu' },
        'a-cta': { id: 'a-cta', type: 'button', content: 'STRATEGIZE', styles: { padding: '12px 24px', backgroundColor: PALETTE.navy, color: 'white', fontWeight: 'bold', borderRadius: '4px' }, layoutMode: 'safety', parentId: 'a-nav', action: { type: 'navigate', payload: 'contact' } },

        'a-hero': {
            id: 'a-hero', type: 'container',
            styles: { padding: '100px 60px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px', alignItems: 'center', backgroundColor: '#f8fafc' },
            layoutMode: 'safety', parentId: 'athena-home-root', children: ['ah-text', 'ah-vis']
        },
        'ah-text': { id: 'ah-text', type: 'container', styles: { gap: '20px' }, layoutMode: 'safety', parentId: 'a-hero', children: ['aht-pre', 'aht-main', 'aht-sub', 'aht-btn'] },
        'aht-pre': { id: 'aht-pre', type: 'text', content: 'INTELLIGENT SOLUTIONS', styles: { color: PALETTE.gold, fontWeight: '700', letterSpacing: '2px', fontSize: '0.8rem' }, layoutMode: 'safety', parentId: 'ah-text' },
        'aht-main': { id: 'aht-main', type: 'text', content: 'Wisdom in Execution.', styles: { fontSize: '4.5rem', fontWeight: '800', fontFamily: 'Playfair Display, serif', lineHeight: '1.1', color: PALETTE.navy }, layoutMode: 'safety', parentId: 'ah-text' },
        'aht-sub': { id: 'aht-sub', type: 'text', content: 'We leverage data-driven strategies to propel your enterprise into a future of dominance.', styles: { fontSize: '1.1rem', color: '#64748b', lineHeight: '1.6', maxWidth: '500px' }, layoutMode: 'safety', parentId: 'ah-text' },
        'aht-btn': { id: 'aht-btn', type: 'button', content: 'VIEW SOLUTIONS', styles: { marginTop: '20px', padding: '15px 40px', backgroundColor: 'transparent', border: `2px solid ${PALETTE.navy}`, color: PALETTE.navy, fontWeight: '700', width: 'fit-content' }, layoutMode: 'safety', parentId: 'ah-text', action: { type: 'navigate', payload: 'services' } },
        'ah-vis': { id: 'ah-vis', type: 'box', styles: { height: '500px', backgroundColor: PALETTE.lightNavy, borderRadius: '20px', backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)' }, layoutMode: 'safety', parentId: 'a-hero' },

        'a-stats': {
            id: 'a-stats', type: 'container',
            styles: { padding: '60px', backgroundColor: PALETTE.navy, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', color: 'white' },
            layoutMode: 'safety', parentId: 'athena-home-root', children: ['ast-1', 'ast-2', 'ast-3', 'ast-4']
        },
        'ast-1': { id: 'ast-1', type: 'container', styles: { alignItems: 'center', gap: '10px' }, layoutMode: 'safety', parentId: 'a-stats', children: ['as1-n', 'as1-l'] },
        'as1-n': { id: 'as1-n', type: 'text', content: '500+', styles: { fontSize: '3rem', fontWeight: '900', color: PALETTE.gold }, layoutMode: 'safety', parentId: 'ast-1' },
        'as1-l': { id: 'as1-l', type: 'text', content: 'Clients Served', styles: { fontSize: '0.9rem', fontWeight: '600' }, layoutMode: 'safety', parentId: 'ast-1' },

        'ast-2': { id: 'ast-2', type: 'container', styles: { alignItems: 'center', gap: '10px' }, layoutMode: 'safety', parentId: 'a-stats', children: ['as2-n', 'as2-l'] },
        'as2-n': { id: 'as2-n', type: 'text', content: '98%', styles: { fontSize: '3rem', fontWeight: '900', color: PALETTE.gold }, layoutMode: 'safety', parentId: 'ast-2' },
        'as2-l': { id: 'as2-l', type: 'text', content: 'Retention Rate', styles: { fontSize: '0.9rem', fontWeight: '600' }, layoutMode: 'safety', parentId: 'ast-2' },

        'ast-3': { id: 'ast-3', type: 'container', styles: { alignItems: 'center', gap: '10px' }, layoutMode: 'safety', parentId: 'a-stats', children: ['as3-n', 'as3-l'] },
        'as3-n': { id: 'as3-n', type: 'text', content: '$2B+', styles: { fontSize: '3rem', fontWeight: '900', color: PALETTE.gold }, layoutMode: 'safety', parentId: 'ast-3' },
        'as3-l': { id: 'as3-l', type: 'text', content: 'Value Generated', styles: { fontSize: '0.9rem', fontWeight: '600' }, layoutMode: 'safety', parentId: 'ast-3' },

        'ast-4': { id: 'ast-4', type: 'container', styles: { alignItems: 'center', gap: '10px' }, layoutMode: 'safety', parentId: 'a-stats', children: ['as4-n', 'as4-l'] },
        'as4-n': { id: 'as4-n', type: 'text', content: '24/7', styles: { fontSize: '3rem', fontWeight: '900', color: PALETTE.gold }, layoutMode: 'safety', parentId: 'ast-4' },
        'as4-l': { id: 'as4-l', type: 'text', content: 'Strategic Support', styles: { fontSize: '0.9rem', fontWeight: '600' }, layoutMode: 'safety', parentId: 'ast-4' },

        'a-services': {
            id: 'a-services', type: 'container',
            styles: { padding: '100px 60px', display: 'flex', flexDirection: 'column', gap: '60px' },
            layoutMode: 'safety', parentId: 'athena-home-root', children: ['asv-head', 'asv-grid']
        },
        'asv-head': { id: 'asv-head', type: 'container', styles: { alignItems: 'center', textAlign: 'center', gap: '15px' }, layoutMode: 'safety', parentId: 'a-services', children: ['asvh-t', 'asvh-s'] },
        'asvh-t': { id: 'asvh-t', type: 'text', content: 'Strategic Capabilities', styles: { fontSize: '2.5rem', fontWeight: '800', fontFamily: 'Playfair Display, serif' }, layoutMode: 'safety', parentId: 'asv-head' },
        'asvh-s': { id: 'asvh-s', type: 'text', content: 'Comprehensive solutions for the modern enterprise.', styles: { color: '#64748b' }, layoutMode: 'safety', parentId: 'asv-head' },

        'asv-grid': {
            id: 'asv-grid', type: 'container',
            styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' },
            layoutMode: 'safety', parentId: 'a-services', children: ['svc-1', 'svc-2', 'svc-3']
        },
        'svc-1': { id: 'svc-1', type: 'container', styles: { padding: '40px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', gap: '15px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }, layoutMode: 'safety', parentId: 'asv-grid', children: ['s1-t', 's1-d'] },
        's1-t': { id: 's1-t', type: 'text', content: 'Digital Transformation', styles: { fontSize: '1.2rem', fontWeight: '700', fontFamily: 'Playfair Display, serif' }, layoutMode: 'safety', parentId: 'svc-1' },
        's1-d': { id: 's1-d', type: 'text', content: 'Modernize your infrastructure with cutting-edge cloud solutions.', styles: { color: '#64748b', lineHeight: '1.6' }, layoutMode: 'safety', parentId: 'svc-1' },

        'svc-2': { id: 'svc-2', type: 'container', styles: { padding: '40px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', gap: '15px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }, layoutMode: 'safety', parentId: 'asv-grid', children: ['s2-t', 's2-d'] },
        's2-t': { id: 's2-t', type: 'text', content: 'Market Analytics', styles: { fontSize: '1.2rem', fontWeight: '700', fontFamily: 'Playfair Display, serif' }, layoutMode: 'safety', parentId: 'svc-2' },
        's2-d': { id: 's2-d', type: 'text', content: 'Deep insights into consumer behavior and market trends.', styles: { color: '#64748b', lineHeight: '1.6' }, layoutMode: 'safety', parentId: 'svc-2' },

        'svc-3': { id: 'svc-3', type: 'container', styles: { padding: '40px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', gap: '15px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }, layoutMode: 'safety', parentId: 'asv-grid', children: ['s3-t', 's3-d'] },
        's3-t': { id: 's3-t', type: 'text', content: 'Executive Consulting', styles: { fontSize: '1.2rem', fontWeight: '700', fontFamily: 'Playfair Display, serif' }, layoutMode: 'safety', parentId: 'svc-3' },
        's3-d': { id: 's3-d', type: 'text', content: 'Leadership coaching and organizational restructuring.', styles: { color: '#64748b', lineHeight: '1.6' }, layoutMode: 'safety', parentId: 'svc-3' },

        'a-footer': {
            id: 'a-footer', type: 'container',
            styles: { padding: '60px', backgroundColor: PALETTE.lightNavy, color: 'white', textAlign: 'center' },
            layoutMode: 'safety', parentId: 'athena-home-root', children: ['af-text']
        },
        'af-text': { id: 'af-text', type: 'text', content: '© 2026 ATHENA CONSULTING. ALL RIGHTS RESERVED.', styles: { color: '#94a3b8', fontSize: '0.8rem' }, layoutMode: 'safety', parentId: 'a-footer' }
    };
    return elements;
};
